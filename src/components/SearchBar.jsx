import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCompanies } from '../services/api';

const EXCHANGE_OPTIONS = ['All Exchanges', 'NSE', 'BSE', 'NASDAQ', 'NYSE', 'LSE', 'ASX', 'HKSE', 'FSX', 'OTC', 'TWO', 'JPX', 'VIE', 'IOB', 'JKT'];
const CURRENCY_OPTIONS = ['All Currencies', 'INR', 'USD', 'EUR', 'AUD', 'HKD', 'TWD', 'JPY', 'IDR'];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);   // { symbol, name, exchange, exchangeFullName, currency }
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [filterExchange, setFilterExchange] = useState('All Exchanges');
  const [filterCurrency, setFilterCurrency] = useState('All Currencies');
  const debouncedQuery = useDebounce(query, 350);
  const containerRef = useRef(null);

  // Fetch results when query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setFiltered([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchCompanies(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        }
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Apply filters whenever results or filter values change
  useEffect(() => {
    let list = results;
    if (filterExchange !== 'All Exchanges') {
      list = list.filter((r) => r.exchange === filterExchange || r.exchangeFullName === filterExchange);
    }
    if (filterCurrency !== 'All Currencies') {
      list = list.filter((r) => r.currency === filterCurrency);
    }
    setFiltered(list);
  }, [results, filterExchange, filterCurrency]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (company) => {
    setSelected(company);
    setQuery(company.name);
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected && !query.trim()) return;
    // If user manually typed without selecting, pass raw name
    onSearch(selected ? selected.name : query.trim(), selected?.symbol);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelected(null);  // Clear selection on new typing
    if (e.target.value.length < 2) setShowDropdown(false);
  };

  const clearSelection = () => {
    setQuery('');
    setSelected(null);
    setResults([]);
    setShowDropdown(false);
  };

  // Unique exchanges and currencies from current results for dynamic filter options
  const availableExchanges = ['All Exchanges', ...new Set(results.map(r => r.exchange).filter(Boolean))];
  const availableCurrencies = ['All Currencies', ...new Set(results.map(r => r.currency).filter(Boolean))];

  return (
    <div className="search-section" ref={containerRef}>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <input
            id="company-search"
            className="search-input"
            type="text"
            placeholder="Enter company name... e.g. Apple, Reliance, Tesla"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (results.length) setShowDropdown(true); }}
            disabled={loading}
            autoComplete="off"
          />
          {searching && <span className="search-spinner" />}
          {query && !loading && (
            <button type="button" className="search-clear" onClick={clearSelection} aria-label="Clear">✕</button>
          )}

          {/* ── Dropdown ─────────────────────────────────────────────────────── */}
          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {/* Filters bar */}
              <div className="dropdown-filters">
                <span className="filter-label">Filter:</span>
                <select
                  className="filter-select"
                  value={filterExchange}
                  onChange={(e) => setFilterExchange(e.target.value)}
                >
                  {availableExchanges.map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={filterCurrency}
                  onChange={(e) => setFilterCurrency(e.target.value)}
                >
                  {availableCurrencies.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
                <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Results list */}
              <ul className="dropdown-list">
                {filtered.length === 0 ? (
                  <li className="dropdown-empty">No results match the filters</li>
                ) : (
                  filtered.map((company) => (
                    <li
                      key={company.symbol}
                      className="dropdown-item"
                      onMouseDown={() => handleSelect(company)}
                    >
                      <div className="dropdown-item-left">
                        <span className="dropdown-symbol">{company.symbol}</span>
                        <span className="dropdown-name">{company.name}</span>
                      </div>
                      <div className="dropdown-item-right">
                        <span className="dropdown-tag exchange">{company.exchange}</span>
                        <span className="dropdown-tag currency">{company.currency}</span>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              {/* Footer: full exchange name for hovered item hint */}
              {filtered.length > 0 && (
                <div className="dropdown-footer">
                  {results.length} total · {filtered.length} shown after filters
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="search-btn"
          type="submit"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Researching...' : '🔍 Analyze'}
        </button>
      </form>

      {/* Selected company confirmation chip */}
      {selected && (
        <div className="selected-chip">
          <span className="selected-chip-icon">✅</span>
          <span className="selected-chip-text">
            <strong>{selected.name}</strong> · {selected.symbol} · {selected.exchangeFullName} · {selected.currency}
          </span>
          <button className="selected-chip-clear" onClick={clearSelection}>✕</button>
        </div>
      )}
    </div>
  );
}
