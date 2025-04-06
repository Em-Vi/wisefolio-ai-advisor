
import React, { useState, useEffect } from 'react';
import { useFinnhub, StockCandle } from '@/hooks/useFinnhub';
import { formatCurrency } from '@/lib/formatUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TrendingUp } from 'lucide-react';

interface StockChartWithFinnhubProps {
  symbol: string;
  title?: string;
  color?: string;
  height?: number;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export function StockChartWithFinnhub({ 
  symbol, 
  title, 
  color = '#3E92CC', 
  height = 300 
}: StockChartWithFinnhubProps) {
  const { getStockCandles, loading } = useFinnhub();
  const [candles, setCandles] = useState<StockCandle | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchData = async () => {
    const now = Math.floor(Date.now() / 1000);
    let from: number;
    let resolution: string;
    
    // Calculate from timestamp and resolution based on time range
    switch(timeRange) {
      case '1D':
        // 1 day ago, 30 minute candles
        from = now - 60 * 60 * 24;
        resolution = '30';
        break;
      case '1W':
        // 1 week ago, 60 minute candles
        from = now - 60 * 60 * 24 * 7;
        resolution = '60';
        break;
      case '1M':
        // 1 month ago, 1 day candles
        from = now - 60 * 60 * 24 * 30;
        resolution = 'D';
        break;
      case '3M':
        // 3 months ago, 1 day candles
        from = now - 60 * 60 * 24 * 90;
        resolution = 'D';
        break;
      case '1Y':
        // 1 year ago, 1 week candles
        from = now - 60 * 60 * 24 * 365;
        resolution = 'W';
        break;
      default:
        from = now - 60 * 60 * 24 * 30;
        resolution = 'D';
    }
    
    const candleData = await getStockCandles(symbol, resolution, from, now);
    if (candleData && candleData.s === 'ok') {
      setCandles(candleData);
      
      // Transform candle data for the chart
      const transformedData = candleData.t.map((timestamp, index) => ({
        date: new Date(timestamp * 1000),
        price: candleData.c[index],
        open: candleData.o[index],
        high: candleData.h[index],
        low: candleData.l[index],
        volume: candleData.v[index],
      }));
      
      setChartData(transformedData);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol, timeRange]);

  // Format X-axis based on time range
  const formatXAxis = (timestamp: Date) => {
    switch(timeRange) {
      case '1D':
        return format(timestamp, 'HH:mm');
      case '1W':
        return format(timestamp, 'EEE');
      case '1M':
      case '3M':
        return format(timestamp, 'MMM dd');
      case '1Y':
        return format(timestamp, 'MMM yyyy');
      default:
        return format(timestamp, 'MMM dd');
    }
  };

  // Get first and last price to determine if trend is up or down
  const firstPrice = chartData.length > 0 ? chartData[0].price : 0;
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const priceDifference = lastPrice - firstPrice;
  const percentChange = firstPrice !== 0 ? (priceDifference / firstPrice) * 100 : 0;
  const isPositive = priceDifference >= 0;
  const lineColor = isPositive ? '#44CF6C' : '#EF4444';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            {title || `${symbol} Price Chart`}
          </CardTitle>
          
          <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
            <ToggleGroupItem value="1D" size="sm">1D</ToggleGroupItem>
            <ToggleGroupItem value="1W" size="sm">1W</ToggleGroupItem>
            <ToggleGroupItem value="1M" size="sm">1M</ToggleGroupItem>
            <ToggleGroupItem value="3M" size="sm">3M</ToggleGroupItem>
            <ToggleGroupItem value="1Y" size="sm">1Y</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !candles ? (
          <Skeleton className="w-full" style={{ height: `${height}px` }} />
        ) : chartData.length > 0 ? (
          <div>
            <div className="flex items-baseline space-x-2 mb-2">
              <div className="text-2xl font-bold">
                {formatCurrency(lastPrice)}
              </div>
              <div className={`text-sm ${isPositive ? 'text-finance-green-600' : 'text-red-600'}`}>
                {priceDifference >= 0 ? '+' : ''}{formatCurrency(priceDifference)} ({percentChange.toFixed(2)}%)
              </div>
            </div>
            
            <div style={{ height: `${height}px`, width: '100%' }}>
              <ChartContainer config={{
                "primary": { 
                  color: lineColor || color 
                }
              }}>
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxis}
                    minTickGap={30}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => formatCurrency(value)}
                    width={60}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => {
                      return timeRange === '1D' ? 
                        format(new Date(label), 'MMM dd, HH:mm') : 
                        format(new Date(label), 'MMM dd, yyyy');
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={lineColor || color} 
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine 
                    y={firstPrice} 
                    stroke="#666" 
                    strokeDasharray="3 3" 
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No chart data available for {symbol}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
