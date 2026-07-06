import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';


/* ── Animated counter ──────────────────────────────────────────────────────── */
function Counter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Architecture step ─────────────────────────────────────────────────────── */
function ArchStep({ number, icon, title, desc, color, delay }) {
  return (
    <div className="lp-arch-step" style={{ '--delay': delay, '--color': color }}>
      <div className="lp-arch-num">{number}</div>
      <div className="lp-arch-icon">{icon}</div>
      <h4 className="lp-arch-title">{title}</h4>
      <p className="lp-arch-desc">{desc}</p>
    </div>
  );
}

/* ── Feature card ──────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, gradient, delay }) {
  return (
    <div className="lp-feature-card" style={{ '--delay': delay }}>
      <div className="lp-feature-icon-wrap" style={{ background: gradient }}>{icon}</div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-desc">{desc}</p>
    </div>
  );
}

/* ── Tech badge ────────────────────────────────────────────────────────────── */
function TechBadge({ name, icon }) {
  return (
    <span className="lp-tech-badge">
      <span className="lp-tech-badge-icon">{icon}</span>
      {name}
    </span>
  );
}

/* ── Main Landing Component ────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp-root">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <div className="lp-nav-logo-icon">📈</div>
            <span className="lp-nav-logo-text">InvestIQ</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#how-it-works" className="lp-nav-link">How it works</a>
            <a href="#architecture" className="lp-nav-link">Architecture</a>
          </div>
          <button className="lp-nav-cta" onClick={() => navigate('/app')}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        {/* Background orbs */}
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />

        <div className="lp-hero-inner">
          {/* ── Left Column: text content ── */}
          <div className="lp-hero-left">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              AI-Powered Investment Intelligence
            </div>

            <h1 className="lp-hero-h1">
              Analyze any company
              <span className="lp-hero-gradient"> in seconds</span>
              <br />with AI
            </h1>

            <p className="lp-hero-sub">
              InvestIQ combines real-time financial data with Google Gemini AI to deliver
              institutional-grade company analysis — Bull case, Bear case, Key metrics,
              and an investment verdict. No subscriptions. No jargon.
            </p>

            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={() => navigate('/app')}>
                <span>Start Analyzing Free</span>
                <span className="lp-btn-arrow">→</span>
              </button>
              <a href="#how-it-works" className="lp-btn-ghost">
                See how it works ↓
              </a>
            </div>

            <div className="lp-hero-trust">
              <span className="lp-trust-dot" />
              <span>No sign-up &nbsp;·&nbsp; Free to use &nbsp;·&nbsp; Instant results</span>
            </div>
          </div>

          {/* ── Right Column: browser mockup ── */}
          <div className="lp-hero-right">
            <div className="lp-preview-card">
              <div className="lp-preview-header">
                <div className="lp-preview-dots">
                  <span /><span /><span />
                </div>
                <span className="lp-preview-url">investiq.app</span>
              </div>
              <div className="lp-preview-body">
                <div className="lp-preview-sidebar">
                  <div className="lp-preview-logo-row">
                    <div className="lp-preview-logo-box" />
                    <div className="lp-preview-logo-text" />
                  </div>
                  <div className="lp-preview-btn-mock" />
                  <div className="lp-preview-section-label" />
                  <div className="lp-preview-history-item" />
                  <div className="lp-preview-history-item" />
                  <div className="lp-preview-history-item" />
                </div>
                <div className="lp-preview-main">
                  <div className="lp-preview-company-header">
                    <div>
                      <div className="lp-preview-company-name" />
                      <div className="lp-preview-company-tags">
                        <div className="lp-preview-tag" />
                        <div className="lp-preview-tag lp-tag-green" />
                      </div>
                    </div>
                    <div className="lp-preview-price" />
                  </div>
                  <div className="lp-preview-metrics-grid">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="lp-preview-metric" />
                    ))}
                  </div>
                  <div className="lp-preview-verdict-row">
                    <div className="lp-preview-bull-card" />
                    <div className="lp-preview-bear-card" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { label: 'Data Points Analyzed', val: 20, suffix: '+' },
            { label: 'AI Model', val: '', custom: 'Gemini 2.5' },
            { label: 'Exchanges Covered', val: 100, suffix: '+' },
            { label: 'Analysis Time', val: '', custom: '~15s' },
          ].map((s, i) => (
            <div key={i} className="lp-stat-item">
              <div className="lp-stat-value">
                {s.custom ? s.custom : <Counter target={s.val} suffix={s.suffix} />}
              </div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-label">What you get</div>
          <h2 className="lp-section-h2">Everything an analyst would tell you,<br />delivered instantly</h2>
          <p className="lp-section-sub">
            InvestIQ pulls live financial data and runs it through a multi-step AI reasoning
            pipeline — giving you the kind of structured insight that would take a human analyst hours.
          </p>

          <div className="lp-features-grid">
            <FeatureCard
              icon="📊"
              title="Key Financial Metrics"
              desc="P/E, P/B, EV/EBITDA, Debt/Equity, ROA, ROE, Interest Coverage, Dividend Yield — all fetched live from Financial Modeling Prep."
              gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
              delay="0s"
            />
            <FeatureCard
              icon="🐂"
              title="Bull Case — Strengths"
              desc="The AI identifies competitive moats, growth catalysts, strong balance sheet signals, and tailwinds specific to that company."
              gradient="linear-gradient(135deg, #059669, #10b981)"
              delay="0.08s"
            />
            <FeatureCard
              icon="🐻"
              title="Bear Case — Risks"
              desc="Every potential downside is surfaced — valuation risk, debt concerns, macro headwinds, competitive threats, and sector challenges."
              gradient="linear-gradient(135deg, #dc2626, #f87171)"
              delay="0.16s"
            />
            <FeatureCard
              icon="⚖️"
              title="Investment Verdict"
              desc="A clear INVEST / HOLD / PASS verdict with a confidence score, backed by reasoned analysis — not just a number."
              gradient="linear-gradient(135deg, #d97706, #f59e0b)"
              delay="0.24s"
            />
            <FeatureCard
              icon="🔍"
              title="Spotlight Company Search"
              desc="Mac-style search bar. Type any company name, get instant live results with exchange, currency, and ticker info."
              gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)"
              delay="0.32s"
            />
            <FeatureCard
              icon="⚡"
              title="Smart Caching"
              desc="Analyzed companies are cached locally. Revisit any previous analysis instantly from your Recent Analyses sidebar — no repeat API calls."
              gradient="linear-gradient(135deg, #7c3aed, #a78bfa)"
              delay="0.4s"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="how-it-works">
        <div className="lp-section-inner">
          <div className="lp-section-label lp-label-light">The process</div>
          <h2 className="lp-section-h2 lp-h2-light">From company name to full analysis<br />in four steps</h2>

          <div className="lp-steps">
            {[
              {
                n: '01', icon: '🔎', title: 'Search',
                desc: 'Type a company name in the Spotlight bar. We query FMP\'s search API and surface all matching tickers with exchange and currency info.',
              },
              {
                n: '02', icon: '📡', title: 'Fetch Live Data',
                desc: 'We simultaneously fetch company profile, key metrics, financial ratios, stock quote, income statement, balance sheet, and cash flows.',
              },
              {
                n: '03', icon: '🤖', title: 'AI Reasoning',
                desc: 'All data is passed to Google Gemini 2.5 Flash with a carefully crafted analyst prompt. The model reasons through strengths, risks, and verdict.',
              },
              {
                n: '04', icon: '📋', title: 'Structured Report',
                desc: 'The AI returns structured JSON — metrics, bull case, bear case, investment reasoning, verdict, and confidence score — rendered beautifully.',
              },
            ].map((step, i) => (
              <div className="lp-step" key={i} style={{ '--i': i }}>
                <div className="lp-step-number">{step.n}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
                {i < 3 && <div className="lp-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────────────────── */}
      <section className="lp-section" id="architecture">
        <div className="lp-section-inner">
          <div className="lp-section-label">Under the hood</div>
          <h2 className="lp-section-h2">A modern full-stack AI architecture</h2>
          <p className="lp-section-sub">
            InvestIQ is built on a clean client-server architecture where the React frontend
            talks to an Express backend, which orchestrates financial data fetching and AI inference.
          </p>

          <div className="lp-arch-diagram">
            {/* Layer: Client */}
            <div className="lp-arch-layer">
              <div className="lp-arch-layer-label">Client (React + Vite)</div>
              <div className="lp-arch-layer-cards">
                <div className="lp-arch-card lp-arch-card-purple">
                  <span className="lp-arch-card-icon">🖥️</span>
                  <strong>React UI</strong>
                  <small>App.jsx · ResultCard · HistoryPanel · LoadingState</small>
                </div>
                <div className="lp-arch-card lp-arch-card-purple">
                  <span className="lp-arch-card-icon">🔌</span>
                  <strong>API Service</strong>
                  <small>Axios client · /analyze · /search · /history</small>
                </div>
              </div>
            </div>

            <div className="lp-arch-connector">
              <span className="lp-arch-conn-line" />
              <span className="lp-arch-conn-label">HTTP REST</span>
              <span className="lp-arch-conn-line" />
            </div>

            {/* Layer: Server */}
            <div className="lp-arch-layer">
              <div className="lp-arch-layer-label">Server (Node.js + Express)</div>
              <div className="lp-arch-layer-cards">
                <div className="lp-arch-card lp-arch-card-blue">
                  <span className="lp-arch-card-icon">🛣️</span>
                  <strong>Routes</strong>
                  <small>analyze.js · search.js · history.js</small>
                </div>
                <div className="lp-arch-card lp-arch-card-blue">
                  <span className="lp-arch-card-icon">💾</span>
                  <strong>Cache Layer</strong>
                  <small>In-memory company store with TTL</small>
                </div>
                <div className="lp-arch-card lp-arch-card-blue">
                  <span className="lp-arch-card-icon">📝</span>
                  <strong>Prompt Engine</strong>
                  <small>Structured analyst.js prompt template</small>
                </div>
              </div>
            </div>

            <div className="lp-arch-connector">
              <span className="lp-arch-conn-line" />
              <span className="lp-arch-conn-label">Parallel API calls</span>
              <span className="lp-arch-conn-line" />
            </div>

            {/* Layer: External */}
            <div className="lp-arch-layer">
              <div className="lp-arch-layer-label">External Services</div>
              <div className="lp-arch-layer-cards">
                <div className="lp-arch-card lp-arch-card-green">
                  <span className="lp-arch-card-icon">📈</span>
                  <strong>Financial Modeling Prep</strong>
                  <small>Live quotes · Ratios · Financials · Profile</small>
                </div>
                <div className="lp-arch-card lp-arch-card-amber">
                  <span className="lp-arch-card-icon">🤖</span>
                  <strong>Google Gemini 2.5 Flash</strong>
                  <small>AI reasoning · Structured JSON output</small>
                </div>
              </div>
            </div>
          </div>

          {/* Tech stack */}
          <div className="lp-tech-stack">
            <div className="lp-tech-label">Built with</div>
            <div className="lp-tech-badges">
              <TechBadge name="React 18" icon="⚛️" />
              <TechBadge name="Vite" icon="⚡" />
              <TechBadge name="Node.js" icon="🟢" />
              <TechBadge name="Express" icon="🚂" />
              <TechBadge name="Gemini AI" icon="✨" />
              <TechBadge name="FMP API" icon="📊" />
              <TechBadge name="Axios" icon="🔗" />
              <TechBadge name="LangGraph" icon="🕸️" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-orb lp-orb-4" />
        <div className="lp-cta-inner">
          <div className="lp-cta-badge">Ready to invest smarter?</div>
          <h2 className="lp-cta-h2">Start your first analysis<br />in under 30 seconds</h2>
          <p className="lp-cta-sub">
            No sign-up. No credit card. Just search a company and let the AI do the work.
          </p>
          <button className="lp-btn-primary lp-btn-large" onClick={() => navigate('/app')}>
            <span>Launch InvestIQ</span>
            <span className="lp-btn-arrow">→</span>
          </button>
          <p className="lp-cta-hint">Try: NVIDIA · Apple · Tesla · Reliance · Infosys</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-left">
            <div className="lp-nav-logo">
              <div className="lp-nav-logo-icon">📈</div>
              <span className="lp-nav-logo-text">InvestIQ</span>
            </div>
            <p className="lp-footer-tagline">AI-powered company analysis for everyone.</p>
          </div>
          <div className="lp-footer-right">
            <p className="lp-footer-disclaimer">
              ⚠️ InvestIQ is for informational purposes only. Nothing on this platform constitutes
              financial advice. Always do your own due diligence before investing.
            </p>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>Built with ❤️ using React · Express · Gemini AI</span>
        </div>
      </footer>

    </div>
  );
}
