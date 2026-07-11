import { useEffect, useState } from 'react';
import { WaveLoader } from './ui/wave-loader';

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
      {/* WaveLoader animation */}
      <div style={{ margin: '0 auto 24px' }}>
        <WaveLoader bars={5} />
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
