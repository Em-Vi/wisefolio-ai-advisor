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
  
  // Function to format AI response for rendering
  const formatAIMessage = (content: string) => {
    if (isUser) return <p className="text-sm">{content}</p>;
    
    // Split the content by double asterisks to identify headings
    const parts = content.split(/\*\*(.*?)\*\*/g);
    
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {parts.map((part, index) => {
          // Every odd index contains text between double asterisks (headings)
          if (index % 2 === 1) {
            return <h3 key={index} className="font-bold text-base mt-3 mb-1">{part}</h3>;
          }
          
          // Process regular content with paragraph breaks
          if (part.trim()) {
            return (
              <React.Fragment key={index}>
                {part.split('\n\n').map((paragraph, pIndex) => (
                  <React.Fragment key={`p-${pIndex}`}>
                    {paragraph.split('\n').map((line, lIndex) => (
                      <React.Fragment key={`l-${lIndex}`}>
                        {line}
                        {lIndex < paragraph.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                    {pIndex < part.split('\n\n').length - 1 && <p className="my-2"></p>}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
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
        {formatAIMessage(message.content)}
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
