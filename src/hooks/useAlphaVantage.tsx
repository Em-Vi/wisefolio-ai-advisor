import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export interface AlphaVantageTimeSeries {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval'?: string;
    '5. Output Size'?: string;
    '6. Time Zone': string;
  };
  'Time Series (Daily)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Time Series (60min)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Time Series (30min)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Time Series (15min)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Time Series (5min)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Weekly Time Series'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Monthly Time Series'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  Note?: string; // Rate limit message
}

export interface AlphaVantageStockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UseAlphaVantageReturn {
  loading: boolean;
  apiLoading: Record<string, boolean>;
  getTimeSeriesDaily: (symbol: string, outputSize?: 'compact' | 'full') => Promise<AlphaVantageStockData[] | null>;
  getTimeSeriesIntraday: (symbol: string, interval: '5min' | '15min' | '30min' | '60min', outputSize?: 'compact' | 'full') => Promise<AlphaVantageStockData[] | null>;
  getTimeSeriesWeekly: (symbol: string) => Promise<AlphaVantageStockData[] | null>;
  getTimeSeriesMonthly: (symbol: string) => Promise<AlphaVantageStockData[] | null>;
}

export const useAlphaVantage = (): UseAlphaVantageReturn => {
  const [apiLoading, setApiLoading] = useState<Record<string, boolean>>({});

  const callAlphaVantageApi = useCallback(async <T,>(functionName: string, params: Record<string, string | number | undefined>, uniqueKey?: string): Promise<T | null> => {
    const loadingKey = uniqueKey || functionName;
    setApiLoading(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string | number>);
        
      const { data, error } = await supabase.functions.invoke('alpha-vantage-api', {
        body: { 
          function: functionName,
          ...filteredParams
        },
      });

      if (error) {
        console.error(`Alpha Vantage API Error:`, error);
        throw new Error(error.message);
      }
      
      if (!data || (typeof data === 'object' && data !== null && 'error' in data)) {
         const apiError = (data as any)?.error || 'Received empty or error response from API function';
         console.error(`Alpha Vantage API Function Error (${functionName}):`, apiError);
         toast.error(`API Error: ${apiError}`);
         return null;
      }

      // Check for rate limit message
      if (data?.data?.Note) {
        toast.warning(`Alpha Vantage API: ${data.data.Note}`);
        // Still return the data if available, but also warn about the rate limit
      }
      
      return data?.data as T || null;
    } catch (error) {
      console.error(`Error calling Alpha Vantage API (${functionName}):`, error);
      if (!(error instanceof Error && error.message.includes('API Function Error'))) {
         toast.error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    } finally {
      setApiLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, [setApiLoading]);

  const transformTimeSeriesData = useCallback((data: AlphaVantageTimeSeries, seriesKey: string): AlphaVantageStockData[] => {
    const timeSeriesData = data[seriesKey as keyof AlphaVantageTimeSeries] as Record<string, any> | undefined;
    
    if (!timeSeriesData) {
      return [];
    }
    
    return Object.entries(timeSeriesData).map(([dateStr, values]) => ({
      date: new Date(dateStr),
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseFloat(values['5. volume']),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending
  }, []);

  const getTimeSeriesDaily = useCallback(async (symbol: string, outputSize: 'compact' | 'full' = 'compact'): Promise<AlphaVantageStockData[] | null> => {
    const data = await callAlphaVantageApi<AlphaVantageTimeSeries>(
      'TIME_SERIES_DAILY', 
      { symbol, outputsize: outputSize },
      `daily-${symbol}-${outputSize}`
    );
    
    if (!data) return null;
    
    return transformTimeSeriesData(data, 'Time Series (Daily)');
  }, [callAlphaVantageApi, transformTimeSeriesData]);
  
  const getTimeSeriesIntraday = useCallback(async (
    symbol: string, 
    interval: '5min' | '15min' | '30min' | '60min',
    outputSize: 'compact' | 'full' = 'compact'
  ): Promise<AlphaVantageStockData[] | null> => {
    const data = await callAlphaVantageApi<AlphaVantageTimeSeries>(
      'TIME_SERIES_INTRADAY', 
      { symbol, interval, outputsize: outputSize },
      `intraday-${symbol}-${interval}`
    );
    
    if (!data) return null;
    
    return transformTimeSeriesData(data, `Time Series (${interval})`);
  }, [callAlphaVantageApi, transformTimeSeriesData]);
  
  const getTimeSeriesWeekly = useCallback(async (symbol: string): Promise<AlphaVantageStockData[] | null> => {
    const data = await callAlphaVantageApi<AlphaVantageTimeSeries>(
      'TIME_SERIES_WEEKLY', 
      { symbol },
      `weekly-${symbol}`
    );
    
    if (!data) return null;
    
    return transformTimeSeriesData(data, 'Weekly Time Series');
  }, [callAlphaVantageApi, transformTimeSeriesData]);
  
  const getTimeSeriesMonthly = useCallback(async (symbol: string): Promise<AlphaVantageStockData[] | null> => {
    const data = await callAlphaVantageApi<AlphaVantageTimeSeries>(
      'TIME_SERIES_MONTHLY', 
      { symbol },
      `monthly-${symbol}`
    );
    
    if (!data) return null;
    
    return transformTimeSeriesData(data, 'Monthly Time Series');
  }, [callAlphaVantageApi, transformTimeSeriesData]);

  const overallLoading = useMemo(() => Object.values(apiLoading).some(Boolean), [apiLoading]);

  return {
    loading: overallLoading,
    apiLoading,
    getTimeSeriesDaily,
    getTimeSeriesIntraday,
    getTimeSeriesWeekly,
    getTimeSeriesMonthly,
  };
};