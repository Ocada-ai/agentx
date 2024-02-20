'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconMetamask, IconSpinner } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useSignMessage } from 'wagmi'
import { cookies } from 'next/headers'

interface LoginButtonProps extends ButtonProps {
  showIcon?: boolean
  text?: string
}

export function LoginButtonMetamask({
  text = 'Login with Metamask',
  showIcon = true,
  className,
  ...props
}: LoginButtonProps) {

  const [nonce, setNonce] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { data: signature, error, signMessage, variables } = useSignMessage()

  function deleteCookie(cookieName: string) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to home page')
      router.refresh()
      router.push('/')
    } else {
      
    }
  }, [isAuthenticated, router])

  const handleSignMessage = async() => {
      setIsLoading(true)
      const userAddress = address ? address : ''
      if (userAddress && isConnected) {
        try {
          const nonceResponse = await fetch(`/api/web3auth/nonce`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              address: userAddress
            })
          })

          const data = await nonceResponse.json()
          const message =process.env.NEXT_PUBLIC_WEB3AUTH_MESSAGE + data.auth.genNonce
          setNonce(data.auth.genNonce);
          await signMessage({ message })
        } catch (err) {
          console.error('An error occurred:', err)
        } finally {
          setIsLoading(false)
        }
      }
  }

  useEffect(function () {
    const fetchData = async () => {
      if (signature) {
        // // verify the signature and get the address that generated the signature for the message passed
        // setSignerAddress(utils.verifyMessage(messageToSign, signature));
        const response = await fetch(`/api/web3auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: address,
            signedMessage: signature,
            nonce: nonce
          })
        })
  
        // console.log(response)
  
        // Handle the response from the API
        if (response.ok) {
          // The verification was successful
          console.log('Verification successful!')
          setIsAuthenticated(true)
        } else {
          // The verification failed
          console.error('Verification failed!')
          setIsAuthenticated(false)
        }
      }
    }
  
    // call the function
    fetchData()
  }, [signature, address, nonce]);

  return (
    <Button
      variant="outline"
      onClick={()=>handleSignMessage()}
      disabled={isLoading || !address || !isConnected}
      className="w-128 h-16"
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : showIcon ? (
        <IconMetamask className="mr-2" />
      ) : null}
      <span className="pl-4 text-[25px]">{text}</span>
    </Button>
  )
}
