import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { MDocument } from "@mastra/rag";

const googleEmbedding = google.textEmbeddingModel("text-embedding-004");
export const createMultipleEmbeddings = async (fileToEmbed: string) => {
  // Create MD Document for processing
  const doc = MDocument.fromText(fileToEmbed);

  // Create Chunk
  const chunks = await doc.chunk({
    strategy: "recursive",
    maxSize: 512,
    overlap: 50,
  });

  // Create Embeddings
  const { embeddings } = await embedMany({
    model: googleEmbedding,
    values: chunks.map((c) => c.text),
  });
  const multipleEmbeddings = embeddings;

  return { multipleEmbeddings, chunks };
};

export const createSingleEmbedding = async (query: string) => {
  const { embedding } = await embed({
    model: googleEmbedding,
    value: query,
  });

  return embedding;
};
