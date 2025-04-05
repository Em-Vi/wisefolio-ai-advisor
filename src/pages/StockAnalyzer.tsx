
import React, { useState, useEffect } from 'react';
import { StockChart } from '@/components/stocks/StockChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { generateMockChartData, generateStockRecommendations, popularStocks } from '@/data/mockStockData';
import { formatCurrency } from '@/lib/formatUtils';
import { Search, TrendingUp, BarChartHorizontal, Award, AlertTriangle } from 'lucide-react';

const StockAnalyzer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [investmentAmount, setInvestmentAmount] = useState(5000);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  
  const filteredStocks = searchTerm
    ? popularStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : popularStocks;
  
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
  
  const handleGenerateAnalysis = () => {
    if (selectedStocks.length === 0) {
      toast.error('Please select at least one stock');
      return;
    }
    
    setAnalysisGenerated(true);
    const recs = generateStockRecommendations(riskLevel, 3);
    setRecommendations(recs);
    
    toast.success('Analysis completed');
  };
  
  useEffect(() => {
    // Reset analysis when parameters change
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
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search stocks by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto py-1">
                {filteredStocks.map((stock) => (
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
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(stock.price)}</div>
                      <div className={`text-xs ${stock.change >= 0 ? 'text-finance-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedStocks.map(symbol => {
                  const stock = popularStocks.find(s => s.symbol === symbol);
                  return (
                    <div 
                      key={symbol}
                      className="px-3 py-1 bg-finance-blue-100 rounded-full text-sm flex items-center"
                    >
                      <span>{symbol}</span>
                      <button 
                        onClick={() => handleStockSelect(symbol)}
                        className="ml-2 text-finance-blue-600 hover:text-finance-blue-800"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
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
                  max={100000}
                  step={1000}
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
                disabled={selectedStocks.length === 0}
                className="w-full"
              >
                <TrendingUp size={16} className="mr-2" />
                Generate Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          {analysisGenerated ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award size={18} className="mr-2" />
                    Investment Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-3">
                    <div className="text-sm font-medium">Based on your parameters:</div>
                    <div className="text-sm">Investment: {formatCurrency(investmentAmount)}</div>
                    <div className="text-sm">Risk Level: {renderRiskBadge(riskLevel)}</div>
                    <div className="text-sm">Selected Stocks: {selectedStocks.join(', ')}</div>
                  </div>
                  
                  <Alert className="my-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      These are simulated recommendations for demonstration purposes only.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4 mt-4">
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
                  </div>
                </CardContent>
              </Card>
              
              {recommendations.length > 0 && (
                <StockChart 
                  data={generateMockChartData(recommendations[0].symbol, 30)}
                  symbol={recommendations[0].symbol}
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
