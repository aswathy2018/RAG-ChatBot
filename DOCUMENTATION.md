# Knowly — Project Documentation

## Project Overview
Knowly is a beginner-friendly Retrieval-Augmented Generation (RAG) assistant built using the MERN stack architecture, TypeScript, and ChromaDB.

-------------------------------------------------------------------------------------------------

## Step 1: Project Setup and Architecture
- **What was implemented**:
  - Initialized a decoupled client-server project structure.
  - Configured `server/` with Node.js, TypeScript, and `ts-node-dev`.
  - Configured `client/` with React, Vite, and TypeScript.
- **Why this structure**:
  - Separating the client and server ensures clear boundaries: the frontend handles UI presentation, while the backend handles sensitive business logic, API keys, and database operations.
- **Key Concepts Learned**:
  - Difference between dependencies and devDependencies.
  - Role of `tsconfig.json` in enforcing type safety.
  - Role of `ts-node-dev` in rapid development without manual re-compilation.



-------------------------------------------------------------------------------------------------

## Step 2: Express Backend and Health Endpoint
- **What was implemented**:
  - Installed Express, CORS, and Dotenv with their TypeScript types.
  - Separated the Express application (`app.ts`) from the server listener (`server.ts`).
  - Added global middleware for CORS and JSON parsing.
  - Created a health check endpoint at `GET /health`.
- **Why this structure**:
  - Decoupling `app.ts` from `server.ts` makes the application modular and testable without locking a network port during tests.
- **Key Concepts Learned**:
  - Client-server request/response cycle.
  - The role of ports and HTTP status codes (`200 OK`).
  - Why CORS middleware is essential when the frontend and backend run on different ports.



-------------------------------------------------------------------------------------------------

## Step 3: Knowledge Document Preparation and Loading
- **What was implemented**:
  - Created `server/src/data/knowledge.txt` containing foundational RAG concepts (RAG, LLMs, Embeddings, Chunking, Vector Databases, ChromaDB, Similarity Search, Hallucinations, and Guardrails).
  - Built `server/src/services/documentService.ts` to asynchronously load the document using Node's `fs/promises`.
- **Why this structure**:
  - Keeping the knowledge source in a dedicated `data/` folder and accessing it through a dedicated service enforces separation of concerns.
- **Key Concepts Learned**:
  - The role of external knowledge as the "ground truth" to minimize hallucinations.
  - Asynchronous file I/O using `async / await` and `fs/promises`.
  - ES Module path resolution using `import.meta.url` and `fileURLToPath`.



-------------------------------------------------------------------------------------------------

## Step 4: Text Chunking Implementation
- **What was implemented**:
  - Installed `@langchain/textsplitters` and `@langchain/core`.
  - Built `server/src/services/chunkingService.ts` using `RecursiveCharacterTextSplitter`.
  - Configured `chunkSize` (500) and `chunkOverlap` (100) with hierarchical separators (`\n\n`, `\n`, ` `, `""`).
- **Why chunking is required**:
  - LLMs and embedding models have input limits.
  - Converting an entire document into one vector dilutes semantic meaning.
  - Chunks allow the vector database to retrieve only the precise paragraphs relevant to a user's question.
- **Key Concepts Learned**:
  - What `chunkSize` and `chunkOverlap` do and why overlap prevents lost context at boundaries.
  - The structure of a LangChain `Document` object (`pageContent` and `metadata`).




-------------------------------------------------------------------------------------------------

## Step 5: Vector Embeddings Generation
- **What was implemented**:
  - Configured Google Gemini API key securely in `server/.env`.
  - Installed `@langchain/google-genai`.
  - Created `server/src/services/embeddingService.ts` using the `text-embedding-004` model.
  - Implemented `embedQuery()` for single questions and `embedDocuments()` for batches of text chunks.
- **Why embeddings are required**:
  - Vector databases and search algorithms cannot search raw text by meaning; they operate on numerical vectors.
  - Embeddings map semantic relationships so that semantically related concepts occupy nearby positions in high-dimensional mathematical space.
- **Key Concepts Learned**:
  - The difference between raw text, chunks, embeddings, embedding models, and LLMs.
  - Vector dimensions (e.g. 768 floating-point coordinates per text snippet).
  - Secure API key management via environment variables and `.gitignore`.



-------------------------------------------------------------------------------------------------

## Step 6: ChromaDB Vector Database Setup and Ingestion
- **What was implemented**:
  - Configured and launched ChromaDB as a local vector database running on port 8000.
  - Installed the official `chromadb` npm client.
  - Built `server/src/services/vectorStoreService.ts` to manage the complete ingestion pipeline.
  - Used `collection.upsert()` to store IDs, 3072-dimensional embeddings, chunk texts, and metadata without creating duplicates on re-indexing.
- **Why ChromaDB instead of MongoDB**:
  - MongoDB handles keyword queries, transactional data, and metadata.
  - ChromaDB uses specialized vector indexing (e.g. HNSW) to perform high-dimensional cosine similarity searches across embeddings in milliseconds.
- **Key Concepts Learned**:
  - ChromaDB core structure: Collections, Documents, Embeddings, Metadata, and IDs.
  - The `upsert` pattern for idempotent document ingestion.



  -------------------------------------------------------------------------------------------------

## Step 7: Similarity Search Implementation
- **What was implemented**:
  - Implemented `searchSimilarChunks(query, topK)` in `server/src/services/vectorStoreService.ts`.
  - Added vector comparison using Cosine Similarity: `(A · B) / (||A|| * ||B||)`.
  - Added ranking and extraction of top-K most semantically similar chunks.
- **Why similarity search is needed before generation**:
  - Validates that the retrieval pipeline accurately finds the correct knowledge paragraphs before involving the LLM.
- **Key Concepts Learned**:
  - How Cosine Similarity quantifies the angle between high-dimensional vectors.
  - The parameter `topK` and its role in limiting context length.
  - Why similarity scores reflect semantic closeness rather than percentage of factual truth.



  -------------------------------------------------------------------------------------------------

## Step 8: LLM Integration and Prompt Engineering
- **What was implemented**:
  - Configured Google Gemini (`gemini-1.5-flash`) via LangChain's `ChatGoogleGenerativeAI`.
  - Configured `temperature: 0.2` for deterministic, grounded outputs.
  - Implemented `buildPrompt()` with explicit guardrails instructing the model to rely solely on the provided context.
  - Implemented `generateAnswer()` to invoke the LLM and return formatted answers.
- **Why prompt engineering and guardrails are required**:
  - Prevents the model from hallucinating or answering from public internet memory on topics outside the approved knowledge base.
- **Key Concepts Learned**:
  - The fundamental distinction between embedding models (representation) and LLMs (generation).
  - The role of temperature in controlling randomness.
  - The necessity of testing guardrails against unanswerable queries.