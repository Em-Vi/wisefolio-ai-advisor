import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFinnhub, SymbolSearchResult, StockQuote } from '@/hooks/useFinnhub';
import { RealTimeStockData } from '@/components/stocks/RealTimeStockData';
import { StockNewsWithSentiment } from '@/components/stocks/StockNewsWithSentiment';
import { StockChartWithAlphaVantage } from '@/components/stocks/StockChartWithAlphaVantage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { ArrowUpRight, ArrowDownRight, Search, AlertCircle, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import debounce from 'lodash/debounce';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
const INDEX_SYMBOLS = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq',
  DIA: 'Dow Jones',
};

interface IndexData extends StockQuote {
  name: string;
  symbol: string;
}

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSymbol, setActiveSymbol] = useState(DEFAULT_STOCKS[0]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_STOCKS);
  const [searchResults, setSearchResults] = useState<SymbolSearchResult['result']>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [marketIndices, setMarketIndices] = useState<IndexData[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(true);

  const { searchSymbols, getStockQuote, loading: searchLoading, apiLoading } = useFinnhub();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchIndexData = useCallback(async () => {
    setIndicesLoading(true);
    const indexSymbols = Object.keys(INDEX_SYMBOLS);
    const promises = indexSymbols.map((symbol) => getStockQuote(symbol));
    const results = await Promise.all(promises);

    const formattedData: IndexData[] = results
      .map((quote, index) => {
        const symbol = indexSymbols[index];
        if (quote) {
          return {
            ...quote,
            symbol: symbol,
            name: INDEX_SYMBOLS[symbol as keyof typeof INDEX_SYMBOLS],
          };
        }
        return null;
      })
      .filter((item): item is IndexData => item !== null);

    setMarketIndices(formattedData);
    setIndicesLoading(false);
  }, [getStockQuote]);

  useEffect(() => {
    fetchIndexData();
    const interval = setInterval(fetchIndexData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchIndexData]);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 1) {
        setSearchResults([]);
        return;
      }
      const results = await searchSymbols(query);
      if (results && results.result) {
        const filteredResults = results.result.filter(
          (r) => r.type === 'Common Stock' || !r.type || r.type === '' || r.type === 'ETF'
        );
        setSearchResults(filteredResults.slice(0, 10));
      } else {
        setSearchResults([]);
      }
    }, 300),
    [searchSymbols]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const handleSelectSymbol = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return;

    if (!watchlist.includes(upperSymbol)) {
      if (watchlist.length >= 10) {
        toast.warning('Maximum of 10 stocks in watchlist. Remove one first.');
        return;
      }
      setWatchlist([...watchlist, upperSymbol]);
    }
    setActiveSymbol(upperSymbol);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upperSearchTerm = searchTerm.toUpperCase().trim();
    const exactMatch = searchResults.find((r) => r.symbol === upperSearchTerm);
    if (exactMatch) {
      handleSelectSymbol(exactMatch.symbol);
    } else if (upperSearchTerm) {
      if (!watchlist.includes(upperSearchTerm)) {
        handleSelectSymbol(upperSearchTerm);
      } else {
        setActiveSymbol(upperSearchTerm);
        setSearchTerm('');
        setSearchResults([]);
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    if (watchlist.length <= 1) {
      toast.error('Cannot remove the last stock from watchlist');
      return;
    }
    const newWatchlist = watchlist.filter((s) => s !== symbol);
    setWatchlist(newWatchlist);
    if (activeSymbol === symbol) {
      setActiveSymbol(newWatchlist[0]);
    }
  };

  const showSearchResults = isSearchFocused && searchTerm.length > 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-1/2 lg:w-1/3">
        <Popover
          open={showSearchResults}
          onOpenChange={(open) => {
            if (!open) {
              setIsSearchFocused(false);
            }
          }}
        >
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                ref={searchInputRef}
                placeholder="Search symbol (e.g., AAPL, SPY)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-8 w-full"
                aria-autocomplete="list"
                aria-controls="search-results"
                autoComplete="off"
              />
              {apiLoading['search'] && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0 mt-1"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList id="search-results">
                <CommandEmpty>
                  {searchLoading ? 'Loading...' : searchTerm ? 'No results found.' : 'Type to search...'}
                </CommandEmpty>
                {searchResults.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {searchResults.map((result) => (
                      <CommandItem
                        key={result.symbol}
                        value={result.symbol}
                        onSelect={() => handleSelectSymbol(result.symbol)}
                        className="cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium mr-2">{result.symbol}</span>
                          <span className="text-sm text-muted-foreground truncate">{result.description}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">{result.type}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </form>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-8/12 space-y-6 flex flex-col">
          <h1 className="text-2xl font-bold">Market Overview</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : marketIndices.length > 0 ? (
              marketIndices.map((index) => (
                <Card key={index.symbol}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {index.name} ({index.symbol})
                        </p>
                        <p className="text-xl font-semibold">
                          {index.c?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ??
                            'N/A'}
                        </p>
                      </div>
                      <div
                        className={`flex items-center ${
                          index.dp >= 0 ? 'text-finance-green-500' : 'text-destructive'
                        }`}
                      >
                        {index.dp >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span className="text-sm font-medium">{index.dp?.toFixed(2) ?? '0.00'}%</span>
                      </div>
                    </div>
                    <p
                      className={`text-sm ${index.d >= 0 ? 'text-finance-green-500' : 'text-destructive'}`}
                    >
                      {index.d >= 0 ? '+' : ''}
                      {index.d?.toFixed(2) ?? '0.00'}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">Could not load market index data.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Watchlist</h2>
            <div className="flex overflow-x-auto pb-2 -mx-1 px-1">
              {watchlist.map((symbol) => (
                <div
                  key={symbol}
                  onClick={() => setActiveSymbol(symbol)}
                  className={`px-3 py-1.5 cursor-pointer border rounded-md mr-2 flex items-center whitespace-nowrap text-sm ${
                    activeSymbol === symbol
                      ? 'bg-finance-blue-50 border-finance-blue-200 font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span>{symbol}</span>
                  {watchlist.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(symbol);
                      }}
                      className="ml-1.5 text-gray-400 hover:text-gray-600"
                      aria-label={`Remove ${symbol} from watchlist`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full finance-chart-container min-h-[300px] md:min-h-[400px]">
            <h2 className="text-xl font-semibold mb-3">{activeSymbol} Chart</h2>
            <StockChartWithAlphaVantage key={activeSymbol} symbol={activeSymbol} height={350} />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Latest News for {activeSymbol}</h2>
            <StockNewsWithSentiment
              key={`${activeSymbol}-news`}
              symbol={activeSymbol}
              limit={5}
              refreshInterval={300000}
            />
          </div>
        </div>

        <div className="w-full md:w-4/12 space-y-6">
          <h2 className="text-xl font-semibold">Details for {activeSymbol}</h2>
          <RealTimeStockData key={`${activeSymbol}-details`} symbol={activeSymbol} refreshInterval={60000} />

          <Card>
            <CardHeader>
              <CardTitle>General Market News</CardTitle>
            </CardHeader>
            <CardContent>
              <StockNewsWithSentiment category="general" limit={5} refreshInterval={600000} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
