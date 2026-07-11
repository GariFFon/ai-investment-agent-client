import { useEffect, useState } from 'react';
import { getHistory } from '../services/api';

const DATA_SOURCES = [
  {
    name: 'Financial Modeling Prep',
    short: 'FMP',
    color: '#1d4ed8',
    bg: '#dbeafe',
    border: '#bfdbfe',
    emoji: '🔵',
    provides: ['Profile', 'Financials', 'Ratios', 'News', 'Peers'],
    url: 'https://financialmodelingprep.com',
  },
  {
    name: 'Yahoo Finance',
    short: 'Yahoo',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d',
    emoji: '🟡',
    provides: ['Analyst Ratings', 'Ownership', 'EPS Estimates', 'Upgrades'],
    url: 'https://finance.yahoo.com',
  },
  {
    name: 'SEC EDGAR',
    short: 'EDGAR',
    color: '#166534',
    bg: '#dcfce7',
    border: '#bbf7d0',
    emoji: '🟢',
    provides: ['10-K / 10-Q Filings', '5-Yr Revenue', 'EPS History', 'R&D Spend', '8-K Events'],
    url: 'https://www.sec.gov/cgi-bin/browse-edgar',
  },
  {
    name: 'Screener.in',
    short: 'Screener',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fed7aa',
    emoji: '🇮🇳',
    provides: ['Indian Financials', 'Shareholding', 'Historical Ratios', 'Quarterly Results'],
    url: 'https://www.screener.in',
  },
];



export default function HistoryPanel({ onSelect, refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => {});
  }, [refreshTrigger]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
      {/* ── Recent Analyses ── */}
      <p className="sidebar-title">Recent Analyses</p>
      <div className="history-list" style={{ flex: 1, overflowY: 'auto' }}>
        {history.length === 0 && (
          <p className="no-history">No analyses yet.<br/>Search a company to begin.</p>
        )}
        {history.map((item) => (
          <div
            key={item._id}
            className="history-item"
            onClick={() => onSelect(item)}
          >
            <div style={{ width: '100%' }}>
              <div className="history-company">{item.companyName}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <div className="history-ticker">{item.ticker}</div>
                {item.verdict && (
                  <span className={`history-verdict ${item.verdict?.toLowerCase()}`}>
                    {item.verdict}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Data Sources ── */}
      <div className="sidebar-sources">
        <button
          className="sidebar-sources-toggle"
          onClick={() => setShowSources((s) => !s)}
          aria-expanded={showSources}
        >
          <span className="sidebar-title" style={{ margin: 0 }}>Data Sources</span>
          <span className="sidebar-sources-chevron">{showSources ? '▲' : '▼'}</span>
        </button>

        {showSources && (
          <div className="sidebar-sources-list">
            {DATA_SOURCES.map((src) => (
              <a
                key={src.short}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-source-item"
                style={{ '--src-color': src.color, '--src-bg': src.bg, '--src-border': src.border }}
              >
                <div className="sidebar-source-header">
                  <span className="sidebar-source-emoji">{src.emoji}</span>
                  <span className="sidebar-source-name">{src.name}</span>
                  <span className="sidebar-source-ext">↗</span>
                </div>
                <div className="sidebar-source-tags">
                  {src.provides.map((p) => (
                    <span key={p} className="sidebar-source-tag">{p}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
