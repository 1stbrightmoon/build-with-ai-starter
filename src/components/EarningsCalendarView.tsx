import React, { useState } from 'react';
import { EarningsEvent } from '../types/market';
import { Calendar, TrendingUp, TrendingDown, Clock, BarChart2 } from 'lucide-react';

interface EarningsCalendarViewProps {
  events: EarningsEvent[];
  onSelectStock: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export const EarningsCalendarView: React.FC<EarningsCalendarViewProps> = ({
  events,
  onSelectStock,
  onOpenChart,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'reported' | 'upcoming'>('all');

  const filteredEvents = events.filter((ev) => {
    if (filterPeriod === 'reported') return ev.actualEPS !== null;
    if (filterPeriod === 'upcoming') return ev.actualEPS === null;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white light:text-[#131722] tracking-tight">
            Earnings Calendar
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5">
            Quarterly earnings releases, consensus Wall Street estimates, and surprises
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-[#1e222d] light:bg-[#f0f3fa] p-1 rounded-md border border-[#2a2e39] light:border-[#e0e3eb]">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filterPeriod === 'all'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            All Reports ({events.length})
          </button>
          <button
            onClick={() => setFilterPeriod('reported')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filterPeriod === 'reported'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            Reported
          </button>
          <button
            onClick={() => setFilterPeriod('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              filterPeriod === 'upcoming'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white light:hover:text-[#131722]'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="border border-[#2a2e39] light:border-[#e0e3eb] bg-[#1e222d] light:bg-white rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd] text-[11px] font-bold text-[#787b86] uppercase tracking-wider">
                <th className="py-3 px-4">Company & Symbol</th>
                <th className="py-3 px-4">Release Date</th>
                <th className="py-3 px-4">Timing</th>
                <th className="py-3 px-4 text-right">EPS Estimate</th>
                <th className="py-3 px-4 text-right">EPS Actual</th>
                <th className="py-3 px-4 text-right">EPS Surprise</th>
                <th className="py-3 px-4 text-right">Revenue Est.</th>
                <th className="py-3 px-4 text-right">Revenue Actual</th>
                <th className="py-3 px-4 text-center">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50 light:divide-[#e0e3eb]/60 text-xs">
              {filteredEvents.map((ev) => {
                const hasBeaten = ev.surprisePercent !== null && ev.surprisePercent > 0;
                const hasMissed = ev.surprisePercent !== null && ev.surprisePercent < 0;

                return (
                  <tr
                    key={ev.symbol}
                    onClick={() => onSelectStock(ev.symbol)}
                    className="hover:bg-[#2a2e39]/30 light:hover:bg-[#f0f3fa] transition-colors group cursor-pointer"
                  >
                    {/* Symbol & Company */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-white light:text-[#131722] group-hover:text-[#2962ff] transition-colors">
                          {ev.symbol}
                        </div>
                        <div className="text-[11px] text-[#787b86]">
                          {ev.company}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-[#d1d4dc] light:text-[#131722]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#787b86]" />
                        <span>{ev.date}</span>
                      </div>
                    </td>

                    {/* Timing */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#131722] light:bg-[#ebedf2] text-[#d1d4dc] light:text-[#131722]">
                        <Clock className="w-3 h-3 text-[#787b86]" />
                        {ev.time === 'AMC' ? 'After Close' : 'Before Open'}
                      </span>
                    </td>

                    {/* EPS Est */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#787b86] tabular-nums">
                      ${ev.estimateEPS.toFixed(2)}
                    </td>

                    {/* EPS Actual */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-white light:text-[#131722] tabular-nums">
                      {ev.actualEPS !== null ? `$${ev.actualEPS.toFixed(2)}` : 'Pending'}
                    </td>

                    {/* Surprise */}
                    <td className="py-3 px-4 text-right">
                      {ev.surprisePercent !== null ? (
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-xs ${
                            hasBeaten
                              ? 'text-[#089981] bg-[#089981]/15'
                              : hasMissed
                              ? 'text-[#f23645] bg-[#f23645]/15'
                              : 'text-[#787b86]'
                          }`}
                        >
                          {ev.surprisePercent >= 0 ? '+' : ''}{ev.surprisePercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[#787b86] font-mono">—</span>
                      )}
                    </td>

                    {/* Revenue Est */}
                    <td className="py-3 px-4 text-right font-mono text-[#787b86] tabular-nums">
                      {ev.estimateRev}
                    </td>

                    {/* Revenue Actual */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-white light:text-[#131722] tabular-nums">
                      {ev.actualRev ?? 'Pending'}
                    </td>

                    {/* Chart */}
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChart(ev.symbol);
                      }}
                    >
                      <button
                        className="p-1.5 rounded hover:bg-[#2962ff]/20 text-[#787b86] hover:text-[#2962ff] transition-colors cursor-pointer"
                        title="View interactive chart"
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
