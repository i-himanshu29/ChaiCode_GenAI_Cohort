import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

async function init() {
  const pdfFilePath = "./solution.pdf";
  const loader = new PDFLoader(pdfFilePath);

  // page by page load the pdf file
  const docs = await loader.load();

  // Ready the openai embedding Model
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });

  // connection
  const vectorStore = await QdrantVectorStore.fromDocuments(embeddings, {
    // url: process.env.QDRANT_URL,
    url: "http://localhost:6333",
    collectionName: "chaicode-collection",
  });

  connsole.log("Indexing of documents done");
}
