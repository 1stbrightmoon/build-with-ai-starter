import React from 'react';
import { Search, Sun, Moon, Bookmark, BarChart2, Bell } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  alertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  isDark,
  onToggleTheme,
  onOpenSearch,
  onToggleWatchlist,
  watchlistCount,
  alertsCount,
}) => {
  const navTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'screener', label: 'Screener' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'gainers', label: 'Gainers & Losers' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'terminal', label: 'Chart Terminal' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2a2e39] bg-[#131722]/95 backdrop-blur-md dark:border-[#2a2e39] dark:bg-[#131722]/95 light:border-[#e0e3eb] light:bg-white/95 transition-colors">
      <div className="flex h-14 items-center justify-between gap-8 px-4 sm:px-6">
        
        {/* Zone 1: Single text wordmark with TradingView TV Monogram */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('overview');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            {/* TradingView Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center shadow-sm group-hover:bg-[#1e54e4] transition-colors">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="10" width="6" height="13" rx="1.5" fill="white" />
                <rect x="11" y="5" width="6" height="18" rx="1.5" fill="white" />
                <rect x="19" y="13" width="6" height="10" rx="1.5" fill="white" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white light:text-[#131722] whitespace-nowrap">
                TradingView
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#787b86] -mt-1">
                Markets · Stocks
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#2962ff]/15 text-[#2962ff] dark:text-[#2962ff]'
                    : 'text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722] hover:bg-[#1e222d] light:hover:bg-[#f0f3fa]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search, Utilities & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-[#f0f3fa] text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722] hover:border-[#363a45] transition-all cursor-pointer"
            title="Search symbols (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search markets...</span>
            <kbd className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#131722] light:bg-white text-[#787b86] border border-[#2a2e39] light:border-[#e0e3eb]">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722] hover:bg-[#1e222d] light:hover:bg-[#f0f3fa] transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Watchlist Toggle */}
          <button
            onClick={onToggleWatchlist}
            className="relative p-2 rounded-lg text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722] hover:bg-[#1e222d] light:hover:bg-[#f0f3fa] transition-colors cursor-pointer"
            title="Toggle Watchlist & Alerts"
            aria-label="Toggle Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2962ff]" />
            )}
          </button>

          {/* Primary Action Button: Launch Terminal */}
          <button
            onClick={() => onTabChange('terminal')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2962ff] hover:bg-[#1e54e4] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Launch Chart</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Strip */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 gap-1 border-t border-[#2a2e39] light:border-[#e0e3eb] bg-[#131722] light:bg-white">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentTab === tab.id
                ? 'bg-[#2962ff]/15 text-[#2962ff]'
                : 'text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
