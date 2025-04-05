
import React from 'react';
import { Avatar } from '@/components/ui/avatar';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatMessageProps {
  message: ChatMessage;
}

export function AIChatMessage({ message }: AIChatMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="h-8 w-8 mr-2 bg-finance-blue-700 flex items-center justify-center text-white">
          <span className="text-xs font-medium">AI</span>
        </Avatar>
      )}
      
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser 
            ? 'bg-finance-blue-600 text-white' 
            : 'bg-muted border border-border'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-muted-foreground'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8 ml-2 bg-gray-700 flex items-center justify-center text-white">
          <span className="text-xs font-medium">You</span>
        </Avatar>
      )}
    </div>
  );
}
