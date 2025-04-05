
import React from 'react';
import { NewsItem } from '@/data/mockStockData';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="finance-card">
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-base font-medium flex-1">{news.title}</h3>
        {news.sentiment && (
          <Badge
            variant="outline"
            className={`
              ${news.sentiment === 'positive' ? 'bg-finance-green-50 text-finance-green-600 border-finance-green-200' : ''}
              ${news.sentiment === 'negative' ? 'bg-red-50 text-red-600 border-red-200' : ''}
              ${news.sentiment === 'neutral' ? 'bg-gray-50 text-gray-600 border-gray-200' : ''}
            `}
          >
            {news.sentiment}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mt-2">
        <span>{news.source}</span>
        <span className="mx-2">•</span>
        <span>{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
      </div>
      
      <p className="mt-3 text-sm">{news.summary}</p>
      
      {news.relatedSymbols && news.relatedSymbols.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {news.relatedSymbols.map(symbol => (
            <Badge key={symbol} variant="secondary" className="text-xs">
              {symbol}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
