import React, { useState } from 'react';
import { Stock } from '../types/market';
import { TrendingUp, TrendingDown, Zap, ShieldAlert, Award, BarChart2 } from 'lucide-react';

interface GainersLosersViewProps {
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

type TabType = 'gainers' | 'losers' | 'volume' | 'highs' | 'volatility';

export const GainersLosersView: React.FC<GainersLosersViewProps> = ({
  stocks,
  onSelectStock,
  onOpenChart,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gainers');

  // Compute lists
  const topGainers = [...stocks].filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
  const topLosers = [...stocks].filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
  const mostVolume = [...stocks].sort((a, b) => b.volume - a.volume);
  const near52High = [...stocks].sort((a, b) => (b.price / b.high52) - (a.price / a.high52));
  const highBeta = [...stocks].sort((a, b) => b.beta - a.beta);

  const getActiveList = () => {
    switch (activeTab) {
      case 'gainers': return topGainers;
      case 'losers': return topLosers;
      case 'volume': return mostVolume;
      case 'highs': return near52High;
      case 'volatility': return highBeta;
    }
  };

  const list = getActiveList();

  return (
    <div className="space-y-4">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-[#131722] tracking-tight">
            Gainers, Losers & Active Markets
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5">
            Identify momentum breakouts, volume surges, and extreme volatility
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 bg-[#1e222d] light:bg-[#f0f3fa] p-1 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'gainers'
                ? 'bg-[#089981] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'losers'
                ? 'bg-[#f23645] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Top Losers
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'volume'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Most Active
          </button>
          <button
            onClick={() => setActiveTab('highs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'highs'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            52-Week Highs
          </button>
          <button
            onClick={() => setActiveTab('volatility')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'volatility'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            High Beta
          </button>
        </div>
      </div>

      {/* Grid Cards of Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {list.map((stock, idx) => {
          const isPos = stock.changePercent >= 0;
          const rangePct = Math.min(100, Math.max(0, ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100));

          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white hover:border-[#2962ff] transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#787b86] w-4">
                      #{idx + 1}
                    </span>
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: stock.color }}
                    >
                      {stock.logoText.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                        {stock.name}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChart(stock.symbol);
                    }}
                    className="p-1.5 rounded hover:bg-[#2962ff]/20 text-[#787b86] hover:text-[#2962ff] transition-colors"
                    title="Open Chart"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price and Percentage */}
                <div className="flex items-baseline justify-between mt-3.5">
                  <div className="text-lg font-mono font-bold text-white light:text-[#131722] tabular-nums">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div
                    className={`font-mono font-bold text-sm tabular-nums px-2 py-0.5 rounded ${
                      isPos ? 'text-[#089981] bg-[#089981]/15' : 'text-[#f23645] bg-[#f23645]/15'
                    }`}
                  >
                    {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>

                {/* 52W Range mini meter */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-[#787b86] font-mono">
                    <span>52W L: ${stock.low52.toFixed(0)}</span>
                    <span>52W H: ${stock.high52.toFixed(0)}</span>
                  </div>
                  <div className="relative w-full h-1 bg-[#131722] light:bg-[#e0e3eb] rounded-full overflow-hidden mt-1">
                    <div
                      className="absolute top-0 bottom-0 bg-[#2962ff] rounded-full"
                      style={{ width: `${rangePct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Specs */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#2a2e39]/60 light:border-[#e0e3eb]/60 text-[11px] font-mono text-[#787b86]">
                <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                <span>Beta: {stock.beta.toFixed(2)}</span>
                <span>Cap: ${(stock.marketCap).toFixed(0)}B</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
