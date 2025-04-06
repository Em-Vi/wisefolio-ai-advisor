
import { useState } from 'react';
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

export interface UseFinnhubReturn {
  loading: boolean;
  getStockQuote: (symbol: string) => Promise<StockQuote | null>;
  getCompanyProfile: (symbol: string) => Promise<CompanyProfile | null>;
  getCompanyMetrics: (symbol: string) => Promise<CompanyMetrics | null>;
  getStockNews: (symbol?: string, from?: string, to?: string, category?: string, minId?: number) => Promise<NewsItem[] | null>;
  getNewsSentiment: (symbol: string) => Promise<NewsSentiment | null>;
  getStockCandles: (symbol: string, resolution: string, from: number, to: number) => Promise<StockCandle | null>;
}

export const useFinnhub = (): UseFinnhubReturn => {
  const [loading, setLoading] = useState(false);

  const callFinnhubApi = async <T,>(endpoint: string, params: Record<string, string | number>): Promise<T | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('finnhub-api', {
        body: { endpoint, params },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.data as T || null;
    } catch (error) {
      console.error(`Error calling Finnhub API (${endpoint}):`, error);
      toast.error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getStockQuote = (symbol: string) => {
    return callFinnhubApi<StockQuote>('quote', { symbol });
  };

  const getCompanyProfile = (symbol: string) => {
    return callFinnhubApi<CompanyProfile>('stock/profile2', { symbol });
  };

  const getCompanyMetrics = (symbol: string) => {
    return callFinnhubApi<CompanyMetrics>('stock/metric', { 
      symbol, 
      metric: 'all' 
    });
  };

  const getStockNews = (symbol?: string, from?: string, to?: string, category?: string, minId?: number) => {
    const params: Record<string, string | number> = {};
    
    if (symbol) params.symbol = symbol;
    if (from) params.from = from;
    if (to) params.to = to;
    if (category) params.category = category;
    if (minId) params.minId = minId;
    
    return callFinnhubApi<NewsItem[]>('company-news', params);
  };

  const getNewsSentiment = (symbol: string) => {
    return callFinnhubApi<NewsSentiment>('news-sentiment', { symbol });
  };

  const getStockCandles = (symbol: string, resolution: string, from: number, to: number) => {
    return callFinnhubApi<StockCandle>('stock/candle', { 
      symbol,
      resolution,
      from,
      to
    });
  };

  return {
    loading,
    getStockQuote,
    getCompanyProfile,
    getCompanyMetrics,
    getStockNews,
    getNewsSentiment,
    getStockCandles,
  };
};
