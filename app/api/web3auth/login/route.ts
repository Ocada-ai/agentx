import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { signToken } from '@/lib/utils'

import { kv } from '@vercel/kv'
import { User } from '@/lib/types'

export async function POST(req: Request) {
  const json = await req.json()
  const { address, signedMessage, nonce } = json
  const message = process.env.NEXT_PUBLIC_WEB3AUTH_MESSAGE + nonce;
  const recoveredAddress = ethers.utils.verifyMessage(message, signedMessage);
  if (recoveredAddress !== address) {
    return NextResponse.json(
      { error: 'Signature verification failed' },
      { status: 401 }
    )
  }

  try {
    const result = await kv.get(address) as User
    if (result) {
      if (result?.auth.genNonce !== nonce) {
        return NextResponse.json(
          { error: 'Nonce verification failed' },
          { status: 401 }
        )
      }

      const token = await signToken(
        {
          address: address,
          sub: result.id,
          aud: 'authenticated'
        },
        { expiresIn: `3600s` }
      )

      const response = NextResponse.json('success', { status: 200 })
      response.cookies.set('address', address)
      response.cookies.set('web3jwt', token)
      return response
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
