import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// it calculate the directory of the current module in modern es modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// it construct the absolute path to knowledge.txt
const KNOWLEDGE_PATH = path.resolve(__dirname, '../data/knowledge.txt');


 // loads the raw text from the knowledge document.
export async function loadKnowledgeDocument(): Promise<string> {
  try {
    const content = await fs.readFile(KNOWLEDGE_PATH, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading knowledge document at: ${KNOWLEDGE_PATH}`, error);
    throw new Error('Failed to load knowledge document from disk.');
  }
}

// if this file is executed directly with tsx, read and display document statistics
async function verifyDocument() {
  console.log('Reading knowledge document...');
  const text = await loadKnowledgeDocument();
  console.log('Successfully loaded document!');
  console.log(`Character count: ${text.length}`);
  console.log(`Sample preview:\n"${text.substring(0, 150)}..."`);
}

// run verification only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyDocument();
}
