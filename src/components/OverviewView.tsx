import React, { useState } from 'react';
import { Stock, MarketIndex, SectorMetric, MarketNews, Timeframe } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { generateCandlesForStock } from '../data/mockMarketData';
import { TrendingUp, TrendingDown, ArrowRight, Gauge, Activity, Flame } from 'lucide-react';

interface OverviewViewProps {
  stocks: Stock[];
  indices: MarketIndex[];
  sectors: SectorMetric[];
  news: MarketNews[];
  onSelectStock: (symbol: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stocks,
  indices,
  sectors,
  news,
  onSelectStock,
  onNavigateTab,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const candles = generateCandlesForStock(currentStock, timeframe);

  // Computed mover lists
  const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const topGainers = [...stocks].filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...stocks].filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Hero Section: Market Pulse & Major Benchmark Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Interactive Benchmark & Ticker Chart (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-[#131722] tracking-tight">
                  Stock Market Overview
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#089981]/15 text-[#089981]">
                  US Markets Open
                </span>
              </div>
              <p className="text-xs text-[#787b86] mt-0.5">
                Real-time technical tracking, market breadth, and equity volume flows
              </p>
            </div>

            {/* Quick stock switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['NVDA', 'AAPL', 'TSLA', 'MSFT', 'PLTR'].map((sym) => {
                const s = stocks.find((st) => st.symbol === sym);
                const isActive = selectedSymbol === sym;
                return (
                  <button
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#2962ff] text-white shadow-xs'
                        : 'bg-[#1e222d] light:bg-[#f0f3fa] text-[#787b86] hover:text-white light:hover:text-[#131722]'
                    }`}
                  >
                    {sym} {s ? `${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(1)}%` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="h-[430px] w-full">
            <InteractiveChart
              candles={candles}
              symbol={currentStock.symbol}
              name={currentStock.name}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              currentPrice={currentStock.price}
              changePercent={currentStock.changePercent}
            />
          </div>

          {/* Key Stats Bar beneath Hero Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-[#f8f9fd] text-xs">
            <div>
              <span className="text-[#787b86]">Day Range</span>
              <div className="font-mono font-semibold text-white light:text-[#131722] mt-0.5 tabular-nums">
                ${(currentStock.price * 0.985).toFixed(2)} - ${(currentStock.price * 1.018).toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-[#787b86]">52-Week Range</span>
              <div className="font-mono font-semibold text-white light:text-[#131722] mt-0.5 tabular-nums">
                ${currentStock.low52.toFixed(2)} - ${currentStock.high52.toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-[#787b86]">Volume (24h)</span>
              <div className="font-mono font-semibold text-white light:text-[#131722] mt-0.5 tabular-nums">
                {(currentStock.volume / 1000000).toFixed(1)}M shares
              </div>
            </div>
            <div>
              <span className="text-[#787b86]">Market Cap</span>
              <div className="font-mono font-semibold text-white light:text-[#131722] mt-0.5 tabular-nums">
                ${currentStock.marketCap.toFixed(1)}B
              </div>
            </div>
          </div>
        </div>

        {/* Right: Market Sentiment & Sector Breakdown (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Market Sentiment Gauge Card */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#089981]" />
                <span className="text-sm font-bold text-white light:text-[#131722]">
                  Market Breadth & Sentiment
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#089981]">
                Greed · 68
              </span>
            </div>

            {/* Gauge visualization bar */}
            <div className="py-4">
              <div className="relative w-full h-3.5 bg-gradient-to-r from-[#f23645] via-amber-400 to-[#089981] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-md rounded-full border border-black/40"
                  style={{ left: '68%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#787b86] font-mono mt-1.5">
                <span>Extreme Fear</span>
                <span>Neutral (50)</span>
                <span>Extreme Greed</span>
              </div>
            </div>

            <div className="text-xs text-[#787b86] leading-relaxed">
              Equities maintain strong momentum above the 50-day moving average, led by technology and semiconductor hardware outperformance.
            </div>
          </div>

          {/* Sector Performance Mini-Card */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2962ff]" />
                <span className="text-sm font-bold text-white light:text-[#131722]">
                  Top Sector Movements
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('heatmap')}
                className="text-xs text-[#2962ff] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                Heatmap <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-[#2a2e39]/40 light:divide-[#e0e3eb]/40 flex-1 overflow-y-auto max-h-[220px]">
              {sectors.slice(0, 6).map((sec) => {
                const isPositive = sec.changePercent >= 0;
                return (
                  <div key={sec.name} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white light:text-[#131722]">
                        {sec.name}
                      </div>
                      <div className="text-[11px] text-[#787b86]">
                        Leader: <strong className="text-[#d1d4dc] light:text-[#131722]">{sec.leaderSymbol}</strong> ({sec.leaderChange >= 0 ? '+' : ''}{sec.leaderChange.toFixed(1)}%)
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-xs ${
                        isPositive
                          ? 'text-[#089981] bg-[#089981]/10'
                          : 'text-[#f23645] bg-[#f23645]/10'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {sec.changePercent.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Market Movers: 3-Column TradingView Style Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-white light:text-[#131722]">
              Market Movers & Highlights
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('gainers')}
            className="text-xs text-[#2962ff] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            View all movers <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Most Active by Volume */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787b86]">
                Most Active by Volume
              </span>
              <span className="text-[11px] text-[#787b86]">Shares Traded</span>
            </div>
            <div className="divide-y divide-[#2a2e39]/40 light:divide-[#e0e3eb]/40">
              {mostActive.map((stock) => {
                const isPos = stock.changePercent >= 0;
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock.symbol)}
                    className="w-full py-2 flex items-center justify-between hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa] px-1 rounded transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: stock.color }}
                      >
                        {stock.logoText.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white light:text-[#131722]">
                          {stock.symbol}
                        </div>
                        <div className="text-[10px] text-[#787b86] font-mono">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-white light:text-[#131722] tabular-nums">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div className={`text-[11px] font-mono tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Top Gainers */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#089981]">
                Top Gainers
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-[#089981]" />
            </div>
            <div className="divide-y divide-[#2a2e39]/40 light:divide-[#e0e3eb]/40">
              {topGainers.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock.symbol)}
                  className="w-full py-2 flex items-center justify-between hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa] px-1 rounded transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: stock.color }}
                    >
                      {stock.logoText.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white light:text-[#131722]">
                        {stock.symbol}
                      </div>
                      <div className="text-[10px] text-[#787b86] truncate max-w-[120px]">
                        {stock.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-white light:text-[#131722] tabular-nums">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[#089981] tabular-nums">
                      +{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Top Losers */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f23645]">
                Top Losers
              </span>
              <TrendingDown className="w-3.5 h-3.5 text-[#f23645]" />
            </div>
            <div className="divide-y divide-[#2a2e39]/40 light:divide-[#e0e3eb]/40">
              {topLosers.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock.symbol)}
                  className="w-full py-2 flex items-center justify-between hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa] px-1 rounded transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: stock.color }}
                    >
                      {stock.logoText.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white light:text-[#131722]">
                        {stock.symbol}
                      </div>
                      <div className="text-[10px] text-[#787b86] truncate max-w-[120px]">
                        {stock.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-white light:text-[#131722] tabular-nums">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[#f23645] tabular-nums">
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Market News & Analysis Stream */}
      <div>
        <h2 className="text-base font-bold text-white light:text-[#131722] mb-3">
          Market News & Live Editorial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white flex flex-col justify-between hover:border-[#363a45] transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-[#787b86] mb-1.5">
                  <span className="font-semibold text-[#2962ff]">{item.source}</span>
                  <span>·</span>
                  <span>{item.timeAgo}</span>
                  <span>·</span>
                  <span>{item.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-white light:text-[#131722] leading-snug hover:text-[#2962ff] transition-colors cursor-pointer">
                  {item.headline}
                </h3>
                <p className="text-xs text-[#787b86] mt-2 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#2a2e39]/60 light:border-[#e0e3eb]/60">
                {item.symbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onSelectStock(sym)}
                    className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#131722] light:bg-[#f0f3fa] text-[#d1d4dc] light:text-[#131722] hover:text-[#2962ff] transition-colors cursor-pointer"
                  >
                    ${sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
