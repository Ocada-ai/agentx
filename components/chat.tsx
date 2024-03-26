"use client";

import { useEffect, useRef, useState } from "react";

import { useUIState, useActions } from "ai/rsc";
import { UserMessage } from "@/components/llm-stocks/message";

import { type AI } from "@/app/action";
import { ChatScrollAnchor } from "@/lib/hooks/chat-scroll-anchor";
import { FooterText } from "@/components/footer";
import Textarea from "react-textarea-autosize";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconArrowElbow, IconPlus, IconPlane } from "@/components/ui/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChatList } from "@/components/chat-list";
import { EmptyScreen } from "@/components/empty-screen";
import { cn } from "@/lib/utils";

import { useWallet } from "@solana/wallet-adapter-react";
import { redirect } from "next/navigation";
import { createRoom } from "@/app/supabase";

import { useLocalStorage } from "@/lib/hooks/use-local-storage";

export default function Chat({ initialMessages }: any) {
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();
  const [inputValue, setInputValue] = useState("");
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wallet = useWallet();
  const [titleId, setTitleId] = useLocalStorage("titleId", null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (
          e.target &&
          ["INPUT", "TEXTAREA"].includes((e.target as any).nodeName)
        ) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (inputRef?.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inputRef]);

  useEffect(() => {
    if (!wallet.wallet) {
      redirect("/sign-in");
    }
  }, [wallet]);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, []);

  return (
    <div className="h-screen overflow-y-scroll relative flex flex-col justify-between no-scrollbar bg-[#141414]">
      <div className="pb-[200px] pt-4 md:pt-10">
        {messages && messages.length ? (
          <>
            <ChatList messages={messages} />
          </>
        ) : (
          <EmptyScreen
            submitMessage={async (message) => {
              // Add user message UI
              setMessages((currentMessages) => [
                ...currentMessages,
                {
                  id: Date.now(),
                  display: <UserMessage>{message}</UserMessage>,
                },
              ]);

              let curTitleId = null;
              const res: any = await createRoom(wallet.publicKey, message);
              if (res) curTitleId = res.titleId;
              setTitleId(curTitleId);

              // Submit and get response message
              const responseMessage = await submitUserMessage(
                message,
                curTitleId
              );
              setMessages((currentMessages) => [
                ...currentMessages,
                responseMessage,
              ]);
            }}
          />
        )}
        <ChatScrollAnchor trackVisibility={true} />
      </div>
      <div className="sticky bottom-0 w-full bg-[#141414] animate-in duration-300 ease-in-out">
        <div className="lg:max-w-3xl sm:px-4 mx-auto">
          <div className="px-4 py-2 space-y-4 bg-transparent sm:rounded-t-xl md:py-4">
            <form
              ref={formRef}
              onSubmit={async (e: any) => {
                e.preventDefault();

                // Blur focus on mobile
                if (window.innerWidth < 600) {
                  e.target["message"]?.blur();
                }

                const value = inputValue.trim();
                setInputValue("");
                if (!value) return;

                // Add user message UI
                setMessages((currentMessages) => [
                  ...currentMessages,
                  {
                    id: Date.now(),
                    display: <UserMessage>{value}</UserMessage>,
                  },
                ]);

                try {
                  // Save title into Supabase
                  if (!wallet.publicKey) return;
                  let curTitleId = null;
                  if (messages.length == 0) {
                    const res: any = await createRoom(wallet.publicKey, value);
                    if (res) curTitleId = res.titleId;
                    setTitleId(curTitleId);
                  }

                  if (!curTitleId) curTitleId = titleId;

                  // Submit and get response message
                  const responseMessage = await submitUserMessage(
                    value,
                    curTitleId
                  );
                  // Show Message
                  setMessages((currentMessages) => [
                    ...currentMessages,
                    responseMessage,
                  ]);
                } catch (error) {
                  // You may want to show a toast or trigger an error state.
                  console.error(error);
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
                        "absolute left-3 top-[10px] size-8 rounded-full bg-transparent hover:bg-theme-700 p-0 sm:left-4 border-[2px] border-[#242424] "
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.reload();
                      }}
                    >
                      <IconPlus className="text-[#242424] font-bold" />
                      <span className="sr-only">New Chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Chat</TooltipContent>
                </Tooltip>
                <Textarea
                  ref={inputRef}
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                  placeholder="Send a message."
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
                          Send message
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-type-600 bg-type-600">
                      Send message
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </form>
            <FooterText className="hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}
