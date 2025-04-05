
import React from 'react';
import { StockData } from '@/data/mockStockData';
import { formatCurrency, formatNumber } from '@/lib/formatUtils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockCardProps {
  stock: StockData;
  onClick?: () => void;
}

export function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <div 
      className="finance-card cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{stock.symbol}</h3>
          <p className="text-sm text-muted-foreground">{stock.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{formatCurrency(stock.price)}</p>
          <div className={`flex items-center text-sm ${isPositive ? 'stock-up' : 'stock-down'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{formatCurrency(Math.abs(stock.change))}</span>
            <span className="ml-1">({Math.abs(stock.changePercent).toFixed(2)}%)</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Volume</p>
          <p className="font-medium">{formatNumber(stock.volume)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Market Cap</p>
          <p className="font-medium">{formatCurrency(stock.marketCap, true)}</p>
        </div>
      </div>
    </div>
  );
}
