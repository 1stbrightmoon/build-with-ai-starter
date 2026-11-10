import React, { useState } from 'react';
import { Stock, Timeframe, PaperPosition } from '../types/market';
import { InteractiveChart } from './InteractiveChart';
import { generateCandlesForStock } from '../data/mockMarketData';
import { Star, TrendingUp, TrendingDown, DollarSign, Briefcase, Building, Users, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface TradingTerminalViewProps {
  stock: Stock;
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  paperPositions: Record<string, PaperPosition>;
  paperCash: number;
  onExecuteOrder: (symbol: string, type: 'buy' | 'sell', shares: number, price: number) => { success: boolean; message: string };
}

export const TradingTerminalView: React.FC<TradingTerminalViewProps> = ({
  stock,
  stocks,
  onSelectStock,
  isWatchlisted,
  onToggleWatchlist,
  paperPositions,
  paperCash,
  onExecuteOrder,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [sharesInput, setSharesInput] = useState<number>(10);
  const [orderNotification, setOrderNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  const candles = generateCandlesForStock(stock, timeframe);
  const position = paperPositions[stock.symbol];
  const isUp = stock.changePercent >= 0;

  const totalCost = sharesInput * stock.price;
  const canBuy = paperCash >= totalCost && sharesInput > 0;
  const canSell = position && position.shares >= sharesInput && sharesInput > 0;

  // Handle Order Submit
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onExecuteOrder(stock.symbol, orderType, sharesInput, stock.price);
    setOrderNotification({ message: result.message, isError: !result.success });
    setTimeout(() => setOrderNotification(null), 3500);
  };

  // Target price upside calculation
  const upsidePct = ((stock.targetPrice - stock.price) / stock.price) * 100;

  return (
    <div className="space-y-4">
      
      {/* Ticker Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white shadow-xs">
        
        {/* Left: Emblem, Symbol, Name, Price */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-sm"
            style={{ backgroundColor: stock.color }}
          >
            {stock.logoText}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-[#131722] tracking-tight">
                {stock.symbol}
              </h1>
              <span className="text-xs text-[#787b86] font-medium hidden sm:inline">
                {stock.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#131722] light:bg-[#f0f3fa] text-[#787b86]">
                {stock.exchange}
              </span>
              <button
                onClick={() => onToggleWatchlist(stock.symbol)}
                className="p-1 text-[#787b86] hover:text-amber-400 transition-colors cursor-pointer"
                title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star
                  className={`w-4 h-4 ${
                    isWatchlisted ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-2xl font-extrabold font-mono text-white light:text-[#131722] tabular-nums">
                ${stock.price.toFixed(2)}
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-mono font-bold tabular-nums ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
              <span className="text-[11px] text-[#787b86] hidden md:inline">
                · Regular Trading Hours
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stock Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#787b86]">Switch Ticker:</span>
          <select
            value={stock.symbol}
            onChange={(e) => onSelectStock(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold font-mono bg-[#131722] light:bg-[#f8f9fd] text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded-md outline-none cursor-pointer"
          >
            {stocks.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name} (${s.price.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Terminal Grid: 8 Cols Chart/Stats + 4 Cols Paper Trading & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left / Center 8 Columns: Chart & Technicals */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Interactive Chart Canvas */}
          <div className="h-[460px] w-full">
            <InteractiveChart
              candles={candles}
              symbol={stock.symbol}
              name={stock.name}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              currentPrice={stock.price}
              changePercent={stock.changePercent}
            />
          </div>

          {/* Key Statistics Grid */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#787b86] mb-3">
              Valuation & Financial Statistics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#787b86] block text-[11px]">Market Cap</span>
                <span className="font-bold text-white light:text-[#131722] tabular-nums">
                  ${stock.marketCap.toFixed(1)}B
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">P/E Ratio (TTM)</span>
                <span className="font-bold text-white light:text-[#131722] tabular-nums">
                  {stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">EPS (TTM)</span>
                <span className="font-bold text-white light:text-[#131722] tabular-nums">
                  ${stock.eps.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Dividend Yield</span>
                <span className="font-bold text-white light:text-[#131722] tabular-nums">
                  {(stock.dividendYield * 100).toFixed(2)}%
                </span>
              </div>

              <div>
                <span className="text-[#787b86] block text-[11px]">Beta (Volatility)</span>
                <span className="font-bold text-white light:text-[#131722] tabular-nums">
                  {stock.beta.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">52-Week High</span>
                <span className="font-bold text-[#089981] tabular-nums">
                  ${stock.high52.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">52-Week Low</span>
                <span className="font-bold text-[#f23645] tabular-nums">
                  ${stock.low52.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Avg Daily Volume</span>
                <span className="font-bold text-white light:text-[#131722] tabular-nums">
                  {(stock.avgVolume / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          {/* Company Profile & Business Description */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#787b86] mb-2">
              About {stock.name}
            </h3>
            <p className="text-xs text-[#d1d4dc] light:text-[#4a5568] leading-relaxed mb-4">
              {stock.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#2a2e39]/50 light:border-[#e0e3eb]/50 text-xs">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[#787b86]" />
                <span className="text-[#787b86]">CEO:</span>
                <span className="font-semibold text-white light:text-[#131722]">{stock.ceo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[#787b86]" />
                <span className="text-[#787b86]">HQ:</span>
                <span className="font-semibold text-white light:text-[#131722]">{stock.headquarters}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#787b86]" />
                <span className="text-[#787b86]">Employees:</span>
                <span className="font-semibold text-white light:text-[#131722]">{stock.employees.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 4 Columns: Paper Trading Order Simulator & Analyst Ratings */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Paper Trading Ticket (Interactive Order Simulator) */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60 mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#2962ff]" />
                  <span className="text-sm font-bold text-white light:text-[#131722]">
                    Trade Simulator
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#787b86]">
                  Buying Power: <strong className="text-white light:text-[#131722]">${paperCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>

              {/* Buy / Sell Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#131722] light:bg-[#f0f3fa] rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setOrderType('buy')}
                  className={`py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    orderType === 'buy'
                      ? 'bg-[#089981] text-white shadow-xs'
                      : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
                  }`}
                >
                  Buy {stock.symbol}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('sell')}
                  className={`py-2 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    orderType === 'sell'
                      ? 'bg-[#f23645] text-white shadow-xs'
                      : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
                  }`}
                >
                  Sell {stock.symbol}
                </button>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-3.5">
                {/* Order Type */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#787b86]">Order Type</span>
                  <span className="font-semibold text-white light:text-[#131722]">Market Order</span>
                </div>

                {/* Shares Input */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#787b86]">Shares to Transact</span>
                    {position && (
                      <span className="text-[11px] text-[#787b86]">
                        Owned: <strong className="text-white light:text-[#131722]">{position.shares} shares</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={sharesInput}
                      onChange={(e) => setSharesInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 bg-[#131722] light:bg-[#f8f9fd] border border-[#2a2e39] light:border-[#e0e3eb] rounded-md font-mono text-sm text-white light:text-[#131722] outline-none focus:border-[#2962ff]"
                    />
                    <button
                      type="button"
                      onClick={() => setSharesInput(10)}
                      className="px-2.5 py-2 text-xs font-mono rounded bg-[#131722] light:bg-[#f0f3fa] text-[#787b86] hover:text-white border border-[#2a2e39] light:border-[#e0e3eb]"
                    >
                      10
                    </button>
                    <button
                      type="button"
                      onClick={() => setSharesInput(50)}
                      className="px-2.5 py-2 text-xs font-mono rounded bg-[#131722] light:bg-[#f0f3fa] text-[#787b86] hover:text-white border border-[#2a2e39] light:border-[#e0e3eb]"
                    >
                      50
                    </button>
                  </div>
                </div>

                {/* Estimated Total */}
                <div className="p-3 rounded-md bg-[#131722] light:bg-[#f8f9fd] border border-[#2a2e39]/60 light:border-[#e0e3eb]/60 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#787b86]">
                    <span>Execution Price</span>
                    <span className="text-white light:text-[#131722]">${stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-[#2a2e39]/40 light:border-[#e0e3eb]/40">
                    <span className="text-white light:text-[#131722]">Estimated Total</span>
                    <span className="text-[#2962ff]">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={orderType === 'buy' ? !canBuy : !canSell}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-md transition-all cursor-pointer ${
                    orderType === 'buy'
                      ? canBuy
                        ? 'bg-[#089981] hover:bg-[#0aa88f]'
                        : 'bg-slate-700 opacity-50 cursor-not-allowed'
                      : canSell
                      ? 'bg-[#f23645] hover:bg-[#ff4453]'
                      : 'bg-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {orderType === 'buy' ? `Buy ${sharesInput} Shares` : `Sell ${sharesInput} Shares`}
                </button>
              </form>

              {/* Notification Banner */}
              {orderNotification && (
                <div
                  className={`mt-3 p-2.5 rounded text-xs flex items-center gap-2 ${
                    orderNotification.isError
                      ? 'bg-[#f23645]/15 text-[#f23645] border border-[#f23645]/30'
                      : 'bg-[#089981]/15 text-[#089981] border border-[#089981]/30'
                  }`}
                >
                  {orderNotification.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{orderNotification.message}</span>
                </div>
              )}
            </div>

            {/* Current Stock Holding Summary */}
            {position && (
              <div className="mt-4 pt-4 border-t border-[#2a2e39]/60 light:border-[#e0e3eb]/60 text-xs font-mono">
                <span className="text-[10px] text-[#787b86] uppercase tracking-wider block mb-1">
                  Your Current Position
                </span>
                <div className="flex justify-between mb-1">
                  <span className="text-[#787b86]">Shares:</span>
                  <span className="text-white light:text-[#131722] font-bold">{position.shares}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#787b86]">Avg Cost:</span>
                  <span className="text-white light:text-[#131722]">${position.avgPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787b86]">Unrealized P&L:</span>
                  {(() => {
                    const pl = (stock.price - position.avgPrice) * position.shares;
                    const plPct = ((stock.price - position.avgPrice) / position.avgPrice) * 100;
                    const isPlPos = pl >= 0;
                    return (
                      <span className={`font-bold ${isPlPos ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {isPlPos ? '+' : ''}${pl.toFixed(2)} ({isPlPos ? '+' : ''}{plPct.toFixed(1)}%)
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Wall Street Consensus & Target Price Meter */}
          <div className="p-4 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]/60 light:border-[#e0e3eb]/60 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787b86]">
                Analyst Consensus & Target
              </span>
              <span className="text-xs font-bold text-[#089981] px-2 py-0.5 rounded bg-[#089981]/15">
                {stock.rating}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#787b86]">Consensus Target:</span>
                <span className="font-mono font-bold text-white light:text-[#131722] text-sm tabular-nums">
                  ${stock.targetPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#787b86]">Implied Upside:</span>
                <span className={`font-mono font-bold tabular-nums ${upsidePct >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                  {upsidePct >= 0 ? '+' : ''}{upsidePct.toFixed(1)}%
                </span>
              </div>

              {/* Progress target bar */}
              <div className="pt-1">
                <div className="relative w-full h-2 bg-[#131722] light:bg-[#e0e3eb] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-[#089981] rounded-full"
                    style={{ width: `${Math.min(100, Math.max(10, (stock.price / stock.targetPrice) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#787b86] font-mono mt-1">
                  <span>Current: ${stock.price.toFixed(0)}</span>
                  <span>Target: ${stock.targetPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
