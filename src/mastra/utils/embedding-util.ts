import { ModelRouterEmbeddingModel } from "@mastra/core";
import { embed, embedMany } from "ai";
import { MDocument } from "@mastra/rag";

export const createMultipleEmbeddings = async (fileToEmbed: string) => {
  const embeddingModel = new ModelRouterEmbeddingModel(
    "google/text-embedding-004"
  );

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
    model: embeddingModel,
    values: chunks.map((c) => c.text),
  });
  const multipleEmbeddings = embeddings;

  return { multipleEmbeddings, chunks };
};

export const createSingleEmbedding = async (query: string) => {
  const embeddingModel = new ModelRouterEmbeddingModel(
    "google/text-embedding-004"
  );

  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  return embedding;
};
