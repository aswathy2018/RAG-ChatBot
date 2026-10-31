import type { MessageSource } from '../types';

// the URL where our Express backend is listening
const API_BASE_URL = 'http://localhost:5000';

export interface ChatApiResponse {
  success: boolean;
  data: {
    question: string;
    answer: string;
    sources: MessageSource[];
  };
  error?: string;
}

/**
 * sends a question to the express RAG backend
 * @param question - the user's prompt
 * @returns Promise<ChatApiResponse['data']> the answer and sources
 */
export async function sendChatMessage(question: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });

    const json: ChatApiResponse = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.error || `Server responded with status: ${response.status}`);
    }

    return json.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(
      error.message || 'Unable to connect to the Knowly server. Please make sure the backend is running.'
    );
  }
}