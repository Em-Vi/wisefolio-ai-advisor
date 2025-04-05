
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioStock } from '@/data/mockStockData';
import { formatCurrency } from '@/lib/formatUtils';

interface PortfolioCardProps {
  portfolio: PortfolioStock[];
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  // Calculate portfolio metrics
  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);
  const totalCost = portfolio.reduce((sum, stock) => sum + (stock.buyPrice * stock.shares), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Current Portfolio</span>
          <span className="text-base font-normal">
            Total Value: <span className="font-semibold">{formatCurrency(totalValue)}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
            <p className={`font-medium ${totalGain >= 0 ? 'text-finance-green-500' : 'text-destructive'}`}>
              {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} ({totalGainPercent.toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="font-medium">{formatCurrency(totalCost)}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {portfolio.map((stock) => {
            const stockValue = stock.currentPrice * stock.shares;
            const stockCost = stock.buyPrice * stock.shares;
            const stockGain = stockValue - stockCost;
            const stockGainPercent = (stockGain / stockCost) * 100;
            
            return (
              <div key={stock.symbol} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{stock.symbol}</h4>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(stock.currentPrice)}</p>
                      <p className={`text-xs ${stockGain >= 0 ? 'text-finance-green-500' : 'text-destructive'}`}>
                        {stockGain >= 0 ? '+' : ''}{stockGainPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{stock.shares} shares</span>
                    <span>Value: {formatCurrency(stockValue)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
