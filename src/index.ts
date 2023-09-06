import fs from "fs";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

import { calculateCost } from "./cost/calculator";
import { loadDocuments, normalizeDocuments } from "./document";
import { OPENAI_API_KEY } from "./environment";

const COST_LIMIT = 1; // in USD
const DOCUMENTS_DIR = `${process.cwd()}/documents`;
const VECTOR_STORE_PATH = `${process.cwd()}/data/documents.index`;

export const run = async () => {
  const query = process.argv[2];
  if (!query) {
    throw new Error("No query provided.");
  }

  console.log("Loading documents...");
  const documents = await loadDocuments(DOCUMENTS_DIR);
  console.log("Documents loaded.");

  console.log("Calculating the cost...");
  const { tokenCount, cost } = await calculateCost(documents);
  console.log(`Cost calculated. Token count: ${tokenCount}, Cost: ${cost}.`);

  if (cost > COST_LIMIT) {
    throw new Error(
      `The cost is too high. Cost: ${cost}, Limit: ${COST_LIMIT}.`,
    );
  }

  const model = new OpenAI({ openAIApiKey: OPENAI_API_KEY });
  const embeddings = new OpenAIEmbeddings();

  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("Loading vector store...");
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);
    console.log("Vector store loaded.");
  } else {
    console.log("Creating vector store...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const normalizedDocs = normalizeDocuments(documents);
    const splitDocs = await splitter.createDocuments(normalizedDocs);
    vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
    await vectorStore.save(VECTOR_STORE_PATH);
    console.log("Vector store created.");
  }

  const retriever = vectorStore.asRetriever();
  const chain = RetrievalQAChain.fromLLM(model, retriever);
  const res = await chain.call({
    query,
  });

  console.log(query);
  console.log(res);
};

run();
