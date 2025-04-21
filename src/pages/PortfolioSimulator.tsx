import React, { useState } from 'react';
import { PortfolioCard } from '@/components/simulator/PortfolioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { formatCurrency } from '@/lib/formatUtils';
import { AlertTriangle, BarChart3, Play, RefreshCcw } from 'lucide-react';
import { generateMockPortfolio } from '@/data/mockStockData';

const PortfolioSimulator = () => {
  const [portfolio, setPortfolio] = useState(generateMockPortfolio());
  const [simulationPeriod, setSimulationPeriod] = useState('1year');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [rebalancing, setRebalancing] = useState(false);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  
  const runSimulation = () => {
    // Generate mock simulation data
    const data: any[] = [];
    
    const periods = {
      '6months': 6,
      '1year': 12,
      '3years': 36,
      '5years': 60,
      '10years': 120
    };
    
    const numMonths = periods[simulationPeriod as keyof typeof periods];
    
    // Calculate initial portfolio value
    const initialValue = portfolio.reduce((sum, stock) => sum + stock.currentPrice * stock.shares, 0);
    
    // Calculate expected return based on risk level
    const expectedAnnualReturns = {
      low: 0.05,
      medium: 0.08,
      high: 0.12
    };
    
    const expectedMonthlyReturn = expectedAnnualReturns[riskLevel] / 12;
    const volatility = {
      low: 0.02,
      medium: 0.04,
      high: 0.06
    }[riskLevel];
    
    let currentValue = initialValue;
    
    for (let i = 0; i <= numMonths; i++) {
      // Add monthly contribution
      if (i > 0) {
        currentValue += monthlyContribution;
      }
      
      // Apply return with randomness
      if (i > 0) {
        const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
        currentValue *= (1 + expectedMonthlyReturn * randomFactor);
        
        // Simulate rebalancing effect if enabled (small performance boost)
        if (rebalancing && i % 3 === 0) {
          currentValue *= 1.002;
        }
      }
      
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      data.push({
        month: i,
        date: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        value: Math.round(currentValue),
        benchmark: Math.round(initialValue * Math.pow(1 + (expectedAnnualReturns.medium / 12), i))
      });
    }
    
    const startValue = data[0].value;
    const endValue = data[data.length - 1].value;
    const totalReturn = ((endValue - startValue) / startValue) * 100;
    const annualizedReturn = (Math.pow(endValue / startValue, 1 / (numMonths / 12)) - 1) * 100;
    
    setSimulationResults({
      data,
      startValue,
      endValue,
      totalReturn,
      annualizedReturn,
      totalContributions: monthlyContribution * numMonths,
      simulationPeriod
    });
    
    toast.success('Simulation completed successfully');
  };
  
  const formatPercentValue = (value: number) => `${value.toFixed(2)}%`;
  
  const timeframes = [
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '3years', label: '3 Years' },
    { value: '5years', label: '5 Years' },
    { value: '10years', label: '10 Years' },
  ];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">
            Portfolio: <span className="font-medium">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-sm">
            Benchmark: <span className="font-medium">{formatCurrency(payload[1].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Portfolio Simulator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {simulationResults ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 size={18} className="mr-2" />
                    Simulation Results
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSimulationResults(null)}
                  >
                    <RefreshCcw size={14} className="mr-1" />
                    New Simulation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="chart">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chart" className="mt-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={simulationResults.data}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            tickFormatter={(value) => formatCurrency(value, true)}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            name="Your Portfolio" 
                            stroke="#3E92CC" 
                            fill="#3E92CC"
                            fillOpacity={0.1}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="benchmark" 
                            name="Market Benchmark" 
                            stroke="#9CA3AF" 
                            fill="#9CA3AF"
                            fillOpacity={0.1}
                            strokeDasharray="5 5"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground">Initial Value</div>
                          <div className="text-lg font-semibold mt-1">
                            {formatCurrency(simulationResults.startValue)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground">Final Value</div>
                          <div className="text-lg font-semibold mt-1">
                            {formatCurrency(simulationResults.endValue)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground">Total Return</div>
                          <div className="text-lg font-semibold mt-1">
                            {simulationResults.totalReturn.toFixed(2)}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground">Annualized Return</div>
                          <div className="text-lg font-semibold mt-1">
                            {simulationResults.annualizedReturn.toFixed(2)}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2">Simulation Parameters</h3>
                          <ul className="space-y-1 text-sm">
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Time Period:</span>
                              <span>{timeframes.find(t => t.value === simulationResults.simulationPeriod)?.label || simulationResults.simulationPeriod}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Risk Level:</span>
                              <span className="capitalize">{riskLevel}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Monthly Contribution:</span>
                              <span>{formatCurrency(monthlyContribution)}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Portfolio Rebalancing:</span>
                              <span>{rebalancing ? 'Enabled' : 'Disabled'}</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Simulation Outcome</h3>
                          <ul className="space-y-1 text-sm">
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Total Contributions:</span>
                              <span>{formatCurrency(simulationResults.totalContributions)}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Investment Growth:</span>
                              <span>{formatCurrency(simulationResults.endValue - simulationResults.startValue - simulationResults.totalContributions)}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">Final vs Initial:</span>
                              <span>{(simulationResults.endValue / simulationResults.startValue).toFixed(2)}x</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This simulation is for educational purposes only and does not guarantee future returns. Past performance is not indicative of future results.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 size={18} className="mr-2" />
                  Simulation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Simulation Time Period</Label>
                  <Select
                    value={simulationPeriod}
                    onValueChange={setSimulationPeriod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeframes.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select
                    value={riskLevel}
                    onValueChange={(value) => setRiskLevel(value as 'low' | 'medium' | 'high')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (5% expected return)</SelectItem>
                      <SelectItem value="medium">Medium (8% expected return)</SelectItem>
                      <SelectItem value="high">High (12% expected return)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthly-contribution">
                    Monthly Contribution: {formatCurrency(monthlyContribution)}
                  </Label>
                  <Slider
                    id="monthly-contribution"
                    value={[monthlyContribution]}
                    min={0}
                    max={50000}
                    step={1000}
                    onValueChange={(value) => setMonthlyContribution(value[0])}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rebalancing"
                    checked={rebalancing}
                    onCheckedChange={setRebalancing}
                  />
                  <Label htmlFor="rebalancing">Enable Portfolio Rebalancing</Label>
                </div>
                
                <Button onClick={runSimulation} className="w-full">
                  <Play size={16} className="mr-2" />
                  Run Simulation
                </Button>
                
                <Alert variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Simulation results are based on hypothetical scenarios and should not be considered financial advice.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-4">
          <PortfolioCard portfolio={portfolio} />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Simulation Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Adjust Risk Level:</span> Higher risk may yield higher returns but with increased volatility.
              </p>
              <p>
                <span className="font-medium">Monthly Contributions:</span> Regular investments can significantly impact long-term growth through dollar-cost averaging.
              </p>
              <p>
                <span className="font-medium">Rebalancing:</span> Periodically adjusting your portfolio back to target allocations can help manage risk and potentially improve returns.
              </p>
              <p>
                <span className="font-medium">Time Horizon:</span> Longer time periods tend to smooth out market volatility and better demonstrate compounding effects.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSimulator;
