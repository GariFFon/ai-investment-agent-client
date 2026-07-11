import React, { useRef, useState, useEffect, useCallback } from 'react';
import { BarChart2, Layers, Cpu, Rocket } from 'lucide-react';

/* Load Playfair Display once at module level — never re-injected */
if (typeof document !== 'undefined' && !document.getElementById('dock-font-playfair')) {
  const link = document.createElement('link');
  link.id = 'dock-font-playfair';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap';
  document.head.appendChild(link);
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────────────────── */
const BASE_SIZE = 42;
const MAX_SIZE  = 62;
const SPREAD    = 120;

function computeScale(mouseX, itemCenterX) {
  const dist = Math.abs(mouseX - itemCenterX);
  if (dist > SPREAD) return 1;
  const t = 1 - dist / SPREAD;
  const magnify = ((MAX_SIZE - BASE_SIZE) / BASE_SIZE) * Math.pow(t, 1.6);
  return 1 + magnify;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOLTIP — rendered fixed to the viewport so it's never clipped
───────────────────────────────────────────────────────────────────────────── */
function Tooltip({ label, anchorRect, scale }) {
  if (!anchorRect) return null;
  const cx = anchorRect.left + anchorRect.width / 2;
  // Position just below the dock pill (anchorRect.bottom + gap)
  const top = anchorRect.bottom + 10;

  return (
    <div
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${cx}px`,
        transform: 'translateX(-50%)',
        background: 'rgba(8, 10, 20, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 600,
        padding: '5px 11px',
        borderRadius: '9px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        border: '1px solid rgba(255,255,255,0.13)',
        zIndex: 9999,
        letterSpacing: '0.04em',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {label}
      {/* Arrow pointing UP */}
      <div style={{
        position: 'absolute',
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: '5px solid rgba(8,10,20,0.88)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOCK ITEM
───────────────────────────────────────────────────────────────────────────── */
function DockItem({ item, mouseX, dockRef, onAction, scrolled, onTooltip }) {
  const itemRef = useRef(null);
  const [scale, setScale] = useState(1);
  const rafRef = useRef(null);

  useEffect(() => {
    if (mouseX === null) {
      rafRef.current = requestAnimationFrame(() => setScale(1));
      return () => cancelAnimationFrame(rafRef.current);
    }
    const el = itemRef.current;
    if (!el) return;
    const elRect = el.getBoundingClientRect();
    const centerX = elRect.left + elRect.width / 2;
    const s = computeScale(mouseX, centerX);
    rafRef.current = requestAnimationFrame(() => setScale(s));
    return () => cancelAnimationFrame(rafRef.current);
  }, [mouseX]);

  const isSpecial = item.special;

  const handleMouseEnter = () => {
    if (isSpecial || !itemRef.current) return;
    // Pass the nav pill's rect (parent of nav) for tooltip anchor
    const dockRect = dockRef.current?.getBoundingClientRect();
    onTooltip({ label: item.label, anchorRect: dockRect });
  };
  const handleMouseLeave = () => onTooltip(null);

  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    height: `${BASE_SIZE}px`,
    minWidth: isSpecial ? '118px' : `${BASE_SIZE}px`,
    padding: isSpecial ? '0 20px' : '0',
    borderRadius: '999px',
    cursor: 'pointer',
    border: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.01em',
    flexShrink: 0,
    /* Grow upward — transform-origin bottom so items expand upward */
    transform: `scale(${scale}) translateY(${(scale - 1) * -6}px)`,
    transformOrigin: 'bottom center',
    transition: mouseX !== null
      ? 'transform 0.07s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: 'transform',
    ...(isSpecial ? {
      background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
      color: '#fff',
      boxShadow: '0 4px 16px rgba(99,102,241,0.55), inset 0 1px 1px rgba(255,255,255,0.25)',
    } : {
      background: scrolled ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.09)',
      color: scrolled ? '#374151' : 'rgba(255,255,255,0.9)',
      boxShadow: scrolled
        ? 'inset 0 1px 1px rgba(255,255,255,0.6)'
        : 'inset 0 1px 1px rgba(255,255,255,0.12)',
    }),
  };

  return (
    <div
      ref={itemRef}
      role="button"
      tabIndex={0}
      style={style}
      onClick={onAction}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={e => e.key === 'Enter' && onAction()}
    >
      {item.icon && React.createElement(item.icon, {
        size: isSpecial ? 15 : 17,
        strokeWidth: isSpecial ? 2.5 : 1.8,
      })}
      {isSpecial && <span>{item.label}</span>}

      {/* Active dot */}
      {item.active && (
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: '#818cf8',
          boxShadow: '0 0 6px rgba(129,140,248,0.9)',
        }} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SEPARATOR
───────────────────────────────────────────────────────────────────────────── */
function DockSeparator({ scrolled }) {
  return (
    <div style={{
      width: '1px',
      height: '22px',
      background: scrolled ? 'rgba(15,23,42,0.13)' : 'rgba(255,255,255,0.16)',
      borderRadius: '1px',
      flexShrink: 0,
      margin: '0 2px',
      alignSelf: 'center',
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DOCK NAVBAR
───────────────────────────────────────────────────────────────────────────── */
export function DockNavbar({ onLaunch, scrolled }) {
  const dockRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);
  const [active, setActive] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { label, anchorRect }

  useEffect(() => {
    const sections = ['features', 'how-it-works', 'architecture'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { threshold: 0.5 }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = useCallback((e) => setMouseX(e.clientX), []);
  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setTooltip(null);
  }, []);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const NAV_ITEMS = [
    { id: 'logo', label: 'InvestIQ', icon: null, isLogo: true },
    null,
    { id: 'features',     label: 'Features',     icon: BarChart2 },
    { id: 'how-it-works', label: 'How It Works', icon: Layers },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    null,
    { id: 'launch', label: 'Launch App', icon: Rocket, special: true },
  ];

  const dockBg     = scrolled ? 'rgba(255,255,255,0.78)' : 'rgba(10,15,30,0.58)';
  const dockBorder = scrolled ? 'rgba(15,23,42,0.11)'    : 'rgba(255,255,255,0.13)';

  return (
    <>
      {/* Fixed wrapper — overflow visible so magnified items aren't clipped */}
      <div style={{
        position: 'fixed',
        top: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        /* Extra padding above so scaled-up items have room to grow upward */
        paddingTop: '24px',
        pointerEvents: 'none', // children re-enable individually
      }}>
        <nav
          ref={dockRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 10px',
            borderRadius: '999px',
            background: dockBg,
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            border: `1px solid ${dockBorder}`,
            boxShadow: scrolled
              ? '0 8px 32px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.75)'
              : '0 8px 32px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.09)',
            transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
            /* CRITICAL: allow children to visually overflow the pill */
            overflow: 'visible',
          }}
        >
          {NAV_ITEMS.map((item, i) => {
            if (item === null) return <DockSeparator key={`sep-${i}`} scrolled={scrolled} />;

            if (item.isLogo) {
              return (
                <div key="logo" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 8px 0 2px',
                pointerEvents: 'none',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.45)',
                  flexShrink: 0,
                }}>📈</div>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'normal',
                  letterSpacing: '-0.04em',
                  /* Simple color transition — no webkit-clip that causes flash */
                  color: scrolled ? '#6366f1' : '#a5b4fc',
                  transition: 'color 0.35s ease',
                  userSelect: 'none',
                  lineHeight: 1,
                }}>II</span>
              </div>
              );
            }

            return (
              <DockItem
                key={item.id}
                item={{ ...item, active: active === item.id }}
                mouseX={mouseX}
                dockRef={dockRef}
                scrolled={scrolled}
                onAction={item.special ? onLaunch : () => scrollTo(item.id)}
                onTooltip={setTooltip}
              />
            );
          })}
        </nav>
      </div>

      {/* Tooltip rendered at fixed position — completely outside the nav pill */}
      {tooltip && (
        <Tooltip label={tooltip.label} anchorRect={tooltip.anchorRect} />
      )}
    </>
  );
}
