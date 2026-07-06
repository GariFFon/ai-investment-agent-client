import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Building2, Users, Globe,
  Calendar, Activity, ExternalLink, DollarSign, Percent,
  BarChart3, ChevronDown, ChevronUp, Tag, Zap, Newspaper,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const fmtCurrency = (v) => {
  if (v == null || isNaN(v)) return 'N/A';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  return `${sign}$${abs.toFixed(2)}`;
};
const fmtNum    = (v, dec = 2) => (v == null || isNaN(v) ? 'N/A' : Number(v).toFixed(dec));
const fmtPct    = (v, dec = 2) => (v == null || isNaN(v) ? 'N/A' : `${Number(v * (Math.abs(v) < 2 ? 100 : 1)).toFixed(dec)}%`);
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
   Reusable card wrapper
───────────────────────────────────────────────────────────────────────────── */
function Card({ children, style, className = '' }) {
  return (
    <div className={`rc-card ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Section header
───────────────────────────────────────────────────────────────────────────── */
function SectionHeader({ icon, title, accent = '#6366f1' }) {
  return (
    <div className="rc-section-header">
      <div className="rc-section-accent" style={{ background: accent }} />
      <span className="rc-section-icon" style={{ color: accent }}>{icon}</span>
      <h3 className="rc-section-title">{title}</h3>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stat Item (profile meta)
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
   Financial Table
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
                  {typeof cell === 'object' && cell?.val !== undefined ? cell.val : cell}
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
   Main ResultCard
───────────────────────────────────────────────────────────────────────────── */
export default function ResultCard({ data }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const vc = VERDICT_CFG[data.verdict] ?? VERDICT_CFG.HOLD;
  const raw = data.rawData ?? {};
  const profile  = raw.companyProfile  ?? {};
  const income   = raw.incomeStatement ?? [];
  const balance  = raw.balanceSheet    ?? [];
  const cashflow = raw.cashFlow        ?? [];
  const km       = raw.keyMetrics      ?? {};
  const news     = raw.recentNews      ?? [];
  const peers    = raw.peers           ?? [];

  /* Table rows */
  const incomeRows = income.map((d) => [
    { val: d.year, cls: 'rc-td-year' },
    fmtCurrency(d.revenue),
    fmtCurrency(d.grossProfit),
    { val: fmtPct(d.grossMargin), cls: 'rc-positive' },
    fmtCurrency(d.operatingIncome),
    { val: fmtPct(d.operatingMargin), cls: 'rc-positive' },
    fmtCurrency(d.netIncome),
    { val: fmtPct(d.netMargin), cls: 'rc-positive' },
    `$${fmtNum(d.eps)}`,
    fmtCurrency(d.ebitda),
  ]);

  const balanceRows = balance.map((d) => [
    { val: d.year, cls: 'rc-td-year' },
    fmtCurrency(d.cash),
    fmtCurrency(d.totalAssets),
    { val: fmtCurrency(d.totalDebt), cls: 'rc-negative' },
    { val: fmtCurrency(d.totalLiabilities), cls: 'rc-negative' },
    { val: fmtCurrency(d.totalEquity), cls: 'rc-positive' },
    { val: fmtNum(d.currentRatio), cls: d.currentRatio >= 1 ? 'rc-positive' : 'rc-negative' },
  ]);

  const cfRows = cashflow.map((d) => [
    { val: d.year, cls: 'rc-td-year' },
    { val: fmtCurrency(d.operatingCashFlow), cls: 'rc-positive' },
    { val: fmtCurrency(d.capitalExpenditure), cls: 'rc-negative' },
    { val: fmtCurrency(d.freeCashFlow), cls: d.freeCashFlow > 0 ? 'rc-positive' : 'rc-negative' },
    fmtCurrency(Math.abs(d.dividendsPaid)),
  ]);

  const kmCards = [
    { label: 'P/E Ratio',         value: fmtNum(km.peRatio),          icon: <Activity size={13}/>,      accent: '#6366f1' },
    { label: 'P/B Ratio',         value: fmtNum(km.pbRatio),          icon: <BarChart3 size={13}/>,     accent: '#8b5cf6' },
    { label: 'EV/EBITDA',         value: fmtNum(km.evToEbitda),       icon: <DollarSign size={13}/>,    accent: '#7c3aed' },
    { label: 'Price/Sales',       value: fmtNum(km.priceToSales),     icon: <TrendingUp size={13}/>,    accent: '#6366f1' },
    { label: 'Debt/Equity',       value: fmtNum(km.debtToEquity),     icon: <TrendingDown size={13}/>,  accent: '#e11d48' },
    { label: 'ROE',               value: fmtPct(km.roe),              icon: <Percent size={13}/>,       accent: '#059669' },
    { label: 'ROA',               value: fmtPct(km.roa),              icon: <Percent size={13}/>,       accent: '#0891b2' },
    { label: 'Interest Coverage', value: fmtNum(km.interestCoverage), icon: <Activity size={13}/>,      accent: '#d97706' },
    { label: 'Dividend Yield',    value: fmtPct(km.dividendYield),    icon: <DollarSign size={13}/>,    accent: '#7c3aed' },
    { label: 'Payout Ratio',      value: fmtPct(km.payoutRatio),      icon: <Percent size={13}/>,       accent: '#059669' },
  ];

  return (
    <>
      {/* ── Scoped Styles ── */}
      <style>{`
        /* Layout */
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

        /* Card base */
        .rc-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(15,23,42,0.05), 0 4px 12px rgba(99,102,241,0.05);
          transition: box-shadow 0.22s ease;
        }
        .rc-card:hover {
          box-shadow: 0 2px 8px rgba(15,23,42,0.07), 0 8px 24px rgba(99,102,241,0.08);
        }

        /* Section header */
        .rc-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .rc-section-accent {
          width: 3px;
          height: 18px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .rc-section-icon { display: flex; align-items: center; }
        .rc-section-title {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }

        /* Company header */
        .rc-company-name {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0 0 10px;
          line-height: 1.2;
        }
        .rc-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .rc-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 7px;
          font-size: 11.5px;
          font-weight: 700;
          border: 1px solid;
          letter-spacing: 0.01em;
        }
        .rc-badge-ticker   { background: #ede9fe; border-color: #c4b5fd; color: #5b21b6; font-family: 'Courier New', monospace; }
        .rc-badge-sector   { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
        .rc-badge-industry { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
        .rc-badge-exchange { background: #fdf4ff; border-color: #e9d5ff; color: #7e22ce; }
        .rc-badge-cache    { background: #f8fafc; border-color: #e2e8f0; color: #94a3b8; font-size: 10.5px; padding: 2px 9px; border-radius: 100px; }

        /* Price block */
        .rc-price-block { text-align: right; flex-shrink: 0; }
        .rc-price { font-size: 30px; font-weight: 900; color: #6366f1; line-height: 1; letter-spacing: -0.02em; }
        .rc-beta { font-size: 11.5px; color: #94a3b8; margin-top: 4px; }

        /* Description */
        .rc-description {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.7;
          margin: 16px 0 0;
          padding-top: 16px;
          border-top: 1px solid rgba(15,23,42,0.06);
        }

        /* Profile stats grid */
        .rc-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(15,23,42,0.06);
        }
        .rc-stat-item { display: flex; align-items: flex-start; gap: 9px; }
        .rc-stat-icon { color: #6366f1; margin-top: 1px; flex-shrink: 0; }
        .rc-stat-label { font-size: 10.5px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .rc-stat-value { font-size: 13px; color: #0f172a; font-weight: 600; margin-top: 2px; }
        .rc-link { font-size: 13px; color: #6366f1; font-weight: 600; text-decoration: none; margin-top: 2px; display: block; }
        .rc-link:hover { text-decoration: underline; }

        /* Peers */
        .rc-peers { margin-top: 16px; }
        .rc-peers-label { font-size: 10.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 600; margin-bottom: 8px; }
        .rc-peers-list { display: flex; flex-wrap: wrap; gap: 5px; }
        .rc-peer-chip {
          padding: 3px 10px;
          background: #f8fafc;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          transition: all 0.15s ease;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.03em;
        }
        .rc-peer-chip:hover { background: #ede9fe; border-color: #c4b5fd; color: #5b21b6; }

        /* ── Verdict ── */
        .rc-verdict-grid {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .rc-verdict-pill {
          padding: 16px 40px;
          border-radius: 14px;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.08em;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .rc-verdict-icon {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
          border: 2px solid;
        }
        .rc-confidence-side { flex: 1; min-width: 180px; }
        .rc-conf-label { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 8px; font-weight: 500; }
        .rc-conf-bar { height: 6px; background: rgba(99,102,241,0.1); border-radius: 100px; overflow: hidden; }
        .rc-conf-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

        /* Reasoning toggle */
        .rc-reasoning-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: rgba(99,102,241,0.04);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 10px;
          cursor: pointer;
          padding: 12px 16px;
          font-family: inherit;
          margin-top: 20px;
          transition: background 0.15s ease;
        }
        .rc-reasoning-btn:hover { background: rgba(99,102,241,0.07); }
        .rc-reasoning-label { font-size: 13px; font-weight: 700; color: #6366f1; display: flex; align-items: center; gap: 6px; }
        .rc-reasoning-text { padding-top: 16px; font-size: 14px; color: #475569; line-height: 1.8; }

        /* ── Metrics grid ── */
        .rc-km-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
        }
        .rc-km-card {
          background: linear-gradient(135deg, #f8faff 0%, #f5f3ff 100%);
          border: 1px solid rgba(99,102,241,0.1);
          border-radius: 12px;
          padding: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .rc-km-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.2);
        }
        .rc-km-label {
          font-size: 10.5px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        .rc-km-value { font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }
        .rc-km-icon { flex-shrink: 0; }

        /* ── Bull / Bear ── */
        .rc-bb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) { .rc-bb-grid { grid-template-columns: 1fr; } }

        .rc-bb-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .rc-bb-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          color: #334155;
          line-height: 1.55;
          animation: rcFadeUp 0.4s ease both;
          border: 1px solid;
          transition: transform 0.15s ease;
        }
        .rc-bb-item:hover { transform: translateX(2px); }
        .rc-bb-item:nth-child(1){animation-delay:.05s} .rc-bb-item:nth-child(2){animation-delay:.10s}
        .rc-bb-item:nth-child(3){animation-delay:.15s} .rc-bb-item:nth-child(4){animation-delay:.20s}
        .rc-bb-item:nth-child(5){animation-delay:.25s}
        .rc-bull-item { background: #f0fdf4; border-color: #bbf7d0; }
        .rc-bear-item { background: #fef2f2; border-color: #fecaca; }
        .rc-bull-dot { color: #059669; font-weight: 900; flex-shrink: 0; font-size: 14px; }
        .rc-bear-dot { color: #dc2626; font-weight: 900; flex-shrink: 0; font-size: 14px; }

        /* ── Tables ── */
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

        /* ── News ── */
        .rc-news-list { display: flex; flex-direction: column; gap: 10px; }
        .rc-news-item {
          padding: 16px;
          background: #f8fafc;
          border: 1px solid rgba(15,23,42,0.07);
          border-radius: 12px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
          cursor: default;
        }
        .rc-news-item:hover {
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 2px 12px rgba(99,102,241,0.08);
          transform: translateY(-1px);
        }
        .rc-news-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .rc-news-title { font-size: 13.5px; font-weight: 700; color: #0f172a; line-height: 1.4; }
        .rc-news-source { font-size: 10px; font-weight: 800; padding: 2px 9px; background: #ede9fe; color: #5b21b6; border-radius: 100px; white-space: nowrap; flex-shrink: 0; letter-spacing: 0.03em; }
        .rc-news-summary { font-size: 13px; color: #475569; line-height: 1.6; }
        .rc-news-date { font-size: 11px; color: #94a3b8; margin-top: 8px; font-weight: 500; }

        /* ── Header layout ── */
        .rc-header-flex { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
      `}</style>

      <div className="rc-dashboard">

        {/* ════════════════════════════════════════
            1. COMPANY HEADER
        ════════════════════════════════════════ */}
        <Card>
          <div className="rc-header-flex">
            {/* Left: name + badges */}
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

            {/* Right: live price */}
            {profile.price != null && (
              <div className="rc-price-block">
                <div className="rc-price">${fmtNum(profile.price)}</div>
                <div className="rc-beta">β {fmtNum(profile.beta)}</div>
              </div>
            )}
          </div>

          {/* Profile meta-stats */}
          <div className="rc-stats-grid">
            {profile.ceo       && <StatItem icon={<Building2 size={13}/>} label="CEO"       value={profile.ceo} />}
            {profile.employees && <StatItem icon={<Users size={13}/>}     label="Employees" value={fmtLargeNum(profile.employees)} />}
            {profile.country   && <StatItem icon={<Globe size={13}/>}     label="Country"   value={profile.country} />}
            {profile.ipoDate   && <StatItem icon={<Calendar size={13}/>}  label="IPO Date"  value={profile.ipoDate} />}
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
            {/* Verdict pill */}
            <div className="rc-verdict-pill" style={{ background: vc.bg, borderColor: vc.border, color: vc.color, boxShadow: `0 6px 24px ${vc.glow}` }}>
              <div className="rc-verdict-icon" style={{ background: `${vc.color}15`, borderColor: vc.border, color: vc.color }}>
                {vc.icon}
              </div>
              {vc.label}
            </div>

            {/* Confidence bar */}
            <div className="rc-confidence-side">
              <div className="rc-conf-label">
                <span>AI Confidence</span>
                <span style={{ fontWeight: 800, color: '#6366f1' }}>{data.confidence}%</span>
              </div>
              <div className="rc-conf-bar">
                <div className="rc-conf-fill" style={{ width: `${data.confidence}%` }} />
              </div>
            </div>

            {/* Ring */}
            <ConfidenceRing confidence={data.confidence} />
          </div>

          {/* Investment reasoning (collapsible) */}
          {data.investmentReasoning && (
            <button className="rc-reasoning-btn" onClick={() => setReasoningOpen(!reasoningOpen)}>
              <span className="rc-reasoning-label">
                <Activity size={13}/> AI Reasoning
              </span>
              {reasoningOpen ? <ChevronUp size={15} color="#6366f1"/> : <ChevronDown size={15} color="#6366f1"/>}
            </button>
          )}
          {reasoningOpen && (
            <div className="rc-reasoning-text">{data.investmentReasoning}</div>
          )}
        </Card>

        {/* ════════════════════════════════════════
            3. KEY METRICS (10 cards)
        ════════════════════════════════════════ */}
        <Card>
          <SectionHeader icon={<BarChart3 size={13}/>} title="Key Metrics & Ratios" accent="#6366f1" />
          <div className="rc-km-grid">
            {kmCards.map((m, i) => (
              <div key={i} className="rc-km-card">
                <div className="rc-km-label">
                  <span className="rc-km-icon" style={{ color: m.accent }}>{m.icon}</span>
                  {m.label}
                </div>
                <div className="rc-km-value">{m.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* ════════════════════════════════════════
            4. BULL / BEAR
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
            5. INCOME STATEMENT
        ════════════════════════════════════════ */}
        {income.length > 0 && (
          <Card>
            <SectionHeader icon={<DollarSign size={13}/>} title="Income Statement (3-Year)" accent="#6366f1" />
            <DataTable
              accentColor="#6366f1"
              headers={['Year','Revenue','Gross Profit','Gross Margin','Op. Income','Op. Margin','Net Income','Net Margin','EPS','EBITDA']}
              rows={incomeRows}
            />
          </Card>
        )}

        {/* ════════════════════════════════════════
            6. BALANCE SHEET
        ════════════════════════════════════════ */}
        {balance.length > 0 && (
          <Card>
            <SectionHeader icon={<Building2 size={13}/>} title="Balance Sheet (3-Year)" accent="#7c3aed" />
            <DataTable
              accentColor="#7c3aed"
              headers={['Year','Cash','Total Assets','Total Debt','Total Liabilities','Total Equity','Current Ratio']}
              rows={balanceRows}
            />
          </Card>
        )}

        {/* ════════════════════════════════════════
            7. CASH FLOW
        ════════════════════════════════════════ */}
        {cashflow.length > 0 && (
          <Card>
            <SectionHeader icon={<Activity size={13}/>} title="Cash Flow Statement (3-Year)" accent="#0891b2" />
            <DataTable
              accentColor="#0891b2"
              headers={['Year','Operating Cash Flow','Capital Expenditure','Free Cash Flow','Dividends Paid']}
              rows={cfRows}
            />
          </Card>
        )}

        {/* ════════════════════════════════════════
            8. RECENT NEWS
        ════════════════════════════════════════ */}
        {news.length > 0 && (
          <Card>
            <SectionHeader icon={<Newspaper size={13}/>} title="Recent News" accent="#d97706" />
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

      </div>
    </>
  );
}
