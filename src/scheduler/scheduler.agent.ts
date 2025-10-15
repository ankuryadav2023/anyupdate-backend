import 'dotenv/config';
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from 'axios';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const llm = new ChatOpenAI({ model: "gpt-4o-mini" });

const tavilySearchTool = new TavilySearch({
    maxResults: 5,
    topic: "general"
});

const firecrawlScrapeTool = tool(
    async ({ url }) => {
        try {
            const response = await axios.post('https://api.firecrawl.dev/v2/scrape', {
                url: url,
                formats: ['markdown']
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return JSON.stringify(response.data);
        } catch (error) {
            console.log(error.message);
            return JSON.stringify(error.message);
        }
    },
    {
        name: "firecrawlScrapeTool",
        description: "Use this tool to scrape a webpage content",
        schema: z.object({
            url: z.string(),
        })
    }
);

const tools = [
    tavilySearchTool,
    firecrawlScrapeTool
];

const llmWithTools = llm.bindTools(tools);

const systemPromptForResearcherAgent = new SystemMessage('You are an excellent researcher. Your task is to reasearch on provided urls or topic.')

export async function researcherAgent(prompt) {
    let messages = [systemPromptForResearcherAgent, new HumanMessage(prompt)];
    let end_execution = false;
    while (!end_execution) {
        try {
            const response = await llmWithTools.invoke(messages);
            messages.push(response);
            if (response.response_metadata.finish_reason === 'tool_calls' && response.tool_calls) {
                for (let i = 0; i < response.tool_calls.length; i++) {
                    if (response.tool_calls[i].name === 'firecrawlScrapeTool') messages.push(await firecrawlScrapeTool.invoke(response.tool_calls[i]));
                    else messages.push(await tavilySearchTool.invoke(response.tool_calls[i]))
                }
            } else {
                end_execution = true;
                return response.content;
            }
        } catch (e) {
            end_execution = true;
            return `Error in executing agent: ${e.message}`;
        }
    }
}