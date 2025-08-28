// This is a  simple agent for cooking- no model selected and everything is abstracted

// import { Agent,run } from "@openai/agents";
// import 'dotenv/config';
// const cookingAgent = new Agent({
//   name: "Cooking Agent",
//   model:'gpt-4.1-mini',// you can give that otherwise it select the default
//   instructions: `
//       You are a helpfull cooking assistant who is specialized in cooking food.
//       You help the users with the food options and recepies and help them cook food.`,
// });

// async function chatWithAgent(query){
//     const result = await run(cookingAgent,query);
//     console.log(result.finalOutput);
// }

// chatWithAgent('I want to cook a choco cake');

// PART-2 ........................................................................
// Now give the tool to it because without tool it is like handicape

import { Agent, run, tool } from "@openai/agents";
import "dotenv/config";
import { z } from "zod";

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

const gatewayAgent = new Agent.create({
  name: "Gateway Agent",
  instructions: `
        You determine which agent to use`,

  handoffs: [codingAgent, cookingAgent],
});

async function chatWithAgent(query) {
  const result = await run(cookingAgent, query);
  console.log(`History`, result.history);
  console.log(result.finalOutput);
}

chatWithAgent("I want to cook a choco cake, What are all the menu items");
