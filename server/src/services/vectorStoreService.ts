import { loadKnowledgeDocument } from './documentService.js';
import { chunkText } from './chunkingService.js';
import { embedDocuments, embedQuery } from './embeddingService.js';
import { fileURLToPath } from 'url';

// shape of a stored record in our vector database
export interface VectorRecord {
  id: string;
  document: string;
  metadata: {
    source: string;
    chunkIndex: number;
  };
  embedding: number[];
}

// shape of a search result returned to the caller

export interface SearchResult {
  id: string;
  document: string;
  similarity: number;
  metadata: {
    source: string;
    chunkIndex: number;
  };
}

// this is in-memory collection of our vector records
let collection: VectorRecord[] = [];

/**
*calculates the cosine similarity between two numerical vectors.
*returns a score between -1 and 1 (closer to 1 = more semantically similar).
*formula = (A · B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
ingestion pipeline:
1.first loads knowledge.txt
2.splits text into chunks
3. generates 3072-dimensional vector embeddings using google gemini
4. indexes the records into our vector store
 */
export async function indexKnowledgeDocument(): Promise<number> {
  console.log('🔄 Starting knowledge ingestion pipeline...');

  // step 1: load the raw document
  const rawText = await loadKnowledgeDocument();

  // step 2: chunk the document
  const chunks = await chunkText(rawText, 500, 100);
  console.log(`📦 Created ${chunks.length} text chunks.`);

  // step 3: generate embeddings for each chunk
  const chunkTexts = chunks.map((c) => c.pageContent);
  console.log('⚡ Generating vector embeddings via Google Gemini...');
  const embeddings = await embedDocuments(chunkTexts);

  // step 4: store the records in our collection (with duplicate prevention)
  collection = chunks.map((chunk, index) => ({
    id: `chunk_${index}`,
    document: chunk.pageContent,
    metadata: {
      source: (chunk.metadata.source as string) || 'knowledge.txt',
      chunkIndex: index
    },
    embedding: embeddings[index]
  }));

  console.log(`💾 Successfully indexed ${collection.length} records!!!`);
  return collection.length;
}

// retrieves the currently indexed records. if the collection is empty, it automatically triggers indexing.

export async function getVectorCollection(): Promise<VectorRecord[]> {
  if (collection.length === 0) {
    await indexKnowledgeDocument();
  }
  return collection;
}

/**
*performs Semantic Similarity Search:
1. converts user query into a vector embedding
2. compares query vector against all stored chunk vectors
3. sorts by highest similarity score
4. returns top K matches
@param query - the user's question
@param topK - number of top relevant chunks to return (default: 3)
 */
export async function searchSimilarChunks(query: string, topK: number = 3): Promise<SearchResult[]> {
  const records = await getVectorCollection();
  // 1. convert the user's question into an embedding
  const queryEmbedding = await embedQuery(query);
  // 2. calculate similarity score for every stored chunk
  const scoredRecords: SearchResult[] = records.map((record) => {
    const similarity = calculateCosineSimilarity(queryEmbedding, record.embedding);
    return {
      id: record.id,
      document: record.document,
      similarity: similarity,
      metadata: record.metadata
    };
  });
  // 3. sort descending (highest similarity score first)
  scoredRecords.sort((a, b) => b.similarity - a.similarity);
  // 4. return the top K results
  return scoredRecords.slice(0, topK);
}
// verification runner: Test similarity search with real questions
async function verifySimilaritySearch() {
  console.log('--- Testing Similarity Search ---');
  
  const testQuery = 'Why is chunking necessary in RAG?';
  console.log(`\n🔍 Search Query: "${testQuery}"`);
  console.log('Searching for top 3 matching chunks...\n');
  const results = await searchSimilarChunks(testQuery, 3);
  results.forEach((res, index) => {
    console.log(`[Rank ${index + 1}] ID: ${res.id} | Similarity Score: ${res.similarity.toFixed(4)}`);
    console.log(`Content Preview:\n"${res.document.substring(0, 180)}..."\n`);
  });
}
// run verification only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifySimilaritySearch();
}