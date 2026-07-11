import { useState, useEffect } from 'react';
import StockChart from './StockChart';

import {
  TrendingUp, TrendingDown, Building2, Users, Globe,
  Calendar, Activity, ExternalLink, DollarSign, Percent,
  BarChart3, ChevronDown, ChevronUp, Tag, Zap, Newspaper,
  Target, Award, GitCompare, Eye, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const getCurrencySymbol = (currency) =>
  currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

const fmtCurrency = (v, currency = 'USD') => {
  if (v == null || isNaN(v)) return 'N/A';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  const sym = getCurrencySymbol(currency);
  if (abs >= 1e12) return `${sign}${sym}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${sign}${sym}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${sign}${sym}${(abs / 1e6).toFixed(2)}M`;
  return `${sign}${sym}${abs.toFixed(2)}`;
};
const fmtNum    = (v, dec = 2) => (v == null || isNaN(v) ? 'N/A' : Number(v).toFixed(dec));
const fmtPct    = (v, dec = 2) => (v == null || isNaN(v) ? 'N/A' : `${Number(v * (Math.abs(v) < 2 ? 100 : 1)).toFixed(dec)}%`);
const fmtPctRaw = (v, dec = 1) => (v == null || isNaN(v) ? 'N/A' : `${(v * 100).toFixed(dec)}%`);
const fmtLargeNum = (v) => {
  if (v == null) return 'N/A';
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
};

/* Verdict config */
const VERDICT_CFG = {
  INVEST: { color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', glow: 'rgba(5,150,105,0.12)', icon: '✓', label: 'INVEST' },
  HOLD:   { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', glow: 'rgba(217,119,6,0.12)',  icon: '~', label: 'HOLD'   },
  PASS:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', glow: 'rgba(220,38,38,0.12)',  icon: '✗', label: 'PASS'   },
};

/* Source badge configs */
const SRC = {
  fmp:   { label: 'FMP',         bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  yahoo: { label: 'Yahoo',       bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  edgar: { label: 'SEC EDGAR',   bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  both:  { label: 'FMP + Yahoo', bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
  all3:  { label: 'FMP + Yahoo + SEC', bg: '#f0fdf4', color: '#065f46', border: '#6ee7b7' },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Source Badge
───────────────────────────────────────────────────────────────────────────── */
function SourceBadge({ src = 'fmp' }) {
  const cfg = SRC[src] ?? SRC.fmp;
  const emoji = src === 'fmp' ? '🔵' : src === 'yahoo' ? '🟡' : src === 'edgar' ? '🟢' : src === 'all3' ? '🔵🟡🟢' : '🔵🟡';
  return (
    <span className="rc-src-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      {emoji} {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Animated Confidence Ring
───────────────────────────────────────────────────────────────────────────── */
function ConfidenceRing({ confidence = 0 }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const dur = 1400, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setAnim(confidence * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [confidence]);

  const R = 42, circ = 2 * Math.PI * R;
  const pct = Math.min(anim / 100, 1);
  const offset = circ * (1 - pct);
  const clr = confidence >= 75 ? '#6366f1' : confidence >= 50 ? '#8b5cf6' : '#a78bfa';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={108} height={108} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={54} cy={54} r={R} fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth={8} />
        <circle
          cx={54} cy={54} r={R} fill="none"
          stroke={clr} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 4px ${clr}60)` }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>{confidence}%</div>
        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Confidence</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Card wrapper
───────────────────────────────────────────────────────────────────────────── */
function Card({ children, style, className = '' }) {
  return (
    <div className={`rc-card ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section header with optional source badge
───────────────────────────────────────────────────────────────────────────── */
function SectionHeader({ icon, title, accent = '#6366f1', src }) {
  return (
    <div className="rc-section-header">
      <div className="rc-section-accent" style={{ background: accent }} />
      <span className="rc-section-icon" style={{ color: accent }}>{icon}</span>
      <h3 className="rc-section-title">{title}</h3>
      {src && <SourceBadge src={src} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stat Item
───────────────────────────────────────────────────────────────────────────── */
function StatItem({ icon, label, value, href }) {
  return (
    <div className="rc-stat-item">
      <div className="rc-stat-icon">{icon}</div>
      <div>
        <div className="rc-stat-label">{label}</div>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="rc-link">{value}</a>
          : <div className="rc-stat-value">{value}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Data Table
───────────────────────────────────────────────────────────────────────────── */
function DataTable({ headers, rows, accentColor = '#6366f1' }) {
  return (
    <div className="rc-table-wrap">
      <table className="rc-table">
        <thead>
          <tr style={{ background: `${accentColor}0d` }}>
            {headers.map((h, i) => (
              <th key={i} className="rc-th" style={{ color: accentColor }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="rc-tr">
              {row.map((cell, j) => (
                <td key={j} className={`rc-td ${typeof cell === 'object' && cell?.cls ? cell.cls : ''}`}>
                  {typeof cell === 'object' && cell !== null && 'val' in cell ? (cell.val ?? '—') : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Cross-Source Comparison Table (3 sources)
───────────────────────────────────────────────────────────────────────────── */
function ComparisonTable({ rows }) {
  // rows: [{ label, fmpFmt, yahooFmt, edgarFmt, agreement }]
  const agreementBadge = (level) => {
    if (!level || level === 'SINGLE') return null;
    const cfg = {
      HIGH:   { bg: '#dcfce7', color: '#166534', border: '#bbf7d0', icon: '✅', text: 'HIGH' },
      MEDIUM: { bg: '#fef9c3', color: '#92400e', border: '#fde68a', icon: '⚠️', text: 'MED' },
      LOW:    { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '🔴', text: 'LOW' },
    }[level] ?? null;
    if (!cfg) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '1px 8px', borderRadius: 100, fontSize: 10, fontWeight: 800,
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      }}>{cfg.icon} {cfg.text}</span>
    );
  };

  return (
    <div className="rc-table-wrap">
      <table className="rc-table">
        <thead>
          <tr style={{ background: '#7c3aed0d' }}>
            <th className="rc-th" style={{ color: '#7c3aed' }}>Metric</th>
            <th className="rc-th" style={{ color: '#1d4ed8' }}>🔵 FMP</th>
            <th className="rc-th" style={{ color: '#92400e' }}>🟡 Yahoo</th>
            <th className="rc-th" style={{ color: '#166534' }}>🟢 SEC EDGAR</th>
            <th className="rc-th" style={{ color: '#7c3aed' }}>Agreement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="rc-tr">
              <td className="rc-td" style={{ fontWeight: 700, color: '#334155' }}>{row.label}</td>
              <td className="rc-td rc-src-fmp">{row.fmpFmt}</td>
              <td className="rc-td rc-src-yahoo">{row.yahooFmt}</td>
              <td className="rc-td rc-src-edgar">{row.edgarFmt}</td>
              <td className="rc-td">{agreementBadge(row.agreement)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Analyst Recommendation Visual Bar
───────────────────────────────────────────────────────────────────────────── */
function RecBar({ strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0 }) {
  const total = strongBuy + buy + hold + sell + strongSell || 1;
  const bars = [
    { label: 'Strong Buy', count: strongBuy, color: '#059669' },
    { label: 'Buy',        count: buy,       color: '#34d399' },
    { label: 'Hold',       count: hold,      color: '#f59e0b' },
    { label: 'Sell',       count: sell,      color: '#f87171' },
    { label: 'Strong Sell',count: strongSell,color: '#dc2626' },
  ];
  return (
    <div className="rc-rec-bar-wrap">
      <div className="rc-rec-stacked">
        {bars.map((b, i) => b.count > 0 && (
          <div key={i} title={`${b.label}: ${b.count}`}
            style={{ width: `${(b.count / total) * 100}%`, background: b.color, height: '100%', borderRadius: i === 0 ? '6px 0 0 6px' : i === bars.length - 1 || b === bars[bars.length - 1] ? '0 6px 6px 0' : '0' }} />
        ))}
      </div>
      <div className="rc-rec-legend">
        {bars.map((b, i) => (
          <div key={i} className="rc-rec-legend-item">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color, display: 'inline-block', flexShrink: 0 }} />
            <span>{b.label}: <strong>{b.count}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main ResultCard
───────────────────────────────────────────────────────────────────────────── */
export default function ResultCard({ data, onReanalyze }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [reanalyzing, setReanalyzing]     = useState(false);
  const [activeTab, setActiveTab]         = useState('overview');

  const handleReanalyze = async () => {
    if (reanalyzing || !onReanalyze) return;
    setReanalyzing(true);
    try { await onReanalyze(); } finally { setReanalyzing(false); }
  };

  const vc      = VERDICT_CFG[data.verdict] ?? VERDICT_CFG.HOLD;
  const raw     = data.rawData ?? {};
  const profile = raw.companyProfile  ?? {};
  
  // Fallback to INR if country is IN or it's an Indian exchange
  let currency = profile.currency ?? raw.yahooData?.currentFinancials?.currency ?? 'USD';
  if ((profile.country === 'IN' || data.ticker?.endsWith('.BO') || data.ticker?.endsWith('.NS')) && (!profile.currency || profile.currency === 'USD' || profile.currency === 'INR')) {
    currency = 'INR';
  }

  const currSym  = getCurrencySymbol(currency);
  const income  = raw.incomeStatement ?? [];
  const balance = raw.balanceSheet    ?? [];
  const cashflow= raw.cashFlow        ?? [];
  const km      = raw.keyMetrics      ?? {};
  const news    = raw.recentNews      ?? [];
  const peers   = raw.peers           ?? [];
  const yf      = raw.yahooData       ?? null;   // Yahoo Finance data
  const edgar   = raw.edgarData       ?? null;   // SEC EDGAR data
  const cs      = raw.crossSource     ?? {};     // Cross-source comparison

  // Indian-specific data
  const isIndian    = raw.market === 'INDIA';
  const indianData  = raw.indianData ?? null;

  /* ── FMP Table rows ── */
  const incomeRows = income.map((d) => [
    { val: d.year, cls: 'rc-td-year' },
    fmtCurrency(d.revenue, currency),
    fmtCurrency(d.grossProfit, currency),
    { val: fmtPct(d.grossMargin), cls: 'rc-positive' },
    fmtCurrency(d.operatingIncome, currency),
    { val: fmtPct(d.operatingMargin), cls: 'rc-positive' },
    fmtCurrency(d.netIncome, currency),
    { val: fmtPct(d.netMargin), cls: 'rc-positive' },
    `${currSym}${fmtNum(d.eps)}`,
    fmtCurrency(d.ebitda, currency),
  ]);

  const balanceRows = balance.map((d) => [
    { val: d.year, cls: 'rc-td-year' },
    fmtCurrency(d.cash, currency),
    fmtCurrency(d.totalAssets, currency),
    { val: fmtCurrency(d.totalDebt, currency), cls: 'rc-negative' },
    { val: fmtCurrency(d.totalLiabilities, currency), cls: 'rc-negative' },
    { val: fmtCurrency(d.totalEquity, currency), cls: 'rc-positive' },
    { val: fmtNum(d.currentRatio), cls: d.currentRatio >= 1 ? 'rc-positive' : 'rc-negative' },
  ]);

  const cfRows = cashflow.map((d) => [
    { val: d.year, cls: 'rc-td-year' },
    { val: fmtCurrency(d.operatingCashFlow, currency), cls: 'rc-positive' },
    { val: fmtCurrency(d.capitalExpenditure, currency), cls: 'rc-negative' },
    { val: fmtCurrency(d.freeCashFlow, currency), cls: d.freeCashFlow > 0 ? 'rc-positive' : 'rc-negative' },
    fmtCurrency(Math.abs(d.dividendsPaid), currency),
  ]);

  /* ── FMP Key Metrics Groups ── */
  const kmGroups = [
    {
      title: 'Valuation', accent: '#6366f1',
      cards: [
        { label: 'P/E Ratio',       value: fmtNum(km.peRatio),           icon: <Activity size={13}/>,     accent: '#6366f1' },
        { label: 'P/B Ratio',       value: fmtNum(km.pbRatio),           icon: <BarChart3 size={13}/>,    accent: '#8b5cf6' },
        { label: 'P/S Ratio',       value: fmtNum(km.priceToSales),      icon: <TrendingUp size={13}/>,   accent: '#7c3aed' },
        { label: 'EV/EBITDA',       value: fmtNum(km.evToEbitda),        icon: <DollarSign size={13}/>,   accent: '#6366f1' },
        { label: 'EV/Sales',        value: fmtNum(km.evToSales),         icon: <DollarSign size={13}/>,   accent: '#8b5cf6' },
        { label: 'EV/FCF',          value: fmtNum(km.evToFreeCashFlow),  icon: <DollarSign size={13}/>,   accent: '#7c3aed' },
        { label: 'Graham Number',   value: fmtNum(km.grahamNumber),      icon: <BarChart3 size={13}/>,    accent: '#8b5cf6' },
        { label: 'Earnings Yield',  value: fmtPct(km.earningsYield),     icon: <Percent size={13}/>,      accent: '#7c3aed' },
        { label: 'FCF Yield',       value: fmtPct(km.freeCashFlowYield), icon: <Percent size={13}/>,      accent: '#6366f1' },
      ],
    },
    {
      title: 'Profitability', accent: '#059669',
      cards: [
        { label: 'ROE',     value: fmtPct(km.roe),                        icon: <Percent size={13}/>, accent: '#059669' },
        { label: 'ROA',     value: fmtPct(km.roa),                        icon: <Percent size={13}/>, accent: '#0891b2' },
        { label: 'ROIC',    value: fmtPct(km.returnOnInvestedCapital),    icon: <Percent size={13}/>, accent: '#059669' },
        { label: 'ROCE',    value: fmtPct(km.returnOnCapitalEmployed),    icon: <Percent size={13}/>, accent: '#0891b2' },
        { label: 'Income Quality', value: fmtNum(km.incomeQuality),       icon: <Activity size={13}/>,accent: '#059669' },
      ],
    },
    {
      title: 'Leverage & Coverage', accent: '#e11d48',
      cards: [
        { label: 'Debt/Equity',       value: fmtNum(km.debtToEquity),    icon: <TrendingDown size={13}/>, accent: '#e11d48' },
        { label: 'Net Debt/EBITDA',   value: fmtNum(km.netDebtToEBITDA), icon: <TrendingDown size={13}/>, accent: '#dc2626' },
        { label: 'Interest Coverage', value: fmtNum(km.interestCoverage),icon: <Activity size={13}/>,     accent: '#e11d48' },
      ],
    },
    {
      title: 'Liquidity', accent: '#d97706',
      cards: [
        { label: 'Current Ratio',   value: fmtNum(km.currentRatio),      icon: <Activity size={13}/>,    accent: '#d97706' },
        { label: 'Quick Ratio',     value: fmtNum(km.quickRatio),        icon: <Activity size={13}/>,    accent: '#f59e0b' },
        { label: 'Working Capital', value: fmtCurrency(km.workingCapital, currency),icon: <DollarSign size={13}/>, accent: '#d97706' },
      ],
    },
    {
      title: 'Dividends', accent: '#7c3aed',
      cards: [
        { label: 'Dividend Yield', value: fmtPct(km.dividendYield),    icon: <DollarSign size={13}/>, accent: '#7c3aed' },
        { label: 'Payout Ratio',   value: fmtPct(km.payoutRatio),      icon: <Percent size={13}/>,    accent: '#8b5cf6' },
        { label: 'Div/Share',      value: fmtNum(km.dividendPerShare), icon: <DollarSign size={13}/>, accent: '#7c3aed' },
      ],
    },
    {
      title: 'Efficiency & CapEx', accent: '#0891b2',
      cards: [
        { label: 'CapEx/Sales',         value: fmtPct(km.capexToRevenue),           icon: <BarChart3 size={13}/>, accent: '#0891b2' },
        { label: 'CapEx/Op. CF',        value: fmtPct(km.capexToOperatingCashFlow), icon: <BarChart3 size={13}/>, accent: '#0d9488' },
        { label: 'R&D/Revenue',         value: fmtPct(km.researchAndDevelopementToRevenue), icon: <Activity size={13}/>, accent: '#0891b2' },
        { label: 'Days Receivable',     value: fmtNum(km.daysOfSalesOutstanding, 1),icon: <Calendar size={13}/>, accent: '#0891b2' },
        { label: 'Days Payable',        value: fmtNum(km.daysOfPayablesOutstanding,1),icon:<Calendar size={13}/>, accent: '#0d9488' },
        { label: 'Cash Conv. Cycle',    value: fmtNum(km.cashConversionCycle, 1),   icon: <Calendar size={13}/>, accent: '#0891b2' },
      ],
    },
  ];

  /* ── Cross-Source Comparison rows (from server-computed crossSource object) ── */
  const yfc = yf?.currentFinancials ?? {};
  const yfk = yf?.keyStats ?? {};

  // Format a raw value based on its type
  const fmtByType = (v, fmt) => {
    if (v == null || isNaN(v)) return '—';
    if (fmt === 'currency') return fmtCurrency(v);
    if (fmt === 'percent') return fmtPct(v);
    if (fmt === 'shares') return fmtLargeNum(v);
    return fmtNum(v); // number
  };

  // Build comparison rows from cross-source object — only show rows with 2+ values
  const comparisonRows = Object.values(cs)
    .filter(point => {
      const sources = [point.fmp, point.yahoo, point.edgar].filter(v => v != null);
      return sources.length >= 2; // only show when we have 2+ sources to compare
    })
    .map(point => ({
      label:     point.label,
      fmpFmt:    fmtByType(point.fmp,   point.format),
      yahooFmt:  fmtByType(point.yahoo, point.format),
      edgarFmt:  fmtByType(point.edgar, point.format),
      agreement: point.agreement,
    }));

  /* ── Yahoo analyst rec trend ── */
  const recNow  = yf?.analystRecommendations?.[0] ?? null;
  const recPrev = yf?.analystRecommendations?.[1] ?? null;

  /* ── Rec key → display ── */
  const REC_DISPLAY = {
    strong_buy: { label: 'Strong Buy', color: '#059669', bg: '#f0fdf4' },
    buy:        { label: 'Buy',        color: '#34d399', bg: '#ecfdf5' },
    hold:       { label: 'Hold',       color: '#d97706', bg: '#fffbeb' },
    sell:       { label: 'Sell',       color: '#ef4444', bg: '#fef2f2' },
    strong_sell:{ label: 'Strong Sell',color: '#dc2626', bg: '#fef2f2' },
  };
  const recCfg = REC_DISPLAY[yfc.recommendationKey] ?? { label: yfc.recommendationKey ?? 'N/A', color: '#64748b', bg: '#f8fafc' };

  /* ── Action label ── */
  const actionLabel = (a) => ({ up: '⬆️ Upgrade', down: '⬇️ Downgrade', init: '🆕 Initiate', reit: '↩️ Reiterate' })[a] ?? a;

  return (
    <>
      {/* ── Scoped Styles ── */}
      <style>{`
        .rc-dashboard {
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: rcFadeUp 0.4s ease both;
          font-family: 'Inter', system-ui, sans-serif;
        }
        @keyframes rcFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rc-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(15,23,42,0.05), 0 4px 12px rgba(99,102,241,0.05);
          transition: box-shadow 0.22s ease;
        }
        .rc-card:hover { box-shadow: 0 2px 8px rgba(15,23,42,0.07), 0 8px 24px rgba(99,102,241,0.08); }

        .rc-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .rc-section-accent { width: 3px; height: 18px; border-radius: 2px; flex-shrink: 0; }
        .rc-section-icon { display: flex; align-items: center; }
        .rc-section-title { font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; margin: 0; }

        /* Source badge */
        .rc-src-badge {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 2px 9px; border-radius: 100px;
          font-size: 10.5px; font-weight: 700; border: 1px solid;
          letter-spacing: 0.02em; flex-shrink: 0;
        }

        .rc-company-name { font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.025em; margin: 0 0 10px; line-height: 1.2; }
        .rc-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .rc-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 7px; font-size: 11.5px; font-weight: 700; border: 1px solid; letter-spacing: 0.01em; }
        .rc-badge-ticker   { background: #ede9fe; border-color: #c4b5fd; color: #5b21b6; font-family: 'Courier New', monospace; }
        .rc-badge-sector   { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
        .rc-badge-industry { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
        .rc-badge-exchange { background: #fdf4ff; border-color: #e9d5ff; color: #7e22ce; }
        .rc-badge-cache    { background: #f8fafc; border-color: #e2e8f0; color: #94a3b8; font-size: 10.5px; padding: 2px 9px; border-radius: 100px; }

        .rc-price-block { text-align: right; flex-shrink: 0; }
        .rc-price { font-size: 30px; font-weight: 900; color: #6366f1; line-height: 1; letter-spacing: -0.02em; }
        .rc-beta  { font-size: 11.5px; color: #94a3b8; margin-top: 4px; }

        .rc-description { font-size: 13.5px; color: #475569; line-height: 1.7; margin: 16px 0 0; padding-top: 16px; border-top: 1px solid rgba(15,23,42,0.06); }

        .rc-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(15,23,42,0.06); }
        .rc-stat-item { display: flex; align-items: flex-start; gap: 9px; }
        .rc-stat-icon { color: #6366f1; margin-top: 1px; flex-shrink: 0; }
        .rc-stat-label { font-size: 10.5px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .rc-stat-value { font-size: 13px; color: #0f172a; font-weight: 600; margin-top: 2px; }
        .rc-link { font-size: 13px; color: #6366f1; font-weight: 600; text-decoration: none; margin-top: 2px; display: block; }
        .rc-link:hover { text-decoration: underline; }

        .rc-peers { margin-top: 16px; }
        .rc-peers-label { font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; margin-bottom: 8px; }
        .rc-peers-list { display: flex; flex-wrap: wrap; gap: 5px; }
        .rc-peer-chip { padding: 3px 10px; background: #f8fafc; border: 1px solid rgba(15,23,42,0.08); border-radius: 100px; font-size: 12px; font-weight: 700; color: #475569; transition: all 0.15s ease; font-family: 'Courier New', monospace; letter-spacing: 0.03em; }
        .rc-peer-chip:hover { background: #ede9fe; border-color: #c4b5fd; color: #5b21b6; }

        /* Verdict */
        .rc-verdict-grid { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
        .rc-verdict-pill { padding: 16px 40px; border-radius: 14px; font-size: 22px; font-weight: 900; letter-spacing: 0.08em; border: 1.5px solid; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .rc-verdict-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; border: 2px solid; }
        .rc-confidence-side { flex: 1; min-width: 180px; }
        .rc-conf-label { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 8px; font-weight: 500; }
        .rc-conf-bar { height: 6px; background: rgba(99,102,241,0.1); border-radius: 100px; overflow: hidden; }
        .rc-conf-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

        .rc-reasoning-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.12); border-radius: 10px; cursor: pointer; padding: 12px 16px; font-family: inherit; margin-top: 20px; transition: background 0.15s ease; }
        .rc-reasoning-btn:hover { background: rgba(99,102,241,0.07); }
        .rc-reasoning-label { font-size: 13px; font-weight: 700; color: #6366f1; display: flex; align-items: center; gap: 6px; }
        .rc-reasoning-text { padding-top: 16px; font-size: 14px; color: #475569; line-height: 1.8; }

        /* Metrics grid */
        .rc-km-group { margin-bottom: 20px; }
        .rc-km-group:last-child { margin-bottom: 0; }
        .rc-km-group-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; }
        .rc-km-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
        .rc-km-card { background: linear-gradient(135deg, #f8faff 0%, #f5f3ff 100%); border: 1px solid rgba(99,102,241,0.1); border-radius: 12px; padding: 12px 14px; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .rc-km-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.2); }
        .rc-km-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; font-weight: 600; }
        .rc-km-value { font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }
        .rc-km-icon { flex-shrink: 0; }

        /* Bull / Bear */
        .rc-bb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 640px) { .rc-bb-grid { grid-template-columns: 1fr; } }
        .rc-bb-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .rc-bb-item { display: flex; align-items: flex-start; gap: 10px; padding: 11px 14px; border-radius: 10px; font-size: 13.5px; color: #334155; line-height: 1.55; animation: rcFadeUp 0.4s ease both; border: 1px solid; transition: transform 0.15s ease; }
        .rc-bb-item:hover { transform: translateX(2px); }
        .rc-bull-item { background: #f0fdf4; border-color: #bbf7d0; }
        .rc-bear-item { background: #fef2f2; border-color: #fecaca; }
        .rc-bull-dot { color: #059669; font-weight: 900; flex-shrink: 0; font-size: 14px; }
        .rc-bear-dot { color: #dc2626; font-weight: 900; flex-shrink: 0; font-size: 14px; }

        /* Tables */
        .rc-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(15,23,42,0.07); }
        .rc-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        .rc-th { padding: 10px 14px; text-align: left; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
        .rc-tr { border-bottom: 1px solid rgba(15,23,42,0.05); transition: background 0.1s; }
        .rc-tr:nth-child(even) { background: #fafbff; }
        .rc-tr:hover { background: #f0f1ff !important; }
        .rc-tr:last-child { border-bottom: none; }
        .rc-td { padding: 10px 14px; color: #334155; white-space: nowrap; }
        .rc-td-year { font-weight: 800; color: #0f172a; font-family: 'Courier New', monospace; letter-spacing: 0.03em; }
        .rc-positive { color: #059669; font-weight: 700; }
        .rc-negative { color: #dc2626; font-weight: 700; }
        .rc-src-fmp   { color: #1d4ed8; font-weight: 700; }
        .rc-src-yahoo { color: #92400e; font-weight: 700; }
        .rc-src-edgar { color: #166534; font-weight: 700; }

        /* News */
        .rc-news-list { display: flex; flex-direction: column; gap: 10px; }
        .rc-news-item { padding: 16px; background: #f8fafc; border: 1px solid rgba(15,23,42,0.07); border-radius: 12px; transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease; cursor: default; }
        .rc-news-item:hover { border-color: rgba(99,102,241,0.2); box-shadow: 0 2px 12px rgba(99,102,241,0.08); transform: translateY(-1px); }
        .rc-news-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .rc-news-title { font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.4; }
        .rc-news-source { font-size: 10px; font-weight: 800; padding: 2px 9px; background: #ede9fe; color: #5b21b6; border-radius: 100px; white-space: nowrap; flex-shrink: 0; letter-spacing: 0.03em; }
        .rc-news-summary { font-size: 13px; color: #475569; line-height: 1.6; }
        .rc-news-date { font-size: 11px; color: #94a3b8; margin-top: 8px; font-weight: 500; }

        /* Reanalyze button */
        .rc-reanalyze-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 18px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; border: none; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; letter-spacing: 0.02em; transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease; box-shadow: 0 2px 10px rgba(99,102,241,0.28); white-space: nowrap; flex-shrink: 0; }
        .rc-reanalyze-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99,102,241,0.38); }
        .rc-reanalyze-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .rc-reanalyze-spinner { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: rcSpin 0.7s linear infinite; }
        @keyframes rcSpin { to { transform: rotate(360deg); } }

        .rc-header-flex { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 20px; }

        /* Yahoo: Analyst Consensus */
        .rc-analyst-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        .rc-analyst-card { background: #f8fafc; border: 1px solid rgba(15,23,42,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 4px; }
        .rc-analyst-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .rc-analyst-value { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
        .rc-analyst-sub { font-size: 11px; color: #64748b; }

        /* Rec pill */
        .rc-rec-pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 12px; font-size: 18px; font-weight: 900; border: 1.5px solid; letter-spacing: 0.05em; }

        /* Stacked bar */
        .rc-rec-bar-wrap { margin-top: 16px; }
        .rc-rec-stacked { height: 18px; border-radius: 6px; overflow: hidden; display: flex; background: #f1f5f9; }
        .rc-rec-legend { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-top: 10px; }
        .rc-rec-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: #64748b; }

        /* Price target */
        .rc-target-row { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding: 14px 18px; background: linear-gradient(135deg, #f0f9ff, #eff6ff); border: 1px solid #bfdbfe; border-radius: 12px; flex-wrap: wrap; gap: 20px; }
        .rc-target-item { text-align: center; }
        .rc-target-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .rc-target-val { font-size: 20px; font-weight: 900; color: #1d4ed8; margin-top: 2px; }
        .rc-target-val-low  { font-size: 20px; font-weight: 900; color: #dc2626; margin-top: 2px; }
        .rc-target-val-high { font-size: 20px; font-weight: 900; color: #059669; margin-top: 2px; }
        .rc-target-divider { width: 1px; height: 40px; background: rgba(15,23,42,0.1); }

        /* Earnings beats */
        .rc-earnings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-top: 4px; }
        .rc-earnings-card { border-radius: 12px; padding: 14px; border: 1px solid; text-align: center; }
        .rc-earnings-date { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; }
        .rc-earnings-actual { font-size: 20px; font-weight: 900; margin: 4px 0; }
        .rc-earnings-est  { font-size: 11.5px; opacity: 0.7; }
        .rc-earnings-surp { font-size: 13px; font-weight: 800; margin-top: 6px; }

        /* Ownership */
        .rc-ownership-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .rc-ownership-card { padding: 16px; background: #fafafa; border: 1px solid rgba(15,23,42,0.07); border-radius: 14px; }
        .rc-ownership-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .rc-ownership-val { font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 4px; }
        .rc-ownership-bar { height: 6px; background: rgba(99,102,241,0.1); border-radius: 100px; margin-top: 8px; overflow: hidden; }
        .rc-ownership-fill { height: 100%; border-radius: 100px; }

        /* Upgrades / Downgrades */
        .rc-action-list { display: flex; flex-direction: column; gap: 8px; }
        .rc-action-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; font-size: 13px; border: 1px solid; }
        .rc-action-up   { background: #f0fdf4; border-color: #bbf7d0; }
        .rc-action-down { background: #fef2f2; border-color: #fecaca; }
        .rc-action-reit { background: #f8fafc; border-color: #e2e8f0; }
        .rc-action-init { background: #eff6ff; border-color: #bfdbfe; }
        .rc-action-firm { font-weight: 700; color: #0f172a; min-width: 140px; }
        .rc-action-grade { font-size: 12px; color: #64748b; }

        /* EPS estimates */
        .rc-eps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .rc-eps-card { padding: 16px; background: #f8fafc; border: 1px solid rgba(15,23,42,0.07); border-radius: 14px; }
        .rc-eps-period { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; margin-bottom: 10px; }
        .rc-eps-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #334155; margin: 4px 0; }
        .rc-eps-key { color: #94a3b8; font-weight: 600; }
        .rc-eps-val { font-weight: 700; color: #0f172a; }

        /* Yahoo key stats */
        .rc-yf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
        .rc-yf-card { background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%); border: 1px solid #fde68a; border-radius: 12px; padding: 12px 14px; }
        .rc-yf-label { font-size: 10px; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 700; }
        .rc-yf-value { font-size: 17px; font-weight: 800; color: #78350f; }

        /* Two-col layout */
        .rc-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 640px) { .rc-two-col { grid-template-columns: 1fr; } }

        /* India tab styles */
        .rc-india-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 9px; border-radius: 100px; font-size: 10.5px; font-weight: 700; border: 1px solid; background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
        .rc-shp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .rc-shp-card { padding: 16px; border-radius: 14px; border: 1px solid rgba(15,23,42,0.08); background: #fafafa; }
        .rc-shp-label { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
        .rc-shp-value { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 4px; }
        .rc-shp-bar { height: 8px; background: rgba(99,102,241,0.08); border-radius: 100px; margin-top: 8px; overflow: hidden; }
        .rc-shp-fill { height: 100%; border-radius: 100px; transition: width 0.8s ease; }
        .rc-shp-delta { font-size: 11px; margin-top: 6px; font-weight: 700; }
        .rc-india-metric-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .rc-india-metric { background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); border: 1px solid #fed7aa; border-radius: 12px; padding: 12px 14px; }
        .rc-india-metric-label { font-size: 10px; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .rc-india-metric-value { font-size: 17px; font-weight: 800; color: #78350f; }
      `}</style>

      <div className="rc-dashboard">

        {/* ── Tab Bar ── */}
        <div className="rc-tab-bar">
          <button
            className={`rc-tab-btn${activeTab === 'overview' ? ' active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>

          <button
            className={`rc-tab-btn${activeTab === 'chart' ? ' active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            📈 Price Chart
          </button>
        </div>

        {/* ════════════════════════════════════════
            CHART TAB
        ════════════════════════════════════════ */}
        {activeTab === 'chart' && (
          <Card>
            <SectionHeader icon={<Activity size={13}/>} title={`${data.ticker} — Price Chart`} accent="#6366f1" />
            <StockChart ticker={data.ticker} yahooData={raw.yahooData} />
          </Card>
        )}



        {/* ════════════════════════════════════════
            OVERVIEW TAB (all existing cards)
        ════════════════════════════════════════ */}
        {activeTab === 'overview' && (<>

        <Card>
          <div className="rc-header-flex">
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2 className="rc-company-name">{data.companyName}</h2>
              <div className="rc-badges">
                <span className="rc-badge rc-badge-ticker">{data.ticker}</span>
                {data.sector   && <span className="rc-badge rc-badge-sector"><Tag size={10}/> {data.sector}</span>}
                {data.industry && <span className="rc-badge rc-badge-industry">{data.industry}</span>}
                {profile.exchange && <span className="rc-badge rc-badge-exchange">{profile.exchange}</span>}
                {data.cached && (
                  <span className="rc-badge rc-badge-cache">
                    <Zap size={9}/> Cached · {new Date(data.cachedAt || data.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              {profile.price != null && (
                <div className="rc-price-block">
                  <div className="rc-price">{currSym}{fmtNum(profile.price)}</div>
                  <div className="rc-beta">β {fmtNum(profile.beta)}</div>
                </div>
              )}
              {yfc.currentPrice && !profile.price && (
                <div className="rc-price-block">
                  <div className="rc-price">{currSym}{fmtNum(yfc.currentPrice)}</div>
                  <SourceBadge src="yahoo" />
                </div>
              )}
              {onReanalyze && (
                <button id="reanalyze-btn" className="rc-reanalyze-btn" onClick={handleReanalyze} disabled={reanalyzing}>
                  {reanalyzing ? <><span className="rc-reanalyze-spinner" /> Reanalyzing…</> : <>🔄 Reanalyze &amp; Save</>}
                </button>
              )}
            </div>
          </div>

          <div className="rc-stats-grid">
            {profile.ceo       && <StatItem icon={<Building2 size={13}/>} label="CEO"       value={profile.ceo} />}
            {profile.employees && <StatItem icon={<Users size={13}/>}     label="Employees" value={fmtLargeNum(profile.employees)} />}
            {profile.country   && <StatItem icon={<Globe size={13}/>}     label="Country"   value={profile.country} />}
            {profile.ipoDate   && <StatItem icon={<Calendar size={13}/>}  label="IPO Date"  value={profile.ipoDate} />}
            {profile.marketCap && <StatItem icon={<DollarSign size={13}/>}label="Market Cap" value={fmtCurrency(profile.marketCap, currency)} />}
            {profile.website   && <StatItem icon={<ExternalLink size={13}/>} label="Website" value="Visit site" href={profile.website} />}
          </div>

          {data.description && <p className="rc-description">{data.description}</p>}

          {peers.length > 0 && (
            <div className="rc-peers">
              <div className="rc-peers-label">Peer Companies</div>
              <div className="rc-peers-list">
                {peers.map((p, i) => <span key={i} className="rc-peer-chip">{p}</span>)}
              </div>
            </div>
          )}
        </Card>

        {/* ════════════════════════════════════════
            2. VERDICT + CONFIDENCE
        ════════════════════════════════════════ */}
        <Card>
          <SectionHeader icon={<Activity size={13}/>} title="Investment Verdict" accent="#6366f1" />
          <div className="rc-verdict-grid">
            <div className="rc-verdict-pill" style={{ background: vc.bg, borderColor: vc.border, color: vc.color, boxShadow: `0 6px 24px ${vc.glow}` }}>
              <div className="rc-verdict-icon" style={{ background: `${vc.color}15`, borderColor: vc.border, color: vc.color }}>
                {vc.icon}
              </div>
              {vc.label}
            </div>
            <div className="rc-confidence-side">
              <div className="rc-conf-label">
                <span>AI Confidence</span>
                <span style={{ fontWeight: 800, color: '#6366f1' }}>{data.confidence}%</span>
              </div>
              <div className="rc-conf-bar">
                <div className="rc-conf-fill" style={{ width: `${data.confidence}%` }} />
              </div>
            </div>
            <ConfidenceRing confidence={data.confidence} />
          </div>

          {data.reasoning && (
            <button className="rc-reasoning-btn" onClick={() => setReasoningOpen(!reasoningOpen)}>
              <span className="rc-reasoning-label"><Activity size={13}/> AI Reasoning</span>
              {reasoningOpen ? <ChevronUp size={15} color="#6366f1"/> : <ChevronDown size={15} color="#6366f1"/>}
            </button>
          )}
          {reasoningOpen && <div className="rc-reasoning-text">{data.reasoning}</div>}
        </Card>

        {/* ════════════════════════════════════════
            3. ANALYST CONSENSUS (Yahoo)
        ════════════════════════════════════════ */}
        {yf && (
          <Card>
            <SectionHeader icon={<Target size={13}/>} title="Analyst Consensus" accent="#f59e0b" src="yahoo" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              {yfc.recommendationKey && (
                <div className="rc-rec-pill" style={{ background: recCfg.bg, color: recCfg.color, borderColor: recCfg.color + '40' }}>
                  <Award size={18}/> {recCfg.label}
                </div>
              )}
              {yfc.recommendationMean && (
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Score: <strong style={{ color: '#0f172a' }}>{fmtNum(yfc.recommendationMean, 2)}</strong>
                  <span style={{ fontSize: 11, marginLeft: 6 }}>(1 = Strong Buy, 5 = Sell)</span>
                </div>
              )}
              {yfc.numberOfAnalystOpinions && (
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Based on <strong style={{ color: '#0f172a' }}>{yfc.numberOfAnalystOpinions}</strong> analysts
                </div>
              )}
            </div>

            {/* Price targets */}
            {yfc.targetMeanPrice && (
              <div className="rc-target-row">
                <div className="rc-target-item">
                  <div className="rc-target-label">Low Target</div>
                  <div className="rc-target-val-low">${fmtNum(yfc.targetLowPrice)}</div>
                </div>
                <div className="rc-target-divider" />
                <div className="rc-target-item">
                  <div className="rc-target-label">Mean Target</div>
                  <div className="rc-target-val">${fmtNum(yfc.targetMeanPrice)}</div>
                </div>
                <div className="rc-target-divider" />
                <div className="rc-target-item">
                  <div className="rc-target-label">Median Target</div>
                  <div className="rc-target-val">${fmtNum(yfc.targetMedianPrice)}</div>
                </div>
                <div className="rc-target-divider" />
                <div className="rc-target-item">
                  <div className="rc-target-label">High Target</div>
                  <div className="rc-target-val-high">${fmtNum(yfc.targetHighPrice)}</div>
                </div>
                {profile.price && yfc.targetMeanPrice && (
                  <>
                    <div className="rc-target-divider" />
                    <div className="rc-target-item">
                      <div className="rc-target-label">Upside (Mean)</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: yfc.targetMeanPrice > profile.price ? '#059669' : '#dc2626', marginTop: 2 }}>
                        {((yfc.targetMeanPrice - profile.price) / profile.price * 100).toFixed(1)}%
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Buy/Hold/Sell stacked bar */}
            {recNow && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  This Month's Analyst Ratings
                </div>
                <RecBar
                  strongBuy={recNow.strongBuy}
                  buy={recNow.buy}
                  hold={recNow.hold}
                  sell={recNow.sell}
                  strongSell={recNow.strongSell}
                />
              </div>
            )}
            {recPrev && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Previous Month
                </div>
                <RecBar
                  strongBuy={recPrev.strongBuy}
                  buy={recPrev.buy}
                  hold={recPrev.hold}
                  sell={recPrev.sell}
                  strongSell={recPrev.strongSell}
                />
              </div>
            )}
          </Card>
        )}

        {/* ════════════════════════════════════════
            4. ANALYST UPGRADES / DOWNGRADES (Yahoo)
        ════════════════════════════════════════ */}
        {yf?.analystActions?.length > 0 && (
          <Card>
            <SectionHeader icon={<ArrowUpRight size={13}/>} title="Recent Analyst Actions" accent="#7c3aed" src="yahoo" />
            <div className="rc-action-list">
              {yf.analystActions.map((a, i) => {
                const cls = a.action === 'up' ? 'rc-action-up' : a.action === 'down' ? 'rc-action-down' : a.action === 'init' ? 'rc-action-init' : 'rc-action-reit';
                return (
                  <div key={i} className={`rc-action-item ${cls}`}>
                    <div style={{ fontSize: 13, width: 110, flexShrink: 0 }}>{actionLabel(a.action)}</div>
                    <div className="rc-action-firm">{a.firm}</div>
                    <div className="rc-action-grade">
                      {a.fromGrade && a.toGrade && a.fromGrade !== a.toGrade
                        ? <>{a.fromGrade} → <strong>{a.toGrade}</strong></>
                        : <strong>{a.toGrade || a.fromGrade}</strong>}
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
                      {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════
            5. QUARTERLY EARNINGS BEATS/MISSES (Yahoo)
        ════════════════════════════════════════ */}
        {yf?.earningsHistory?.length > 0 && (
          <Card>
            <SectionHeader icon={<BarChart3 size={13}/>} title="Quarterly Earnings — Actual vs. Estimate" accent="#059669" src="yahoo" />
            <div className="rc-earnings-grid">
              {yf.earningsHistory.map((q, i) => {
                const beat = q.surprise > 0;
                return (
                  <div key={i} className="rc-earnings-card"
                    style={{ background: beat ? '#f0fdf4' : '#fef2f2', borderColor: beat ? '#bbf7d0' : '#fecaca' }}>
                    <div className="rc-earnings-date">{q.date}</div>
                    <div className="rc-earnings-actual" style={{ color: beat ? '#059669' : '#dc2626' }}>
                      ${fmtNum(q.actual)}
                    </div>
                    <div className="rc-earnings-est">Est: ${fmtNum(q.estimate)}</div>
                    {q.surprise != null && (
                      <div className="rc-earnings-surp" style={{ color: beat ? '#059669' : '#dc2626' }}>
                        {beat ? '▲' : '▼'} {Math.abs(q.surprise).toFixed(2)}% {beat ? 'beat' : 'miss'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════
            6. EPS & REVENUE ESTIMATES (Yahoo)
        ════════════════════════════════════════ */}
        {yf?.epsEstimates?.length > 0 && (
          <Card>
            <SectionHeader icon={<Eye size={13}/>} title="EPS & Revenue Estimates" accent="#0891b2" src="yahoo" />
            <div className="rc-eps-grid">
              {yf.epsEstimates.map((e, i) => {
                const periodLabel = { '0q': 'Current Quarter', '+1q': 'Next Quarter', '0y': 'Current Year', '+1y': 'Next Year' }[e.period] ?? e.period;
                return (
                  <div key={i} className="rc-eps-card">
                    <div className="rc-eps-period">{periodLabel}</div>
                    <div className="rc-eps-row"><span className="rc-eps-key">EPS Estimate</span><span className="rc-eps-val">${fmtNum(e.epsAvg)}</span></div>
                    <div className="rc-eps-row"><span className="rc-eps-key">EPS Range</span><span className="rc-eps-val">${fmtNum(e.epsLow)} – ${fmtNum(e.epsHigh)}</span></div>
                    <div className="rc-eps-row"><span className="rc-eps-key">Year-Ago EPS</span><span className="rc-eps-val">${fmtNum(e.yearAgoEps)}</span></div>
                    {e.revAvg && <div className="rc-eps-row"><span className="rc-eps-key">Rev. Estimate</span><span className="rc-eps-val">{fmtCurrency(e.revAvg)}</span></div>}
                    {e.growth != null && <div className="rc-eps-row"><span className="rc-eps-key">Growth Est.</span><span className="rc-eps-val" style={{ color: e.growth > 0 ? '#059669' : '#dc2626' }}>{fmtPctRaw(e.growth)}</span></div>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════
            7. OWNERSHIP (Yahoo)
        ════════════════════════════════════════ */}
        {yf?.ownership && (
          <Card>
            <SectionHeader icon={<Users size={13}/>} title="Institutional & Insider Ownership" accent="#7c3aed" src="yahoo" />
            <div className="rc-ownership-grid">
              {[
                { label: 'Institutional Ownership', val: yf.ownership.institutionsPercent, color: '#6366f1' },
                { label: 'Insider Ownership',       val: yf.ownership.insidersPercent,     color: '#059669' },
                { label: 'Inst. Float Held',        val: yf.ownership.institutionsFloatPercent, color: '#7c3aed' },
              ].map((item, i) => (
                <div key={i} className="rc-ownership-card">
                  <div className="rc-ownership-label">{item.label}</div>
                  <div className="rc-ownership-val">{item.val != null ? fmtPctRaw(item.val) : 'N/A'}</div>
                  {item.val != null && (
                    <div className="rc-ownership-bar">
                      <div className="rc-ownership-fill" style={{ width: `${Math.min(item.val * 100, 100)}%`, background: item.color }} />
                    </div>
                  )}
                </div>
              ))}
              {yf.ownership.institutionsCount && (
                <div className="rc-ownership-card">
                  <div className="rc-ownership-label">Total Institutions</div>
                  <div className="rc-ownership-val">{yf.ownership.institutionsCount.toLocaleString()}</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════
            8. YAHOO KEY STATISTICS
        ════════════════════════════════════════ */}
        {yf && (
          <Card>
            <SectionHeader icon={<BarChart3 size={13}/>} title="Key Statistics" accent="#d97706" src="yahoo" />
            <div className="rc-yf-grid">
              {[
                { label: 'Forward P/E',      value: fmtNum(yfk.forwardPE) },
                { label: 'PEG Ratio',        value: fmtNum(yfk.pegRatio) },
                { label: 'Price/Book',       value: fmtNum(yfk.priceToBook) },
                { label: 'Price/Sales',      value: fmtNum(yfk.priceToSales) },
                { label: 'EV/Revenue',       value: fmtNum(yfk.enterpriseToRevenue) },
                { label: 'EV/EBITDA',        value: fmtNum(yfk.enterpriseToEbitda) },
                { label: 'Beta',             value: fmtNum(yfk.beta) },
                { label: 'EPS (Trail.)',     value: `$${fmtNum(yfk.trailingEps)}` },
                { label: 'EPS (Fwd)',        value: `$${fmtNum(yfk.forwardEps)}` },
                { label: 'Shares Out.',      value: fmtLargeNum(yfk.sharesOutstanding) },
                { label: 'Short % Float',    value: yfk.shortPercentOfFloat != null ? fmtPctRaw(yfk.shortPercentOfFloat) : 'N/A' },
                { label: '52W Change',       value: yfk.weekChange52 != null ? fmtPctRaw(yfk.weekChange52) : 'N/A' },
                { label: 'Revenue Growth',   value: yfc.revenueGrowth != null ? fmtPctRaw(yfc.revenueGrowth) : 'N/A' },
                { label: 'Earnings Growth',  value: yfc.earningsGrowth != null ? fmtPctRaw(yfc.earningsGrowth) : 'N/A' },
                { label: 'EBITDA Margin',    value: yfc.ebitdaMargins != null ? fmtPctRaw(yfc.ebitdaMargins) : 'N/A' },
                { label: 'Free Cash Flow',   value: fmtCurrency(yfc.freeCashflow) },
              ].filter(c => c.value !== 'N/A' && c.value !== '$N/A').map((card, i) => (
                <div key={i} className="rc-yf-card">
                  <div className="rc-yf-label">{card.label}</div>
                  <div className="rc-yf-value">{card.value}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════
            9. SEC EDGAR OFFICIAL FILINGS
        ════════════════════════════════════════ */}
        {edgar && (
          <Card>
            <SectionHeader icon={<Award size={13}/>} title="SEC EDGAR — Official Filings" accent="#059669" src="edgar" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Latest 10-K (Annual Report)', date: edgar.filings?.latest10K?.date, url: edgar.filings?.latest10K?.url },
                { label: 'Latest 10-Q (Quarterly)',     date: edgar.filings?.latest10Q?.date, url: edgar.filings?.latest10Q?.url },
              ].map((f, i) => f.date && (
                <div key={i} style={{ padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#14532d', marginBottom: 6 }}>{f.date}</div>
                  {f.url && <a href={f.url} target="_blank" rel="noopener noreferrer" className="rc-link" style={{ fontSize: 11.5, color: '#059669' }}>View on SEC.gov →</a>}
                </div>
              ))}
              {edgar.filings?.recent8Ks?.length > 0 && (
                <div style={{ padding: '14px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Recent 8-Ks (90d)</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#78350f', marginBottom: 6 }}>{edgar.filings.recent8Ks.length} events</div>
                  <a href={edgar.filings?.edgarPageUrl} target="_blank" rel="noopener noreferrer" className="rc-link" style={{ fontSize: 11.5, color: '#d97706' }}>All Filings →</a>
                </div>
              )}
              <div style={{ padding: '14px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Entity Name (SEC)</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a', marginBottom: 6, lineHeight: 1.4 }}>{edgar.facts?.entityName ?? 'N/A'}</div>
                <a href={edgar.filings?.edgarPageUrl} target="_blank" rel="noopener noreferrer" className="rc-link" style={{ fontSize: 11.5, color: '#3b82f6' }}>Full EDGAR Profile →</a>
              </div>
            </div>

            {/* 5-year EDGAR financial data table */}
            {edgar.facts?.revenueHistory?.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>5-Year Financial History (from SEC 10-K filings)</div>
                <div className="rc-table-wrap">
                  <table className="rc-table">
                    <thead>
                      <tr style={{ background: '#f0fdf40d' }}>
                        {['Fiscal Year End', 'Revenue', 'Net Income', 'EPS Diluted', 'R&D Expense', 'Op. Cash Flow'].map((h, i) => (
                          <th key={i} className="rc-th" style={{ color: '#059669' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {edgar.facts.revenueHistory.slice(0, 5).map((rev, i) => {
                        const netIncome   = edgar.facts.netIncomeHistory?.[i]?.value;
                        const eps         = edgar.facts.epsDilutedHistory?.[i]?.value;
                        const rd          = edgar.facts.rdHistory?.[i]?.value;
                        const opCF        = edgar.facts.operatingCFHistory?.[i]?.value;
                        return (
                          <tr key={i} className="rc-tr">
                            <td className="rc-td rc-td-year">{rev.date?.slice(0, 7)}</td>
                            <td className="rc-td">{fmtCurrency(rev.value)}</td>
                            <td className="rc-td" style={{ color: netIncome > 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>{fmtCurrency(netIncome)}</td>
                            <td className="rc-td">{eps != null ? `$${fmtNum(eps)}` : '—'}</td>
                            <td className="rc-td">{fmtCurrency(rd)}</td>
                            <td className="rc-td" style={{ color: opCF > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>{fmtCurrency(opCF)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}

        {/* ════════════════════════════════════════
            10. CROSS-SOURCE COMPARISON (FMP + Yahoo + EDGAR)
        ════════════════════════════════════════ */}
        {comparisonRows.length > 0 && (
          <Card>
            <SectionHeader icon={<GitCompare size={13}/>} title="Cross-Source Data Verification" accent="#7c3aed" src="all3" />
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 14px', lineHeight: 1.6 }}>
              Same metrics reported by multiple sources. Agreement level shows how closely FMP, Yahoo Finance, and SEC EDGAR align.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>✅ HIGH — all sources within 2%</span>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#fef9c3', color: '#92400e', border: '1px solid #fde68a' }}>⚠️ MED — within 10%</span>
              <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>🔴 LOW — &gt;10% divergence</span>
            </div>
            <ComparisonTable rows={comparisonRows} />
          </Card>
        )}

        {/* ════════════════════════════════════════
            10. KEY METRICS (FMP)
        ════════════════════════════════════════ */}
        <Card>
          <SectionHeader icon={<BarChart3 size={13}/>} title="Key Metrics & Ratios" accent="#6366f1" src="fmp" />
          {kmGroups.map((group, gi) => (
            <div key={gi} className="rc-km-group">
              <div className="rc-km-group-title" style={{ color: group.accent, background: `${group.accent}12`, border: `1px solid ${group.accent}25` }}>
                {group.title}
              </div>
              <div className="rc-km-grid">
                {group.cards.map((m, i) => (
                  <div key={i} className="rc-km-card">
                    <div className="rc-km-label">
                      <span className="rc-km-icon" style={{ color: m.accent }}>{m.icon}</span>
                      {m.label}
                    </div>
                    <div className="rc-km-value">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>

        {/* ════════════════════════════════════════
            11. BULL / BEAR
        ════════════════════════════════════════ */}
        <div className="rc-bb-grid">
          <Card>
            <SectionHeader icon={<TrendingUp size={13}/>} title="Bull Case — Strengths" accent="#059669" />
            <ul className="rc-bb-list">
              {(data.strengths ?? []).map((s, i) => (
                <li key={i} className="rc-bb-item rc-bull-item">
                  <span className="rc-bull-dot">✓</span>{s}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionHeader icon={<TrendingDown size={13}/>} title="Bear Case — Risks" accent="#dc2626" />
            <ul className="rc-bb-list">
              {(data.risks ?? []).map((r, i) => (
                <li key={i} className="rc-bb-item rc-bear-item">
                  <span className="rc-bear-dot">⚠</span>{r}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ════════════════════════════════════════
            12. INCOME STATEMENT (FMP)
        ════════════════════════════════════════ */}
        {income.length > 0 && (
          <Card>
            <SectionHeader icon={<DollarSign size={13}/>} title="Income Statement (3-Year)" accent="#6366f1" src="fmp" />
            <DataTable
              accentColor="#6366f1"
              headers={['Year','Revenue','Gross Profit','Gross Margin','Op. Income','Op. Margin','Net Income','Net Margin','EPS','EBITDA']}
              rows={incomeRows}
            />
          </Card>
        )}

        {/* ════════════════════════════════════════
            13. BALANCE SHEET (FMP)
        ════════════════════════════════════════ */}
        {balance.length > 0 && (
          <Card>
            <SectionHeader icon={<Building2 size={13}/>} title="Balance Sheet (3-Year)" accent="#7c3aed" src="fmp" />
            <DataTable
              accentColor="#7c3aed"
              headers={['Year','Cash','Total Assets','Total Debt','Total Liabilities','Total Equity','Current Ratio']}
              rows={balanceRows}
            />
          </Card>
        )}

        {/* ════════════════════════════════════════
            14. CASH FLOW (FMP)
        ════════════════════════════════════════ */}
        {cashflow.length > 0 && (
          <Card>
            <SectionHeader icon={<Activity size={13}/>} title="Cash Flow Statement (3-Year)" accent="#0891b2" src="fmp" />
            <DataTable
              accentColor="#0891b2"
              headers={['Year','Operating Cash Flow','Capital Expenditure','Free Cash Flow','Dividends Paid']}
              rows={cfRows}
            />
          </Card>
        )}

        {/* ════════════════════════════════════════
            15. RECENT NEWS (FMP)
        ════════════════════════════════════════ */}
        {news.length > 0 && (
          <Card>
            <SectionHeader icon={<Newspaper size={13}/>} title="Recent News" accent="#d97706" src="fmp" />
            <div className="rc-news-list">
              {news.map((item, i) => (
                <div key={i} className="rc-news-item">
                  <div className="rc-news-top">
                    <div className="rc-news-title">{item.title}</div>
                    {item.source && <span className="rc-news-source">{item.source}</span>}
                  </div>
                  {item.summary && <p className="rc-news-summary">{item.summary}</p>}
                  {item.date && <div className="rc-news-date">{new Date(item.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ════════════════════════════════════════
            INDIA SECTION — Screener.in (shown in Overview)
        ════════════════════════════════════════ */}
        {isIndian && (<>

          {/* Shareholding Pattern */}
          {indianData?.shareholding && (
            <Card>
              <SectionHeader icon={<Users size={13}/>} title="Shareholding Pattern" accent="#c2410c" />
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>
                Latest: {indianData.shareholding.latestQuarter || 'N/A'}
              </div>
              <div className="rc-shp-grid">
                {[
                  { label: 'Promoters', val: indianData.shareholding.promoter, color: '#6366f1' },
                  { label: 'FII / Foreign', val: indianData.shareholding.fii, color: '#059669' },
                  { label: 'DII / Domestic', val: indianData.shareholding.dii, color: '#d97706' },
                  { label: 'Public / Others', val: indianData.shareholding.public, color: '#dc2626' },
                ].filter(s => s.val != null).map((s, i) => {
                  const trend = indianData.shareholding.trend;
                  let delta = null;
                  if (trend?.length >= 2) {
                    const key = s.label.toLowerCase().includes('promoter') ? 'promoter'
                      : s.label.toLowerCase().includes('fii') ? 'fii'
                      : s.label.toLowerCase().includes('dii') ? 'dii' : 'public';
                    const first = trend[0]?.[key];
                    const last = trend[trend.length - 1]?.[key];
                    if (first != null && last != null) delta = +(last - first).toFixed(2);
                  }
                  return (
                    <div key={i} className="rc-shp-card">
                      <div className="rc-shp-label">{s.label}</div>
                      <div className="rc-shp-value">{s.val}%</div>
                      <div className="rc-shp-bar">
                        <div className="rc-shp-fill" style={{ width: `${Math.min(s.val, 100)}%`, background: s.color }} />
                      </div>
                      {delta != null && (
                        <div className="rc-shp-delta" style={{ color: delta > 0 ? '#059669' : delta < 0 ? '#dc2626' : '#94a3b8' }}>
                          {delta > 0 ? '▲' : delta < 0 ? '▼' : '–'} {Math.abs(delta)}% trend
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Quarterly Results */}
          {indianData?.quarterlyResults?.length > 0 && (
            <Card>
              <SectionHeader icon={<Calendar size={13}/>} title="Quarterly Results" accent="#0891b2" />
              <DataTable
                accentColor="#0891b2"
                headers={['Quarter', 'Revenue', 'Op. Profit', 'Net Profit', 'OPM %', 'EPS']}
                rows={indianData.quarterlyResults.map((q) => [
                  { val: q.quarter, cls: 'rc-td-year' },
                  fmtCurrency(q.revenue, 'INR'),
                  fmtCurrency(q.operatingProfit, 'INR'),
                  { val: fmtCurrency(q.netProfit, 'INR'), cls: q.netProfit > 0 ? 'rc-positive' : 'rc-negative' },
                  q.opmPercent != null ? `${q.opmPercent}%` : 'N/A',
                  q.eps != null ? `₹${fmtNum(q.eps)}` : 'N/A',
                ])}
              />
            </Card>
          )}

          {/* Key Ratios Grid */}
          <Card>
            <SectionHeader icon={<BarChart3 size={13}/>} title="Key Ratios — Screener.in" accent="#c2410c" />
            <div className="rc-india-metric-grid">
              {[
                { label: 'P/E Ratio', value: fmtNum(km.peRatio) },
                { label: 'P/B Ratio', value: fmtNum(km.pbRatio) },
                { label: 'ROCE', value: km.returnOnCapitalEmployed != null ? fmtPct(km.returnOnCapitalEmployed) : 'N/A' },
                { label: 'ROE', value: km.roe != null ? fmtPct(km.roe) : 'N/A' },
                { label: 'Dividend Yield', value: km.dividendYield != null ? fmtPct(km.dividendYield) : 'N/A' },
                { label: 'Debt/Equity', value: fmtNum(km.debtToEquity) },
                { label: 'Current Ratio', value: fmtNum(km.currentRatio) },
                { label: 'EV/EBITDA', value: fmtNum(km.evToEbitda) },
                { label: 'Interest Coverage', value: fmtNum(km.interestCoverage) },
                { label: 'P/S Ratio', value: fmtNum(km.priceToSales) },
              ].filter(c => c.value !== 'N/A').map((c, i) => (
                <div key={i} className="rc-india-metric">
                  <div className="rc-india-metric-label">{c.label}</div>
                  <div className="rc-india-metric-value">{c.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Annual Income Statement */}
          {income.length > 0 && (
            <Card>
              <SectionHeader icon={<DollarSign size={13}/>} title="Annual Income Statement — Screener.in" accent="#6366f1" />
              <DataTable
                accentColor="#6366f1"
                headers={['Year', 'Revenue', 'Op. Income', 'Op. Margin', 'Net Income', 'Net Margin', 'EPS', 'EBITDA']}
                rows={income.map((d) => [
                  { val: d.year, cls: 'rc-td-year' },
                  fmtCurrency(d.revenue, 'INR'),
                  fmtCurrency(d.operatingIncome, 'INR'),
                  { val: fmtPct(d.operatingMargin), cls: 'rc-positive' },
                  { val: fmtCurrency(d.netIncome, 'INR'), cls: d.netIncome > 0 ? 'rc-positive' : 'rc-negative' },
                  { val: fmtPct(d.netMargin), cls: 'rc-positive' },
                  d.eps != null ? `₹${fmtNum(d.eps)}` : 'N/A',
                  fmtCurrency(d.ebitda, 'INR'),
                ])}
              />
            </Card>
          )}

          {/* Annual Balance Sheet */}
          {balance.length > 0 && (
            <Card>
              <SectionHeader icon={<Building2 size={13}/>} title="Annual Balance Sheet — Screener.in" accent="#7c3aed" />
              <DataTable
                accentColor="#7c3aed"
                headers={['Year', 'Cash', 'Total Assets', 'Total Debt', 'Total Liabilities', 'Total Equity']}
                rows={balance.map((d) => [
                  { val: d.year, cls: 'rc-td-year' },
                  fmtCurrency(d.cash, 'INR'),
                  fmtCurrency(d.totalAssets, 'INR'),
                  { val: fmtCurrency(d.totalDebt, 'INR'), cls: 'rc-negative' },
                  { val: fmtCurrency(d.totalLiabilities, 'INR'), cls: 'rc-negative' },
                  { val: fmtCurrency(d.totalEquity, 'INR'), cls: 'rc-positive' },
                ])}
              />
            </Card>
          )}

          {/* Annual Cash Flow */}
          {cashflow.length > 0 && (
            <Card>
              <SectionHeader icon={<Activity size={13}/>} title="Annual Cash Flow — Screener.in" accent="#0891b2" />
              <DataTable
                accentColor="#0891b2"
                headers={['Year', 'Operating CF', 'CapEx', 'Free CF', 'Dividends Paid']}
                rows={cashflow.map((d) => [
                  { val: d.year, cls: 'rc-td-year' },
                  { val: fmtCurrency(d.operatingCashFlow, 'INR'), cls: 'rc-positive' },
                  { val: fmtCurrency(d.capitalExpenditure, 'INR'), cls: 'rc-negative' },
                  { val: fmtCurrency(d.freeCashFlow, 'INR'), cls: d.freeCashFlow > 0 ? 'rc-positive' : 'rc-negative' },
                  fmtCurrency(Math.abs(d.dividendsPaid || 0), 'INR'),
                ])}
              />
            </Card>
          )}

        </>)}

        </>) /* end overview tab */}

      </div>
    </>
  );
}
