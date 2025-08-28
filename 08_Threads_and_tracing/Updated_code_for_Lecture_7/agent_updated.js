// import "dotenv/config";
// import { Agent, run, tool } from "@openai/agents";

// const customerSupportAgent = new Agent({
//   name: "Customer Support Agent",
//   instruction: `
//         You are a helpfull customer support agent.
//     `,
// });

// async function runAgentWithQuery(query = "") {
//   const result = await run(customerSupportAgent, query);
//   console.log(result.finalOutput);
// }

// runAgentWithQuery('Hey there, My name is Himanshu Maurya');
// it says we don't know

// Part-2 ....................................................................
// LangGraph have concept of Checkpointing
// for Message history
// thread - conversation history called

// Similarly OpenAI also have Threads concept (copy of langGraph)

//code...
//As of now it has not access to the databases
// import "dotenv/config";
// import { Agent, run, tool } from "@openai/agents";

// // Load messages from DataBases
// let database = []
// const customerSupportAgent = new Agent({
//   name: "Customer Support Agent",
//   instruction: `
//         You are a helpfull customer support agent.
//     `,
// });

// async function runAgentWithQuery(query = "") {
//   const result = await run(customerSupportAgent, query);
//   console.log(result.finalOutput);
// }

// runAgentWithQuery('Hey there, My name is Himanshu Maurya').then(()=>{
//   runAgentWithQuery('What is My name');
// });

//Now give access to the databases...

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";

// Load messages from DataBases
let database = [];
const customerSupportAgent = new Agent({
  name: "Customer Support Agent",
  instruction: `
        You are a helpfull customer support agent. 
    `,
});

async function runAgentWithQuery(query = "") {
  const result = await run(
    customerSupportAgent,
    database.concat({ role: "user", content: query })
  );
  database = result.history;
  console.log(result.finalOutput);
  console.log(`Database`,database);
}

runAgentWithQuery("Hey there, My name is Himanshu Maurya").then(() => {
  runAgentWithQuery("What is My name");
});
