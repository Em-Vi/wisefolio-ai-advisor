export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  description?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  relatedSymbols?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ChartData {
  name: string;
  value: number;
  pv?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  stocks: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  aiFeedback?: string;
  cognitivebiases?: Array<{name: string, description: string}>;
}

export interface PortfolioStock {
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  price: number;
  recommendation: 'buy' | 'hold' | 'sell';
  riskLevel: 'low' | 'medium' | 'high';
  potentialReturn: number;
  timeFrame: 'short' | 'long';
  summary: string;
}

// Mock popular stocks
export const popularStocks: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 184.92,
    change: 1.27,
    changePercent: 0.69,
    volume: 48965200,
    marketCap: 2850000000000,
    sector: 'Technology',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 417.53,
    change: 2.34,
    changePercent: 0.56,
    volume: 19382700,
    marketCap: 3106000000000,
    sector: 'Technology',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 182.81,
    change: -1.43,
    changePercent: -0.78,
    volume: 39762600,
    marketCap: 1896000000000,
    sector: 'Consumer Cyclical',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 171.95,
    change: 0.23,
    changePercent: 0.13,
    volume: 24862400,
    marketCap: 2129000000000,
    sector: 'Communication Services',
    description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 503.12,
    change: 3.78,
    changePercent: 0.76,
    volume: 12963700,
    marketCap: 1279000000000,
    sector: 'Communication Services',
    description: 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 173.80,
    change: -5.21,
    changePercent: -2.91,
    volume: 58963200,
    marketCap: 553700000000,
    sector: 'Consumer Cyclical',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 116.19,
    change: 2.05,
    changePercent: 1.80,
    volume: 198642700,
    marketCap: 2864000000000,
    sector: 'Technology',
    description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 197.53,
    change: -0.87,
    changePercent: -0.44,
    volume: 8962700,
    marketCap: 570200000000,
    sector: 'Financial Services',
    description: 'JPMorgan Chase & Co. operates as a financial services company worldwide.'
  }
];

// Generate mock news
export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Apple Announces New iPhone Line with AI Features',
    source: 'Tech Today',
    url: '#',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    summary: 'Apple revealed its latest iPhone lineup featuring advanced AI capabilities and improved battery life. Analysts expect strong sales in the coming quarters.',
    relatedSymbols: ['AAPL'],
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Microsoft Cloud Revenue Surpasses Expectations',
    source: 'Business News',
    url: '#',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    summary: 'Microsoft reported quarterly results with cloud services revenue exceeding analyst projections by 12%. The company raised guidance for the upcoming fiscal year.',
    relatedSymbols: ['MSFT'],
    sentiment: 'positive',
  },
  {
    id: '3',
    title: 'Tesla Faces Production Challenges in Berlin Factory',
    source: 'Auto Industry News',
    url: '#',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    summary: 'Tesla is experiencing supply chain issues at its Berlin Gigafactory, potentially impacting European delivery targets for the quarter. The company is working to resolve the bottlenecks.',
    relatedSymbols: ['TSLA'],
    sentiment: 'negative',
  },
  {
    id: '4',
    title: 'Amazon Expands Same-Day Delivery to 15 New Cities',
    source: 'Retail Dive',
    url: '#',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    summary: 'Amazon announced the expansion of its same-day delivery service to 15 additional metropolitan areas, strengthening its logistics advantage over competitors.',
    relatedSymbols: ['AMZN'],
    sentiment: 'positive',
  },
  {
    id: '5',
    title: 'Federal Reserve Signals Potential Rate Cuts',
    source: 'Financial Times',
    url: '#',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    summary: 'The Federal Reserve hinted at possible interest rate reductions in the coming months as inflation shows signs of easing. Markets responded positively to the announcement.',
    relatedSymbols: ['JPM', 'AAPL', 'MSFT', 'GOOGL'],
    sentiment: 'positive',
  },
];

// Generate mock chart data (5-day price history)
export function generateMockChartData(stockSymbol: string, days = 7): ChartData[] {
  const stock = popularStocks.find(s => s.symbol === stockSymbol);
  const startPrice = stock ? stock.price - (stock.change * Math.random() * 5) : 100;
  
  return Array.from({ length: days }, (_, i) => {
    const volatility = Math.random() * 3 - 1.5; // random between -1.5 and 1.5
    const value = startPrice + (i * (Math.random() * 2 - 0.5)) + volatility;
    
    return {
      name: new Date(Date.now() - (days - i) * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(2)),
    };
  });
}

// Generate mock stock recommendations
export function generateStockRecommendations(riskLevel: 'low' | 'medium' | 'high', count = 3): StockRecommendation[] {
  // Filter stocks based on risk level
  let filteredStocks: StockData[] = [];
  
  if (riskLevel === 'low') {
    filteredStocks = popularStocks.filter(stock => 
      Math.abs(stock.changePercent) < 1 && 
      ['Financial Services', 'Consumer Defensive'].includes(stock.sector)
    );
  } else if (riskLevel === 'medium') {
    filteredStocks = popularStocks.filter(stock => 
      Math.abs(stock.changePercent) < 2 &&
      !['Financial Services', 'Consumer Defensive'].includes(stock.sector)
    );
  } else {
    filteredStocks = popularStocks.filter(stock => 
      Math.abs(stock.changePercent) >= 1 &&
      ['Technology', 'Consumer Cyclical'].includes(stock.sector)
    );
  }
  
  // If not enough stocks match the criteria, use all stocks
  if (filteredStocks.length < count) {
    filteredStocks = popularStocks;
  }
  
  // Select random stocks from filtered list
  const selectedIndices: number[] = [];
  while (selectedIndices.length < Math.min(count, filteredStocks.length)) {
    const index = Math.floor(Math.random() * filteredStocks.length);
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
    }
  }
  
  // Create recommendations
  return selectedIndices.map(index => {
    const stock = filteredStocks[index];
    const isPositive = stock.change > 0;
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      recommendation: isPositive ? 'buy' : Math.random() > 0.5 ? 'hold' : 'sell',
      riskLevel,
      potentialReturn: riskLevel === 'low' ? 5 + Math.random() * 5 : 
                       riskLevel === 'medium' ? 10 + Math.random() * 10 : 
                       15 + Math.random() * 15,
      timeFrame: Math.random() > 0.5 ? 'short' : 'long',
      summary: `${stock.name} shows ${isPositive ? 'positive' : 'negative'} momentum with recent ${Math.abs(stock.changePercent).toFixed(2)}% ${isPositive ? 'gain' : 'loss'}. The company operates in the ${stock.sector} sector and ${stock.description?.substring(0, 100)}...`
    };
  });
}

// Mock journal entries
export const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    title: 'Tech Sector Analysis',
    content: 'I believe tech stocks will continue to outperform in the next quarter due to strong earnings and AI innovation. Planning to increase my position in AAPL and MSFT.',
    stocks: ['AAPL', 'MSFT', 'NVDA'],
    sentiment: 'bullish',
    aiFeedback: "Your analysis shows confidence in tech sector growth, which aligns with current market trends. Consider diversifying beyond just mega-cap tech to reduce concentration risk. Your optimism about AI's impact is well-founded, but be mindful of potential regulatory headwinds in this space.",
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    title: 'Electric Vehicle Market Concerns',
    content: "TSLA's recent price drops may indicate weakening demand. I'm considering reducing my position and reallocating to established automakers with stronger EV roadmaps.",
    stocks: ['TSLA', 'F', 'GM'],
    sentiment: 'bearish',
    aiFeedback: "You've identified a legitimate concern about Tesla's pricing strategy, which could impact margins. Your consideration of established automakers shows contrarian thinking, which can be valuable. Be aware of confirmation bias - ensure you're not focusing only on negative Tesla news to justify a decision you've already made.",
  }
];

// Generate mock portfolio
export function generateMockPortfolio(): PortfolioStock[] {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 10,
      buyPrice: 172.50,
      currentPrice: 184.92,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 5,
      buyPrice: 405.12,
      currentPrice: 417.53,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      shares: 20,
      buyPrice: 103.67,
      currentPrice: 116.19,
    }
  ];
}
