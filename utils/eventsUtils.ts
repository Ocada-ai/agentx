    // Import necessary components
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";


export async function searchTheWeb(input:string) {
   
    const tools = [new TavilySearchResults({ maxResults: 1 })];
    
    const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-functions-agent");
  
    const llm = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      temperature: 0,
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
      input: input,
    });

    console.log(result);
  }