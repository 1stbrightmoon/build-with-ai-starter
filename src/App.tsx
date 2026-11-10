import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TickerRibbon } from './components/TickerRibbon';
import { SearchModal } from './components/SearchModal';
import { OverviewView } from './components/OverviewView';
import { ScreenerView } from './components/ScreenerView';
import { HeatmapView } from './components/HeatmapView';
import { GainersLosersView } from './components/GainersLosersView';
import { EarningsCalendarView } from './components/EarningsCalendarView';
import { TradingTerminalView } from './components/TradingTerminalView';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import {
  MARKET_INDICES,
  STOCKS_DATA,
  SECTOR_METRICS,
  EARNINGS_CALENDAR,
  MARKET_NEWS,
} from './data/mockMarketData';
import { Stock, MarketIndex, PriceAlert, PaperPosition } from './types/market';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(true);

  // Tab state: 'overview' | 'screener' | 'heatmap' | 'gainers' | 'earnings' | 'terminal'
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // Currently selected stock for terminal or inspection
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');

  // Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Watchlist Sidebar drawer
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);

  // Live stocks state (updated with gentle live market ticks)
  const [stocks, setStocks] = useState<Stock[]>(STOCKS_DATA);
  const [indices, setIndices] = useState<MarketIndex[]>(MARKET_INDICES);

  // User Watchlist (Symbols)
  const [watchlist, setWatchlist] = useState<string[]>(['NVDA', 'AAPL', 'MSFT', 'TSLA', 'PLTR']);

  // Price Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'al-1',
      symbol: 'NVDA',
      targetPrice: 155.0,
      condition: 'above',
      createdAt: Date.now() - 3600000,
      triggered: false,
    },
    {
      id: 'al-2',
      symbol: 'TSLA',
      targetPrice: 330.0,
      condition: 'below',
      createdAt: Date.now() - 7200000,
      triggered: false,
    },
  ]);

  // Paper Trading Account
  const [paperCash, setPaperCash] = useState<number>(100000);
  const [paperPositions, setPaperPositions] = useState<Record<string, PaperPosition>>({
    NVDA: { symbol: 'NVDA', shares: 50, avgPrice: 138.5, currentPrice: 148.88 },
    AAPL: { symbol: 'AAPL', shares: 40, avgPrice: 228.0, currentPrice: 236.42 },
  });

  // Apply Dark/Light Mode Class on Document Element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDark]);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gentle Live Price Simulation (every 4 seconds, jitter prices subtly)
  useEffect(() => {
    const timer = setInterval(() => {
      setStocks((prev) => {
        const randomIdx = Math.floor(Math.random() * prev.length);
        const target = prev[randomIdx];
        const delta = (Math.random() - 0.49) * (target.price * 0.003);
        const newPrice = Number(Math.max(1, target.price + delta).toFixed(2));
        const newChange = Number((target.change + delta).toFixed(2));
        const newPct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));

        const updated = [...prev];
        updated[randomIdx] = {
          ...target,
          price: newPrice,
          change: newChange,
          changePercent: newPct,
        };
        return updated;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  // Watchlist Toggle
  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist((prev) => [...prev, symbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  // Select Stock (jump to terminal or open)
  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentTab('terminal');
  };

  // Open full chart
  const handleOpenChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCurrentTab('terminal');
  };

  // Create Price Alert
  const handleCreateAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol,
      targetPrice,
      condition,
      createdAt: Date.now(),
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Execute Paper Trading Order
  const handleExecuteOrder = (
    symbol: string,
    type: 'buy' | 'sell',
    shares: number,
    price: number
  ): { success: boolean; message: string } => {
    const cost = shares * price;

    if (type === 'buy') {
      if (paperCash < cost) {
        return { success: false, message: `Insufficient cash! Need $${cost.toFixed(2)}, available $${paperCash.toFixed(2)}.` };
      }
      setPaperCash((prev) => prev - cost);
      setPaperPositions((prev) => {
        const existing = prev[symbol];
        if (existing) {
          const newShares = existing.shares + shares;
          const newAvg = (existing.shares * existing.avgPrice + cost) / newShares;
          return {
            ...prev,
            [symbol]: { symbol, shares: newShares, avgPrice: newAvg, currentPrice: price },
          };
        }
        return {
          ...prev,
          [symbol]: { symbol, shares, avgPrice: price, currentPrice: price },
        };
      });
      return { success: true, message: `Bought ${shares} shares of ${symbol} @ $${price.toFixed(2)} ($${cost.toFixed(2)})` };
    } else {
      const existing = paperPositions[symbol];
      if (!existing || existing.shares < shares) {
        return { success: false, message: `Not enough shares to sell! You own ${existing ? existing.shares : 0} shares.` };
      }
      setPaperCash((prev) => prev + cost);
      setPaperPositions((prev) => {
        const remainingShares = existing.shares - shares;
        if (remainingShares === 0) {
          const updated = { ...prev };
          delete updated[symbol];
          return updated;
        }
        return {
          ...prev,
          [symbol]: { ...existing, shares: remainingShares },
        };
      });
      return { success: true, message: `Sold ${shares} shares of ${symbol} @ $${price.toFixed(2)} ($${cost.toFixed(2)})` };
    }
  };

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  return (
    <div className="min-h-screen bg-[#131722] light:bg-[#f8f9fd] text-[#d1d4dc] light:text-[#131722] flex flex-col font-sans transition-colors">
      
      {/* TradingView Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        watchlistCount={watchlist.length}
        alertsCount={alerts.length}
      />

      {/* Major Benchmark Indices Ticker Tape */}
      <TickerRibbon
        indices={indices}
        onSelectIndex={(sym) => {
          const matchingStock = stocks.find((s) => s.symbol === sym);
          if (matchingStock) {
            handleSelectStock(sym);
          } else {
            // If it's an index like SPX or NDX, jump to overview or terminal
            setCurrentTab('overview');
          }
        }}
        selectedSymbol={selectedSymbol}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-16">
        {currentTab === 'overview' && (
          <OverviewView
            stocks={stocks}
            indices={indices}
            sectors={SECTOR_METRICS}
            news={MARKET_NEWS}
            onSelectStock={handleSelectStock}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'screener' && (
          <ScreenerView
            stocks={stocks}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectStock={handleSelectStock}
            onOpenChart={handleOpenChart}
          />
        )}

        {currentTab === 'heatmap' && (
          <HeatmapView
            stocks={stocks}
            sectors={SECTOR_METRICS}
            onSelectStock={handleSelectStock}
            onOpenChart={handleOpenChart}
          />
        )}

        {currentTab === 'gainers' && (
          <GainersLosersView
            stocks={stocks}
            onSelectStock={handleSelectStock}
            onOpenChart={handleOpenChart}
          />
        )}

        {currentTab === 'earnings' && (
          <EarningsCalendarView
            events={EARNINGS_CALENDAR}
            onSelectStock={handleSelectStock}
            onOpenChart={handleOpenChart}
          />
        )}

        {currentTab === 'terminal' && (
          <TradingTerminalView
            stock={currentStock}
            stocks={stocks}
            onSelectStock={(sym) => setSelectedSymbol(sym)}
            isWatchlisted={watchlist.includes(currentStock.symbol)}
            onToggleWatchlist={handleToggleWatchlist}
            paperPositions={paperPositions}
            paperCash={paperCash}
            onExecuteOrder={handleExecuteOrder}
          />
        )}
      </main>

      {/* Footer (Quiet TradingView copyright and market disclaimer) */}
      <footer className="border-t border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-white py-6 px-4 sm:px-6 text-xs text-[#787b86]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#d1d4dc] light:text-[#131722]">TradingView Markets</span>
            <span>·</span>
            <span>Market quotes and simulated financial analytics</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Data updated real-time</span>
            <span>·</span>
            <span>NYSE & NASDAQ direct feeds</span>
            <span>·</span>
            <span>© 2026 TradingView Inc.</span>
          </div>
        </div>
      </footer>

      {/* Global ⌘K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stocks={stocks}
        indices={indices}
        onSelectStock={handleSelectStock}
      />

      {/* Signature Right Dockable Watchlist & Alerts Sidebar */}
      <WatchlistSidebar
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlist}
        stocks={stocks}
        onSelectStock={handleSelectStock}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        onAddToWatchlist={handleAddToWatchlist}
        alerts={alerts}
        onCreateAlert={handleCreateAlert}
        onDeleteAlert={handleDeleteAlert}
        paperPositions={paperPositions}
        paperCash={paperCash}
      />

    </div>
  );
}
