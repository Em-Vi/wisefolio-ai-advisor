import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockChartWithFinnhub } from './StockChartWithFinnhub';
import { StockChartWithAlphaVantage } from './StockChartWithAlphaVantage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface StockChartProps {
  symbol: string;
  title?: string;
  showTabs?: boolean;
  defaultProvider?: 'alphavantage' | 'finnhub';
  color?: string;
  height?: number;
}

export function StockChart({
  symbol,
  title,
  showTabs = false,
  defaultProvider = 'alphavantage',
  color = '#3E92CC',
  height = 300
}: StockChartProps) {
  // If we don't want tabs, just show the preferred provider
  if (!showTabs) {
    return defaultProvider === 'alphavantage' ? (
      <StockChartWithAlphaVantage
        symbol={symbol}
        title={title}
        color={color}
        height={height}
      />
    ) : (
      <StockChartWithFinnhub
        symbol={symbol}
        title={title}
        color={color}
        height={height}
      />
    );
  }

  // If we want tabs, show both providers but default to the preferred one
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title || `${symbol} Price Chart`}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={defaultProvider}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="alphavantage">Alpha Vantage</TabsTrigger>
            <TabsTrigger value="finnhub">Finnhub</TabsTrigger>
          </TabsList>
          <TabsContent value="alphavantage" className="pt-0">
            <StockChartWithAlphaVantage
              symbol={symbol}
              color={color}
              height={height}
            />
          </TabsContent>
          <TabsContent value="finnhub" className="pt-0">
            <StockChartWithFinnhub
              symbol={symbol}
              color={color}
              height={height}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
