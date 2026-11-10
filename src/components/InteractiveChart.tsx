import React, { useRef, useEffect, useState, useMemo } from 'react';
import { OHLCV, Timeframe, ChartType, TechnicalIndicator } from '../types/market';
import { Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface InteractiveChartProps {
  candles: OHLCV[];
  symbol: string;
  name: string;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  currentPrice: number;
  changePercent: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  symbol,
  name,
  timeframe,
  onTimeframeChange,
  currentPrice,
  changePercent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [chartType, setChartType] = useState<ChartType>('candles');
  const [activeIndicators, setActiveIndicators] = useState<Record<TechnicalIndicator, boolean>>({
    volume: true,
    sma20: true,
    ema50: false,
    bollinger: false,
    rsi: false,
  });

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Timeframes list
  const timeframes: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];

  // Toggle indicator
  const toggleIndicator = (ind: TechnicalIndicator) => {
    setActiveIndicators((prev) => ({ ...prev, [ind]: !prev[ind] }));
  };

  // Compute Technical Indicators
  const indicatorData = useMemo(() => {
    const closes = candles.map((c) => c.close);
    
    // SMA 20
    const sma20: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < 19) {
        sma20.push(null);
      } else {
        const slice = closes.slice(i - 19, i + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / 20;
        sma20.push(avg);
      }
    }

    // EMA 50 (or smaller if candles < 50)
    const emaPeriod = Math.min(30, closes.length - 2);
    const emaMultiplier = 2 / (emaPeriod + 1);
    const ema50: (number | null)[] = [];
    let prevEma: number | null = null;
    for (let i = 0; i < closes.length; i++) {
      if (i < emaPeriod - 1) {
        ema50.push(null);
      } else if (i === emaPeriod - 1) {
        const avg = closes.slice(0, emaPeriod).reduce((a, b) => a + b, 0) / emaPeriod;
        ema50.push(avg);
        prevEma = avg;
      } else {
        const currentEma: number = (closes[i] - (prevEma ?? closes[i])) * emaMultiplier + (prevEma ?? closes[i]);
        ema50.push(currentEma);
        prevEma = currentEma;
      }
    }

    // Bollinger Bands (20 periods, 2 std dev)
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < 19) {
        bbUpper.push(null);
        bbLower.push(null);
      } else {
        const slice = closes.slice(i - 19, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / 20;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
        const stdDev = Math.sqrt(variance);
        bbUpper.push(mean + stdDev * 2);
        bbLower.push(mean - stdDev * 2);
      }
    }

    // RSI (14)
    const rsi: (number | null)[] = [];
    const rsiPeriod = 14;
    for (let i = 0; i < closes.length; i++) {
      if (i < rsiPeriod) {
        rsi.push(null);
      } else {
        let gains = 0;
        let losses = 0;
        for (let j = i - rsiPeriod + 1; j <= i; j++) {
          const diff = closes[j] - closes[j - 1];
          if (diff >= 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const avgGain = gains / rsiPeriod;
        const avgLoss = losses / rsiPeriod;
        if (avgLoss === 0) {
          rsi.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - 100 / (1 + rs));
        }
      }
    }

    return { sma20, ema50, bbUpper, bbLower, rsi };
  }, [candles]);

  // Main Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI retina display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Check if dark theme
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#131722' : '#ffffff';
    const gridColor = isDark ? 'rgba(42, 46, 57, 0.45)' : 'rgba(224, 227, 235, 0.7)';
    const textColor = isDark ? '#787b86' : '#787b86';
    const crosshairColor = isDark ? 'rgba(120, 123, 134, 0.6)' : 'rgba(120, 123, 134, 0.6)';

    const upColor = '#089981';
    const downColor = '#f23645';

    // Clear background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Calculate layout regions
    const rightAxisWidth = 65;
    const bottomTimeHeight = 26;
    const rsiHeight = activeIndicators.rsi ? 75 : 0;
    const mainChartHeight = height - bottomTimeHeight - rsiHeight;
    const plotWidth = width - rightAxisWidth;

    // Find Price Range (Min/Max)
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    // Also include Bollinger Bands in min/max if active
    if (activeIndicators.bollinger) {
      indicatorData.bbUpper.forEach((val) => {
        if (val !== null && val > maxPrice) maxPrice = val;
      });
      indicatorData.bbLower.forEach((val) => {
        if (val !== null && val < minPrice) minPrice = val;
      });
    }

    const pricePadding = (maxPrice - minPrice) * 0.08 || 2;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Coordinate converters
    const getX = (index: number) => {
      const step = plotWidth / (candles.length - 1 || 1);
      return index * step;
    };

    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / priceRange) * (mainChartHeight - 20) - 10;
    };

    // Draw Price Grid lines (horizontal)
    const gridRows = 6;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    for (let r = 0; r <= gridRows; r++) {
      const y = (mainChartHeight / gridRows) * r;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotWidth, y);
      ctx.stroke();

      const priceVal = maxPrice - (r / gridRows) * priceRange;
      ctx.fillText(priceVal.toFixed(2), plotWidth + 6, y);
    }

    // Draw Time Grid lines (vertical)
    const timeCols = Math.min(6, candles.length);
    const colStep = Math.floor(candles.length / timeCols);

    for (let i = 0; i < candles.length; i += colStep) {
      const x = getX(i);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mainChartHeight);
      ctx.stroke();

      ctx.save();
      ctx.setLineDash([]);
      ctx.textAlign = 'center';
      ctx.fillText(candles[i].time, x, mainChartHeight + 14);
      ctx.restore();
    }

    ctx.setLineDash([]); // Reset line dash

    // Draw Volume Bars in bottom 22% of main chart
    if (activeIndicators.volume && maxVolume > 0) {
      const volAreaHeight = mainChartHeight * 0.22;
      const barWidth = Math.max(2, (plotWidth / candles.length) * 0.65);

      candles.forEach((c, idx) => {
        const x = getX(idx);
        const vHeight = (c.volume / maxVolume) * volAreaHeight;
        const y = mainChartHeight - vHeight;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp
          ? isDark ? 'rgba(8, 153, 129, 0.25)' : 'rgba(8, 153, 129, 0.35)'
          : isDark ? 'rgba(242, 54, 69, 0.25)' : 'rgba(242, 54, 69, 0.35)';

        ctx.fillRect(x - barWidth / 2, y, barWidth, vHeight);
      });
    }

    // Draw Bollinger Bands (fill area between upper and lower)
    if (activeIndicators.bollinger) {
      ctx.fillStyle = isDark ? 'rgba(41, 98, 255, 0.08)' : 'rgba(41, 98, 255, 0.06)';
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < candles.length; i++) {
        const u = indicatorData.bbUpper[i];
        if (u !== null) {
          const x = getX(i);
          const y = getY(u);
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = candles.length - 1; i >= 0; i--) {
        const l = indicatorData.bbLower[i];
        if (l !== null) {
          const x = getX(i);
          const y = getY(l);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Upper & Lower band lines
      ctx.strokeStyle = 'rgba(41, 98, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      first = true;
      for (let i = 0; i < candles.length; i++) {
        const u = indicatorData.bbUpper[i];
        if (u !== null) {
          const x = getX(i);
          const y = getY(u);
          if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      first = true;
      for (let i = 0; i < candles.length; i++) {
        const l = indicatorData.bbLower[i];
        if (l !== null) {
          const x = getX(i);
          const y = getY(l);
          if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw Moving Averages (SMA 20)
    if (activeIndicators.sma20) {
      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      indicatorData.sma20.forEach((val, i) => {
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw EMA 50
    if (activeIndicators.ema50) {
      ctx.strokeStyle = '#f59e0b'; // Amber
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      indicatorData.ema50.forEach((val, i) => {
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw Price Data: Candlesticks OR Area / Line
    if (chartType === 'candles') {
      const candleWidth = Math.max(3, (plotWidth / candles.length) * 0.7);

      candles.forEach((c, idx) => {
        const x = getX(idx);
        const yOpen = getY(c.open);
        const yClose = getY(c.close);
        const yHigh = getY(c.high);
        const yLow = getY(c.low);
        const isUp = c.close >= c.open;
        const color = isUp ? upColor : downColor;

        // Wick line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Candle body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(1.5, Math.abs(yClose - yOpen));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else if (chartType === 'area') {
      // Area Chart with smooth gradient
      const isOverallUp = candles[candles.length - 1]?.close >= candles[0]?.close;
      const themeColor = isOverallUp ? '#089981' : '#f23645';

      const gradient = ctx.createLinearGradient(0, 0, 0, mainChartHeight);
      gradient.addColorStop(0, isOverallUp ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)');
      gradient.addColorStop(1, isOverallUp ? 'rgba(8, 153, 129, 0.0)' : 'rgba(242, 54, 69, 0.0)');

      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Fill area down to mainChartHeight
      ctx.lineTo(plotWidth, mainChartHeight);
      ctx.lineTo(0, mainChartHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Top line
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (chartType === 'line') {
      const isOverallUp = candles[candles.length - 1]?.close >= candles[0]?.close;
      ctx.strokeStyle = isOverallUp ? upColor : downColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw Current Price Line indicator
    const currentPriceY = getY(currentPrice);
    const isUp = changePercent >= 0;
    const currentPriceColor = isUp ? upColor : downColor;

    ctx.strokeStyle = currentPriceColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(plotWidth, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Badge on right price axis
    ctx.fillStyle = currentPriceColor;
    ctx.fillRect(plotWidth, currentPriceY - 10, rightAxisWidth, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentPrice.toFixed(2), plotWidth + rightAxisWidth / 2, currentPriceY);

    // Draw RSI Sub-Panel if enabled
    if (activeIndicators.rsi) {
      const rsiTop = mainChartHeight + bottomTimeHeight;
      const rsiPlotHeight = rsiHeight - 16;

      // Divider line
      ctx.strokeStyle = isDark ? '#2a2e39' : '#e0e3eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rsiTop);
      ctx.lineTo(width, rsiTop);
      ctx.stroke();

      // RSI Label
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.textAlign = 'left';
      ctx.fillText('RSI (14)', 8, rsiTop + 14);

      // Oversold / Overbought lines (30 / 70)
      const getYRsi = (val: number) => {
        return rsiTop + rsiPlotHeight - (val / 100) * rsiPlotHeight + 8;
      };

      ctx.strokeStyle = isDark ? 'rgba(120, 123, 134, 0.3)' : 'rgba(120, 123, 134, 0.3)';
      ctx.setLineDash([2, 2]);

      // 70 line
      ctx.beginPath();
      ctx.moveTo(0, getYRsi(70));
      ctx.lineTo(plotWidth, getYRsi(70));
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText('70', plotWidth + 6, getYRsi(70));

      // 30 line
      ctx.beginPath();
      ctx.moveTo(0, getYRsi(30));
      ctx.lineTo(plotWidth, getYRsi(30));
      ctx.stroke();
      ctx.fillText('30', plotWidth + 6, getYRsi(30));
      ctx.setLineDash([]);

      // RSI plot
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      indicatorData.rsi.forEach((val, i) => {
        if (val !== null) {
          const x = getX(i);
          const y = getYRsi(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw Crosshair & Hover Tooltip
    if (mousePos && hoverIndex !== null && hoverIndex >= 0 && hoverIndex < candles.length) {
      const activeCandle = candles[hoverIndex];
      const candleX = getX(hoverIndex);
      const crosshairY = Math.min(mainChartHeight, Math.max(0, mousePos.y));

      // Crosshair lines
      ctx.strokeStyle = crosshairColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(candleX, 0);
      ctx.lineTo(candleX, mainChartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crosshairY);
      ctx.lineTo(plotWidth, crosshairY);
      ctx.stroke();

      ctx.setLineDash([]);

      // Right Axis Crosshair Price Badge
      const hoveredPrice = maxPrice - (crosshairY / mainChartHeight) * priceRange;
      ctx.fillStyle = isDark ? '#2a2e39' : '#363a45';
      ctx.fillRect(plotWidth, crosshairY - 10, rightAxisWidth, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hoveredPrice.toFixed(2), plotWidth + rightAxisWidth / 2, crosshairY);

      // Bottom Axis Crosshair Date Badge
      ctx.fillRect(candleX - 35, mainChartHeight + 2, 70, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(activeCandle.time, candleX, mainChartHeight + 12);
    }

  }, [candles, chartType, activeIndicators, mousePos, hoverIndex, currentPrice, changePercent]);

  // Handle Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const plotWidth = rect.width - 65;
    if (x >= 0 && x <= plotWidth) {
      const index = Math.round((x / plotWidth) * (candles.length - 1));
      const clampedIndex = Math.max(0, Math.min(candles.length - 1, index));
      setHoverIndex(clampedIndex);
      setMousePos({ x, y });
    } else {
      setHoverIndex(null);
      setMousePos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full bg-[#131722] light:bg-white rounded-lg border border-[#2a2e39] light:border-[#e0e3eb] overflow-hidden">
      
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#2a2e39] light:border-[#e0e3eb] bg-[#171b26] light:bg-[#f8f9fd]">
        
        {/* Left: Symbol & Timeframe Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white light:text-[#131722] tracking-tight">
              {symbol}
            </span>
            <span className="text-xs text-[#787b86] hidden sm:inline">
              · {name}
            </span>
          </div>

          <div className="h-4 w-px bg-[#2a2e39] light:bg-[#e0e3eb]" />

          {/* Timeframes */}
          <div className="flex items-center gap-1 bg-[#131722] light:bg-white p-0.5 rounded-md border border-[#2a2e39] light:border-[#e0e3eb]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
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

        {/* Right: Chart Type & Indicators */}
        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 bg-[#131722] light:bg-white p-0.5 rounded-md border border-[#2a2e39] light:border-[#e0e3eb] text-xs">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                chartType === 'candles' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                chartType === 'area' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                chartType === 'line' ? 'bg-[#2962ff] text-white' : 'text-[#787b86]'
              }`}
            >
              Line
            </button>
          </div>

          <div className="h-4 w-px bg-[#2a2e39] light:bg-[#e0e3eb]" />

          {/* Indicators dropdown/buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleIndicator('sma20')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                activeIndicators.sma20
                  ? 'border-[#2962ff] bg-[#2962ff]/15 text-[#2962ff]'
                  : 'border-[#2a2e39] light:border-[#e0e3eb] text-[#787b86]'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => toggleIndicator('bollinger')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                activeIndicators.bollinger
                  ? 'border-[#2962ff] bg-[#2962ff]/15 text-[#2962ff]'
                  : 'border-[#2a2e39] light:border-[#e0e3eb] text-[#787b86]'
              }`}
            >
              BB
            </button>
            <button
              onClick={() => toggleIndicator('rsi')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                activeIndicators.rsi
                  ? 'border-purple-500 bg-purple-500/15 text-purple-400'
                  : 'border-[#2a2e39] light:border-[#e0e3eb] text-[#787b86]'
              }`}
            >
              RSI
            </button>
          </div>
        </div>

      </div>

      {/* Floating Active Candlestick Stats Bar (TradingView signature) */}
      {activeCandle && (
        <div className="flex items-center gap-4 px-3 py-1.5 text-xs font-mono border-b border-[#2a2e39]/50 light:border-[#e0e3eb]/50 bg-[#131722]/80 light:bg-white/80 backdrop-blur-xs text-[#787b86]">
          <span className="text-[#d1d4dc] light:text-[#131722] font-semibold">
            {activeCandle.time}
          </span>
          <div className="flex items-center gap-3 tabular-nums">
            <span>O <strong className="text-white light:text-slate-900">{activeCandle.open.toFixed(2)}</strong></span>
            <span>H <strong className="text-[#089981]">{activeCandle.high.toFixed(2)}</strong></span>
            <span>L <strong className="text-[#f23645]">{activeCandle.low.toFixed(2)}</strong></span>
            <span>C <strong className={activeCandle.close >= activeCandle.open ? 'text-[#089981]' : 'text-[#f23645]'}>{activeCandle.close.toFixed(2)}</strong></span>
            <span>Vol <strong className="text-[#d1d4dc] light:text-slate-900">{(activeCandle.volume / 1000000).toFixed(2)}M</strong></span>
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 w-full min-h-[380px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

    </div>
  );
};
