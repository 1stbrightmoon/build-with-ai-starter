import React, { useState, useMemo } from 'react';
import { Stock, SectorMetric } from '../types/market';
import { Grid, Eye, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface HeatmapViewProps {
  stocks: Stock[];
  sectors: SectorMetric[];
  onSelectStock: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  stocks,
  sectors,
  onSelectStock,
  onOpenChart,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D');
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('All');

  // Multiplier for pseudo-timeframe performance calculation
  const timeframeFactor = useMemo(() => {
    switch (timeframe) {
      case '1W': return 2.2;
      case '1M': return 4.1;
      case 'YTD': return 7.5;
      default: return 1.0;
    }
  }, [timeframe]);

  // Color generator based on percentage
  const getTileColor = (pct: number) => {
    if (pct >= 4.0) return 'bg-[#089981] hover:bg-[#0aa88f] text-white';
    if (pct >= 2.0) return 'bg-[#0e7e6c] hover:bg-[#118f7a] text-white';
    if (pct > 0.0) return 'bg-[#155e52] hover:bg-[#1a6e60] text-emerald-100';
    if (pct === 0.0) return 'bg-[#363a45] text-slate-300';
    if (pct >= -2.0) return 'bg-[#85232d] hover:bg-[#992834] text-red-100';
    if (pct >= -4.0) return 'bg-[#b82937] hover:bg-[#cc2d3d] text-white';
    return 'bg-[#f23645] hover:bg-[#ff4453] text-white';
  };

  // Group stocks by sector
  const sectorGroups = useMemo(() => {
    const map: Record<string, Stock[]> = {};
    stocks.forEach((s) => {
      if (selectedSector !== 'All' && s.sector !== selectedSector) return;
      if (!map[s.sector]) map[s.sector] = [];
      map[s.sector].push(s);
    });

    // Sort stocks inside each sector by market cap desc
    Object.keys(map).forEach((sec) => {
      map[sec].sort((a, b) => b.marketCap - a.marketCap);
    });

    return map;
  }, [stocks, selectedSector]);

  return (
    <div className="space-y-4">
      
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-[#131722] tracking-tight">
            Stock Market Heatmap
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5">
            Treemap sized by market capitalization and colored by performance
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          
          {/* Sector selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#1e222d] light:bg-[#f0f3fa] text-[#d1d4dc] light:text-[#131722] border border-[#2a2e39] light:border-[#e0e3eb] rounded-md outline-none cursor-pointer"
          >
            <option value="All">All Sectors</option>
            {sectors.map((sec) => (
              <option key={sec.name} value={sec.name}>
                {sec.name}
              </option>
            ))}
          </select>

          {/* Timeframe tabs */}
          <div className="flex items-center gap-1 bg-[#1e222d] light:bg-[#f0f3fa] p-1 rounded-md border border-[#2a2e39] light:border-[#e0e3eb]">
            {(['1D', '1W', '1M', 'YTD'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-[#787b86] hover:text-[#d1d4dc] light:hover:text-[#131722]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd] text-xs">
        <span className="text-[#787b86] font-medium">Performance Scale ({timeframe}):</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-[#f23645] mr-1">-4%</span>
          <div className="w-6 h-3 rounded-xs bg-[#f23645]" />
          <div className="w-6 h-3 rounded-xs bg-[#b82937]" />
          <div className="w-6 h-3 rounded-xs bg-[#85232d]" />
          <div className="w-6 h-3 rounded-xs bg-[#363a45]" />
          <div className="w-6 h-3 rounded-xs bg-[#155e52]" />
          <div className="w-6 h-3 rounded-xs bg-[#0e7e6c]" />
          <div className="w-6 h-3 rounded-xs bg-[#089981]" />
          <span className="text-[10px] font-mono text-[#089981] ml-1">+4%</span>
        </div>
      </div>

      {/* Main Treemap Grid Container */}
      <div className="border border-[#2a2e39] light:border-[#e0e3eb] bg-[#131722] light:bg-slate-100 rounded-lg p-3 space-y-4 min-h-[500px]">
        {Object.entries(sectorGroups).map(([sectorName, secStocks]) => {
          if (secStocks.length === 0) return null;
          const sectorSumCap = secStocks.reduce((acc, s) => acc + s.marketCap, 0);

          return (
            <div
              key={sectorName}
              className="p-3 rounded-lg border border-[#2a2e39]/80 light:border-[#e0e3eb] bg-[#1e222d]/60 light:bg-white"
            >
              {/* Sector Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2a2e39]/50 light:border-[#e0e3eb]/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white light:text-[#131722]">
                    {sectorName}
                  </span>
                  <span className="text-[11px] text-[#787b86] font-mono">
                    (${sectorSumCap.toFixed(1)}B Mkt Cap)
                  </span>
                </div>
                <span className="text-[11px] text-[#787b86]">
                  {secStocks.length} components
                </span>
              </div>

              {/* Dynamic Tile Flex / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 auto-rows-[80px]">
                {secStocks.map((stock) => {
                  const effectiveChange = Number((stock.changePercent * (timeframe === '1D' ? 1 : timeframeFactor * 0.7)).toFixed(2));
                  const isMega = stock.marketCap > 1000;
                  const isLarge = stock.marketCap > 300;

                  // Dynamic sizing classes based on Market Cap
                  const colSpan = isMega
                    ? 'col-span-2 row-span-2 sm:col-span-2 sm:row-span-2'
                    : isLarge
                    ? 'col-span-1 row-span-2 sm:col-span-2 sm:row-span-1'
                    : 'col-span-1 row-span-1';

                  const colorClass = getTileColor(effectiveChange);

                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => onOpenChart(stock.symbol)}
                      onMouseEnter={() => setHoveredStock(stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`${colSpan} ${colorClass} rounded-md p-2 flex flex-col justify-between transition-all duration-150 text-left shadow-xs hover:ring-2 hover:ring-white/80 cursor-pointer overflow-hidden relative group`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-mono font-extrabold ${isMega ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'} tracking-tight`}>
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] opacity-80 font-mono">
                          ${stock.marketCap > 1000 ? `${(stock.marketCap / 1000).toFixed(1)}T` : `${stock.marketCap.toFixed(0)}B`}
                        </span>
                      </div>

                      <div className="w-full">
                        <div className={`font-mono font-bold tabular-nums ${isMega ? 'text-sm sm:text-base' : 'text-xs'}`}>
                          {effectiveChange >= 0 ? '+' : ''}{effectiveChange.toFixed(2)}%
                        </div>
                        <div className="text-[10px] opacity-75 font-mono truncate">
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Inspector Card for Hovered Stock */}
      {hoveredStock && (
        <div className="fixed bottom-4 left-6 z-30 p-3.5 rounded-lg border border-[#2a2e39] bg-[#1e222d] shadow-2xl text-xs flex items-center gap-4 animate-in fade-in duration-150">
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-bold text-xs text-white"
            style={{ backgroundColor: hoveredStock.color }}
          >
            {hoveredStock.logoText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">{hoveredStock.symbol}</span>
              <span className="text-[#787b86] truncate max-w-xs">{hoveredStock.name}</span>
            </div>
            <div className="flex items-center gap-3 font-mono mt-0.5 text-[11px]">
              <span className="text-white">${hoveredStock.price.toFixed(2)}</span>
              <span className={hoveredStock.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
                {hoveredStock.changePercent >= 0 ? '+' : ''}{hoveredStock.changePercent.toFixed(2)}%
              </span>
              <span className="text-[#787b86]">Mkt Cap: ${hoveredStock.marketCap.toFixed(1)}B</span>
              <span className="text-[#787b86]">Vol: {(hoveredStock.volume / 1000000).toFixed(1)}M</span>
            </div>
          </div>
          <button
            onClick={() => onOpenChart(hoveredStock.symbol)}
            className="px-3 py-1.5 rounded bg-[#2962ff] text-white font-semibold text-xs hover:bg-[#1e54e4] flex items-center gap-1 cursor-pointer"
          >
            Chart <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

    </div>
  );
};
