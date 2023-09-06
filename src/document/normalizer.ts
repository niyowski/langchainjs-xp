import { Doc } from "../types";

const normalizeDocument = (doc: Doc) => {
  if (typeof doc.pageContent === "string") {
    return doc.pageContent;
  }

  console.log("doc.pageContent", doc.pageContent);
  throw new Error("Document's pageContent is not a string.");
};

export const normalizeDocuments = (docs: Doc[]) => {
  return docs.map(normalizeDocument);
};
