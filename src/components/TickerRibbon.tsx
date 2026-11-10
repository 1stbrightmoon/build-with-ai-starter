import React from 'react';
import { MarketIndex } from '../types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerRibbonProps {
  indices: MarketIndex[];
  onSelectIndex: (symbol: string) => void;
  selectedSymbol?: string;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({
  indices,
  onSelectIndex,
  selectedSymbol,
}) => {
  return (
    <div className="w-full border-b border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd] overflow-x-auto scrollbar-none py-1.5 px-3">
      <div className="flex items-center gap-2 min-w-max">
        {indices.map((idx) => {
          const isPositive = idx.changePercent >= 0;
          const isSelected = selectedSymbol === idx.symbol;

          // Render micro-sparkline SVG
          const min = Math.min(...idx.sparkline);
          const max = Math.max(...idx.sparkline);
          const range = max - min || 1;
          const points = idx.sparkline
            .map((val, i) => {
              const x = (i / (idx.sparkline.length - 1)) * 48;
              const y = 18 - ((val - min) / range) * 14;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <button
              key={idx.symbol}
              onClick={() => onSelectIndex(idx.symbol)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#2962ff]/15 ring-1 ring-[#2962ff]'
                  : 'hover:bg-[#1e222d] light:hover:bg-[#ebedf2]'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold tracking-tight text-[#d1d4dc] light:text-[#131722] whitespace-nowrap">
                  {idx.name}
                </span>
                <span className="text-[10px] text-[#787b86] font-mono">
                  {idx.symbol}
                </span>
              </div>

              {/* Sparkline */}
              <div className="w-12 h-5 hidden sm:block shrink-0">
                <svg width="48" height="20" className="overflow-visible">
                  <polyline
                    fill="none"
                    stroke={isPositive ? '#089981' : '#f23645'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </svg>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[11px] font-mono font-semibold text-[#d1d4dc] light:text-[#131722] tabular-nums">
                  {idx.price.toLocaleString(undefined, {
                    minimumFractionDigits: idx.price < 10 ? 3 : 2,
                    maximumFractionDigits: idx.price < 10 ? 3 : 2,
                  })}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-mono font-medium tabular-nums ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
