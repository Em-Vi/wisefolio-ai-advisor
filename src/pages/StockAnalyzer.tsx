import React, { useState, useEffect, useCallback } from 'react';
import { StockChart } from '@/components/stocks/StockChart';
import { RealTimeStockData } from '@/components/stocks/RealTimeStockData';
import { MiniStockPrice } from '@/components/stocks/MiniStockPrice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { popularStocks } from '@/data/mockStockData';
import { formatCurrency } from '@/lib/formatUtils';
import { Search, TrendingUp, BarChartHorizontal, Award, AlertTriangle, Loader2, LineChart, AlertCircle, PieChart } from 'lucide-react';
import { useFinnhub, SymbolSearchResult } from '@/hooks/useFinnhub';
import { useGeminiStockAnalysis, GeminiStockRecommendation } from '@/hooks/useGeminiStockAnalysis';
import debounce from 'lodash/debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StockAnalyzer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState(5000);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [recommendations, setRecommendations] = useState<GeminiStockRecommendation[]>([]);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  const [searchResults, setSearchResults] = useState<SymbolSearchResult['result']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    summary: string;
    marketOutlook: string;
    riskAssessment: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('stocks');
  
  const { searchSymbols, loading: finnhubLoading } = useFinnhub();
  const stockAnalysis = useGeminiStockAnalysis();
  
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      try {
        const results = await searchSymbols(query);
        if (results && results.result) {
          const filteredResults = results.result.filter(item => 
            item.type === 'Common Stock' || item.type === 'stock'
          );
          setSearchResults(filteredResults.slice(0, 10));
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [searchSymbols]
  );
  
  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, debouncedSearch]);
  
  const displayedStocks = searchTerm.length >= 2 
    ? searchResults 
    : popularStocks.slice(0, 10).map(stock => ({
        symbol: stock.symbol,
        description: stock.name,
        displaySymbol: stock.symbol,
        type: 'Common Stock'
      }));
  
  const handleStockSelect = (stock: string) => {
    if (selectedStocks.includes(stock)) {
      setSelectedStocks(selectedStocks.filter(s => s !== stock));
    } else {
      if (selectedStocks.length < 5) {
        setSelectedStocks([...selectedStocks, stock]);
      } else {
        toast.warning('You can select up to 5 stocks');
      }
    }
  };
  
  const handleGenerateAnalysis = async () => {
    if (selectedStocks.length === 0) {
      toast.error('Please select at least one stock');
      return;
    }
    
    try {
      const result = await stockAnalysis.mutateAsync({
        symbols: selectedStocks,
        riskLevel,
        investmentAmount
      });
      
      // Use the recommendations directly without regex parsing that could cause issues
      setRecommendations(result.recommendations);
      
      // Use the analysis data directly to avoid regex parsing problems
      setAnalysisData({
        summary: result.analysis.summary,
        marketOutlook: result.analysis.marketOutlook,
        riskAssessment: result.analysis.riskAssessment
      });
      
      setAnalysisGenerated(true);
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to generate analysis. Please try again later.');
    }
  };
  
  useEffect(() => {
    if (analysisGenerated) {
      setAnalysisGenerated(false);
    }
  }, [selectedStocks, investmentAmount, riskLevel]);
  
  const renderRiskBadge = (level: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${colors[level as keyof typeof colors]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stock Analyzer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Search size={18} className="mr-2" />
                Select Stocks to Analyze
              </CardTitle>
              <CardDescription>
                Search for stocks by name or symbol and select up to 5 for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search stocks by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto py-1">
                {displayedStocks.map((stock) => (
                  <div 
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock.symbol)}
                    className={`p-3 border rounded-md cursor-pointer flex justify-between ${
                      selectedStocks.includes(stock.symbol) 
                        ? 'bg-finance-blue-50 border-finance-blue-200' 
                        : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.description}</div>
                    </div>
                    <div className="text-right">
                      <MiniStockPrice symbol={stock.symbol} />
                    </div>
                  </div>
                ))}
                {displayedStocks.length === 0 && !isSearching && searchTerm.length >= 2 && (
                  <div className="col-span-2 p-4 text-center text-muted-foreground">
                    No stocks found matching "{searchTerm}".
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedStocks.map(symbol => (
                  <div 
                    key={symbol}
                    className="px-3 py-1 bg-finance-blue-100 rounded-full text-sm flex items-center"
                  >
                    <span>{symbol}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStockSelect(symbol);
                      }}
                      className="ml-2 text-finance-blue-600 hover:text-finance-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {selectedStocks.length === 0 && (
                  <div className="text-sm text-muted-foreground">No stocks selected</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChartHorizontal size={18} className="mr-2" />
                Investment Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="investment-amount">
                  Investment Amount: {formatCurrency(investmentAmount)}
                </Label>
                <Slider
                  id="investment-amount"
                  value={[investmentAmount]}
                  min={1000}
                  max={1000000}
                  step={10000}
                  onValueChange={(value) => setInvestmentAmount(value[0])}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Risk Level</Label>
                <div className="flex space-x-2">
                  {(['low', 'medium', 'high'] as const).map(level => (
                    <Button
                      key={level}
                      variant={riskLevel === level ? "default" : "outline"}
                      onClick={() => setRiskLevel(level)}
                      className="flex-1"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={handleGenerateAnalysis}
                disabled={selectedStocks.length === 0 || stockAnalysis.isPending}
                className="w-full"
              >
                {stockAnalysis.isPending ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <TrendingUp size={16} className="mr-2" />
                )}
                {stockAnalysis.isPending ? 'Analyzing...' : 'Generate Analysis'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          {analysisGenerated ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Award size={18} className="mr-2" />
                    Investment Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis based on your selected parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-1 mb-3">
                    <div className="text-sm font-medium">Based on your parameters:</div>
                    <div className="text-sm">Investment: {formatCurrency(investmentAmount)}</div>
                    <div className="text-sm">Risk Level: {renderRiskBadge(riskLevel)}</div>
                    <div className="text-sm">Selected Stocks: {selectedStocks.join(', ')}</div>
                  </div>
                  
                  {analysisData && analysisData.summary && (
                    <div className="bg-muted rounded-md p-3 text-sm mt-3">
                      <p>{analysisData.summary}</p>
                    </div>
                  )}
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="stocks">
                        <LineChart size={14} className="mr-1" />
                        Stocks
                      </TabsTrigger>
                      <TabsTrigger value="market">
                        <PieChart size={14} className="mr-1" />
                        Market
                      </TabsTrigger>
                      <TabsTrigger value="risk">
                        <AlertCircle size={14} className="mr-1" />
                        Risk
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stocks" className="mt-4 space-y-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{rec.symbol}</div>
                              <div className="text-xs text-muted-foreground">{rec.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">{formatCurrency(rec.price)}</div>
                              <div className="flex items-center text-xs">
                                {renderRiskBadge(rec.riskLevel)}
                                <span className="ml-2">{rec.timeFrame} term</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <div className="flex justify-between">
                              <span>Recommendation:</span>
                              <span className={`font-medium ${
                                rec.recommendation === 'buy' ? 'text-finance-green-600' : 
                                rec.recommendation === 'sell' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {rec.recommendation.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potential Return:</span>
                              <span>{rec.potentialReturn.toFixed(2)}%</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-xs text-muted-foreground">
                            {rec.summary}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="market" className="mt-4">
                      <div className="border rounded-md p-3">
                        <h3 className="text-sm font-medium mb-2">Market Outlook</h3>
                        <p className="text-sm text-muted-foreground">
                          {analysisData?.marketOutlook && analysisData.marketOutlook !== "Market outlook unavailable" 
                            ? analysisData.marketOutlook 
                            : "No market outlook data available."}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="risk" className="mt-4">
                      <div className="border rounded-md p-3">
                        <h3 className="text-sm font-medium mb-2">Risk Assessment</h3>
                        <p className="text-sm text-muted-foreground">
                          {analysisData?.riskAssessment && analysisData.riskAssessment !== "Risk assessment unavailable" 
                            ? analysisData.riskAssessment 
                            : "No risk assessment data available."}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This is not financial advice. Past performance is not indicative of future results.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              {recommendations.length > 0 && (
                <RealTimeStockData symbol={recommendations[0].symbol} refreshInterval={60000} />
              )}
              
              {recommendations.length > 0 && (
                <StockChart 
                  symbol={recommendations[0].symbol}
                  defaultProvider="alphavantage"
                  color="#3E92CC"
                />
              )}
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <TrendingUp size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Ready for Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Select stocks, set your investment parameters, and generate analysis to receive personalized investment recommendations.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAnalyzer;
