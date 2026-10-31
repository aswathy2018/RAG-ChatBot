import React from 'react';
import type { ChatMessageItem } from '../types';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
        <div className="message-header">
          <span className="sender-name">{isUser ? 'You' : 'Knowly'}</span>
          <span className="message-time">{message.timestamp}</span>
        </div>
        <div className="message-text">{message.text}</div>

        {/* source attribution for bot answers */}
        {/* {message.sources && message.sources.length > 0 && (
          <div className="sources-container">
            <span className="sources-title">Referenced Sources:</span>
            <div className="sources-list">
              {message.sources.map((source) => (
                <span key={source.id} className="source-pill" title={source.preview}>
                  {source.id} (Score: {source.similarity})
                </span>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};