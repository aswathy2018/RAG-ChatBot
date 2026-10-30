import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// load environment variables from .env file
dotenv.config();

// it verifies that the API key exists before initializing
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.warn('WARNING!!! GOOGLE_API_KEY is not set in .env file');
}

// it initializes google's active gemini-embedding-001 model
export const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-001',
  apiKey: apiKey
});

/**
converts a single string (e.g. a user question) into a vector of numbers.
@param text - the string to embed
@returns Promise<number[]> - array of 768 floating-point numbers
 */
export async function embedQuery(text: string): Promise<number[]> {
  try {
    const vector = await embeddingModel.embedQuery(text);
    return vector;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}

/**
converts multiple text chunks into an array of vectors.
@param texts - array of chunk strings to embed
@returns Promise<number[][]> - array of vector arrays
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  try {
    const vectors = await embeddingModel.embedDocuments(texts);
    return vectors;
  } catch (error) {
    console.error('Error generating document embeddings:', error);
    throw error;
  }
}

// verification runner to test embedding a single sample sentence
async function verifyEmbeddings() {
  console.log('Testing google gemini embedding model (gemini-embedding-001)...');
  const sampleSentence = 'What is Retrieval-Augmented Generation?';
  
  console.log(`Generating embedding for: "${sampleSentence}"...`);
  const vector = await embedQuery(sampleSentence);

  console.log('\nSuccessfully generated vector embedding!');
  console.log(`Vector Dimension Length: ${vector.length} numbers`);
  console.log(`Preview of first 5 numbers:`, vector.slice(0, 5));
}

// run verification only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyEmbeddings();
}
