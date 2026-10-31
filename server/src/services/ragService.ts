import { searchSimilarChunks, SearchResult } from './vectorStoreService.js';
import { generateAnswer } from './llmService.js';
import { fileURLToPath } from 'url';


// the structured response returned by our RAG system

export interface RagResponse {
  question: string;
  answer: string;
  sources: Array<{
    id: string;
    similarity: number;
    preview: string;
  }>;
}

/**
complete end-to-end RAG pipeline:
1. validates the question
2. retrieves top 3 most relevant chunks via Cosine Similarity
3. sends question and chunks to Google Gemini
4. returns the answer with source references
 @param question - the user's input question
 @returns Promise<RagResponse> complete answer with source attribution
 */
export async function askQuestion(question: string): Promise<RagResponse> {
  // Step 1: input validation
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    throw new Error('Question cannot be empty.');
  }

  console.log(`\n🔍 [RAG Pipeline] Processing: "${trimmedQuestion}"`);

  // Step 2: retrieval-find top 3 relevant chunks
  const searchResults: SearchResult[] = await searchSimilarChunks(trimmedQuestion, 3);
  console.log(`📦 [RAG Pipeline] Retrieved ${searchResults.length} relevant chunks.`);

  // Step 3: extract chunk text for the LLM
  const contextChunks = searchResults.map((result) => result.document);

  // Step 4: generation-generate answer using gemini and guardrails
  console.log('⚡ [RAG Pipeline] Generating answer with Google Gemini...');
  const answer = await generateAnswer(trimmedQuestion, contextChunks);

  // Step 5: package response with source attribution
  const response: RagResponse = {
    question: trimmedQuestion,
    answer: answer,
    sources: searchResults.map((result) => ({
      id: result.id,
      similarity: parseFloat(result.similarity.toFixed(4)),
      preview: `${result.document.substring(0, 100)}...`
    }))
  };

  return response;
}

// verification runner: test the complete end-to-end RAG pipeline
async function verifyRagService() {
  console.log('=========================================');
  console.log('🚀 Testing Complete Unified RAG Pipeline');
  console.log('=========================================');

  // Test 1: core document question
  const q1 = 'What is the purpose of ChromaDB and vector databases?';
  const res1 = await askQuestion(q1);

  console.log(`\n❓ Question: ${res1.question}`);
  console.log(`💡 Answer:\n${res1.answer}`);
  console.log('\n📚 Sources Used:');
  res1.sources.forEach((s) => console.log(`   - [${s.id}] (Score: ${s.similarity}): "${s.preview}"`));

  // small delay to respect API rate limits
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 2: out-of-domain question (testing guardrails across the whole pipeline)
  const q2 = 'How do airplanes generate lift?';
  const res2 = await askQuestion(q2);

  console.log(`\n❓ Question: ${res2.question}`);
  console.log(`💡 Answer:\n${res2.answer}`);
  console.log('\n📚 Sources Checked:');
  res2.sources.forEach((s) => console.log(`   - [${s.id}] (Score: ${s.similarity}): "${s.preview}"`));
}

// run verification only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  verifyRagService();
}