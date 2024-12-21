'use client'

import { useEffect, useRef, useState } from "react"
import { useUIState, useActions } from "ai/rsc"
import { type AI } from "@/app/action"
import { UserMessage } from "@/components/llm-stocks/message"
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit"
import { ChatList } from "@/components/chat-list"
import { EmptySwapScreen } from './empty-screen'
import { FooterText } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button, buttonVariants } from "@/components/ui/button"
import { IconPlus, IconPlane } from "@/components/ui/icons"
import Textarea from "react-textarea-autosize"
import { useWallet } from "@solana/wallet-adapter-react"
import { redirect } from "next/navigation"
import { createRoom } from "@/app/supabase"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"

export function SwapInterface({ initialMessages }: { initialMessages?: any[] }) {
  const [messages, setMessages] = useUIState<typeof AI>()
  const { submitUserMessage } = useActions<typeof AI>()
  const [inputValue, setInputValue] = useState("")
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wallet = useWallet()
  const [titleId, setTitleId] = useLocalStorage("titleId", null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (
          e.target &&
          ["INPUT", "TEXTAREA"].includes((e.target as any).nodeName)
        ) {
          return
        }
        e.preventDefault()
        e.stopPropagation()
        if (inputRef?.current) {
          inputRef.current.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [inputRef])

  useEffect(() => {
    if (!wallet.wallet) {
      redirect("/sign-in")
    }
  }, [wallet])

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages)
  }, [initialMessages, setMessages])

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {messages && messages.length ? (
        <ChatList messages={messages} />
      ) : (
        <EmptySwapScreen
          submitMessage={async (message) => {
            setMessages((currentMessages) => [
              ...currentMessages,
              {
                id: Date.now(),
                display: <UserMessage>{message}</UserMessage>,
              },
            ])

            let curTitleId = null
            const res: any = await createRoom(wallet.publicKey, message)
            if (res) curTitleId = res.titleId
            setTitleId(curTitleId)

            const responseMessage = await submitUserMessage(message, curTitleId)
            setMessages((currentMessages) => [
              ...currentMessages,
              responseMessage,
            ])
          }}
        />
      )}
      <div className="fixed inset-x-0 bottom-0 w-full bg-transparent animate-in duration-300 ease-in-out lg:pl-[220px] xl:pr-[320px] bg-gradient-to-b from-[#1414143a] from-10% via-[#141414d1] via-30% to-[#141414] to-100%">
        <div className="lg:max-w-3xl sm:px-4 mx-auto">
          <div className="px-4 py-2 space-y-4 bg-transparent sm:rounded-t-xl md:py-4">
            <form
              ref={formRef}
              onSubmit={async (e) => {
                e.preventDefault()

                if (window.innerWidth < 600) {
                  e.currentTarget["message"]?.blur()
                }

                const value = inputValue.trim()
                setInputValue("")
                if (!value) return

                setMessages((currentMessages) => [
                  ...currentMessages,
                  {
                    id: Date.now(),
                    display: <UserMessage>{value}</UserMessage>,
                  },
                ])

                try {
                  if (!wallet.publicKey) return
                  let curTitleId = null
                  if (messages.length === 0) {
                    const res: any = await createRoom(wallet.publicKey, value)
                    if (res) curTitleId = res.titleId
                    setTitleId(curTitleId)
                  }

                  if (!curTitleId) curTitleId = titleId

                  const responseMessage = await submitUserMessage(value, curTitleId)
                  setMessages((currentMessages) => [
                    ...currentMessages,
                    responseMessage,
                  ])
                } catch (error) {
                  console.error(error)
                }
              }}
            >
              <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-48 bg-[#1a1a1a] ring-[6px] ring-[#1a1a1a] rounded-full border-[2px] border-[#242424] text-type-600">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                        "absolute left-3 top-[10px] size-8 rounded-full bg-transparent hover:bg-theme-700 p-0 sm:left-4 border-[2px] border-[#242424]"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.reload()
                      }}
                    >
                      <IconPlus className="text-[#242424] font-bold" />
                      <span className="sr-only">New Swap</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Swap</TooltipContent>
                </Tooltip>
                <Textarea
                  ref={inputRef}
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                  placeholder="Describe your swap..."
                  className="w-full resize-none bg-transparent px-4 py-[1rem] focus-within:outline-none sm:text-sm placeholder:text-type-600 placeholder:text-opacity-70 ps-8"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  name="message"
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <div className="absolute right-3 top-[10px] sm:right-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        className="bg-transparent hover:bg-transparent right-10"
                        disabled={inputValue === ""}
                      >
                        <IconPlane className="opacity-75 hover:opacity-100" />
                        <span className="sr-only bg-type-600 text-opacity-70">
                          Send swap request
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send swap request</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </form>
            <FooterText className="hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  )
}

