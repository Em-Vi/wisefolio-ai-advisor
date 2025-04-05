
import React, { useState } from 'react';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';
import { NewsCard } from '@/components/stocks/NewsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMockChartData, mockNews, popularStocks } from '@/data/mockStockData';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState(popularStocks[0]);
  const chartData = generateMockChartData(selectedStock.symbol);
  
  // Calculate market metrics
  const gainers = popularStocks.filter(stock => stock.changePercent > 0);
  const losers = popularStocks.filter(stock => stock.changePercent < 0);
  const marketTrend = gainers.length > losers.length ? 'positive' : 'negative';
  
  // Market index data
  const marketIndices = [
    { name: 'S&P 500', value: 5250.12, change: 0.75 },
    { name: 'Nasdaq', value: 16489.38, change: 1.12 },
    { name: 'Dow Jones', value: 39123.57, change: 0.42 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-8/12 space-y-4">
          <h1 className="text-2xl font-bold">Market Overview</h1>
          
          {/* Market summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {marketIndices.map((index) => (
              <Card key={index.name}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">{index.name}</p>
                      <p className="text-xl font-semibold">{index.value.toLocaleString()}</p>
                    </div>
                    <div className={`flex items-center ${index.change >= 0 ? 'text-finance-green-500' : 'text-destructive'}`}>
                      {index.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      <span className="text-sm font-medium">{index.change}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Selected stock chart */}
          <div className="w-full finance-chart-container">
            <StockChart 
              data={chartData} 
              symbol={selectedStock.symbol} 
              color={selectedStock.change >= 0 ? '#44CF6C' : '#EF4444'}
              height={300}
            />
          </div>
          
          {/* News feed */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Latest News</h2>
            <div className="space-y-3">
              {mockNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-4/12 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2" size={18} />
                <span>Market Trend</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  marketTrend === 'positive' ? 'bg-finance-green-100 text-finance-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {marketTrend === 'positive' ? 'Bullish' : 'Bearish'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>{gainers.length} stocks advancing</p>
                <p>{losers.length} stocks declining</p>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-semibold">Popular Stocks</h2>
          <div className="grid grid-cols-1 gap-3">
            {popularStocks.slice(0, 5).map((stock) => (
              <StockCard 
                key={stock.symbol} 
                stock={stock} 
                onClick={() => setSelectedStock(stock)}
              />
            ))}
            <Button variant="outline" className="w-full">View All Stocks</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
