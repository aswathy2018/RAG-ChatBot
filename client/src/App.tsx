import { useState, useRef, useEffect } from 'react';
import type { ChatMessageItem } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { sendChatMessage } from './services/api';
import './index.css';

export function App() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am Knowly, your personal knowledge assistant. Ask me anything about RAG, embeddings, chunking, or vector databases!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ref to track the bottom of the chat window
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // auto-scroll to the bottom whenever messages change or loading state toggles
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);


//  handles user question submission with real backend RAG integration

  const handleSendMessage = async (text: string) => {
    setErrorMessage(null);

    // append user's question
    const userMessage: ChatMessageItem = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMessage]);

    // set loading state
    setIsLoading(true);

    try {
      // send question to Express backend
      const result = await sendChatMessage(text);

      // append bot's answer
      const botMessage: ChatMessageItem = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: result.answer,
        sources: result.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-badge">RAG ASSISTANT</div>
        <h1>Knowly</h1>
        <p className="header-subtitle">
          Grounded knowledge assistant powered by TypeScript and Google Gemini
        </p>
      </header>

      {/* Chat Messages Window */}
      <main className="chat-window">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="loading-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="loading-text">Knowly is searching documents...</span>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="error-banner">{errorMessage}</div>
        )}

        {/* Invisible anchor element to scroll down to */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="input-container">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
}

export default App;