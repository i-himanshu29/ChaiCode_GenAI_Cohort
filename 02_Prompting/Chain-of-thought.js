// // COT - The model is encouraged to break down reasoning step by step before arriving at an answer.

// import 'dotenv/config';
// import { OpenAI } from 'openai';

// const client = new OpenAI();

// async function main() {
//   // These api calls are stateless (Chain Of Thought)
//   const SYSTEM_PROMPT = `
//     You are an AI assistant who works on START, THINK and OUTPUT format.
//     For a given user query first think and breakdown the problem into sub problems.
//     You should always keep thinking and thinking before giving the actual output.
//     Also, before outputing the final result to user you must check once if everything is correct.

//     Rules:
//     - Strictly follow the output JSON format
//     - Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
//     - After evey think, there is going to be an EVALUATE step that is performed manually by someone and you need to wait for it.
//     - Always perform only one step at a time and wait for other step.
//     - Alway make sure to do multiple steps of thinking before giving out output.

//     Output JSON Format:
//     { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }

//     Example:
//     User: Can you solve 3 + 4 * 10 - 4 * 3
//     ASSISTANT: { "step": "START", "content": "The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem" }
//     ASSISTANT: { "step": "THINK", "content": "This is typical math problem where we use BODMAS formula for calculation" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "Lets breakdown the problem step by step" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "As per bodmas, first lets solve all multiplications and divisions" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "So, first we need to solve 4 * 10 that is 40" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 4 * 3" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "Now, I can see one more multiplication to be done that is 4 * 3 = 12" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 12" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "As we have done all multiplications lets do the add and subtract" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "so, 3 + 40 = 43" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "new equations look like 43 - 12 which is 31" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "THINK", "content": "great, all steps are done and final result is 31" }
//     ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
//     ASSISTANT: { "step": "OUTPUT", "content": "3 + 4 * 10 - 4 * 3 = 31" }
//   `;

//   const messages = [
//     {
//       role: 'system',
//       content: SYSTEM_PROMPT,
//     },
//     {
//       role: 'user',
//       content: 'Write a code in JS to find a prime number as fast as possible',
//     },
//   ];

//   while (true) {
//     const response = await client.chat.completions.create({
//       model: 'gpt-4.1-mini',
//       messages: messages,
//     });

//     const rawContent = response.choices[0].message.content;
//     const parsedContent = JSON.parse(rawContent);

//     messages.push({
//       role: 'assistant',
//       content: JSON.stringify(parsedContent),
//     });

//     if (parsedContent.step === 'START') {
//       console.log(`🔥`, parsedContent.content);
//       continue;
//     }

//     if (parsedContent.step === 'THINK') {
//       console.log(`\t🧠`, parsedContent.content);

//       // Todo: Send the messages as history to maybe gemini and ask for a review and append it to history
//       // LLM as a judge techniuqe
//       messages.push({
//         role: 'developer',
//         content: JSON.stringify({
//           step: 'EVALUATE',
//           content: 'Nice, You are going on correct path',
//         }),
//       });

//       continue;
//     }

//     if (parsedContent.step === 'OUTPUT') {
//       console.log(`🤖`, parsedContent.content);
//       break;
//     }
//   }

//   console.log('Done...');
// }

// main();

// PART-2 --------------------------------------------------
// H.W
// COT - The model is encouraged to break down reasoning step by step before arriving at an answer.

import "dotenv/config";
import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";

// --- Setup OpenAI & Gemini Clients ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Helper: Serialize history for judge ---
function serializeHistory(messages, max = 14) {
  return messages
    .slice(-max)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

// --- Helper: Ask Gemini for evaluation ---
async function reviewWithGemini(messages) {
  const transcript = serializeHistory(messages);
  const prompt = `
  You are an external reviewer for an agent that emits steps: START, THINK, EVALUATE, OUTPUT.
  Your job: Read the conversation and strictly return a single JSON object like:
  {"step":"EVALUATE","content":"<short critique or 'Looks good'>"}
  Keep it under 280 characters. Return ONLY JSON, nothing else.
  
  Conversation transcript:
  ${transcript}
  `;

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const text = response?.response?.text?.();
    const parsed = JSON.parse(text);

    if (parsed?.step === "EVALUATE" && typeof parsed?.content === "string") {
      return parsed;
    }
    throw new Error("Invalid Gemini output");
  } catch (err) {
    console.error("⚠ Gemini judge failed:", err.message);
    return { step: "EVALUATE", content: "Review unavailable; continue." };
  }
}

async function main() {
  // These api calls are stateless (Chain Of Thought)
  const SYSTEM_PROMPT = `
    You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    You should always keep thinking and thinking before giving the actual output.
    Also, before outputing the final result to user you must check once if everything is correct.

    Rules:
    - Strictly follow the output JSON format
    - Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
    - After evey think, there is going to be an EVALUATE step that is performed manually by someone and you need to wait for it.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.

    Output JSON Format:
    { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }

    Example:
    User: Can you solve 3 + 4 * 10 - 4 * 3
    ASSISTANT: { "step": "START", "content": "The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem" } 
    ASSISTANT: { "step": "THINK", "content": "This is typical math problem where we use BODMAS formula for calculation" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Lets breakdown the problem step by step" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "As per bodmas, first lets solve all multiplications and divisions" }
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
    ASSISTANT: { "step": "THINK", "content": "So, first we need to solve 4 * 10 that is 40" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 4 * 3" }
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Now, I can see one more multiplication to be done that is 4 * 3 = 12" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 12" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "As we have done all multiplications lets do the add and subtract" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "so, 3 + 40 = 43" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "new equations look like 43 - 12 which is 31" } 
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
    ASSISTANT: { "step": "THINK", "content": "great, all steps are done and final result is 31" }
    ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
    ASSISTANT: { "step": "OUTPUT", "content": "3 + 4 * 10 - 4 * 3 = 31" } 
  `;

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: "Write a code in JS to find a prime number as fast as possible",
    },
  ];

  let turn = 0;
  while (true) {
    turn++;
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent);

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`\t🧠`, parsedContent.content);

      // Todo: Send the messages as history to maybe gemini and ask for a review and append it to history
      // LLM as a judge techniuqe

      // Ask Gemini for review
      const evalMsg = await reviewWithGemini(messages);

      messages.push({
        role: "developer",
        content: JSON.stringify(evalMsg),
      });

      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log(`🤖`, parsedContent.content);
      break;
    }

    // 🔹 Safety stop
    if (turn > 50) {
      console.error("⚠ Stopping to prevent infinite loop");
      break;
    }
  }

  console.log("Done...");
}

main();
