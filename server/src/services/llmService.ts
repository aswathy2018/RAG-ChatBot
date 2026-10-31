import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// it loads environment variables
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.warn('⚠️ WARNING: GOOGLE_API_KEY is not set in .env file');
}

// 1. initialize google gemini 1.5 flash as our LLM
// we set temperature to 0.2 so the model is strictly factual and avoids creative guessing
export const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-3.5-flash-lite',
    temperature: 0.2,
    maxRetries: 1,
    apiKey: apiKey
});

// builds the grounded prompt instructing the LLM to answer strictly using the context

export function buildPrompt(question: string, contextChunks: string[]): string {
    const combinedContext = contextChunks.join('\n\n---\n\n');

    return `You are Knowly, a helpful and accurate personal knowledge assistant.

Your task is to answer the user's question using ONLY the provided reference context below.

CRITICAL INSTRUCTIONS:
1. Base your answer strictly on the facts mentioned in the context.
2. If the context does not contain sufficient information to answer the question, you MUST clearly reply:
   "I could not find enough relevant information in the available documents to answer that question."
3. Do NOT invent facts, assume information, or use outside knowledge.
4. Keep your answer clear, concise, and professional.

---------------------
CONTEXT:
${combinedContext}
---------------------

USER QUESTION:
${question}

HELPFUL ANSWER:`;
}


// it sends the user question and retrieved context chunks to gemini to generate an answer
/**
* @param question - the user's question
* @param contextChunks - array of relevant text strings retrieved from vector store
* @returns Promise<string> The LLM's generated response
*/
export async function generateAnswer(
    question: string,
    contextChunks: string[]
): Promise<string> {
    try {
        const prompt = buildPrompt(question, contextChunks);
        const response = await llm.invoke(prompt);
        return response.content.toString();
    } catch (error: any) {
        console.error('Error generating answer from LLM:', error?.message || error);
        if (error?.cause) {
            console.error('Underlying network cause:', error.cause);
        }
        throw new Error('Failed to generate answer from the language model.');
    }
}

// verification runner: test with both an answerable and unanswerable question
async function verifyLLM() {
    console.log('--- Testing Google Gemini LLM Service ---');
    // Test Case 1: An answerable question with matching context
    const sampleQuestion1 = 'What is chunking and why is it needed?';
    const sampleContext1 = [
        'What is Chunking?\nChunking is the process of breaking down a large document into smaller, manageable text segments called chunks before converting them into embeddings. Chunking is necessary because embedding models and LLMs have strict token limits. Moreover, smaller chunks allow the retrieval system to pinpoint the exact paragraphs relevant to a user query.'
    ];
    console.log(`\n🧪 Test 1 (Answerable Question): "${sampleQuestion1}"`);
    const answer1 = await generateAnswer(sampleQuestion1, sampleContext1);
    console.log(`🤖 Knowly's Answer:\n${answer1}\n`);
    // Small 3-second delay to respect Google's free-tier rate limits
    console.log('⏳ Pausing 3 seconds to respect free-tier rate limits...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // Test Case 2: An unanswerable question (Checking guardrails!)
    const sampleQuestion2 = 'What is photosynthesis?';
    const sampleContext2 = [
        'What is Chunking?\nChunking is the process of breaking down a large document...'
    ];
    console.log(`\n🧪 Test 2 (Unanswerable Question - Guardrail Test): "${sampleQuestion2}"`);
    const answer2 = await generateAnswer(sampleQuestion2, sampleContext2);
    console.log(`🤖 Knowly's Answer:\n${answer2}\n`);
}

// run verification only if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    verifyLLM();
}