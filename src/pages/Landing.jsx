import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelHero } from '../components/ui/pixel-perfect-hero';
import { DockNavbar } from '../components/ui/dock-navbar';
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
function FeatureCard({ icon, title, desc, gradient }) {
  return (
    <div className="lp-feature-card">
      <div className="lp-feature-icon-wrap" style={{ background: gradient }}>{icon}</div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-desc">{desc}</p>
    </div>
  );
}

/* ── Features Carousel ─────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '📊', title: 'Key Financial Metrics',    desc: 'P/E, P/B, EV/EBITDA, Debt/Equity, ROA, ROE, Interest Coverage, Dividend Yield — all fetched live from Financial Modeling Prep.', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { icon: '🐂', title: 'Bull Case — Strengths',    desc: 'The AI identifies competitive moats, growth catalysts, strong balance sheet signals, and tailwinds specific to that company.',          gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  { icon: '🐻', title: 'Bear Case — Risks',        desc: 'Every potential downside is surfaced — valuation risk, debt concerns, macro headwinds, competitive threats, and sector challenges.',       gradient: 'linear-gradient(135deg, #dc2626, #f87171)' },
  { icon: '⚖️', title: 'Investment Verdict',       desc: 'A clear INVEST / PASS verdict with a confidence score, backed by reasoned analysis — not just a number.',                             gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  { icon: '🔍', title: 'Spotlight Company Search', desc: 'Mac-style search bar. Type any company name, get instant live results with exchange, currency, and ticker info.',                         gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { icon: '⚡', title: 'Smart Caching',            desc: 'Analyzed companies are cached locally. Revisit any previous analysis instantly from your Recent Analyses sidebar — no repeat API calls.', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { icon: '🕸️', title: 'Agentic Orchestration',   desc: 'Powered by LangGraph, IntellyInvest uses a multi-agent workflow to dynamically fetch data, reason through financials, and compile its final report.', gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)' },
  { icon: '📰', title: 'Real-Time News',           desc: 'Stay informed with the latest market news and press releases for each company, aggregated directly from Yahoo Finance.',                   gradient: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)' },
];

function FeaturesCarousel() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [xVal, setXVal] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !trackRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Total amount of vertical pixels we have to scroll through the container
      const scrollHeight = rect.height - window.innerHeight;
      // Current scroll position within the container
      const scrolled = -rect.top;
      
      let progress = scrolled / scrollHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      // Calculate max horizontal scroll
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      // Subtract viewport width and add some padding so the last card doesn't touch the edge
      const maxScroll = Math.max(0, trackWidth - viewportWidth + 80);
      
      setXVal(-(maxScroll * progress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section className="lp-fc-container" id="features" ref={containerRef}>
      <div className="lp-fc-sticky">
        <div className="lp-fc-header">
          <div className="lp-section-label">What you get</div>
          <h2 className="lp-section-h2">Everything an analyst would tell you,<br />delivered instantly</h2>
          <p className="lp-section-sub">
            IntellyInvest pulls live financial data and runs it through a multi-step AI reasoning
            pipeline — giving you the kind of structured insight that would take a human analyst hours.
          </p>
        </div>
        
        <div className="lp-fc-track-wrapper">
          <div 
            className="lp-fc-track-pinned" 
            ref={trackRef} 
            style={{ transform: `translateX(${xVal}px)` }}
          >
            {FEATURES.map((f, i) => (
              <div className="lp-fc-item" key={i}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp-root">

      {/* ── Mac Dock Navbar ──────────────────────────────────────────────── */}
      <DockNavbar onLaunch={() => navigate('/app')} scrolled={scrolled} />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <PixelHero 
        word1="Intelligent"
        word2="Investing."
        description="IntellyInvest combines real-time financial data with Gemini AI to deliver institutional-grade company analysis. No subscriptions. No jargon."
        primaryCta="Start Analyzing Free"
        primaryCtaMobile="Start"
        secondaryCta="How it works"
        secondaryCtaMobile="Process"
        onPrimaryClick={() => navigate('/app')}
        onSecondaryClick={(e) => { 
          e.preventDefault(); 
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); 
        }}
        githubUrl="#how-it-works"
      />

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

      {/* ── Features (Pinned Scroll) ─────────────────────────────────────────── */}
      <FeaturesCarousel />

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
                n: '03', icon: '🤖', title: 'Agent Orchestration',
                desc: 'Using LangChain and LangGraph, a multi-agent workflow passes data to Google Gemini 2.5 Flash to reason through strengths, risks, and verdict.',
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
            IntellyInvest is built on a clean client-server architecture where the React frontend
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
                  <span className="lp-arch-card-icon">🕸️</span>
                  <strong>Agent Orchestration</strong>
                  <small>LangGraph · LangChain · Multi-step pipelines</small>
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
                <div className="lp-arch-card lp-arch-card-green">
                  <span className="lp-arch-card-icon">📰</span>
                  <strong>Yahoo Finance</strong>
                  <small>Market News · Analyst estimates · Ownership</small>
                </div>
                <div className="lp-arch-card lp-arch-card-green">
                  <span className="lp-arch-card-icon">🏛️</span>
                  <strong>SEC EDGAR</strong>
                  <small>Official US filings · 10-K · 10-Q · Historicals</small>
                </div>
                <div className="lp-arch-card lp-arch-card-green">
                  <span className="lp-arch-card-icon">🇮🇳</span>
                  <strong>Screener.in</strong>
                  <small>Indian market data · Shareholding · Ratios</small>
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
              <TechBadge name="LangChain" icon="🦜" />
              <TechBadge name="LangGraph" icon="🕸️" />
              <TechBadge name="Gemini AI" icon="✨" />
              <TechBadge name="FMP API" icon="📊" />
              <TechBadge name="Yahoo Finance" icon="📰" />
              <TechBadge name="SEC EDGAR" icon="🏛️" />
              <TechBadge name="Screener.in" icon="🇮🇳" />
              <TechBadge name="Axios" icon="🔗" />
            </div>
          </div>
        </div>
      </section>


      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-left">
            <div className="lp-nav-logo">
              <div className="lp-nav-logo-icon">📈</div>
              <span className="lp-nav-logo-text">IntellyInvest</span>
            </div>
            <p className="lp-footer-tagline">AI-powered company analysis for everyone.</p>
          </div>
          <div className="lp-footer-right">
            <p className="lp-footer-disclaimer">
              ⚠️ IntellyInvest is for informational purposes only. Nothing on this platform constitutes
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
