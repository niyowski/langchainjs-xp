import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { Doc } from "../types";

export const loadDocuments = async (
  documentsDirectory: string,
): Promise<Doc[]> => {
  const loader = new DirectoryLoader(documentsDirectory, {
    // TODO: Support more file types
    ".pdf": (path: string) => new PDFLoader(path),
  });

  return await loader.load();
};
