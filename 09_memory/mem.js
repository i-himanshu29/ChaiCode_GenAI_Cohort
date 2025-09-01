import "dotenv/config";
import { Memory } from "mem0ai/oss";
import { OpenAI } from "openai";

const client = new OpenAI();
const mem = new Memory({
  version: "v1.1",

  vectorStore: {
    provider: "qdrant",
    config: {
      collectionName: "memories",
      embeddingModelDims: 1536,
      host: "localhost",
      port: 6333,
    },
  },
});

async function chat(query = "") {
  const memories = await mem.search(query, { userId: "Himanshu" });
  //   console.log("Got Memories", memories.results);
  const memStr = memories.results.map((e) => e.memory).join("\n");

  const SYSTEM_PROMPT = `
        Context About User:
        ${memStr}
    `;
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
  });
  console.log(`\n\nBot:`, response.choices[0].message.content);
  console.log("Adding Memory.");

  await mem.add(
    [
      { role: "user", content: query },
      { role: "assistant", content: query },
    ],
    {
      userId: "Himanshu",
    }
  );
  console.log("Adding Memory done..");
}

chat("Hey Agent , You know my name is Himanshu Maurya and I am from UP");
