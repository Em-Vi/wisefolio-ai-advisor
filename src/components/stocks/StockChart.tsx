
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '@/data/mockStockData';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatUtils';

interface StockChartProps {
  data: ChartData[];
  symbol: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
}

export function StockChart({ 
  data, 
  symbol, 
  color = '#3E92CC', 
  height = 250,
  showGrid = true 
}: StockChartProps) {
  // Calculate min and max values for Y axis
  const values = data.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Add padding to Y axis
  const yAxisDomain = [
    min - (max - min) * 0.1, // min minus 10% of range
    max + (max - min) * 0.1  // max plus 10% of range
  ];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md text-sm">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-medium">{symbol}: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium">{symbol} Price History</h3>
      </div>
      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={yAxisDomain}
              tick={{ fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.1} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
