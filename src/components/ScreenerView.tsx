import React, { useState, useMemo } from 'react';
import { Stock, TechnicalRating } from '../types/market';
import { Search, Star, ArrowUpDown, ChevronDown, Filter, ExternalLink, BarChart2 } from 'lucide-react';

interface ScreenerViewProps {
  stocks: Stock[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type SortOrder = 'asc' | 'desc';

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
  onOpenChart,
}) => {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [presetFilter, setPresetFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sectors = ['All', ...Array.from(new Set(stocks.map((s) => s.sector)))];

  const presets = [
    { id: 'all', label: 'All Equities' },
    { id: 'large-cap', label: 'Mega & Large Cap' },
    { id: 'gainers', label: 'Top Gainers (>+2%)' },
    { id: 'tech', label: 'Tech & AI Leaders' },
    { id: 'undervalued', label: 'Value (P/E < 30)' },
    { id: 'dividend', label: 'Dividend Payers' },
  ];

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered & Sorted Stocks
  const filteredStocks = useMemo(() => {
    return stocks
      .filter((s) => {
        // Search text
        const matchesSearch =
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;

        // Sector filter
        if (sectorFilter !== 'All' && s.sector !== sectorFilter) return false;

        // Preset filters
        if (presetFilter === 'large-cap' && s.marketCap < 200) return false;
        if (presetFilter === 'gainers' && s.changePercent < 2) return false;
        if (presetFilter === 'tech' && s.sector !== 'Technology') return false;
        if (presetFilter === 'undervalued' && (s.peRatio === null || s.peRatio > 30)) return false;
        if (presetFilter === 'dividend' && s.dividendYield <= 0.2) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === null) valA = -999999;
        if (valB === null) valB = -999999;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [stocks, search, sectorFilter, presetFilter, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-[#131722] tracking-tight">
            Stock Screener
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5">
            Filter, rank, and analyze {stocks.length} equities across valuation, performance, and volume
          </p>
        </div>

        {/* Preset filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setPresetFilter(preset.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                presetFilter === preset.id
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#1e222d] light:bg-[#f0f3fa] text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787b86]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symbol or company name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#131722] light:bg-[#f8f9fd] text-[#d1d4dc] light:text-[#131722] placeholder-[#787b86] border border-[#2a2e39] light:border-[#e0e3eb] rounded-md outline-none focus:border-[#2962ff]"
          />
        </div>

        {/* Sector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#787b86] shrink-0">Sector:</span>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-[#131722] light:bg-[#f8f9fd] text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded-md outline-none cursor-pointer"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#787b86] font-mono shrink-0 pl-1">
          Showing <strong className="text-white light:text-[#131722]">{filteredStocks.length}</strong> matches
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd] text-[11px] font-bold text-[#787b86] uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">★</th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>
                  <div className="flex items-center gap-1.5">
                    <span>Symbol & Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-20">Trend</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('changePercent')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Change %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('volume')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('marketCap')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Mkt Cap</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('peRatio')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>P/E (TTM)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center min-w-[130px]">52-Week Range</th>
                <th className="py-3 px-3 text-center">Analyst Rating</th>
                <th className="py-3 px-3 text-center w-16">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50 light:divide-[#e0e3eb]/70 text-xs">
              {filteredStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                const isSaved = watchlist.includes(stock.symbol);

                // Range calculation for 52W bar
                const rangeSpan = stock.high52 - stock.low52 || 1;
                const rangePct = Math.min(100, Math.max(0, ((stock.price - stock.low52) / rangeSpan) * 100));

                // Micro sparkline points
                const min = Math.min(...stock.sparkline);
                const max = Math.max(...stock.sparkline);
                const sRange = max - min || 1;
                const sparkPoints = stock.sparkline
                  .map((val, i) => {
                    const x = (i / (stock.sparkline.length - 1)) * 48;
                    const y = 16 - ((val - min) / sRange) * 12;
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-[#2a2e39]/30 light:hover:bg-[#f0f3fa] transition-colors group cursor-pointer"
                    onClick={() => onSelectStock(stock.symbol)}
                  >
                    {/* Watchlist Star */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock.symbol);
                      }}
                    >
                      <button className="p-1 hover:scale-110 transition-transform">
                        <Star
                          className={`w-4 h-4 ${
                            isSaved
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-[#787b86] hover:text-white'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: stock.color }}
                        >
                          {stock.logoText.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors">
                            {stock.symbol}
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[150px] sm:max-w-xs">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sparkline */}
                    <td className="py-3 px-3 text-center">
                      <div className="w-12 h-5 mx-auto">
                        <svg width="48" height="18">
                          <polyline
                            fill="none"
                            stroke={isPositive ? '#089981' : '#f23645'}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={sparkPoints}
                          />
                        </svg>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white light:text-[#131722] tabular-nums">
                      ${stock.price.toFixed(2)}
                    </td>

                    {/* Change % */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-xs ${
                          isPositive
                            ? 'text-[#089981] bg-[#089981]/10'
                            : 'text-[#f23645] bg-[#f23645]/10'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right font-mono text-[#d1d4dc] light:text-[#131722] tabular-nums">
                      {(stock.volume / 1000000).toFixed(1)}M
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-3 text-right font-mono text-[#d1d4dc] light:text-[#131722] tabular-nums">
                      ${stock.marketCap.toFixed(1)}B
                    </td>

                    {/* P/E Ratio */}
                    <td className="py-3 px-3 text-right font-mono text-[#787b86] tabular-nums">
                      {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    {/* 52-Week Range Bar */}
                    <td className="py-3 px-4">
                      <div className="w-full flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#787b86]">${stock.low52.toFixed(0)}</span>
                        <div className="relative flex-1 h-1.5 bg-[#2a2e39] light:bg-[#e0e3eb] rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 bg-[#2962ff] rounded-full"
                            style={{ width: `${rangePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#787b86]">${stock.high52.toFixed(0)}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          stock.rating === 'Strong Buy'
                            ? 'text-[#089981] bg-[#089981]/15 font-bold'
                            : stock.rating === 'Buy'
                            ? 'text-[#089981]'
                            : stock.rating === 'Sell'
                            ? 'text-[#f23645] bg-[#f23645]/15'
                            : 'text-[#787b86]'
                        }`}
                      >
                        {stock.rating}
                      </span>
                    </td>

                    {/* Chart Launch Button */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChart(stock.symbol);
                      }}
                    >
                      <button
                        className="p-1.5 rounded hover:bg-[#2962ff]/20 text-[#787b86] hover:text-[#2962ff] transition-colors cursor-pointer"
                        title="Open in Terminal Chart"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
