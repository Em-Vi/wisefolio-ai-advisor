
import React, { useState, useEffect } from 'react';
import { RealTimeStockData } from '@/components/stocks/RealTimeStockData';
import { StockNewsWithSentiment } from '@/components/stocks/StockNewsWithSentiment';
import { StockChartWithFinnhub } from '@/components/stocks/StockChartWithFinnhub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { Search, TrendingUp, Newspaper, BarChart2, AlertCircle } from 'lucide-react';

// Default stocks to display
const DEFAULT_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];

const MarketDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSymbol, setActiveSymbol] = useState(DEFAULT_STOCKS[0]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_STOCKS);
  const [tab, setTab] = useState('overview');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm) return;
    
    const symbol = searchTerm.toUpperCase().trim();
    
    if (watchlist.includes(symbol)) {
      setActiveSymbol(symbol);
      return;
    }
    
    // Add to watchlist and set as active
    if (watchlist.length >= 10) {
      toast.warning('Maximum of 10 stocks in watchlist. Remove one first.');
      return;
    }
    
    setWatchlist([...watchlist, symbol]);
    setActiveSymbol(symbol);
    setSearchTerm('');
  };

  const removeFromWatchlist = (symbol: string) => {
    if (watchlist.length <= 1) {
      toast.error('Cannot remove the last stock from watchlist');
      return;
    }
    
    const newWatchlist = watchlist.filter(s => s !== symbol);
    setWatchlist(newWatchlist);
    
    if (activeSymbol === symbol) {
      setActiveSymbol(newWatchlist[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Market Dashboard</h1>
        <form onSubmit={handleSearch} className="flex">
          <Input
            placeholder="Search stock symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 md:w-64"
          />
          <Button type="submit" size="icon" className="ml-2">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
        {watchlist.map(symbol => (
          <div 
            key={symbol}
            onClick={() => setActiveSymbol(symbol)}
            className={`px-4 py-2 cursor-pointer border rounded-md mr-2 flex items-center whitespace-nowrap ${
              activeSymbol === symbol ? 'bg-finance-blue-50 border-finance-blue-200' : 'hover:bg-muted'
            }`}
          >
            <span>{symbol}</span>
            {watchlist.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(symbol);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          API calls are limited to 60 requests per minute with the free Finnhub plan.
        </AlertDescription>
      </Alert>
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chart">
            <BarChart2 className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="news">
            <Newspaper className="h-4 w-4 mr-2" />
            News
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StockChartWithFinnhub 
                symbol={activeSymbol} 
                height={400}
              />
            </div>
            <div>
              <RealTimeStockData 
                symbol={activeSymbol}
                refreshInterval={60000} // 1 minute
              />
            </div>
            
            <div className="lg:col-span-3">
              <StockNewsWithSentiment 
                symbol={activeSymbol}
                limit={5}
                refreshInterval={300000} // 5 minutes
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chart" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockChartWithFinnhub 
              symbol={activeSymbol} 
              height={400}
            />
            
            <div className="space-y-6">
              <RealTimeStockData 
                symbol={activeSymbol}
                refreshInterval={60000} // 1 minute
              />
              
              {watchlist.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparison Charts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {watchlist.filter(s => s !== activeSymbol).slice(0, 3).map(symbol => (
                        <StockChartWithFinnhub 
                          key={symbol}
                          symbol={symbol} 
                          height={150}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="news" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <StockNewsWithSentiment 
                symbol={activeSymbol}
                limit={10}
                refreshInterval={300000} // 5 minutes
              />
            </div>
            <div className="space-y-6">
              <RealTimeStockData 
                symbol={activeSymbol}
                refreshInterval={60000} // 1 minute
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>General Market News</CardTitle>
                </CardHeader>
                <CardContent>
                  <StockNewsWithSentiment 
                    limit={5}
                    refreshInterval={300000} // 5 minutes
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketDashboard;
