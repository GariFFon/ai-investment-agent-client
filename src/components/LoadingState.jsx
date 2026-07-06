import { useEffect, useState } from 'react';

const STEPS = [
  'Identifying company & ticker symbol...',
  'Fetching business profile & sector...',
  'Analyzing 3 years of income statements...',
  'Reviewing balance sheet & debt levels...',
  'Evaluating free cash flow generation...',
  'Calculating valuation ratios (P/E, ROE)...',
  'Scanning recent news & market events...',
  'Comparing with industry peers...',
  'Synthesizing AI investment decision...',
];

export default function LoadingState({ company }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-card">
      {/* Animated ring */}
      <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto 24px' }}>
        <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="3.5"/>
          <circle cx="26" cy="26" r="22" fill="none"
            stroke="url(#loadGrad)" strokeWidth="3.5"
            strokeDasharray={138} strokeDashoffset={35}
            strokeLinecap="round"
            style={{ animation: 'spin 1.2s linear infinite' }}
          />
          <defs>
            <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1"/>
              <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>📊</div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
        Analyzing {company}
      </h3>
      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        AI agent is gathering data from multiple sources…
      </p>

      <ul className="loading-steps">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className={`loading-step ${i < activeStep ? 'done' : i === activeStep ? 'active' : ''}`}
          >
            <span className="step-dot" />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
