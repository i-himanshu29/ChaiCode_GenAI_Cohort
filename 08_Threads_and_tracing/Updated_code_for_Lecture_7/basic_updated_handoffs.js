import { Agent, run, tool } from "@openai/agents";
import "dotenv/config";
import { z } from "zod";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
//tool
const getCurrentTime = tool({
  name: "get_current_time",
  description: "This tool returns the current time",
  parameters: z.object({
    // userId:z.string() // you can also do
  }),
  async execute() {
    return new Date().toString();
  },
});

const getMenuTool = tool({
  name: "get_menu",
  description: "Fetches and return the menu items",
  parameters: z.object({}),
  async execute() {
    return {
      Drinks: {
        Chai: "INR 50",
        Coffee: "INR 60",
      },
      Veg: {
        DalMakhni: "INR 250",
        Panner: "INR 460",
      },
    };
  },
});

const cookingAgent = new Agent({
  name: "Cooking Agent",
  model: "gpt-4.1-mini",
  tools: [getCurrentTime, getMenuTool],
  instructions: `
      You are a helpfull cooking assistant who is specialized in cooking food.
      You help the users with the food options and recepies and help them cook food.`,
});

const codingAgent = new Agent({
  name: "Coding Agent",
  instructions: `
        You are an expert coding assistant particularly in javascript.`,
});

// handoffs-

// const gatewayAgent = new Agent.create({
//   name: "Gateway Agent",
//   instructions: `
//         You have list of handoffs which you need to use the handoff the current user query to the agent.
//         You can use Coding Agent if users ask about the coding questions.
//         You should handoff to Cooking Agent if question is related to cooking. `,

//   handoffs: [codingAgent, cookingAgent],
// });

// If You don't want to mention handoff then use ${RECOMMENDED_PROMPT_PREFIX}

const gatewayAgent = new Agent.create({
  name: "Gateway Agent",
  instructions: `
  ${RECOMMENDED_PROMPT_PREFIX}
        You have list of handoffs which you need to use the handoff the current user query to the agent.
        You can use Coding Agent if users ask about the coding questions.
        You should handoff to Cooking Agent if question is related to cooking. `,

  handoffs: [codingAgent, cookingAgent],
});

async function chatWithAgent(query) {
  const result = await run(gatewayAgent, query);
  console.log(`History`, result.history);
  console.log(`Handoff Too`, result.lastAgent.name);
  console.log(result.finalOutput);
}

chatWithAgent("Write a code in js on hello world");
// chatWithAgent("recipe of a cake");
// chatWithAgent("recipe of a cake and Javascript code to add two numbers");// it give ans of 1st.

