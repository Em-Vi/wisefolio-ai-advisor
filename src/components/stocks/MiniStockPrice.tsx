import React, { useState, useEffect, useCallback } from 'react';
import { useFinnhub, StockQuote } from '@/hooks/useFinnhub';
import { formatCurrency } from '@/lib/formatUtils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface MiniStockPriceProps {
  symbol: string;
}

interface GlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

interface StockPriceData {
  price: number;
  percentChange: number;
  source: 'finnhub' | 'alphavantage';
}

export function MiniStockPrice({ symbol }: MiniStockPriceProps) {
  const { getStockQuote } = useFinnhub();
  const [stockData, setStockData] = useState<StockPriceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true);
      
      // First try with Finnhub
      const finnhubData = await getStockQuote(symbol);
      
      if (finnhubData && finnhubData.c !== null && finnhubData.c !== undefined && 
          finnhubData.dp !== null && finnhubData.dp !== undefined) {
        setStockData({
          price: finnhubData.c,
          percentChange: finnhubData.dp,
          source: 'finnhub'
        });
        return;
      }
      
      // If Finnhub fails or returns incomplete data, try Alpha Vantage
      console.log('Finnhub data unavailable, trying Alpha Vantage for:', symbol);
      const { data, error } = await supabase.functions.invoke('alpha-vantage-api', {
        body: { 
          function: 'GLOBAL_QUOTE',
          symbol
        },
      });
      
      if (error) {
        console.error(`Alpha Vantage API Error:`, error);
        throw new Error(error.message);
      }
      
      if (data?.data && data.data['Global Quote']) {
        const quote = data.data['Global Quote'];
        const price = parseFloat(quote['05. price']);
        // Extract percentage change value (removing % sign) and parse as number
        const percentChange = parseFloat(quote['10. change percent'].replace('%', ''));
        
        if (!isNaN(price) && !isNaN(percentChange)) {
          setStockData({
            price,
            percentChange,
            source: 'alphavantage'
          });
          return;
        }
      }
      
      console.warn(`No valid quote data for ${symbol} from either Finnhub or Alpha Vantage`);
      setStockData(null);
      
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      setStockData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, getStockQuote]);

  useEffect(() => {
    fetchQuote();
    // We're not setting up an interval here since this is just for display in search results
  }, [fetchQuote]);

  const isPositive = stockData?.percentChange !== undefined && stockData.percentChange >= 0;

  if (loading) {
    return (
      <div>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12 mt-1" />
      </div>
    );
  }

  if (!stockData) {
    return <div className="text-xs text-muted-foreground">Data unavailable</div>;
  }

  return (
    <div>
      <div>{formatCurrency(stockData.price)}</div>
      <div className={`text-xs flex items-center ${isPositive ? 'text-finance-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{stockData.percentChange.toFixed(2)}%</span>
      </div>
    </div>
  );
}