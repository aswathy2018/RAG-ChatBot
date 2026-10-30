import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { loadKnowledgeDocument } from './documentService.js';
import { fileURLToPath } from 'url';

/**
 * @param rawText - this is the raw string loaded from knowledge.txt
 * @param chunkSize - maximum number of characters per chunk and the default is 500
 * @param chunkOverlap - the number of overlapping characters between chunks and the default is 100
 * @returns Promise<Document[]> an array of LangChain Document objects with pageContent and metadata
 */
export async function chunkText(
  rawText: string,
  chunkSize: number = 500,
  chunkOverlap: number = 100
): Promise<Document[]> {
  // first initializes the splitter with our chosen size and overlap rules
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    // splitting hierarchy: paragraphs - lines - words - characters
    separators: ['\n\n', '\n', ' ', '']
  });

  // then create Document chunks with metadata
  const chunks = await splitter.createDocuments(
    [rawText],
    [{ source: 'knowledge.txt' }] // metadata attached to every chunk
  );

  return chunks;
}

// verification runner - run directly to inspect the created chunks
async function verifyChunking() {
  console.log('Loading knowledge document for chunking test...');
  const text = await loadKnowledgeDocument();

  console.log(`Splitting text (chunkSize: 500, chunkOverlap: 100)...`);
  const chunks = await chunkText(text, 500, 100);

  console.log(`\nSuccessfully generated ${chunks.length} chunks!!\n`);

  // display the first 3 chunks to inspect their structure
  chunks.slice(0, 3).forEach((chunk, index) => {
    console.log(`--- [CHUNK ${index + 1}] (Length: ${chunk.pageContent.length} chars) ---`);
    console.log(`Metadata:`, chunk.metadata);
    console.log(`Content:\n${chunk.pageContent}\n`);
  });
}

// run verification only if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyChunking();
}
