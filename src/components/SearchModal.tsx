import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Stock, MarketIndex } from '../types/market';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  indices: MarketIndex[];
  onSelectStock: (symbol: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  stocks,
  indices,
  onSelectStock,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'stocks' | 'indices'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredStocks = stocks.filter((s) => {
    if (filterType === 'indices') return false;
    if (!normalizedQuery) return true;
    return (
      s.symbol.toLowerCase().includes(normalizedQuery) ||
      s.name.toLowerCase().includes(normalizedQuery) ||
      s.sector.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredIndices = indices.filter((idx) => {
    if (filterType === 'stocks') return false;
    if (!normalizedQuery) return true;
    return (
      idx.symbol.toLowerCase().includes(normalizedQuery) ||
      idx.name.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#1e222d] light:bg-white rounded-xl shadow-2xl border border-[#2a2e39] light:border-[#e0e3eb] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2e39] light:border-[#e0e3eb]">
          <Search className="w-5 h-5 text-[#787b86]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, or sector (e.g. NVDA, Apple, Technology)..."
            className="flex-1 bg-transparent text-sm text-[#d1d4dc] light:text-[#131722] placeholder-[#787b86] outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60 bg-[#171b26] light:bg-[#f8f9fd] text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722]'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setFilterType('stocks')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'stocks'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722]'
            }`}
          >
            Stocks ({stocks.length})
          </button>
          <button
            onClick={() => setFilterType('indices')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filterType === 'indices'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722]'
            }`}
          >
            Indices ({indices.length})
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/40 light:divide-[#e0e3eb]/60 p-2">
          {/* Indices */}
          {filterType !== 'stocks' && filteredIndices.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">
                Benchmark Indices
              </div>
              {filteredIndices.map((idx) => {
                const isPositive = idx.changePercent >= 0;
                return (
                  <button
                    key={idx.symbol}
                    onClick={() => {
                      onSelectStock(idx.symbol);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2a2e39]/50 light:hover:bg-[#f0f3fa] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#2962ff]/20 text-[#2962ff] font-mono font-bold text-xs flex items-center justify-center">
                        {idx.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white light:text-[#131722]">
                          {idx.name}
                        </div>
                        <div className="text-xs text-[#787b86] font-mono">
                          {idx.symbol} · INDEX
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-medium text-white light:text-[#131722] tabular-nums">
                        {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`text-xs font-mono tabular-nums ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {idx.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Stocks */}
          {filterType !== 'indices' && filteredStocks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">
                Stocks & Equities
              </div>
              {filteredStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock(stock.symbol);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#2a2e39]/50 light:hover:bg-[#f0f3fa] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: stock.color }}
                      >
                        {stock.logoText.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-xs text-[#787b86] truncate max-w-[200px] sm:max-w-xs">
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787b86]">
                          {stock.exchange} · {stock.sector}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold text-white light:text-[#131722] tabular-nums">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs font-mono font-medium tabular-nums ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {filteredStocks.length === 0 && filteredIndices.length === 0 && (
            <div className="py-12 text-center text-sm text-[#787b86]">
              No instruments found matching "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd] flex items-center justify-between text-[11px] text-[#787b86]">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1 rounded bg-[#2a2e39] light:bg-[#e0e3eb] text-[#d1d4dc] light:text-[#131722]">↑</kbd> <kbd className="px-1 rounded bg-[#2a2e39] light:bg-[#e0e3eb] text-[#d1d4dc] light:text-[#131722]">↓</kbd> to navigate</span>
            <span><kbd className="px-1 rounded bg-[#2a2e39] light:bg-[#e0e3eb] text-[#d1d4dc] light:text-[#131722]">↵</kbd> to select</span>
          </div>
          <span>TradingView Markets</span>
        </div>
      </div>
    </div>
  );
};
