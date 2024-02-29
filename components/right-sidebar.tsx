'use client'
import { JSX, SVGProps } from 'react'
import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import { LLMChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate
} from 'langchain/prompts'



// import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor } from "langchain/agents";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentFinish, AgentAction } from "@langchain/core/agents";
import { BaseMessageChunk } from "@langchain/core/messages";
import { SearchApi } from "@langchain/community/tools/searchapi";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
// import { ChatOpenAI } from "@langchain/openai";
// import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { createOpenAIFunctionsAgent } from "langchain/agents";

import { pull } from "langchain/hub";
// import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";


const model = new ChatOpenAI({
  openAIApiKey: `${process.env.OPENAI_API_KEY}`,
  //@ts-ignore
  model: 'gpt-3.5-turbo-16k',
  temperature: 0.9
})

interface TokenMetadata {
  name: string
  symbol: string
  token_standard: string
}

interface TokenInfo {
  balance: number
}

interface Asset {
  interface: string
  content: {
    metadata: TokenMetadata
  }
  token_info: TokenInfo
}

export default function Component() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [analysis, setAnalysis] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<string>('')

  const wallet = useWallet()

  const user = wallet.publicKey?.toBase58()
  const url = `https://mainnet.helius-rpc.com/?api-key=`

  useEffect(() => {
    const getAssetsByOwner = async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'my-id',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: `${user}`,
            page: 1, // Starts at 1
            limit: 1000,
            displayOptions: {
              showFungible: true
            }
          }
        })
      })
      const { result } = await response.json()

      if (result?.items?.length > 0) {
        let data: Asset[] = await result.items

        data = data.sort((a, b) => {
          if (
            a.interface === 'FungibleToken' &&
            b.interface !== 'FungibleToken'
          ) {
            return -1
          }
          if (
            a.interface !== 'FungibleToken' &&
            b.interface === 'FungibleToken'
          ) {
            return 1
          }
          return 0
        })

        setAssets(data)
        console.log(
          'Assets by Owner on the NAAAAAAAVAVAAVAVABAAARRR IS DATA FETCHED IS THIS : ',
          data
        )

        console.log('ASSESTS IS THIS : ', assets)
      } else {
        console.error('Result or Result.items is undefined', result)
      }
    }

    getAssetsByOwner()
  }, [user])

  useEffect(() => {
    console.log('Assets have been updated: ', assets)
  }, [assets])

  // Group assets by their interface type
  const splTokens = assets.filter(asset => asset.interface === 'FungibleToken')
  const nfts = assets.filter(asset => asset.interface === 'V1_NFT')

  // Function to serialize SPL Tokens and NFTs data into a descriptive text format
  function serializeAssets(splTokens: Asset[], nfts: Asset[]): string {
    let splTokensDescription =
      'SPL Tokens:\n' +
      splTokens
        .map(
          token =>
            `Token Name: ${token.content.metadata.name}, Symbol: ${token.content.metadata.symbol}, Balance: ${token.token_info.balance}`
        )
        .join('\n')
    let nftsDescription =
      'NFTs:\n' +
      nfts
        .map(
          nft =>
            `NFT Name: ${nft.content.metadata.name}, Symbol: ${nft.content.metadata.symbol}`
        )
        .join('\n')

    return `${splTokensDescription}\n\n${nftsDescription}`
  }

  useEffect(() => {
    const assetsDescription = serializeAssets(splTokens, nfts)

    // async function fetchTokenInformation(splTokens: Asset[]) {
    //     const requestBody = {
    //       splTokens,
    //     //   nfts,
    //       // Include any other necessary data
    //     };
      
    //     try {
    //       const response = await fetch('/api/chat/route', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(`Search for information about these solana tokens for me ${requestBody}`),
    //       });
      
    //       if (!response.ok) {
    //         throw new Error('Network response was not ok');
    //       }
      
    //       const data = await response.json();
    //       console.log(`IOEJFIWUEBFIUBEFFBEWOUFHWEF WKBFIWBFIKWRUBF : ${data}`)
    //       return data; // This should include the Tavily search results and any other processed information
    //     } catch (error) {
    //       console.error('Error fetching token information:', error);
    //       return null;
    //     }
    //   }

    

    const walletAnalysis = async () => {
      
      const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
          `Analyze the following wallet contents and provide an aggregated summary of the token holdings, should be something like total SPL tokens held in wallet FOR EXAMPLE, IF THERE ARE 3 DIFFERENT SPL TOKENS YOU SAY 3 SPL TOKENS, total NFts held in wallet etc... just an aggregated insight dont list all the tokens:\n\n${assetsDescription}\n\n
        `
        ),
        HumanMessagePromptTemplate.fromTemplate(`${assets}`)
      ])

      const chain = new LLMChain({ llm: model, prompt: chatPrompt })

      try {
        // The result is an object with a `text` property.
        const resA = await chain.call({ conversation: assets })
        // console.log( resA.text );
        setAnalysis(resA.text);
        console.log('Wallet ANALYSIS:', resA.text);
        return resA
      } catch (error) {
        console.log('Error:', error)
        return error
      } finally {
        console.log('done analysing')
      }
    }

    walletAnalysis()



  }, [assets])

  useEffect(() => {

    if (splTokens.length > 0) {
        const getLatestTokenInfo = async () => {
            function serializeAssets(splTokens: Asset[]): string {
              let splTokensDescription =
                'SPL Tokens:\n' +
                splTokens
                  .map(
                    token =>
                      `Token Name: ${token.content.metadata.name}, Symbol: ${token.content.metadata.symbol}`
                  )
                  .join('\n')
          
          
              return `${splTokensDescription}\n`
            }
          
            const tokensToSearch = serializeAssets(splTokens);
          
          const tools = [new TavilySearchResults({ maxResults: 1 , apiKey: "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"})];
          
          const prompt = await pull<ChatPromptTemplate>(
            "hwchase17/openai-functions-agent"
          );
          
          const llm = new ChatOpenAI({
              openAIApiKey: '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',
              //@ts-ignore
              model: 'gpt-3.5-turbo-16k',
              temperature: 0.9
          });
          
          const agent = await createOpenAIFunctionsAgent({
            llm,
            tools,
            prompt,
          });
          
          const agentExecutor = new AgentExecutor({
            agent,
            tools,
          });
          
          const result = await agentExecutor.invoke({
            input: `what is the latest information about these crypto tokens ? ${tokensToSearch}, if this token is not a well known or popular token. Just tell the user that it's not a significant token`,
          });
          
          setTokenInfo(result.output)
          
          console.log(result);
              }
            getLatestTokenInfo();
    }

   

  } )

  


  return (
    <div className="flex min-h-screen items-start p-4 gap-2">
      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium shrink-0 w-20">Address</p>
          <div className="flex-1 rounded-md bg-gray-100 p-3 dark:bg-gray-800">
            <p className="text-sm font-mono break-all">
              {wallet.publicKey?.toBase58() || 'N/A'}
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          <div className="grid gap-2 items-center">
            <div className="grid gap-0.5">
              {/* SPL-Tokens section */}
                    <h2>{analysis && (
                        <h3>{analysis}</h3>
                    )}</h2>

                <div className='grid gap-0.1'>
                    <h2>{tokenInfo && (
                        <h3>{tokenInfo}</h3>
                    )}</h2>

                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
