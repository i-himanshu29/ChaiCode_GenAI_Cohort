// Input Embeddings : Generate embeddings for a given input text using OpenAI's API.
// It generates a high-dimensional vector representation of the input text that can be used for various NLP tasks such as semantic search, clustering, and classification.
// sementic meaning is captured in the embeddings due to which similar texts have similar embeddings.

import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function init() {
  const result = await client.embeddings.create({
    model: 'text-embedding-3-large',
    input: 'I love to visit India',
    encoding_format: 'float',
  });

  console.log(result.data[0].embedding.length);
}

init();