export interface MessageSource {
  id: string;
  similarity: number;
  preview: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: MessageSource[];
  timestamp: string;
}