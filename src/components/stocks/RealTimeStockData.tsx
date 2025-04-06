
import React, { useState, useEffect } from 'react';
import { useFinnhub, StockQuote, CompanyProfile, CompanyMetrics } from '@/hooks/useFinnhub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatUtils';

interface RealTimeStockDataProps {
  symbol: string;
  refreshInterval?: number; // in milliseconds
}

export function RealTimeStockData({ symbol, refreshInterval = 60000 }: RealTimeStockDataProps) {
  const { getStockQuote, getCompanyProfile, getCompanyMetrics, loading } = useFinnhub();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    const quoteData = await getStockQuote(symbol);
    if (quoteData) {
      setQuote(quoteData);
      setLastUpdated(new Date());
    }

    // Only fetch profile and metrics once, as they don't change frequently
    if (!profile) {
      const profileData = await getCompanyProfile(symbol);
      if (profileData) {
        setProfile(profileData);
      }
    }

    if (!metrics) {
      const metricsData = await getCompanyMetrics(symbol);
      if (metricsData) {
        setMetrics(metricsData);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [symbol, refreshInterval]);

  const isPositive = quote?.d && quote.d >= 0;

  return (
    <Card className="overflow-hidden">
      {profile && (
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{profile.name} ({symbol})</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">{profile.exchange} • {profile.finnhubIndustry}</div>
            </div>
            {profile.logo && (
              <div className="w-10 h-10 overflow-hidden rounded-md">
                <img src={profile.logo} alt={`${profile.name} logo`} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {loading && !quote ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-28" />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        ) : quote ? (
          <>
            <div className="mb-4">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{formatCurrency(quote.c)}</div>
                <div className={`flex items-center text-sm ${isPositive ? 'text-finance-green-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span>{formatCurrency(Math.abs(quote.d))}</span>
                  <span className="ml-1">({Math.abs(quote.dp).toFixed(2)}%)</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Open</div>
                <div className="font-medium">{formatCurrency(quote.o)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">High</div>
                <div className="font-medium">{formatCurrency(quote.h)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Low</div>
                <div className="font-medium">{formatCurrency(quote.l)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Prev Close</div>
                <div className="font-medium">{formatCurrency(quote.pc)}</div>
              </div>
            </div>

            {metrics && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium mb-2">Key Financials</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                  {metrics.metric.peBasicExclExtraTTM !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">P/E Ratio</div>
                      <div className="font-medium">
                        {Number(metrics.metric.peBasicExclExtraTTM).toFixed(2)}
                      </div>
                    </div>
                  )}
                  {metrics.metric.epsBasicExclExtraItemsTTM !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">EPS</div>
                      <div className="font-medium">
                        {formatCurrency(Number(metrics.metric.epsBasicExclExtraItemsTTM))}
                      </div>
                    </div>
                  )}
                  {profile && profile.marketCapitalization !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Market Cap</div>
                      <div className="font-medium">
                        {formatCurrency(profile.marketCapitalization * 1000000, true)}
                      </div>
                    </div>
                  )}
                  {metrics.metric.beta !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Beta</div>
                      <div className="font-medium">
                        {Number(metrics.metric.beta).toFixed(2)}
                      </div>
                    </div>
                  )}
                  {metrics.metric.dividendYieldIndicatedAnnual !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Dividend Yield</div>
                      <div className="font-medium">
                        {Number(metrics.metric.dividendYieldIndicatedAnnual).toFixed(2)}%
                      </div>
                    </div>
                  )}
                  {metrics.metric['52WeekHigh'] !== undefined && metrics.metric['52WeekLow'] !== undefined && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">52W Range</div>
                      <div className="font-medium">
                        {formatCurrency(Number(metrics.metric['52WeekLow']))} - {formatCurrency(Number(metrics.metric['52WeekHigh']))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No data available for {symbol}</div>
        )}
      </CardContent>
    </Card>
  );
}
