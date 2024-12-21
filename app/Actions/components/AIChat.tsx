'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AIChatProps {
  initialMessage: string
  onSwapRequest: () => void
}

export function AIChat({ initialMessage, onSwapRequest }: AIChatProps) {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage)
      handleSendMessage(initialMessage)
    }
  }, [initialMessage])

  const handleSendMessage = async (msg: string) => {
    // Here you would typically send the message to your AI service
    // For this example, we'll just simulate a response
    setResponse(`I understand you want to ${msg.toLowerCase()}. I'll initiate that for you now.`)
    onSwapRequest()
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Ask AI to perform a swap..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-[#171717] border-[#292929] text-type-600"
      />
      <Button onClick={() => handleSendMessage(message)} className="w-full bg-theme-500 hover:bg-theme-600 text-white">Send</Button>
      {response && <p className="text-sm text-type-600 text-opacity-60">{response}</p>}
    </div>
  )
}

