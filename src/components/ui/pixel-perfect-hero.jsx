import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, LineChart, Newspaper, Landmark, Globe, BrainCircuit, ChevronDown } from "lucide-react";

/* -----------------------------------------------------------------------------
 * BRAND LOGOS — InvestIQ data sources
 * -------------------------------------------------------------------------- */
const BRAND_LOGOS = [
  { icon: LineChart, label: "FMP" },
  { icon: Newspaper, label: "Yahoo Finance" },
  { icon: Landmark, label: "SEC EDGAR" },
  { icon: Globe, label: "Screener.in" },
  { icon: BrainCircuit, label: "Gemini AI" },
];

function BrandLogo({ icon: Icon, label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      fontWeight: 600,
      color: "rgba(255,255,255,0.55)",
      whiteSpace: "nowrap",
      transition: "color 0.3s",
      cursor: "default",
    }}
    onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.9)"}
    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
    >
      <Icon size={18} />
      <span>{label}</span>
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * CANVAS PIXEL PHYSICS ENGINE
 * -------------------------------------------------------------------------- */
function createPixel(ctx, canvas, x, y, color, baseSpeed, delay) {
  const rand = (min, max) => Math.random() * (max - min) + min;
  const p = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0,
    sizeStep: rand(0.12, 0.28),
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) { p.counter += p.counterStep; return; }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer(); else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false; p.counter = 0;
      if (p.size <= 0) { p.isIdle = true; return; }
      p.size -= 0.1; p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed; else p.size += p.speed;
    },
  };
  return p;
}

function PixelCanvas({ colors, gap = 6, speed = 30 }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const pixelsRef = useRef([]);
  const animationRef = useRef(0);
  const lastFrameRef = useRef(performance.now());
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !colors.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width), h = Math.floor(height);
    canvas.width = w; canvas.height = h;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels = [];
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2, dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }
    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode) => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;
    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);
      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();
      if (pixels.every(p => p.isIdle)) cancelAnimationFrame(animationRef.current);
    };
    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();
    const ro = new ResizeObserver(() => init());
    if (wrapRef.current) ro.observe(wrapRef.current);
    animate("appear");
    return () => { ro.disconnect(); cancelAnimationFrame(animationRef.current); };
  }, [init, animate]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * PIXEL HERO COMPONENT
 * -------------------------------------------------------------------------- */
export function PixelHero({
  word1 = "Intelligent",
  word2 = "Investing.",
  description = "InvestIQ combines real-time financial data with Gemini AI to deliver institutional-grade company analysis. No subscriptions. No jargon.",
  primaryCta = "Start Analyzing Free",
  primaryCtaMobile = "Start",
  secondaryCta = "How it works",
  onPrimaryClick,
  onSecondaryClick,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pixelColors, setPixelColors] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Use InvestIQ brand colors for the pixel canvas
    setPixelColors([
      "rgba(99, 102, 241, 0.35)",  // indigo
      "rgba(139, 92, 246, 0.25)",  // violet
      "rgba(99, 102, 241, 0.15)",  // faint indigo
      "rgba(139, 92, 246, 0.15)",  // faint violet
      "rgba(99, 102, 241, 0.5)",   // bright indigo accent
    ]);

    const timer = setTimeout(() => setIsLoaded(true), 80);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(timer); window.removeEventListener("resize", onResize); };
  }, []);

  const heroStyle = {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a0f1e 0%, #0f1729 40%, #0a0f1e 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    userSelect: "none",
    isolation: "isolate",
    padding: "80px 24px 40px",
    boxSizing: "border-box",
  };

  const headingStyle = {
    color: "transparent",
    background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.45) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.25) 80%, rgba(255,255,255,1) 100%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextStroke: "1.5px rgba(255,255,255,0.25)",
    filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.5))",
    animation: "hero-shimmer 8s linear infinite",
    fontSize: isMobile ? "clamp(2.6rem, 12vw, 4rem)" : "clamp(4rem, 9vw, 7rem)",
    lineHeight: 1.05,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    textAlign: "center",
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    gap: "0.3em",
    alignItems: "center",
    justifyContent: "center",
  };

  const descStyle = {
    fontSize: isMobile ? "15px" : "18px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.7)",
    maxWidth: "520px",
    textAlign: "center",
    margin: "28px auto 0",
    fontWeight: 400,
    padding: "16px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    backdropFilter: "blur(12px)",
  };

  const ctaRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "36px",
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? "translateY(0)" : "translateY(20px)",
    transition: "all 0.8s ease",
    transitionDelay: "400ms",
  };

  const primaryBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: isMobile ? "42px" : "50px",
    padding: isMobile ? "0 20px" : "0 32px",
    borderRadius: "14px",
    background: "linear-gradient(145deg, #6366f1, #4f46e5)",
    color: "#fff",
    fontSize: isMobile ? "13px" : "15px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 16px rgba(99,102,241,0.45), 0 1px 3px rgba(0,0,0,0.3)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    fontFamily: "'Inter', sans-serif",
  };

  const secondaryBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: isMobile ? "42px" : "50px",
    padding: isMobile ? "0 20px" : "0 28px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.85)",
    fontSize: isMobile ? "13px" : "15px",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    backdropFilter: "blur(12px)",
    transition: "transform 0.18s ease, background 0.18s ease",
    fontFamily: "'Inter', sans-serif",
    textDecoration: "none",
  };

  const marqueeWrapStyle = {
    position: "absolute",
    bottom: "32px",
    left: 0,
    right: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    opacity: isLoaded ? 1 : 0,
    transform: isLoaded ? "translateY(0)" : "translateY(16px)",
    transition: "all 0.8s ease",
    transitionDelay: "600ms",
    zIndex: 10,
  };

  const marqueeTrackStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "800px",
    overflow: "hidden",
    WebkitMaskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
    maskImage: "linear-gradient(to right, transparent, white 15%, white 85%, transparent)",
  };

  const marqueeInnerStyle = {
    display: "flex",
    width: "max-content",
    gap: "48px",
    padding: "8px 0",
    animation: "hero-marquee 20s linear infinite",
  };

  return (
    <div style={heroStyle}>
      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: 0% center; }
        }
        @keyframes hero-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Pixel canvas background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {pixelColors.length > 0 && <PixelCanvas colors={pixelColors} gap={6} speed={25} />}
        {/* Vignette overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 10%, rgba(10,15,30,0.75) 100%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "6px 16px", borderRadius: "99px",
        background: "rgba(99,102,241,0.15)",
        border: "1px solid rgba(99,102,241,0.35)",
        color: "rgba(165,180,252,1)",
        fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
        marginBottom: "28px", zIndex: 2,
      }}>
        <span style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#6366f1",
          boxShadow: "0 0 8px rgba(99,102,241,0.9)",
          animation: "none",
          flexShrink: 0,
        }} />
        AI-Powered Investment Intelligence
      </div>

      {/* Main heading */}
      <h1 style={headingStyle}>
        <span style={{ fontStyle: "italic", fontWeight: 500 }}>{word1}</span>
        <span style={{ fontWeight: 900 }}>{word2}</span>
      </h1>

      {/* Description */}
      <p style={descStyle}>{description}</p>

      {/* Trust line */}
      <div style={{
        marginTop: "20px",
        display: "flex", alignItems: "center", gap: "8px",
        color: "rgba(255,255,255,0.4)", fontSize: "13px", fontWeight: 500, zIndex: 2,
      }}>
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.8)",
        }} />
        No sign-up &nbsp;·&nbsp; Free to use &nbsp;·&nbsp; Instant results
      </div>

      {/* CTA Buttons */}
      <div style={ctaRowStyle}>
        <button
          onClick={onPrimaryClick}
          style={primaryBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "inset 0 1px 1px rgba(255,255,255,0.25), 0 6px 24px rgba(99,102,241,0.6), 0 1px 3px rgba(0,0,0,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "inset 0 1px 1px rgba(255,255,255,0.25), 0 4px 16px rgba(99,102,241,0.45), 0 1px 3px rgba(0,0,0,0.3)"; }}
        >
          <span style={{ display: isMobile ? "inline" : "none" }}>{primaryCtaMobile}</span>
          <span style={{ display: isMobile ? "none" : "inline" }}>{primaryCta}</span>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={onSecondaryClick}
          style={secondaryBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
        >
          <span>{secondaryCta}</span>
          <ChevronDown size={15} />
        </button>
      </div>

      {/* Marquee — data sources */}
      <div style={marqueeWrapStyle}>
        <span style={{
          fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
        }}>
          Powered by industry data
        </span>
        <div style={marqueeTrackStyle}>
          <div style={marqueeInnerStyle}>
            {[...BRAND_LOGOS, ...BRAND_LOGOS].map((item, i) => (
              <BrandLogo key={i} icon={item.icon} label={item.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
