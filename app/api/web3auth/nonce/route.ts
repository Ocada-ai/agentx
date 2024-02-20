import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const json = await req.json()
  const { address } = json
  const userId = (await auth())?.userId
  if (userId) return new Response('Unauthorized', {status: 401})
  try {
    const nonce = Math.floor(Math.random() * 1000000);
    const result = await kv.get(address)
    const data = {
      userId: address,
      auth: {
        genNonce: nonce,
        lastAuth: new Date().toISOString(),
        lastAuthStatus: "pending"
      }
    }
    if (!result) {
      await kv.set(address, data)
      return NextResponse.json(data, { status: 200 })
    } else {
      await kv.set(address, data)
      return NextResponse.json(data, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}