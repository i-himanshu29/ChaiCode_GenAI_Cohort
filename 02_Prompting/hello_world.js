// import 'dotenv/config';
// import {OpenAI} from "openai";

// const client = new OpenAI();

// async function main(){
//     // These api calls are stateless-(nothing remembers)
//     const response = await client.chat.completions.create({
//         model:'gpt-4.1-mini',
//         message:[{role:'user',content:'Hey,How are you?'}],
//     });
//     console.log(response.choices[0].message.content)
// }
// main();

// PART-2 -------------------------------------------
// CHATML(openai) format..........................
// import "dotenv/config";
// import { OpenAI } from "openai";

// const client = new OpenAI();

// async function main() {
//   // These api calls are stateless-(nothing remembers)
//   const response = await client.chat.completions.create({
//     model: "gpt-4.1-mini",
//     message: [
//         { role: "user", content: "Hey gpt,My name is Himanshu Maurya" },
//         {
//             role:'assistant',
//             content:'Hello Himanshu Maurya ! How can I assists you today?',
//         },
//         {role:'user',content:'What is my name?'},
//         {
//             role:'assistant',
//             content:'Your name is Himanshu Maurya . How can I help you further?',
//         },
//         {role:'user',content:'Write a poem on me'},
//     ],
//   });
//   console.log(response.choices[0].message.content);
// }
// main();

// PART-3 -------------------------------------------------------
// Gemnai compatibility with openai ......................

// import "dotenv/config";
// import  {OpenAI} from "openai";
// const client = new OpenAI({
//     // apiKey: "GEMINI_API_KEY",
//     apiKey: "Write your GEMINI_API_KEY",
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

// async function main() {
//   // These api calls are stateless-(nothing remembers)
//   const response = await client.chat.completions.create({
//     model: "gemini-2.0-flash",
//     message: [
//         { role: "user", content: "Hey gpt,My name is Himanshu Maurya" },
//         {
//             role:'assistant',
//             content:'Hello Himanshu Maurya ! How can I assists you today?',
//         },
//         {role:'user',content:'What is my name?'},
//         {
//             role:'assistant',
//             content:'Your name is Himanshu Maurya . How can I help you further?',
//         },
//         {role:'user',content:'Write a poem on me'},
//     ],
//   });
//   console.log(response.choices[0].message.content);
// }
// main();

//PART - 4------------------------------------------------
// System prompts............................
import "dotenv/config";
import { OpenAI } from "openai";
const client = new OpenAI();

async function main() {
  // These api calls are stateless-(nothing remembers)
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    message: [
      {
        role: "system",
        content: `
                    You're an AI assistant expert in coding with Javascript. You only and only know Javascript as coding language.
                    If user asks anything other than Javascript coding question, Do not ans that question.
                    You are an AI from ChaiCode which is an EdTech company transforming modern tech knowledge. Your name is ChaiCode and always ans as if you represent ChaiCode
                `,
      },
      { role: "user", content: "Hey gpt,My name is Himanshu Maurya" },
      {
        role: "assistant",
        content: "Hello Himanshu Maurya ! How can I assists you today?",
      },
      { role: "user", content: "What is my name?" },
      {
        role: "assistant",
        content: "Your name is Himanshu Maurya . How can I help you further?",
      },
      { role: "user", content: "Write a poem on me" },
    ],
  });
  console.log(response.choices[0].message.content);
}
main();
