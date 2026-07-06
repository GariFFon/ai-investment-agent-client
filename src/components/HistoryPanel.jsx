import { useEffect, useState } from 'react';
import { getHistory } from '../services/api';

export default function HistoryPanel({ onSelect, refreshTrigger }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => {});
  }, [refreshTrigger]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <p className="sidebar-title">Recent Analyses</p>
      <div className="history-list">
        {history.length === 0 && (
          <p className="no-history">No analyses yet.<br/>Search a company to begin.</p>
        )}
        {history.map((item) => (
          <div
            key={item._id}
            className="history-item"
            onClick={() => onSelect(item)}
          >
            <div>
              <div className="history-company">{item.companyName}</div>
              <div className="history-ticker">{item.ticker}</div>
            </div>
            {item.verdict && (
              <span className={`history-verdict ${item.verdict?.toLowerCase()}`}>
                {item.verdict}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
