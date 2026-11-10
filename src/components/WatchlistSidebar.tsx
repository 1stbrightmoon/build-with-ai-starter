import React, { useState } from 'react';
import { Stock, PriceAlert, PaperPosition } from '../types/market';
import { X, Bookmark, Bell, Briefcase, Plus, Trash2, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

interface WatchlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  alerts: PriceAlert[];
  onCreateAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  onDeleteAlert: (id: string) => void;
  paperPositions: Record<string, PaperPosition>;
  paperCash: number;
}

export const WatchlistSidebar: React.FC<WatchlistSidebarProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  stocks,
  onSelectStock,
  onRemoveFromWatchlist,
  onAddToWatchlist,
  alerts,
  onCreateAlert,
  onDeleteAlert,
  paperPositions,
  paperCash,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts' | 'portfolio'>('watchlist');

  // New alert form state
  const [alertSymbol, setAlertSymbol] = useState<string>('NVDA');
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(155);
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  // Symbol to add state
  const [addQuery, setAddQuery] = useState('');

  if (!isOpen) return null;

  // Watchlisted stock objects
  const watchlistedStocks = watchlistSymbols
    .map((sym) => stocks.find((s) => s.symbol === sym))
    .filter((s): s is Stock => Boolean(s));

  // Compute Paper Portfolio Total Value
  let openPositionsValue = 0;
  let totalCostBasis = 0;
  Object.values(paperPositions).forEach((pos) => {
    const s = stocks.find((st) => st.symbol === pos.symbol);
    const currPrice = s ? s.price : pos.avgPrice;
    openPositionsValue += pos.shares * currPrice;
    totalCostBasis += pos.shares * pos.avgPrice;
  });

  const totalPortfolioValue = paperCash + openPositionsValue;
  const totalUnrealizedPL = openPositionsValue - totalCostBasis;
  const totalPLPct = totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0;

  const handleCreateAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertTargetPrice > 0) {
      onCreateAlert(alertSymbol, alertTargetPrice, alertCondition);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 bg-[#1e222d] light:bg-white border-l border-[#2a2e39] light:border-[#e0e3eb] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39] light:border-[#e0e3eb]">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#131722] light:bg-[#f0f3fa] p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Watchlist ({watchlistedStocks.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'portfolio'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Portfolio
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-[#787b86] hover:text-white light:hover:text-[#131722] hover:bg-[#2a2e39] light:hover:bg-[#f0f3fa] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        
        {/* TAB 1: WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div className="space-y-3">
            
            {/* Quick Add Symbol Input */}
            <div className="relative">
              <input
                type="text"
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
                placeholder="Add symbol (e.g. AMD, META)..."
                className="w-full px-3 py-1.5 text-xs bg-[#131722] light:bg-[#f8f9fd] text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded-md outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans placeholder-[#787b86]"
              />
              {addQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#1e222d] light:bg-white border border-[#2a2e39] light:border-[#e0e3eb] rounded-md shadow-xl max-h-48 overflow-y-auto">
                  {stocks
                    .filter((s) => s.symbol.includes(addQuery.toUpperCase()) && !watchlistSymbols.includes(s.symbol))
                    .map((s) => (
                      <button
                        key={s.symbol}
                        onClick={() => {
                          onAddToWatchlist(s.symbol);
                          setAddQuery('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#2a2e39]/50 light:hover:bg-[#f0f3fa] flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-bold font-mono text-white light:text-[#131722]">{s.symbol}</span>
                        <span className="text-[11px] text-[#787b86] truncate max-w-[140px]">{s.name}</span>
                        <Plus className="w-3.5 h-3.5 text-[#2962ff]" />
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-[#2a2e39]/50 light:divide-[#e0e3eb]/60">
              {watchlistedStocks.map((stock) => {
                const isPos = stock.changePercent >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock.symbol)}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-[#2a2e39]/40 light:hover:bg-[#f0f3fa] rounded-md transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: stock.color }}
                      >
                        {stock.logoText.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </div>
                        <div className="text-[10px] text-[#787b86] truncate max-w-[110px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white light:text-[#131722] tabular-nums">
                          ${stock.price.toFixed(2)}
                        </div>
                        <div className={`text-[11px] font-mono font-medium tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromWatchlist(stock.symbol);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#787b86] hover:text-[#f23645] transition-opacity"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {watchlistedStocks.length === 0 && (
                <div className="py-12 text-center text-xs text-[#787b86]">
                  Your watchlist is empty. Click star icons on any stock to pin it here.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PRICE ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            
            {/* Create Alert Form */}
            <form onSubmit={handleCreateAlertSubmit} className="p-3 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd] space-y-2.5">
              <span className="text-xs font-bold text-white light:text-[#131722] block">
                Create New Price Alert
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#787b86] block mb-0.5">Symbol</label>
                  <select
                    value={alertSymbol}
                    onChange={(e) => {
                      setAlertSymbol(e.target.value);
                      const s = stocks.find((st) => st.symbol === e.target.value);
                      if (s) setAlertTargetPrice(Number((s.price * 1.05).toFixed(2)));
                    }}
                    className="w-full px-2 py-1.5 bg-[#131722] light:bg-white text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded font-mono"
                  >
                    {stocks.map((s) => (
                      <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#787b86] block mb-0.5">Condition</label>
                  <select
                    value={alertCondition}
                    onChange={(e) => setAlertCondition(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-[#131722] light:bg-white text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded"
                  >
                    <option value="above">Price rises above</option>
                    <option value="below">Price falls below</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#787b86] block mb-0.5">Target Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-[#131722] light:bg-white text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded font-mono text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 text-xs font-semibold rounded bg-[#2962ff] text-white hover:bg-[#1e54e4] transition-colors cursor-pointer"
              >
                Set Price Alert
              </button>
            </form>

            {/* Existing Alerts */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787b86] block">
                Active Alerts ({alerts.length})
              </span>

              {alerts.map((al) => {
                const s = stocks.find((st) => st.symbol === al.symbol);
                const currPrice = s ? s.price : 0;
                const isTriggered = al.condition === 'above' ? currPrice >= al.targetPrice : currPrice <= al.targetPrice;

                return (
                  <div
                    key={al.id}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                      isTriggered
                        ? 'border-[#089981]/50 bg-[#089981]/10'
                        : 'border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-white light:text-[#131722]">{al.symbol}</span>
                        <span className="text-[11px] text-[#787b86]">
                          {al.condition === 'above' ? '≥' : '≤'} ${al.targetPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#787b86] font-mono mt-0.5">
                        Current: ${currPrice.toFixed(2)} {isTriggered ? '· Triggered!' : ''}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAlert(al.id)}
                      className="p-1 text-[#787b86] hover:text-[#f23645] transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="py-8 text-center text-xs text-[#787b86]">
                  No active price alerts.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: PAPER PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            
            {/* Balance Card */}
            <div className="p-3.5 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd]">
              <span className="text-[10px] text-[#787b86] uppercase tracking-wider block">
                Total Account Value
              </span>
              <div className="text-xl font-extrabold font-mono text-white light:text-[#131722] mt-0.5 tabular-nums">
                ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#2a2e39]/60 light:border-[#e0e3eb]/60 text-xs font-mono">
                <div>
                  <span className="text-[#787b86] block text-[10px]">Cash Balance</span>
                  <span className="text-white light:text-[#131722] font-semibold">${paperCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#787b86] block text-[10px]">Total Unrealized P&L</span>
                  <span className={`font-bold ${totalUnrealizedPL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                    {totalUnrealizedPL >= 0 ? '+' : ''}${totalUnrealizedPL.toFixed(2)} ({totalUnrealizedPL >= 0 ? '+' : ''}{totalPLPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Position List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787b86] block">
                Open Equity Positions ({Object.keys(paperPositions).length})
              </span>

              {Object.values(paperPositions).map((pos) => {
                const s = stocks.find((st) => st.symbol === pos.symbol);
                const currPrice = s ? s.price : pos.avgPrice;
                const mktVal = pos.shares * currPrice;
                const pl = (currPrice - pos.avgPrice) * pos.shares;
                const plPct = ((currPrice - pos.avgPrice) / pos.avgPrice) * 100;
                const isPlPos = pl >= 0;

                return (
                  <div
                    key={pos.symbol}
                    onClick={() => onSelectStock(pos.symbol)}
                    className="p-3 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white hover:border-[#2962ff] transition-all cursor-pointer text-xs font-mono"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white light:text-[#131722] text-sm">{pos.symbol}</span>
                        <span className="text-[#787b86]">{pos.shares} shs @ ${pos.avgPrice.toFixed(2)}</span>
                      </div>
                      <span className="text-white light:text-[#131722] font-bold">
                        ${mktVal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#2a2e39]/50 light:border-[#e0e3eb]/50">
                      <span className="text-[#787b86]">Current: ${currPrice.toFixed(2)}</span>
                      <span className={`font-semibold ${isPlPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isPlPos ? '+' : ''}${pl.toFixed(2)} ({isPlPos ? '+' : ''}{plPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}

              {Object.keys(paperPositions).length === 0 && (
                <div className="py-8 text-center text-xs text-[#787b86]">
                  No open positions. Use the Trade Simulator in Chart Terminal to execute simulated orders.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
