const fmt = (val, fallback = 'N/A') => (val == null ? fallback : val);

export default function MetricGrid({ financialSummary: f }) {
  if (!f) return null;

  const metrics = [
    { label: 'Revenue', value: fmt(f.revenue), type: 'neutral' },
    { label: 'Revenue Growth', value: fmt(f.revenueGrowth), type: f.revenueGrowth?.startsWith('+') ? 'positive' : 'negative' },
    { label: 'Net Margin', value: fmt(f.netMargin), type: 'positive' },
    { label: 'Gross Margin', value: fmt(f.grossMargin), type: 'positive' },
    { label: 'P/E Ratio', value: fmt(f.peRatio), type: 'neutral' },
    { label: 'EV/EBITDA', value: fmt(f.evEbitda), type: 'neutral' },
    { label: 'Debt/Equity', value: fmt(f.debtToEquity), type: f.debtToEquity > 2 ? 'negative' : 'positive' },
    { label: 'Current Ratio', value: fmt(f.currentRatio), type: f.currentRatio < 1 ? 'negative' : 'positive' },
    { label: 'ROE', value: fmt(f.roe), type: 'positive' },
    { label: 'ROCE', value: fmt(f.roce), type: 'positive' },
    { label: 'Free Cash Flow', value: fmt(f.freeCashFlow), type: 'positive' },
    { label: 'Market Cap', value: fmt(f.marketCap), type: 'neutral' },
  ];

  return (
    <div className="metrics-section">
      <p className="section-title">📊 Financial Metrics</p>
      <div className="metrics-grid">
        {metrics.map((m) => (
          <div className="metric-item" key={m.label}>
            <div className="metric-label">{m.label}</div>
            <div className={`metric-value ${m.type}`}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
