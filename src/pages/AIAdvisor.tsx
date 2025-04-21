import React, { useState, useRef, useEffect } from 'react';
import { AIChatMessage, ChatMessage } from '@/components/ai/AIChatMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendHorizontal, Bot, User, Loader2 } from 'lucide-react';
import { useFinancialAdvisor } from '@/hooks/useFinancialAdvisor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // User context for personalized advice
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [investmentHorizon, setInvestmentHorizon] = useState<'short' | 'medium' | 'long'>('medium');
  const [portfolioSize, setPortfolioSize] = useState<number>(25000);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: getAIResponse, isPending } = useFinancialAdvisor();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isPending) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // User context to personalize responses
      const userContext = {
        riskTolerance,
        investmentHorizon,
        investmentGoals: ['Growth', 'Income', 'Preservation'],
        portfolioSize,
      };
      
      // Get AI response
      const response = await getAIResponse({ 
        query: input,
        userContext
      });
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Error already handled by the hook with toast
      console.error('Error getting AI response:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <h1 className="text-2xl font-bold mb-4">AI Financial Advisor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
        <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-lg flex items-center">
                <Bot size={18} className="mr-2 text-finance-blue-600" />
                <span>Financial Advisor Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
              <ScrollArea className="flex-1 pr-2 mb-4">
                {messages.map((message) => (
                  <AIChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto shrink-0">
                <Input 
                  placeholder="Ask about investments, market trends, or financial planning..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isPending}
                  className="flex-1"
                />
                <Button type="submit" disabled={isPending || !input.trim()}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal size={18} />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="overflow-y-auto h-full pr-1 pb-4">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                  <Select value={riskTolerance} onValueChange={(val) => setRiskTolerance(val as 'low' | 'medium' | 'high')}>
                    <SelectTrigger id="risk-tolerance">
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Conservative</SelectItem>
                      <SelectItem value="medium">Medium - Balanced</SelectItem>
                      <SelectItem value="high">High - Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-horizon">Investment Horizon</Label>
                  <Select value={investmentHorizon} onValueChange={(val) => setInvestmentHorizon(val as 'short' | 'medium' | 'long')}>
                    <SelectTrigger id="time-horizon">
                      <SelectValue placeholder="Select time horizon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short-term (0-2 years)</SelectItem>
                      <SelectItem value="medium">Medium-term (2-5 years)</SelectItem>
                      <SelectItem value="long">Long-term (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="portfolio-size">Portfolio Size ($)</Label>
                  <Input
                    id="portfolio-size"
                    type="number"
                    value={portfolioSize}
                    onChange={(e) => setPortfolioSize(Number(e.target.value))}
                    placeholder="Enter your portfolio size"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Suggested Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Growth stock recommendations?",
                  "Portfolio balancing tips",
                  "Current market outlook",
                  "Retirement planning advice",
                  "ETFs vs individual stocks",
                  "Tax-efficient strategies"
                ].map((topic, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full justify-start text-sm h-auto py-2 text-left"
                    onClick={() => setInput(topic)}
                    disabled={isPending}
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
                Powered by Google's Gemini AI and financial data, your AI Advisor provides personalized investment guidance based on your goals, risk tolerance, and market conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
