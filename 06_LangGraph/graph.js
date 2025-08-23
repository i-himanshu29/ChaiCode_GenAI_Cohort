// import "dotenv/config";
// import { ChatOpenAI } from "@langchain/openai";
// import { StateGraph, Annotation } from "@langchain/langgraph";
// import { z } from "zod";

// const llm = new ChatOpenAI({
//   model: "gpt-4.1-mini",
// });

// //create the fraph annotation
// const GraphAnnotation = Annotation.Root({
//   messages: Annotation({
//     reducer: (x, y) => x.concat(y), // Reducer to handle state updates
//     default: () => [],
//   }),
// });

// async function callOpenAI(state) {
//   console.log(`Inside callOpenAI`, state);
//   // Return the new messages to be added to state
//   return {
//     messages: ["Hey , I just added something to the state"],
//   };
// }

// async function runAfterCallOpenAI(state) {
//   console.log(`Inside runAfterCallOpenAI`, state);
//   return {
//     messages: ["Hey , I just added from runAfterCallOpenAI"],
//   };
// }

// // Define a new graph
// const workflow = new StateGraph(GraphAnnotation)
//   .addNode("callOpenAI", callOpenAI)
//   .addNode("runAfterCallOpenAI", runAfterCallOpenAI)
//   .addEdge("__start__", "callOpenAI") // __start__ is a special name for the entrypoint
//   .addEdge("callOpenAI", "runAfterCallOpenAI")
//   .addEdge("runAfterCallOpenAI", "__end__");

// // Finally, we compile it into a LangChain Runnable.
// const graph = workflow.compile();

// async function runGraph() {
//   const updatedState = await graph.invoke({ message: [] });
//   console.log("state after graph", updatedState);
// }

// runGraph();

// updated version ..............................................

// import "dotenv/config";
// import { ChatOpenAI } from "@langchain/openai";
// import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
// import { z } from "zod";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";

// const llm = new ChatOpenAI({
//   model: "gpt-4.1-mini",
// });

// async function callOpenAI(state) {
//   console.log(`Inside callOpenAI`, state);
//   const response = await llm.invoke(state.messages);
//   return {
//     messages: [response],
//   };
// }

// // Define a new graph
// const workflow = new StateGraph(MessagesAnnotation)
//   .addNode("callOpenAI", callOpenAI)
//   .addEdge("__start__", "callOpenAI") // __start__ is a special name for the entrypoint
//   .addEdge("callOpenAI", "runAfterCallOpenAI")
//   .addEdge("callOpenAI", "__end__");

// // Finally, we compile it into a LangChain Runnable.
// const graph = workflow.compile();

// async function runGraph() {
//   const userQuery = "Hey , My name is Piyush Garg";
//   const updatedState = await graph.invoke({
//     message: [new HumanMessage(userQuery)],
//   });
//   console.log("state after graph", updatedState);
// }

// runGraph();

// Most update version .............................................................

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { z } from "zod";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const agent = await createchaiCodeAgents();
const response = agent.invoke({ messages: ["hey There"] });

async function createchaiCodeAgents() {
  const llm = new ChatOpenAI({
    model: "gpt-4.1-mini",
  });
  async function callOpenAI(state) {
    console.log(`Inside callOpenAI`, state);
    const response = await llm.invoke(state.messages);
    return {
      messages: [response],
    };
  }

  // Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("callOpenAI", callOpenAI)
    .addEdge("__start__", "callOpenAI") // __start__ is a special name for the entrypoint
    .addEdge("callOpenAI", "runAfterCallOpenAI")
    .addEdge("callOpenAI", "__end__");

  // Finally, we compile it into a LangChain Runnable.
  const graph = workflow.compile();

  return graph;
}

// async function runGraph() {
//   const userQuery = "Hey , My name is Piyush Garg";
//   const updatedState = await graph.invoke({
//     message: [new HumanMessage(userQuery)],
//   });
//   console.log("state after graph", updatedState);
// }

// runGraph();
