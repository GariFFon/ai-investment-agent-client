export default function StrengthRisk({ strengths = [], risks = [] }) {
  return (
    <div className="strength-risk-grid">
      <div className="strength-card">
        <p className="sr-title bull">🟢 Bull Case — Strengths</p>
        <ul className="sr-list">
          {strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div className="risk-card">
        <p className="sr-title bear">🔴 Bear Case — Risks</p>
        <ul className="sr-list">
          {risks.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </div>
  );
}
