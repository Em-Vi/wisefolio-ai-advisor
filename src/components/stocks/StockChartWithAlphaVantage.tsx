import React, { useState, useEffect } from 'react';
import { useAlphaVantage, AlphaVantageStockData } from '@/hooks/useAlphaVantage';
import { formatCurrency } from '@/lib/formatUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TrendingUp } from 'lucide-react';

interface StockChartWithAlphaVantageProps {
  symbol: string;
  title?: string;
  color?: string;
  height?: number;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export function StockChartWithAlphaVantage({ 
  symbol, 
  title, 
  color = '#3E92CC', 
  height = 300 
}: StockChartWithAlphaVantageProps) {
  const { 
    getTimeSeriesDaily, 
    getTimeSeriesIntraday, 
    getTimeSeriesWeekly, 
    getTimeSeriesMonthly, 
    loading, 
    apiLoading 
  } = useAlphaVantage();
  
  const [stockData, setStockData] = useState<AlphaVantageStockData[] | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchData = async () => {
    let data: AlphaVantageStockData[] | null = null;
    
    // Choose the right API endpoint based on time range
    switch(timeRange) {
      case '1D':
        // For 1 day, use intraday data with 5min intervals
        data = await getTimeSeriesIntraday(symbol, '5min');
        break;
      case '1W':
        // For 1 week, use intraday data with 60min intervals
        data = await getTimeSeriesIntraday(symbol, '60min');
        break;
      case '1M':
        // For 1 month, use daily data
        data = await getTimeSeriesDaily(symbol);
        break;
      case '3M':
        // For 3 months, use daily data
        data = await getTimeSeriesDaily(symbol);
        break;
      case '1Y':
        // For 1 year, use weekly data
        data = await getTimeSeriesWeekly(symbol);
        break;
      default:
        data = await getTimeSeriesDaily(symbol);
    }
    
    if (data) {
      setStockData(data);
      
      // Filter data based on time range
      let filteredData = [...data];
      const now = new Date();
      
      switch(timeRange) {
        case '1D':
          filteredData = data.filter(item => {
            return item.date >= subDays(now, 1);
          });
          break;
        case '1W':
          filteredData = data.filter(item => {
            return item.date >= subDays(now, 7);
          });
          break;
        case '1M':
          filteredData = data.filter(item => {
            return item.date >= subMonths(now, 1);
          });
          break;
        case '3M':
          filteredData = data.filter(item => {
            return item.date >= subMonths(now, 3);
          });
          break;
        case '1Y':
          filteredData = data.filter(item => {
            return item.date >= subYears(now, 1);
          });
          break;
      }
      
      // Transform data for the chart
      const transformedData = filteredData.map(item => ({
        date: item.date,
        price: item.close,
        open: item.open,
        high: item.high,
        low: item.low,
        volume: item.volume,
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
        {loading || apiLoading[`daily-${symbol}-compact`] || apiLoading[`weekly-${symbol}`] || 
         apiLoading[`intraday-${symbol}-5min`] || apiLoading[`intraday-${symbol}-60min`] ? (
          <Skeleton className="w-full" style={{ height: `500px` }} />
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
            
            <div style={{ height: `500px`, width: '100%' }}>
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
                    labelFormatter={(label: Date) => {
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
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            No chart data available for {symbol}
          </div>
        )}
      </CardContent>
    </Card>
  );
}