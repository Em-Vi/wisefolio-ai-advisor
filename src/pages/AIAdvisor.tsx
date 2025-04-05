
import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage, ChatMessage } from '@/components/ai/AIChatMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendHorizontal, Bot, User } from 'lucide-react';

// Sample AI responses for demo purposes
const aiResponses = [
  "Based on your investment goals and risk tolerance, I recommend diversifying your portfolio with a mix of growth stocks and dividend-paying companies. A 60/40 split between equities and bonds would be appropriate for your moderate risk profile.",
  "Looking at the current market conditions, technology and healthcare sectors show strong growth potential for the next quarter. Consider allocating 20-25% of your portfolio to these sectors.",
  "The recent volatility in the market suggests a cautious approach. You might want to consider dollar-cost averaging into your positions rather than investing a lump sum all at once.",
  "When investing in individual stocks, it's important to assess their financial health. Look for companies with strong balance sheets, consistent revenue growth, and manageable debt levels.",
  "For retirement planning, a good rule of thumb is to save at least 15% of your pre-tax income annually. Given your time horizon of 25 years until retirement, a growth-oriented strategy would be appropriate, gradually shifting to more conservative investments as you approach retirement age."
];

const AIAdvisor = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Financial Advisor. How can I help you with your investment decisions today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      // Get random AI response for demo
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <h1 className="text-2xl font-bold mb-4">AI Financial Advisor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        <div className="md:col-span-2 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bot size={18} className="mr-2 text-finance-blue-600" />
                <span>Financial Advisor Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 pr-2">
                {messages.map((message) => (
                  <AIChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder="Ask about investments, market trends, or financial planning..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !input.trim()}>
                  <SendHorizontal size={18} />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Suggested Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "What stocks should I invest in for long-term growth?",
                  "How do I balance my portfolio based on risk tolerance?",
                  "What's your take on the current market conditions?",
                  "How much should I save for retirement?",
                  "Should I invest in individual stocks or ETFs?",
                  "What tax-efficient investing strategies would you recommend?"
                ].map((topic, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full justify-start text-sm h-auto py-2 text-left"
                    onClick={() => setInput(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your AI Advisor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-finance-blue-700 rounded-full flex items-center justify-center text-white mr-3">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-medium">WiseAdvisor AI</h3>
                  <p className="text-sm text-muted-foreground">Financial Expert</p>
                </div>
              </div>
              <p className="text-sm">
                Powered by advanced market analysis and financial data, your AI Advisor provides personalized investment guidance based on your goals, risk tolerance, and market conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
