import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import { analyzeCompany, reanalyzeCompany, getCompany, searchCompanies } from './services/api';
import './index.css';

/* ── Debounce hook ───────────────────────────────────────────────────────── */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/* ── Spotlight Search Modal ─────────────────────────────────────────────── */
function SpotlightModal({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 320);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setSearching(false); return; }
    let cancelled = false;
    setSearching(true);
    searchCompanies(debouncedQuery.trim())
      .then((data) => {
        if (!cancelled) { setResults(Array.isArray(data) ? data.slice(0, 10) : []); setActiveIdx(0); }
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) {
      onSelect(results[activeIdx].name, results[activeIdx].symbol);
    }
  };

  return (
    <div className="spotlight-backdrop" onClick={handleBackdrop}>
      <div className="spotlight-modal" role="dialog" aria-label="Search company">
        {/* Search bar */}
        <div className="spotlight-input-row">
          <span className="spotlight-icon">
            {searching
              ? <span className="spotlight-spinner" />
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            }
          </span>
          <input
            ref={inputRef}
            className="spotlight-input"
            type="text"
            placeholder="Search company name or ticker…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="spotlight-clear" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
              ×
            </button>
          )}
          <kbd className="spotlight-esc" onClick={onClose}>esc</kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="spotlight-results">
            {results.map((item, idx) => (
              <li
                key={item.symbol}
                className={`spotlight-result-item${idx === activeIdx ? ' active' : ''}`}
                onClick={() => onSelect(item.name, item.symbol)}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <span className="spotlight-result-symbol">{item.symbol}</span>
                <span className="spotlight-result-name">{item.name}</span>
                <div className="spotlight-result-tags">
                  {item.exchangeShortName && (
                    <span className="spotlight-tag exchange">{item.exchangeShortName}</span>
                  )}
                  {item.currency && (
                    <span className="spotlight-tag currency">{item.currency}</span>
                  )}
                </div>
                <span className="spotlight-result-arrow">↵</span>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {debouncedQuery && !searching && results.length === 0 && (
          <div className="spotlight-empty">
            <span>No companies found for "<strong>{debouncedQuery}</strong>"</span>
          </div>
        )}

        {/* Hint footer */}
        {results.length > 0 && (
          <div className="spotlight-footer">
            <span>↑↓ navigate</span>
            <span>↵ analyze</span>
            <span>esc close</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ onSearch }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📊</div>
      <h2>No company selected</h2>
      <p>
        Search any publicly listed company to get an AI-powered analysis with financial metrics, bull &amp; bear case, and an investment verdict.
      </p>
      <button className="new-analysis-btn" style={{ marginTop: '8px', width: 'auto', padding: '12px 24px' }} onClick={onSearch}>
        <span className="new-analysis-plus">+</span>
        Search a company
        <kbd className="new-analysis-kbd">⌘K</kbd>
      </button>
      <p style={{ fontSize: '12px', color: 'var(--text-placeholder)', marginTop: '12px' }}>
        Try: NVIDIA · Apple · Tesla · Reliance · Infosys
      </p>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentCompany, setCurrentCompany] = useState('');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [showSpotlight, setShowSpotlight] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSpotlight(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = async (companyName, ticker) => {
    setShowSpotlight(false);
    setLoading(true);
    setResult(null);
    setError(null);
    setCurrentCompany(companyName);
    try {
      const data = await analyzeCompany(companyName, ticker);
      setResult(data);
      setRefreshHistory((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!result) return;
    setLoading(true);
    setError(null);
    setCurrentCompany(result.companyName);
    try {
      const data = await reanalyzeCompany(result.companyName, result.ticker);
      setResult(data);
      setRefreshHistory((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Reanalysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = async (item) => {
    try {
      const data = await getCompany(item.ticker);
      setResult({ ...data, cached: true, cachedAt: data.fetchedAt });
      setError(null);
    } catch {
      setError('Could not load cached data');
    }
  };

  return (
    <div className="app">
      {showSpotlight && (
        <SpotlightModal
          onClose={() => setShowSpotlight(false)}
          onSelect={(name, ticker) => handleSearch(name, ticker)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon">📈</div>
          <h2>InvestIQ</h2>
        </Link>

        <button
          className="new-analysis-btn"
          onClick={() => setShowSpotlight(true)}
          disabled={loading}
        >
          <span className="new-analysis-plus">+</span>
          New Analysis
          <kbd className="new-analysis-kbd">⌘K</kbd>
        </button>

        <HistoryPanel onSelect={handleHistorySelect} refreshTrigger={refreshHistory} />
      </aside>

      {/* ── Main ── */}
      <main className="main">
        {loading && <LoadingState company={currentCompany} />}

        {error && !loading && (
          <div className="error-card">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {result && !loading && <ResultCard data={result} onReanalyze={handleReanalyze} />}

        {!result && !loading && !error && (
          <EmptyState onSearch={() => setShowSpotlight(true)} />
        )}
      </main>
    </div>
  );
}
