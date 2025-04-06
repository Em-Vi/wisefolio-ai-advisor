
import React, { useState, useEffect } from 'react';
import { useFinnhub, NewsItem, NewsSentiment } from '@/hooks/useFinnhub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface StockNewsWithSentimentProps {
  symbol?: string;
  limit?: number;
  refreshInterval?: number; // in milliseconds
}

export function StockNewsWithSentiment({ 
  symbol, 
  limit = 5, 
  refreshInterval = 300000 // 5 minutes by default
}: StockNewsWithSentimentProps) {
  const { getStockNews, getNewsSentiment, loading } = useFinnhub();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentiment, setSentiment] = useState<NewsSentiment | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchNews = async () => {
    // Calculate date range (last 7 days)
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);
    
    const toStr = format(to, 'yyyy-MM-dd');
    const fromStr = format(from, 'yyyy-MM-dd');
    
    // Fetch news
    const newsData = await getStockNews(
      symbol,
      fromStr,
      toStr
    );
    
    if (newsData) {
      setNews(newsData.slice(0, limit));
      setLastUpdated(new Date());
    }
    
    // Fetch sentiment if symbol is provided
    if (symbol) {
      const sentimentData = await getNewsSentiment(symbol);
      if (sentimentData) {
        setSentiment(sentimentData);
      }
    }
  };

  useEffect(() => {
    fetchNews();
    
    const intervalId = setInterval(() => {
      fetchNews();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [symbol, limit, refreshInterval]);

  // Function to determine sentiment level
  const getSentimentLevel = (score: number): 'positive' | 'neutral' | 'negative' => {
    if (score >= 0.5) return 'positive';
    if (score <= -0.3) return 'negative';
    return 'neutral';
  };

  // Function to render sentiment badge
  const renderSentimentBadge = (level: 'positive' | 'neutral' | 'negative') => {
    const colors = {
      positive: 'bg-finance-green-50 text-finance-green-600 border-finance-green-200',
      neutral: 'bg-gray-50 text-gray-600 border-gray-200',
      negative: 'bg-red-50 text-red-600 border-red-200'
    };
    
    return (
      <Badge variant="outline" className={colors[level]}>
        {level === 'positive' ? (
          <TrendingUp className="h-3 w-3 mr-1" />
        ) : level === 'negative' ? (
          <TrendingDown className="h-3 w-3 mr-1" />
        ) : null}
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <Newspaper className="h-5 w-5 mr-2" />
            {symbol ? `${symbol} News` : 'Market News'}
          </CardTitle>
          {sentiment && (
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground mr-1">Sentiment:</span>
              {renderSentimentBadge(
                getSentimentLevel(sentiment.companyNewsScore)
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {loading && news.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4 divide-y">
            {news.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-finance-blue-600 transition-colors"
                >
                  <h3 className="font-medium text-base">{item.headline}</h3>
                </a>
                <div className="flex items-center text-xs text-muted-foreground mt-1 mb-2">
                  <span>{item.source}</span>
                  <span className="mx-1.5">•</span>
                  <span>{formatDistanceToNow(new Date(item.datetime * 1000), { addSuffix: true })}</span>
                  
                  {item.category && (
                    <>
                      <span className="mx-1.5">•</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{item.summary}</p>
                
                {item.image && (
                  <div className="w-full h-40 overflow-hidden rounded-md mb-2">
                    <img 
                      src={item.image} 
                      alt={item.headline} 
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {item.related && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.related.split(',').map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No recent news available {symbol ? `for ${symbol}` : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
