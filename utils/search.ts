import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";

import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

import { LLMChain } from 'langchain/chains'


// import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from '@langchain/core/runnables'
import { AgentFinish, AgentAction } from '@langchain/core/agents'
import { BaseMessageChunk } from '@langchain/core/messages'

export default async function searchInternet(input: string) {

// Define the tools the agent will have access to.
const tools = [
    new TavilySearchResults({
      maxResults: 1,
      apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY
    })
  ]

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/openai-functions-agent
const prompt = await pull<ChatPromptTemplate>(
  "hwchase17/openai-functions-agent"
);



const llm = new ChatOpenAI({
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    //@ts-ignore
    model: 'gpt-3.5-turbo-16k',
    temperature: 0.9
  })

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt
  })
  const agentExecutor = new AgentExecutor({
    agent,
    tools
  })

  // Invoking the agent to get results
  const result = await agentExecutor.invoke({
    input: `what is the latest information about these crypto tokens ? ${tokensToSearch}, if this token is not a well known or popular token. Just tell the user that it's not a significant token`
  })


  console.log(`this is the damn result: ${result}`)


}
