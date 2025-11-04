import { PineconeVector } from "@mastra/pinecone";
import * as dotenv from "dotenv";

dotenv.config();

const store = new PineconeVector({
  apiKey: process.env.PINECONE_API_KEY!,
});

await store.createIndex({
  indexName: "hngindex",
  dimension: 768,
});

export default store;
