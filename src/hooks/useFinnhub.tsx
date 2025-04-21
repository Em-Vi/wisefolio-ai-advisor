import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export interface StockQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface CompanyMetrics {
  metric: {
    [key: string]: number | string | null;
    // Common metrics
    '10DayAverageTradingVolume'?: number;
    '52WeekHigh'?: number;
    '52WeekLow'?: number;
    '52WeekHighDate'?: string;
    '52WeekLowDate'?: string;
    'peBasicExclExtraTTM'?: number; // PE ratio
    'epsBasicExclExtraItemsTTM'?: number; // EPS
    'marketCapitalization'?: number;
    'dividendYieldIndicatedAnnual'?: number;
    'beta'?: number;
  };
  metricType: string;
  series: {
    [key: string]: Array<{ period: string; v: number }>;
  };
}

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface MarketNewsItem extends NewsItem {
  // Add any specific fields if different, otherwise inherits NewsItem
}

export interface NewsSentiment {
  buzz: {
    articlesInLastWeek: number;
    buzz: number;
    weeklyAverage: number;
  };
  companyNewsScore: number;
  sectorAverageBullishPercent: number;
  sectorAverageNewsScore: number;
  sentiment: {
    bearishPercent: number;
    bullishPercent: number;
  };
  symbol: string;
}

export interface StockCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status
  t: number[];  // Timestamps
  v: number[];  // Volumes
}

export interface SymbolSearchResult {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface UseFinnhubReturn {
  loading: boolean;
  apiLoading: Record<string, boolean>;
  getStockQuote: (symbol: string) => Promise<StockQuote | null>;
  getCompanyProfile: (symbol: string) => Promise<CompanyProfile | null>;
  getCompanyMetrics: (symbol: string) => Promise<CompanyMetrics | null>;
  getStockNews: (symbol?: string, from?: string, to?: string, category?: string, minId?: number) => Promise<NewsItem[] | null>;
  getNewsSentiment: (symbol: string) => Promise<NewsSentiment | null>;
  getStockCandles: (symbol: string, resolution: string, from: number, to: number) => Promise<StockCandle | null>;
  searchSymbols: (query: string) => Promise<SymbolSearchResult | null>;
  getMarketNews: (category: string, minId?: number) => Promise<MarketNewsItem[] | null>;
}

export const useFinnhub = (): UseFinnhubReturn => {
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});

  const callFinnhubApi = useCallback(async <T,>(endpoint: string, params: Record<string, string | number | undefined>, uniqueKey?: string): Promise<T | null> => {
    const loadingKey = uniqueKey || endpoint;
    setApiLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string | number>);
        
      const { data, error } = await supabase.functions.invoke('finnhub-api', {
        body: { endpoint, params: filteredParams },
      });

      if (error) {
        console.log(error)
        throw new Error(error.message);
      }
      
      if (!data || (typeof data === 'object' && data !== null && 'error' in data)) {
         const apiError = (data as any)?.error || 'Received empty or error response from API function';
         console.error(`Finnhub API Function Error (${endpoint}):`, apiError);
         toast.error(`API Error: ${apiError}`);
         return null;
      }

      return data?.data as T || null;
    } catch (error) {
      console.error(`Error calling Finnhub API (${endpoint}):`, error);
      if (!(error instanceof Error && error.message.includes('API Function Error'))) {
         toast.error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    } finally {
      setApiLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [setApiLoading]);

  const getStockQuote = useCallback((symbol: string) => {
    return callFinnhubApi<StockQuote>('quote', { symbol }, `quote-${symbol}`);
  }, [callFinnhubApi]);

  const getCompanyProfile = useCallback((symbol: string) => {
    return callFinnhubApi<CompanyProfile>('stock/profile2', { symbol }, `profile-${symbol}`);
  }, [callFinnhubApi]);

  const getCompanyMetrics = useCallback((symbol: string) => {
    return callFinnhubApi<CompanyMetrics>('stock/metric', { 
      symbol, 
      metric: 'all' 
    }, `metrics-${symbol}`);
  }, [callFinnhubApi]);

  const getStockNews = useCallback((symbol?: string, from?: string, to?: string, category: string = 'general', minId?: number) => {
    const params: Record<string, string | number | undefined> = { category };
    
    if (symbol) params.symbol = symbol;
    if (from) params.from = from;
    if (to) params.to = to;
    if (minId) params.minId = minId;
    
    const key = symbol ? `company-news-${symbol}` : `market-news-${category}`;
    const endpoint = symbol ? 'company-news' : 'news';

    return callFinnhubApi<NewsItem[]>(endpoint, params, key);
  }, [callFinnhubApi]);

  const getNewsSentiment = useCallback((symbol: string) => {
    return callFinnhubApi<NewsSentiment>('news-sentiment', { symbol }, `sentiment-${symbol}`);
  }, [callFinnhubApi]);

  const getStockCandles = useCallback((symbol: string, resolution: string, from: number, to: number) => {
    return callFinnhubApi<StockCandle>('stock/candle', { 
      symbol,
      resolution,
      from,
      to
    }, `candles-${symbol}-${resolution}`);
  }, [callFinnhubApi]);

  const searchSymbols = useCallback((query: string) => {
    return callFinnhubApi<SymbolSearchResult>('search', { q: query }, 'search');
  }, [callFinnhubApi]);
  
  const getMarketNews = useCallback((category: string, minId?: number) => {
    const params: Record<string, string | number | undefined> = { category };
    if (minId) params.minId = minId;
    return callFinnhubApi<MarketNewsItem[]>('news', params, `market-news-${category}`);
  }, [callFinnhubApi]);

  const overallLoading = useMemo(() => Object.values(apiLoading).some(Boolean), [apiLoading]);

  return {
    loading: overallLoading,
    apiLoading,
    getStockQuote,
    getCompanyProfile,
    getCompanyMetrics,
    getStockNews,
    getNewsSentiment,
    getStockCandles,
    searchSymbols,
    getMarketNews,
  };
};
