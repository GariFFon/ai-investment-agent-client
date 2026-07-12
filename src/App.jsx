import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import { analyzeCompany, reanalyzeCompany, getCompany, searchCompanies, getNews } from './services/api';
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

/* ── Relative time helper ─────────────────────────────────────────────── */
function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Topic badge colours ──────────────────────────────────────────────── */
const TOPIC_COLOURS = {
  'S&P 500': 'var(--accent)',
  'NASDAQ': '#06b6d4',
  'Bitcoin': '#f59e0b',
  'Top Stocks': '#10b981',
};

/* ── Single news card ─────────────────────────────────────────────────── */
function NewsCard({ item, index }) {
  const colour = TOPIC_COLOURS[item.topic] || 'var(--accent)';
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="news-card"
      style={{ '--i': index, '--topic-color': colour }}
    >
      <div className="news-card-top">
        <span className="news-topic-badge" style={{ background: colour + '22', color: colour, borderColor: colour + '44' }}>
          {item.topic}
        </span>
        <span className="news-time">{timeAgo(item.pubDate)}</span>
      </div>
      <h3 className="news-title">{item.title}</h3>
      {item.description && <p className="news-desc">{item.description}</p>}
      <div className="news-card-footer">
        <span className="news-source">📰 {item.source}</span>
        <span className="news-arrow">→</span>
      </div>
    </a>
  );
}

/* ── Skeleton card ────────────────────────────────────────────────────── */
function NewsCardSkeleton({ index }) {
  return (
    <div className="news-card news-card-skeleton" style={{ '--i': index }}>
      <div className="skel skel-badge" />
      <div className="skel skel-title" />
      <div className="skel skel-title skel-title-short" />
      <div className="skel skel-desc" />
      <div className="skel skel-desc skel-desc-short" />
    </div>
  );
}

/* ── Market News Feed (replaces bland EmptyState) ─────────────────────── */
function MarketNewsFeed({ onSearch }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [filter, setFilter] = useState('All');

  const topics = ['All', 'S&P 500', 'NASDAQ', 'Bitcoin', 'Top Stocks'];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNews()
      .then((data) => {
        if (!cancelled) {
          setNews(data.news || []);
          setFetchedAt(data.fetchedAt);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load news. Please try again later.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'All' ? news : news.filter((n) => n.topic === filter);

  return (
    <div className="market-news-feed">
      {/* Header */}
      <div className="news-feed-header">
        <div className="news-feed-header-left">
          <div className="news-live-dot" />
          <h2 className="news-feed-title">Market News</h2>
          {fetchedAt && (
            <span className="news-feed-updated">Updated {timeAgo(fetchedAt)}</span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="news-filter-tabs">
        {topics.map((t) => (
          <button
            key={t}
            className={`news-filter-tab${filter === t ? ' active' : ''}`}
            onClick={() => setFilter(t)}
            style={filter === t ? { '--tab-color': TOPIC_COLOURS[t] || 'var(--accent)' } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="news-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div className="news-grid">
        {loading
          ? [...Array(9)].map((_, i) => <NewsCardSkeleton key={i} index={i} />)
          : filtered.map((item, i) => <NewsCard key={item.link} item={item} index={i} />)
        }
        {!loading && !error && filtered.length === 0 && (
          <div className="news-empty">No news for this topic right now.</div>
        )}
      </div>

      {/* Footer hint */}
      <p className="news-feed-hint">Search a company above to get AI-powered analysis · Try: NVIDIA · Apple · Reliance · Infosys</p>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply direct blur to page content when spotlight is open (more reliable than backdrop-filter)
  useEffect(() => {
    if (showSpotlight) {
      document.body.classList.add('spotlight-open');
    } else {
      document.body.classList.remove('spotlight-open');
    }
    return () => document.body.classList.remove('spotlight-open');
  }, [showSpotlight]);

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
          onSelect={(name, ticker) => { setSidebarOpen(false); handleSearch(name, ticker); }}
        />
      )}

      {/* ── Mobile Top-Bar ── */}
      <header className="mobile-topbar">
        <button
          className="mobile-hamburger"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line${sidebarOpen ? ' open' : ''}`} />
          <span className={`hamburger-line${sidebarOpen ? ' open' : ''}`} />
          <span className={`hamburger-line${sidebarOpen ? ' open' : ''}`} />
        </button>
        <Link to="/" className="mobile-logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 13 }}>📈</div>
          <span className="mobile-logo-text">IntellyInvest</span>
        </Link>
        <button
          className="mobile-search-btn"
          onClick={() => setShowSpotlight(true)}
          disabled={loading}
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </header>

      {/* ── Sidebar Backdrop (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-mobile-open' : ''}`}>
        <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
          <div className="logo-icon">📈</div>
          <h2>IntellyInvest</h2>
        </Link>

        <div className="new-analysis-btn-wrapper">
          <button
            className="new-analysis-btn"
            onClick={() => { setSidebarOpen(false); setShowSpotlight(true); }}
            disabled={loading}
          >
            <span className="new-analysis-plus">+</span>
            New Analysis
            <kbd className="new-analysis-kbd">⌘K</kbd>
          </button>
        </div>

        <HistoryPanel onSelect={(item) => { setSidebarOpen(false); handleHistorySelect(item); }} refreshTrigger={refreshHistory} />
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
          <MarketNewsFeed onSearch={() => setShowSpotlight(true)} />
        )}
      </main>
    </div>
  );
}
