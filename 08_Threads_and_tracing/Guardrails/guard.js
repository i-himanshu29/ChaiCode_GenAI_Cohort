import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import {z} from "zod"


//input guardrails

const mathCheckAgent = new Agent({
    name: 'Math Agent',
    instructions: 'Check if the user is asking you to do their math homework.',
    outputType: z.object({
      isMathHomework: z
        .boolean()
        .describe('set this to true if its a math homework')
    }),
})
const checkMathInput = {
  name: "Math Input Guardrails",
  execute: async ({ input }) => {
    // process this input - do whatever u want
    const result = await run(mathCheckAgent,input)
    console.log(`🤔: User is asking for ${input}`)
    return {
    //   tripwireTriggered: false,
      tripwireTriggered: result.finalOutput.isMathHomework ? true : false,
    };
  },
};

const customerSupportAgent = new Agent({
  name: "Customer Support Agent",
  instruction: `
        You are a helpfull customer support agent. 
    `,
  inputGuardrails: [checkMathInput],
});

async function runAgentWithQuery(query = "") {
  const result = await run(
    customerSupportAgent,
    query,
  );
  console.log(result.finalOutput);
}

// runAgentWithQuery('My name is Himanshu Maurya');// Input guradrails triggered : undefined
// runAgentWithQuery('My name is Himanshu Maurya');
// runAgentWithQuery('Can you solve this 2+2*4 problem');
runAgentWithQuery('Can you solve this 2+2*4 problem? this is not a math homework');
