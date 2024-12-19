import React, { useState, useRef } from 'react';
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import Chat from '@/components/chat';
import RightSidebar from '@/components/right-sidebar';
import { EmptyScreenSwap } from './empty_screen_swap';
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
  import { useUIState } from 'ai/rsc';
import { AI } from '@/app/action';
import { UserMessage } from '@/components/llm-stocks/message';
import { createRoom } from '@/app/supabase';
import { useWallet } from "@solana/wallet-adapter-react";
import { Textarea } from '@/components/ui/textarea';




const JupiterSwap = () => {
  const [status, setStatus] = useState<string>(''); // State to track the status of the swap
  const [quoteResponse, setQuoteResponse] = useState<any>(null); // State to store the quote response
  const [messages, setMessages] = useUIState<typeof AI>();
  const wallet = useWallet();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
const { formRef, onKeyDown } = useEnterSubmit();

  const testSwap = async () => {
    setStatus('Connecting to the network...');
    try {
      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=1b789c89-6ab1-4d31-b192-4205a155cc96');
      setStatus('Loading wallet...');
      
      const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.NEXT_PUBLIC_PRIVATE_KEY || '')));

      setStatus('Fetching quote...');
      const response = await fetch('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=200');
      const data = await response.json();
      console.log("Quote response from the swap ", data);
      setQuoteResponse(data);
      setStatus('Quote received. Preparing to swap...');

      // Here you can add the logic to execute the swap using the quoteResponse
      // For example, you can call the swap API with the necessary parameters

      // Simulating a swap transaction
      setStatus('Executing swap transaction...');
      // await executeSwapTransaction(quoteResponse, wallet); // Uncomment and implement this function

      setStatus('Swap completed successfully!');


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
      setStatus('An error occurred during the swap. Please try again.');
    }
  };

  function setTitleId(curTitleId: any) {
    throw new Error('Function not implemented.');
  }

  function submitUserMessage(message: string, curTitleId: any) {
    throw new Error('Function not implemented.');
  }

  return (
<>


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
    <EmptyScreenSwap submitMessage={async (message) => {
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
              // responseMessage,
            ]);
          }}
        />
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


    <RightSidebar />

    </>
  );
};

export default JupiterSwap;
