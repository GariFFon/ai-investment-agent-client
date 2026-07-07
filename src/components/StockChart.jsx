import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getChart } from '../services/api';

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmtPrice = (v, currency = 'USD') => {
  if (v == null || isNaN(v)) return 'N/A';
  const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';
  return `${sym}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtVolume = (v) => {
  if (!v) return '0';
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
};

const fmtDate = (ts, range) => {
  const d = new Date(ts);
  if (range === '1D') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (range === '1W') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  if (range === '5Y') return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtDateFull = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

/* ── Custom Tooltip ─────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, currency, range }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const isUp = d.close >= (d.open ?? d.close);
  return (
    <div style={{
      background: 'rgba(15,23,42,0.92)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
      color: '#e2e8f0',
      minWidth: 160,
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    }}>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, letterSpacing: '0.04em' }}>
        {fmtDateFull(label)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
        <span style={{ color: '#94a3b8' }}>Close</span>
        <span style={{ fontWeight: 800, color: isUp ? '#34d399' : '#f87171', fontSize: 13 }}>
          {fmtPrice(d.close, currency)}
        </span>
      </div>
      {d.open != null && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
            <span style={{ color: '#94a3b8' }}>Open</span>
            <span style={{ fontWeight: 600 }}>{fmtPrice(d.open, currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
            <span style={{ color: '#94a3b8' }}>High</span>
            <span style={{ fontWeight: 600, color: '#34d399' }}>{fmtPrice(d.high, currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
            <span style={{ color: '#94a3b8' }}>Low</span>
            <span style={{ fontWeight: 600, color: '#f87171' }}>{fmtPrice(d.low, currency)}</span>
          </div>
        </>
      )}
      {d.volume > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 6, paddingTop: 6 }}>
          <span style={{ color: '#94a3b8' }}>Volume</span>
          <span style={{ fontWeight: 600, color: '#a5b4fc' }}>{fmtVolume(d.volume)}</span>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton Loader ────────────────────────────────────────────────────── */
function ChartSkeleton() {
  return (
    <div className="sc-skeleton">
      <div className="sc-skeleton-stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="sc-skeleton-stat">
            <div className="sc-shimmer" style={{ width: '60%', height: 10, borderRadius: 5 }} />
            <div className="sc-shimmer" style={{ width: '80%', height: 22, borderRadius: 5, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div className="sc-shimmer" style={{ width: '100%', height: 280, borderRadius: 12, marginTop: 16 }} />
      <div className="sc-shimmer" style={{ width: '100%', height: 80, borderRadius: 12, marginTop: 8 }} />
    </div>
  );
}

/* ── Main StockChart Component ──────────────────────────────────────────── */
export default function StockChart({ ticker, yahooData }) {
  const [range, setRange]     = useState('1Y');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

  const yfc = yahooData?.currentFinancials ?? {};
  const currency = data?.meta?.currency ?? 'USD';

  const load = useCallback(async (r) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const result = await getChart(ticker, r);
      if (!controller.signal.aborted) {
        setData(result);
        setLoading(false);
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e.response?.data?.error || e.message || 'Failed to load price data');
        setLoading(false);
      }
    }
  }, [ticker]);

  useEffect(() => { load(range); }, [range, load]);

  /* ── Derived stats ── */
  const quotes = data?.quotes ?? [];
  const firstClose = quotes[0]?.close;
  const lastClose  = quotes[quotes.length - 1]?.close;
  const pctChange  = firstClose && lastClose
    ? ((lastClose - firstClose) / firstClose) * 100
    : null;
  const isUp = pctChange == null ? true : pctChange >= 0;

  const ACCENT    = isUp ? '#22c55e' : '#ef4444';
  const ACCENT_DIM = isUp ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)';

  // Tick reducer — only show N ticks on X-axis
  const tickCount = 6;
  const step = Math.max(1, Math.floor(quotes.length / tickCount));
  const ticks = quotes.filter((_, i) => i % step === 0).map((q) => q.date);

  /* ── Volume bars with color per candle direction ── */
  const volumeData = quotes.map((q) => ({
    date:   q.date,
    volume: q.volume,
    fill:   (q.close >= (q.open ?? q.close)) ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.55)',
  }));

  return (
    <div className="sc-root">
      {/* ── Header: price + change ── */}
      <div className="sc-header">
        <div className="sc-header-left">
          <div className="sc-current-price">
            {fmtPrice(data?.meta?.currentPrice ?? lastClose, currency)}
          </div>
          {pctChange != null && (
            <div className="sc-change" style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
              {isUp ? '▲' : '▼'} {Math.abs(pctChange).toFixed(2)}%
              <span className="sc-change-label">({range})</span>
            </div>
          )}
        </div>

        {/* ── Range Buttons ── */}
        <div className="sc-ranges">
          {RANGES.map((r) => (
            <button
              key={r}
              className={`sc-range-btn${range === r ? ' active' : ''}`}
              onClick={() => setRange(r)}
              disabled={loading}
              style={range === r ? { '--active-color': ACCENT } : {}}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Strip ── */}
      <div className="sc-stats-strip">
        {data?.meta?.fiftyTwoWeekLow != null && (
          <div className="sc-stat-pill">
            <span className="sc-stat-label">52W Low</span>
            <span className="sc-stat-val" style={{ color: '#ef4444' }}>
              {fmtPrice(data.meta.fiftyTwoWeekLow, currency)}
            </span>
          </div>
        )}
        {data?.meta?.fiftyTwoWeekHigh != null && (
          <div className="sc-stat-pill">
            <span className="sc-stat-label">52W High</span>
            <span className="sc-stat-val" style={{ color: '#22c55e' }}>
              {fmtPrice(data.meta.fiftyTwoWeekHigh, currency)}
            </span>
          </div>
        )}
        {data?.meta?.previousClose != null && (
          <div className="sc-stat-pill">
            <span className="sc-stat-label">Prev Close</span>
            <span className="sc-stat-val">{fmtPrice(data.meta.previousClose, currency)}</span>
          </div>
        )}
        {yfc.targetMeanPrice != null && (
          <div className="sc-stat-pill" style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.05)' }}>
            <span className="sc-stat-label">Mean Target</span>
            <span className="sc-stat-val" style={{ color: '#6366f1' }}>
              {fmtPrice(yfc.targetMeanPrice, currency)}
            </span>
          </div>
        )}
        {yfc.targetHighPrice != null && (
          <div className="sc-stat-pill" style={{ borderColor: 'rgba(5,150,105,0.2)', background: 'rgba(5,150,105,0.05)' }}>
            <span className="sc-stat-label">High Target</span>
            <span className="sc-stat-val" style={{ color: '#059669' }}>
              {fmtPrice(yfc.targetHighPrice, currency)}
            </span>
          </div>
        )}
      </div>

      {/* ── Loading / Error / Chart ── */}
      {loading && <ChartSkeleton />}

      {error && !loading && (
        <div className="sc-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && quotes.length > 0 && (
        <>
          {/* ── Price Area Chart ── */}
          <div className="sc-chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={quotes} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                    <stop offset="85%" stopColor={ACCENT} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(15,23,42,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  ticks={ticks}
                  tickFormatter={(v) => fmtDate(v, range)}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => fmtPrice(v, currency)}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  tickCount={6}
                />
                <Tooltip
                  content={<ChartTooltip currency={currency} range={range} />}
                  cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1.5, strokeDasharray: '4 2' }}
                />

                {/* Analyst price target lines */}
                {yfc.targetMeanPrice && (
                  <ReferenceLine
                    y={yfc.targetMeanPrice}
                    stroke="#6366f1"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    label={{ value: 'Mean Target', position: 'insideTopRight', fontSize: 10, fill: '#6366f1', fontWeight: 700 }}
                  />
                )}
                {yfc.targetHighPrice && (
                  <ReferenceLine
                    y={yfc.targetHighPrice}
                    stroke="#059669"
                    strokeDasharray="3 4"
                    strokeWidth={1}
                    label={{ value: 'High Target', position: 'insideTopRight', fontSize: 10, fill: '#059669', fontWeight: 700 }}
                  />
                )}
                {yfc.targetLowPrice && (
                  <ReferenceLine
                    y={yfc.targetLowPrice}
                    stroke="#dc2626"
                    strokeDasharray="3 4"
                    strokeWidth={1}
                    label={{ value: 'Low Target', position: 'insideTopRight', fontSize: 10, fill: '#dc2626', fontWeight: 700 }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Volume Bar Chart ── */}
          <div className="sc-volume-wrap">
            <div className="sc-volume-label">Volume</div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={volumeData} margin={{ top: 0, right: 4, left: 0, bottom: 0 }} barCategoryGap="10%">
                <XAxis dataKey="date" hide />
                <YAxis tickFormatter={fmtVolume} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} tickCount={3} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: 'rgba(15,23,42,0.88)', color: '#e2e8f0', padding: '6px 10px', borderRadius: 8, fontSize: 11, backdropFilter: 'blur(8px)' }}>
                        <span style={{ color: '#94a3b8' }}>Vol: </span>
                        <strong>{fmtVolume(payload[0]?.value)}</strong>
                      </div>
                    );
                  }}
                  cursor={{ fill: 'rgba(99,102,241,0.07)' }}
                />
                <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                  {volumeData.map((entry, index) => (
                    <Cell key={`vol-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Analyst Target Legend ── */}
          {(yfc.targetMeanPrice || yfc.targetHighPrice || yfc.targetLowPrice) && (
            <div className="sc-target-legend">
              <span className="sc-target-legend-label">Analyst Targets:</span>
              {yfc.targetLowPrice && (
                <span className="sc-target-chip" style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)' }}>
                  <span style={{ width: 16, display: 'inline-block', borderTop: '1.5px dashed #dc2626', marginRight: 4, verticalAlign: 'middle' }} />
                  Low {fmtPrice(yfc.targetLowPrice, currency)}
                </span>
              )}
              {yfc.targetMeanPrice && (
                <span className="sc-target-chip" style={{ color: '#6366f1', borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.06)' }}>
                  <span style={{ width: 16, display: 'inline-block', borderTop: '2px dashed #6366f1', marginRight: 4, verticalAlign: 'middle' }} />
                  Mean {fmtPrice(yfc.targetMeanPrice, currency)}
                </span>
              )}
              {yfc.targetHighPrice && (
                <span className="sc-target-chip" style={{ color: '#059669', borderColor: 'rgba(5,150,105,0.2)', background: 'rgba(5,150,105,0.05)' }}>
                  <span style={{ width: 16, display: 'inline-block', borderTop: '1.5px dashed #059669', marginRight: 4, verticalAlign: 'middle' }} />
                  High {fmtPrice(yfc.targetHighPrice, currency)}
                </span>
              )}
            </div>
          )}

          {/* ── Exchange info ── */}
          {data?.meta?.fullExchangeName && (
            <div className="sc-exchange-note">
              {data.meta.fullExchangeName} · {quotes.length} data points · {data.interval} interval
            </div>
          )}
        </>
      )}
    </div>
  );
}
