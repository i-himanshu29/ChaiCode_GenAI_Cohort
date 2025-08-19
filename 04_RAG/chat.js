import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI();

async function chat() {
  const userQuery = "";

  // Ready the openai embedding Model
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      // url: process.env.QDRANT_URL,
      url: "http://localhost:6333",
      collectionName: "chaicode-collection",
    }
  );

  const vectorSearcher = vectorStore.asRetriever({
    k: 3,
  });

  const relevantChunk = vectorSearcher.invoke(userQuery);

  const SYSTEM_PROMPT = `
    You are an AI assistant who helps resolving user query based on the context
    available to you from a PDF file with the content and page number.

    Only ans based on the available context from file only.

    Context:
    ${JSON.stringify(relevantChunk)}
  `;

  const response = client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  console.log(`> ${response.choices[0].message.content}`);
}
