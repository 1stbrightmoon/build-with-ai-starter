export type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
export type ChartType = 'candles' | 'area' | 'line' | 'heikin';
export type TechnicalIndicator = 'sma20' | 'ema50' | 'bollinger' | 'rsi' | 'volume';
export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface OHLCV {
  time: string; // ISO or date string
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number; // in billions or absolute
  peRatio: number | null;
  eps: number;
  dividendYield: number;
  sector: string;
  industry: string;
  high52: number;
  low52: number;
  rating: TechnicalRating;
  targetPrice: number;
  beta: number;
  ceo: string;
  headquarters: string;
  employees: number;
  description: string;
  exchange: 'NASDAQ' | 'NYSE';
  sparkline: number[];
  color: string;
  logoBg: string;
  logoText: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  sparkline: number[];
}

export interface SectorMetric {
  name: string;
  changePercent: number;
  marketCapBillions: number;
  leaderSymbol: string;
  leaderChange: number;
  stocksCount: number;
}

export interface EarningsEvent {
  symbol: string;
  company: string;
  date: string;
  time: 'BMO' | 'AMC'; // Before Market Open / After Market Close
  estimateEPS: number;
  actualEPS: number | null;
  estimateRev: string;
  actualRev: string | null;
  surprisePercent: number | null;
}

export interface MarketNews {
  id: string;
  headline: string;
  source: string;
  timeAgo: string;
  symbols: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
  summary: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
}

export interface PaperPosition {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
}
