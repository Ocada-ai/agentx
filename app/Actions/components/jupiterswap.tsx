import React, { useState, useRef } from "react";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";
import Chat from "@/components/chat";
import RightSidebar from "@/components/right-sidebar";
import { EmptyScreenSwap } from "./empty_screen_swap";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { useUIState } from "ai/rsc";
import { AI } from "@/app/action";
import { UserMessage } from "@/components/llm-stocks/message";
import { createRoom } from "@/app/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Button, buttonVariants } from "@/components/ui/button";
import { IconPlane, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface ActionProps {
  params: {
    [x: string]: any;
    params: {
      slug: string[];
    };
  };
  // slug: string[];
}

const JupiterSwap = ({ params }: ActionProps) => {
  const [status, setStatus] = useState<string>(""); // State to track the status of the swap
  const [quoteResponse, setQuoteResponse] = useState<any>(null); // State to store the quote response
  const [messages, setMessages] = useUIState<typeof AI>();
  const wallet = useWallet();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { formRef, onKeyDown } = useEnterSubmit();

  const testSwap = async () => {
    setStatus("Connecting to the network...");
    try {
      const connection = new Connection(
        "https://mainnet.helius-rpc.com/?api-key=1b789c89-6ab1-4d31-b192-4205a155cc96"
      );
      setStatus("Loading wallet...");

      // const wallet = new Wallet(
      //   Keypair.fromSecretKey(
      //     bs58.decode(process.env.NEXT_PUBLIC_PRIVATE_KEY || "")
      //   )
      // );

      setStatus("Fetching quote...");
      const response = await fetch(
        "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=200"
      );
      const data = await response.json();
      console.log("Quote response from the swap ", data);
      setQuoteResponse(data);
      setStatus("Quote received. Preparing to swap...");

      // Here you can add the logic to execute the swap using the quoteResponse
      // For example, you can call the swap API with the necessary parameters

      // Simulating a swap transaction
      setStatus("Executing swap transaction...");
      // await executeSwapTransaction(quoteResponse, wallet); // Uncomment and implement this function

      setStatus("Swap completed successfully!");

      // get serialized transactions for the swap
      // const { swapTransaction } = await (
      //   await fetch('https://quote-api.jup.ag/v6/swap', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({
      //       // quoteResponse from /quote api
      //       quoteResponse,
      //       // user public key to be used for the swap
      //       userPublicKey: wallet.publicKey.toString(),
      //       // auto wrap and unwrap SOL. default is true
      //       wrapAndUnwrapSol: true,
      //       // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
      //       // feeAccount: "fee_account_public_key"
      //     })
      //   })
      // ).json();
    } catch (error) {
      console.error(error);
      setStatus("An error occurred during the swap. Please try again.");
    }
  };

  function setTitleId(curTitleId: any) {
    throw new Error("Function not implemented.");
  }

  function submitUserMessage(message: string, curTitleId: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen">
      {/* 
    <div>
      <h1>Jupiter Swap</h1>
      <button onClick={testSwap}>Start Swap</button>
      <p>Status: {status}</p>
      {quoteResponse && (
        <div>
          <h2>Quote Response:</h2>
          <pre>{JSON.stringify(quoteResponse, null, 2)}</pre>
        </div>
      )}
    </div> */}
      {/* <Chat /> */}
      <EmptyScreenSwap
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
          const responseMessage = await submitUserMessage(message, curTitleId);
          setMessages((currentMessages) => [
            ...currentMessages,
            // responseMessage,
          ]);
        }}
      />

      <div className="p-4">
        <h1 className="text-2xl font-bold">Jupiter Swap</h1>
        <button
          onClick={testSwap}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Get Quote
        </button>
        <p className="mt-2">Status: {status}</p>
        {quoteResponse && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Quote Response:</h2>
            <div className="bg-black p-4 rounded">
              <h3 className="font-bold">Input Mint:</h3>
              <p>{quoteResponse.inputMint}</p>
              <h3 className="font-bold">Input Amount:</h3>
              <p>{quoteResponse.inAmount}</p>
              <h3 className="font-bold">Output Mint:</h3>
              <p>{quoteResponse.outputMint}</p>
              <h3 className="font-bold">Output Amount:</h3>
              <p>{quoteResponse.outAmount}</p>
              <h3 className="font-bold">Slippage BPS:</h3>
              <p>{quoteResponse.slippageBps}</p>
              <h3 className="font-bold">Price Impact Percentage:</h3>
              <p>{quoteResponse.priceImpactPct}%</p>
              <h3 className="font-bold">Route Plan:</h3>
              {quoteResponse.routePlan.map((route: any, index: number) => (
                <div key={index} className="mb-2">
                  <h4 className="font-semibold">Route {index + 1}:</h4>
                  <p><strong>Label:</strong> {route.swapInfo.label}</p>
                  <p><strong>Input Mint:</strong> {route.swapInfo.inputMint}</p>
                  <p><strong>Output Mint:</strong> {route.swapInfo.outputMint}</p>
                  <p><strong>In Amount:</strong> {route.swapInfo.inAmount}</p>
                  <p><strong>Out Amount:</strong> {route.swapInfo.outAmount}</p>
                  <p><strong>Fee Amount:</strong> {route.swapInfo.feeAmount}</p>
                  <p><strong>Fee Mint:</strong> {route.swapInfo.feeMint}</p>
                  <p><strong>Percent:</strong> {route.percent}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* <form
            className="flex w-full mb-4 justify-normal items-baseline " 
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

            if (!curTitleId) curTitleId = params.slug[1];

            // Submit and get response message
            const responseMessage = await submitUserMessage(value, curTitleId);
            // Show Message
            setMessages((currentMessages) => [
              ...currentMessages,
              // responseMessage,
            ]);
          } catch (error) {
            // You may want to show a toast or trigger an error state.
            console.error(error);
          }
        }}
      >
        <div className="relative flex flex-col w-2/3 justify-center margin-auto px-8 overflow-hidden max-h-48 bg-[#1a1a1a] ring-[6px] ring-[#1a1a1a] rounded-full border-[2px] border-[#242424] text-type-600">
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
        
      </form> */}
    </div>
  );
};

export default JupiterSwap;
