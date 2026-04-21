import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  OffthreadVideo,
  Img,
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { GlassmorphismCard } from './components/GlassmorphismCard';
import { KineticText } from './components/KineticText';
import { BRollPlayer } from './components/BRollPlayer';
import { NoiseOverlay } from './components/NoiseOverlay';
import { TypewriterText } from './components/TypewriterText';

// ═══════════════════════════════════════════════════════════════════════════════
// STORYSELLING IN THE AGE OF AI
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Palette (green/white/black brand) ────────────────────────────────
const BRAND = {
  green: '#005A3B',
  greenLight: '#00804F',
  greenDark: '#003D28',
  white: '#FFFFFF',
  black: '#000000',
  bgDark: '#050505',
  textSecondary: '#b0b0b0',
  cardBg: 'rgba(0, 90, 59, 0.06)',
  cardBorder: 'rgba(0, 90, 59, 0.25)',
  greenGlow: 'rgba(0, 90, 59, 0.5)',
};

// ─── Scene Frame Boundaries (from Whisper timestamps) ────────────────────────
const SCENE = {
  HOOK_START: 0,
  HOOK_END: 890,       // ~29.7s — silence gap before "two advisors"
  STORY_START: 890,
  STORY_END: 2340,     // ~78.0s — silence gap after "replicate"
  APP_START: 2340,
  APP_END: 3770,       // ~125.7s — silence gap before "AI is not here"
  CTA_START: 3770,
  CTA_END: 4450,       // ~148.3s
};

// ─── B-roll sub-timings within scenes ────────────────────────────────────────
// Scene 2 David sub-scene: ~30.9s–42.0s → local frames 10–1110 within story
const DAVID_BROLL_START = 150;  // ~5s into scene 2
const DAVID_BROLL_DUR = 180;   // 6s
// Scene 2 Sarah sub-scene: ~45.0s–58.0s → local frames ~480–1110
const SARAH_BROLL_START = 510;
const SARAH_BROLL_DUR = 180;
// Scene 3 AI copilot: ~105s–115s → local frames ~720-1020
const COPILOT_BROLL_START = 720;
const COPILOT_BROLL_DUR = 180;

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1: THE HOOK — Connection Over Computation
// Split-screen: scrolling financial data (left) + speaker panel (right)
// ═══════════════════════════════════════════════════════════════════════════════

const FinancialDataWall: React.FC = () => {
  const frame = useCurrentFrame();
  const rand = seededRandom(42);

  // Generate fake financial data rows
  const rows = Array.from({ length: 30 }, (_, i) => {
    const ticker = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'META', 'NVDA', 'JPM', 'GS', 'BAC', 'WFC',
      'BRK.B', 'UNH', 'V', 'MA', 'PFE', 'JNJ', 'TSM', 'AVGO', 'HD', 'PG',
      'XOM', 'CVX', 'LLY', 'ABBV', 'MRK', 'PEP', 'KO', 'COST', 'TMO', 'ACN'][i];
    const price = (rand() * 400 + 50).toFixed(2);
    const change = (rand() * 10 - 5).toFixed(2);
    const vol = (rand() * 50 + 1).toFixed(1) + 'M';
    return { ticker, price, change: parseFloat(change), vol };
  });

  // Scroll speed accelerates over time
  const scrollSpeed = interpolate(frame, [0, 300, 600, 890], [0.3, 1, 3, 8], {
    extrapolateRight: 'clamp',
  });
  const scrollY = frame * scrollSpeed * 1.5;

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
      overflow: 'hidden', backgroundColor: BRAND.white,
    }}>
      {/* Rapidly scrolling stock data */}
      <div style={{ transform: `translateY(${-scrollY % 1600}px)` }}>
        {[...rows, ...rows].map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', padding: '12px 40px',
            borderBottom: '1px solid #e0e0e0',
            fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: 22,
          }}>
            <span style={{ fontWeight: 700, color: BRAND.black, width: 100 }}>{row.ticker}</span>
            <span style={{ color: '#333', width: 100, textAlign: 'right' }}>${row.price}</span>
            <span style={{
              color: row.change >= 0 ? '#16a34a' : '#dc2626',
              fontWeight: 600, width: 100, textAlign: 'right',
            }}>
              {row.change >= 0 ? '+' : ''}{row.change}%
            </span>
            <span style={{ color: '#888', width: 80, textAlign: 'right' }}>{row.vol}</span>
          </div>
        ))}
      </div>

      {/* Overlay: scrolling candlestick chart SVG */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 300,
        background: 'linear-gradient(transparent, rgba(255,255,255,0.95))',
      }}>
        <svg width={960} height={300} style={{ opacity: 0.6 }}>
          {Array.from({ length: 60 }, (_, i) => {
            const x = i * 16 + 8;
            const baseY = 150 + Math.sin(i * 0.4 + frame * 0.02) * 60;
            const open = baseY - rand() * 20;
            const close = baseY + rand() * 20;
            const high = Math.min(open, close) - rand() * 15;
            const low = Math.max(open, close) + rand() * 15;
            const color = close > open ? '#dc2626' : '#16a34a';
            return (
              <g key={i}>
                <line x1={x} y1={high} x2={x} y2={low} stroke={color} strokeWidth={1} />
                <rect x={x - 4} y={Math.min(open, close)} width={8}
                  height={Math.abs(close - open) || 2} fill={color} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Speed blur effect as data accelerates */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(rgba(255,255,255,0) 20%, rgba(255,255,255,${
          interpolate(frame, [400, 890], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        }) 100%)`,
      }} />
    </div>
  );
};

const GlitchText: React.FC<{ text: string; triggerFrame: number; duration: number }> = ({
  text, triggerFrame, duration,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - triggerFrame;
  if (localFrame < 0 || localFrame > duration) return null;

  const glitchIntensity = localFrame < 8
    ? interpolate(localFrame, [0, 8], [0, 1])
    : localFrame < duration - 8
      ? 1
      : interpolate(localFrame, [duration - 8, duration], [1, 0]);

  const offsetX = Math.sin(localFrame * 3.7) * 6 * glitchIntensity;
  const offsetY = Math.cos(localFrame * 2.3) * 4 * glitchIntensity;
  const skewX = Math.sin(localFrame * 5) * 3 * glitchIntensity;

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) skewX(${skewX}deg)`,
      fontSize: 120, fontWeight: 900, color: BRAND.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      textShadow: `
        ${offsetX * -2}px 0 ${BRAND.green},
        ${offsetX * 2}px 0 #ff3333,
        0 0 20px ${BRAND.greenGlow}
      `,
      letterSpacing: 8,
      zIndex: 50,
    }}>
      {text}
    </div>
  );
};

// ─── Hook left-panel content: rotates every ~5s through financial data → quote → headline → call-out
const HookLeftPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // SEGMENT 1 (0–150f = 0–5s): Financial data wall
  const showData    = frame < 150;
  // SEGMENT 2 (150–380f = 5–12.7s): Pull quote from the narration
  const showQuote   = frame >= 150 && frame < 380;
  // SEGMENT 3 (380–620f = 12.7–20.7s): Bold stat / headline
  const showHeadline = frame >= 380 && frame < 620;
  // SEGMENT 4 (620–890f = 20.7–29.7s): Title card
  const showTitle   = frame >= 620;

  // Crossfade helpers
  const seg = (start: number, end: number) => {
    const fadeDur = 18;
    const alphaIn  = Math.min(1, (frame - start) / fadeDur);
    const alphaOut = Math.min(1, (end - frame) / fadeDur);
    return Math.max(0, Math.min(alphaIn, alphaOut));
  };

  const quoteIn = spring({ frame: Math.max(0, frame - 165), fps, config: { damping: 14, stiffness: 70 } });
  const headIn  = spring({ frame: Math.max(0, frame - 395), fps, config: { damping: 14, stiffness: 80 } });
  const titleIn = spring({ frame: Math.max(0, frame - 635), fps, config: { damping: 14, stiffness: 80 } });
  const subtitleIn = spring({ frame: Math.max(0, frame - 665), fps, config: { damping: 18, stiffness: 60 } });

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
      overflow: 'hidden',
    }}>
      {/* ── Segment 1: financial data wall (0–5s) ── */}
      {showData && (
        <div style={{ opacity: seg(0, 150) }}>
          <FinancialDataWall />
        </div>
      )}

      {/* ── Segment 2: Quote panel (5–12.7s) ── */}
      {showQuote && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${BRAND.bgDark}, ${BRAND.black})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 80px',
          opacity: seg(150, 380),
        }}>
          <ParticleField color={BRAND.green} count={18} seed={11} intensity={0.35} />
          {/* Decorative quotation mark */}
          <div style={{
            fontSize: 160, fontWeight: 900, color: `${BRAND.green}30`, lineHeight: 0.8,
            fontFamily: 'Georgia, serif', alignSelf: 'flex-start', marginLeft: 40,
          }}>"</div>
          <p style={{
            fontSize: 44, fontWeight: 700, color: BRAND.white, textAlign: 'center',
            fontFamily: '-apple-system, sans-serif', lineHeight: 1.45, margin: 0,
            opacity: quoteIn,
            transform: `translateY(${interpolate(quoteIn, [0, 1], [30, 0])}px)`,
            textShadow: `0 2px 30px rgba(0,0,0,0.6)`,
          }}>
            AI can now process more data in a <span style={{ color: '#f5a623', textShadow: '0 0 20px #f5a62360' }}>second</span> than you can in a <span style={{ color: '#f5a623', textShadow: '0 0 20px #f5a62360' }}>month.</span>
          </p>
          <div style={{
            width: 80, height: 3, backgroundColor: BRAND.green, marginTop: 32,
            opacity: quoteIn, borderRadius: 2,
          }} />
        </div>
      )}

      {/* ── Segment 3: Bold headline (12.7–20.7s) ── */}
      {showHeadline && (
        <div style={{
          position: 'absolute', inset: 0,
          background: BRAND.black,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 80px',
          opacity: seg(380, 620),
        }}>
          {/* Pulsing green circle behind headline */}
          <div style={{
            position: 'absolute', width: 500, height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND.green}18 0%, transparent 70%)`,
            animation: 'none',
            opacity: 0.8 + Math.sin(frame * 0.08) * 0.2,
          }} />
          <div style={{
            fontSize: 30, fontWeight: 600, color: BRAND.textSecondary,
            letterSpacing: 5, textTransform: 'uppercase',
            fontFamily: '-apple-system, sans-serif', marginBottom: 24,
            opacity: headIn,
          }}>
            The Uncomfortable Truth
          </div>
          <h2 style={{
            fontSize: 72, fontWeight: 900, color: BRAND.white, textAlign: 'center',
            fontFamily: '-apple-system, sans-serif', lineHeight: 1.15, margin: 0,
            letterSpacing: -2,
            opacity: headIn,
            transform: `scale(${interpolate(headIn, [0, 1], [0.9, 1])})`,
            textShadow: `0 0 40px rgba(255,255,255,0.2)`,
          }}>
            If your only value is a{' '}
            <span style={{
              color: BRAND.green,
              textShadow: `0 0 20px ${BRAND.greenGlow}, 0 0 50px ${BRAND.greenGlow}`,
            }}>spreadsheet</span>...
          </h2>
          <p style={{
            fontSize: 38, fontWeight: 700,
            color: '#f5a623',
            textShadow: '0 0 20px #f5a62380, 0 0 50px #f5a62340',
            textAlign: 'center',
            fontFamily: '-apple-system, sans-serif',
            marginTop: 28,
            opacity: spring({ frame: Math.max(0, frame - 430), fps, config: { damping: 16, stiffness: 70 } }),
            transform: `scale(${1 + (
              frame > 430 && frame < 470
                ? Math.sin(((frame - 430) / 40) * Math.PI) * 0.06
                : 0
            )})`,
          }}>
            Your career is on borrowed time.
          </p>
        </div>
      )}

      {/* ── Segment 4: "It already has." + "The real question is..." (20.7–29.7s) ── */}
      {showTitle && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${BRAND.bgDark} 0%, ${BRAND.black} 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 60px',
          opacity: seg(620, 890),
        }}>
          <ParticleField color={BRAND.green} count={30} seed={7} intensity={0.5} />

          {/* "It already has." — Whisper: 22.94s = frame 688, hold until ~720 */}
          {frame >= 680 && frame <= 760 && (
            <p style={{
              fontSize: 88, fontWeight: 900, color: '#f5a623',
              textShadow: '0 0 30px #f5a62380, 0 0 80px #f5a62340',
              textAlign: 'center', lineHeight: 1.1, zIndex: 10,
              opacity: interpolate(frame, [680, 700, 740, 760], [0, 1, 1, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - 680), fps,
                config: { damping: 14, stiffness: 90 } }), [0, 1], [0.8, 1])})`,
            }}>
              It already has.
            </p>
          )}

          {/* "The real question is..." — Whisper: 24.22s = frame 726, typewriter reveal */}
          {frame >= 726 && (
            <div style={{ zIndex: 10 }}>
              <TypewriterText
                text="The real question is..."
                color="#f5a623"
                fontSize={52}
                delay={726}
              />
            </div>
          )}

          {/* Title card fades in after text reveals */}
          {frame >= 790 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '0 60px',
              opacity: interpolate(frame, [790, 820], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              zIndex: 11,
            }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{
                  fontSize: 88, fontWeight: 900, color: BRAND.white, margin: 0,
                  fontFamily: '-apple-system, sans-serif', lineHeight: 1.1, letterSpacing: -3,
                  textShadow: '0 0 40px rgba(255,255,255,0.1)',
                }}>
                  STORY<span style={{ color: BRAND.green }}>SELLING</span>
                </h1>
                <h2 style={{
                  fontSize: 38, fontWeight: 300, color: BRAND.white, margin: '12px 0 0',
                  fontFamily: '-apple-system, sans-serif', letterSpacing: 6, textTransform: 'uppercase',
                }}>
                  in the Age of <span style={{
                    color: BRAND.green,
                    textShadow: `0 0 15px ${BRAND.greenGlow}`,
                  }}>AI</span>
                </h2>
              </div>
              <p style={{
                fontSize: 26, color: BRAND.textSecondary, textAlign: 'center',
                fontFamily: '-apple-system, sans-serif',
                marginTop: 36, letterSpacing: 3, textTransform: 'uppercase',
              }}>
                Connection Over Computation
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneDuration = SCENE.HOOK_END - SCENE.HOOK_START;
  const kineticDelay = Math.floor(sceneDuration * 0.62);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.black }}>
      {/* Left panel: rotating content segments */}
      <HookLeftPanel />

      {/* Right panel: always-visible speaker/topic panel */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: 960, height: 1080,
        background: `linear-gradient(135deg, ${BRAND.bgDark} 0%, ${BRAND.black} 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px',
      }}>
        <ParticleField color={BRAND.green} count={30} seed={77} intensity={0.45} />
        {/* "STORYSELLING" title always visible right panel */}
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <h1 style={{
            fontSize: 72, fontWeight: 900, color: BRAND.white, margin: 0,
            fontFamily: '-apple-system, sans-serif', lineHeight: 1.15, letterSpacing: -2,
          }}>
            STORY<span style={{ color: BRAND.green }}>SELLING</span>
          </h1>
          <h2 style={{
            fontSize: 36, fontWeight: 300, color: BRAND.white, margin: '10px 0 0',
            fontFamily: '-apple-system, sans-serif', letterSpacing: 5,
          }}>
            IN THE AGE OF{' '}
            <span style={{ color: BRAND.green, textShadow: `0 0 15px ${BRAND.greenGlow}` }}>AI</span>
          </h2>
        </div>
        <div style={{
          width: 120, height: 4, backgroundColor: BRAND.green, marginTop: 28,
          borderRadius: 2, boxShadow: `0 0 20px ${BRAND.greenGlow}`,
        }} />
        <p style={{
          fontSize: 24, color: BRAND.textSecondary, textAlign: 'center',
          fontFamily: '-apple-system, sans-serif', marginTop: 28, letterSpacing: 2,
        }}>
          Connection · Story · Impact
        </p>
      </div>

      {/* Center divider */}
      <div style={{
        position: 'absolute', left: 960, top: 0, width: 2, height: 1080,
        background: `linear-gradient(transparent, ${BRAND.green}, transparent)`,
        opacity: 0.5,
      }} />

      {/* Glitch "AI" — triggers at ~12.4s = frame 372 */}
      <GlitchText text="AI" triggerFrame={372} duration={30} />

      {/* Kinetic text */}
      <KineticText
        text="CONNECTION OVER COMPUTATION"
        color={BRAND.white}
        fontSize={60}
        delay={kineticDelay}
        duration={Math.floor(sceneDuration * 0.33)}
        glow
      />

      <NoiseOverlay opacity={0.03} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2: THE STORY ARC — David vs. Sarah
// Balance scale graphic + side-by-side B-roll
// ═══════════════════════════════════════════════════════════════════════════════

const BalanceScale: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Scale entrance
  const entrance = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 60 } });

  // Tilt progress — starts level, tips toward story side over time
  // Max 10° to keep pans within the extended viewBox (0 0 500 340) without clipping
  const tiltProgress = interpolate(localFrame, [0, 60, 180], [0, 0, 1], {
    extrapolateRight: 'clamp',
  });
  const tiltAngle = tiltProgress * 10; // degrees — kept ≤10 to prevent pan overflow

  // Gentle swing
  const swing = Math.sin(localFrame * 0.03) * 2 * (1 - tiltProgress * 0.5);

  return (
    <div style={{
      position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
      opacity: entrance, zIndex: 15,
      // overflow visible so tilted pans don't get clipped by container bounds
      overflow: 'visible',
    }}>
      {/* Extended viewBox to 340 height gives tilted pans room; width 860×400 */}
      <svg width={860} height={400} viewBox="0 0 500 340" overflow="visible">
        {/* Base/fulcrum */}
        <polygon points="220,270 280,270 250,230" fill={BRAND.green} opacity={0.9} />
        <rect x={245} y={200} width={10} height={35} fill={BRAND.green} opacity={0.9} />
        {/* Glow on fulcrum */}
        <ellipse cx={250} cy={260} rx={20} ry={8} fill={BRAND.green} opacity={0.25 + Math.sin(localFrame * 0.06) * 0.1} />

        {/* Beam */}
        <g transform={`rotate(${-tiltAngle + swing}, 250, 200)`}>
          <rect x={60} y={196} width={380} height={8} rx={4} fill={BRAND.white} opacity={0.95}
            style={{ filter: `drop-shadow(0 0 6px rgba(255,255,255,0.5))` }} />

          {/* Left pan: 50-page deck */}
          <g transform="translate(100, 204)">
            <line x1={0} y1={0} x2={-30} y2={40} stroke={BRAND.textSecondary} strokeWidth={2.5} />
            <line x1={0} y1={0} x2={30} y2={40} stroke={BRAND.textSecondary} strokeWidth={2.5} />
            <ellipse cx={0} cy={48} rx={55} ry={13} fill="rgba(255,255,255,0.08)"
              stroke={BRAND.textSecondary} strokeWidth={2} />
            {/* Stack of document icons */}
            {[0, -9, -17, -24, -30, -35].map((y, i) => (
              <rect key={i} x={-22} y={y + 32} width={44} height={7} rx={2}
                fill={BRAND.textSecondary} opacity={0.65 - i * 0.07} />
            ))}
            <text x={0} y={65} textAnchor="middle" fontSize={15} fill={BRAND.textSecondary}
              fontFamily="-apple-system, sans-serif" fontWeight={700} letterSpacing={1}>
              50-PAGE DECK
            </text>
          </g>

          {/* Right pan: one story + glowing heart */}
          <g transform="translate(400, 204)">
            <line x1={0} y1={0} x2={-30} y2={40} stroke={BRAND.green} strokeWidth={2.5} />
            <line x1={0} y1={0} x2={30} y2={40} stroke={BRAND.green} strokeWidth={2.5} />
            <ellipse cx={0} cy={48} rx={55} ry={13} fill="rgba(0,90,59,0.18)"
              stroke={BRAND.green} strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 8px ${BRAND.green})` }} />
            {/* Heart */}
            <path d="M0,22 C-9,12 -20,16 -20,27 C-20,38 0,50 0,50 C0,50 20,38 20,27 C20,16 9,12 0,22Z"
              fill={BRAND.green} opacity={0.95}
              style={{ filter: `drop-shadow(0 0 12px ${BRAND.green})` }} />
            {/* Glow ring behind heart */}
            <circle cx={0} cy={34} r={24} fill={BRAND.green}
              opacity={0.12 + Math.sin(localFrame * 0.1) * 0.08} />
            <text x={0} y={65} textAnchor="middle" fontSize={15} fill={BRAND.green}
              fontFamily="-apple-system, sans-serif" fontWeight={800} letterSpacing={1}>
              ONE STORY
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

const StoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = SCENE.STORY_END - SCENE.STORY_START;

  const titleIn = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 16, stiffness: 80 } });

  // B-roll active states
  const broll1Active = frame >= DAVID_BROLL_START && frame <= DAVID_BROLL_START + DAVID_BROLL_DUR;
  const broll2Active = frame >= SARAH_BROLL_START && frame <= SARAH_BROLL_START + SARAH_BROLL_DUR;

  // Card shift when B-roll is active
  const shiftProgress1 = (() => {
    const localF = frame - DAVID_BROLL_START;
    if (localF < 0) return 0;
    if (localF > DAVID_BROLL_DUR) return Math.max(0, 1 - (localF - DAVID_BROLL_DUR) / 20);
    return Math.min(1, localF / 20);
  })();
  const shiftProgress2 = (() => {
    const localF = frame - SARAH_BROLL_START;
    if (localF < 0) return 0;
    if (localF > SARAH_BROLL_DUR) return Math.max(0, 1 - (localF - SARAH_BROLL_DUR) / 20);
    return Math.min(1, localF / 20);
  })();
  const shiftProgress = Math.max(shiftProgress1, shiftProgress2);
  const cardX = interpolate(shiftProgress, [0, 1], [0, -340]);
  const cardScale = interpolate(shiftProgress, [0, 1], [1, 0.85]);

  // Phase text: "DAVID" vs "SARAH" indicator
  const isDavidPhase = frame < 450;
  const isSarahPhase = frame >= 450 && frame < 920;
  const isClimaxPhase = frame >= 920;

  // Pull quote timing — "Facts earn a handshake. Stories earn a hug."
  // Spoken at ~63s = local frame ~980
  const pullQuoteIn = spring({ frame: Math.max(0, frame - 980), fps, config: { damping: 14, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.black }}>
      {/* Animated background */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse 50% 50% at ${25 + Math.sin(frame * 0.005) * 15}% 35%, ${BRAND.green}12 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at ${75 + Math.cos(frame * 0.007) * 12}% 65%, ${BRAND.greenDark}20 0%, transparent 50%),
          linear-gradient(135deg, ${BRAND.bgDark} 0%, ${BRAND.black} 100%)
        `,
      }} />
      <ParticleField color={BRAND.green} count={25} seed={20} intensity={0.4} />

      {/* Scene title badge */}
      <div style={{
        position: 'absolute', top: 50, left: 70, display: 'flex', alignItems: 'center', gap: 16,
        opacity: titleIn, transform: `translateX(${interpolate(titleIn, [0, 1], [-30, 0])}px)`,
        zIndex: 20,
      }}>
        <div style={{
          padding: '8px 24px', borderRadius: 8,
          background: `${BRAND.green}20`, border: `1px solid ${BRAND.green}40`,
          fontSize: 18, fontWeight: 700, color: BRAND.green, letterSpacing: 2,
          fontFamily: '-apple-system, sans-serif', textTransform: 'uppercase',
        }}>
          The Story Arc
        </div>
      </div>

      {/* Main content card — always bottom-anchored so balance scale has full top zone */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 60,
        transform: `translateX(${cardX}px) scale(${cardScale})`,
      }}>
        <GlassmorphismCard accentColor={BRAND.green} delay={15} width={1100}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Story icon — 2× */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              border: `3px solid ${BRAND.green}70`, background: `${BRAND.green}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              boxShadow: `0 0 40px ${BRAND.green}40, 0 0 80px ${BRAND.green}20`,
            }}>
              <svg width={54} height={54} viewBox="0 0 40 40">
                <path d="M8 8 L20 12 L32 8 L32 32 L20 28 L8 32 Z" fill="none"
                  stroke={BRAND.green} strokeWidth={2.5} />
                <line x1={20} y1={12} x2={20} y2={28} stroke={BRAND.green} strokeWidth={2.5} />
              </svg>
            </div>

            <h2 style={{
              color: BRAND.white,
              fontSize: isClimaxPhase ? 100 : 84,
              fontWeight: 900, margin: 0, textAlign: 'center',
              fontFamily: '-apple-system, sans-serif', letterSpacing: -2,
              textShadow: isClimaxPhase ? `0 0 40px ${BRAND.green}60` : 'none',
            }}>
              {isClimaxPhase ? (
                <span style={{
                  color: BRAND.green,
                  textShadow: `0 0 30px ${BRAND.greenGlow}, 0 0 60px ${BRAND.greenGlow}`,
                }}>The Power of Story</span>
              ) : (
                <>David vs. <span style={{ color: BRAND.green }}>Sarah</span></>
              )}
            </h2>

            <p style={{
              color: BRAND.textSecondary,
              fontSize: isClimaxPhase ? 44 : 36,
              fontFamily: '-apple-system, sans-serif',
              textAlign: 'center', marginTop: 20, lineHeight: 1.5, maxWidth: 900,
              fontWeight: isClimaxPhase ? 600 : 400,
              color: isClimaxPhase ? BRAND.white : BRAND.textSecondary,
            } as React.CSSProperties}>
              {isDavidPhase
                ? 'A 50-page deck vs. a single story. $20 million on the line.'
                : isSarahPhase
                  ? 'She made the client see their own future — no spreadsheets required.'
                  : 'People don\'t buy what you know. They buy how you make them feel.'}
            </p>
          </div>
        </GlassmorphismCard>
      </AbsoluteFill>

      {/* B-roll: boardroom (David) */}
      <BRollPlayer
        src="conference.mp4"
        accentColor={BRAND.green}
        startFrame={DAVID_BROLL_START}
        durationFrames={DAVID_BROLL_DUR}
      />

      {/* B-roll: warm meeting (Sarah) — use teamwork for warmth */}
      <BRollPlayer
        src="teamwork.mp4"
        accentColor={BRAND.green}
        startFrame={SARAH_BROLL_START}
        durationFrames={SARAH_BROLL_DUR}
      />

      {/* Balance Scale graphic — appears from frame 300 */}
      <BalanceScale delay={300} />

      {/* Pull quote overlay: "Facts inform... Stories transform" */}
      {pullQuoteIn > 0.01 && (
        <div style={{
          position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)',
          opacity: pullQuoteIn, zIndex: 20,
        }}>
          <div style={{
            padding: '20px 48px', borderRadius: 12,
            background: `${BRAND.green}CC`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 4px 30px ${BRAND.greenGlow}`,
          }}>
            <p style={{
              color: BRAND.white, fontSize: 32, fontWeight: 600,
              fontFamily: '-apple-system, sans-serif',
              fontStyle: 'italic', margin: 0, textAlign: 'center',
            }}>
              Facts earn a handshake. Stories earn a hug.
            </p>
          </div>
        </div>
      )}

      {/* Kinetic text at 80% */}
      <KineticText
        text="FACTS INFORM. STORIES TRANSFORM."
        color={BRAND.white}
        fontSize={52}
        delay={Math.floor(sceneDuration * 0.82)}
        duration={Math.floor(sceneDuration * 0.16)}
        glow
      />

      <NoiseOverlay opacity={0.03} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3: THE APPLICATION — Winter to Spring + AI Co-Pilot
// Split landscape graphic + bridge + typewriter text
// ═══════════════════════════════════════════════════════════════════════════════

const WinterSpringLandscape: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  const entrance = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 50 } });

  // Snow particle drift
  const snowDrift = localFrame * 0.5;

  // ── Bridge draw-in timed to "bridge of stories" narration (~11.3s = frame 340 in scene)
  // Triggered at localFrame 300, fully built by ~520
  const BRIDGE_TRIGGER = 300;
  const bf = Math.max(0, localFrame - BRIDGE_TRIGGER); // frames since trigger
  const towerProgress   = interpolate(bf, [0, 50],   [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cableProgress   = interpolate(bf, [40, 120],  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const plankProgress   = interpolate(bf, [110, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const textProgress    = interpolate(bf, [185, 250], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Bridge geometry — wide span (620→980 = 360px) centered at x=800
  const BL = 620;          // bridge left anchor x
  const BR = 980;          // bridge right anchor x
  const BM = 800;          // bridge center x
  const TOWER_TOP  = 248;  // top of towers y
  const TOWER_BASE = 345;  // tower base / deck level y
  const CABLE_SAG  = 292;  // lowest point of main suspension cable y
  const NUM_PLANKS = 14;   // number of deck planks

  return (
    <div style={{
      position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
      width: 1600, height: 500, opacity: entrance, zIndex: 5,
    }}>
      <svg width={1600} height={500} viewBox="0 0 1600 500" overflow="visible">

        <defs>
          <linearGradient id="winterSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a4a5a" />
            <stop offset="100%" stopColor="#6a6a7a" />
          </linearGradient>
          <linearGradient id="springSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.green} />
            <stop offset="100%" stopColor={BRAND.greenLight} />
          </linearGradient>
          {/* Gold glow filter for bridge structure */}
          <filter id="goldGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#F5A623" floodOpacity="0.85" />
          </filter>
          {/* Stronger gold glow for the STORYSELLING text */}
          <filter id="goldTextGlow" x="-30%" y="-60%" width="160%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#F5A623" floodOpacity="1" />
            <feDropShadow dx="0" dy="0" stdDeviation="4"  floodColor="#ffffff" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* ── WINTER SIDE (left, grayscale) ── */}
        <rect x={0} y={0} width={780} height={350} fill="url(#winterSky)" />
        <rect x={0} y={350} width={780} height={150} fill="#8a8a9a" />
        <ellipse cx={150} cy={360} rx={120} ry={20} fill="#c0c0c8" />
        <ellipse cx={400} cy={370} rx={90}  ry={15} fill="#b0b0b8" />
        <ellipse cx={650} cy={365} rx={100} ry={18} fill="#c5c5cd" />

        {/* Winter trees (bare) */}
        {[120, 280, 500, 630].map((x, i) => (
          <g key={`wt-${i}`}>
            <line x1={x} y1={350} x2={x}      y2={250 - i * 8} stroke="#5a5a5a" strokeWidth={4} />
            <line x1={x} y1={280} x2={x - 25} y2={260}          stroke="#5a5a5a" strokeWidth={2} />
            <line x1={x} y1={290} x2={x + 20} y2={265}          stroke="#5a5a5a" strokeWidth={2} />
            <line x1={x} y1={310} x2={x - 18} y2={295}          stroke="#5a5a5a" strokeWidth={2} />
          </g>
        ))}

        {/* Snowflakes */}
        {Array.from({ length: 20 }, (_, i) => {
          const sx = (i * 39 + snowDrift) % 780;
          const sy = (i * 47 + snowDrift * 0.7 + i * 13) % 340;
          return <circle key={`sf-${i}`} cx={sx} cy={sy} r={2} fill="white" opacity={0.5 + (i % 3) * 0.15} />;
        })}

        <text x={390} y={440} textAnchor="middle" fontSize={28} fill="#999"
          fontFamily="-apple-system, sans-serif" fontWeight={700} letterSpacing={6}>WINTER</text>
        <text x={390} y={470} textAnchor="middle" fontSize={16} fill="#777"
          fontFamily="-apple-system, sans-serif" letterSpacing={2}>FEAR · UNCERTAINTY</text>

        {/* ── SPRING SIDE (right, vibrant green) ── */}
        <rect x={820} y={0}   width={780} height={350} fill="url(#springSky)" />
        <rect x={820} y={350} width={780} height={150} fill={BRAND.greenDark} />
        <ellipse cx={1050} cy={355} rx={150} ry={30} fill={BRAND.green}      opacity={0.7} />
        <ellipse cx={1350} cy={360} rx={120} ry={25} fill={BRAND.greenLight} opacity={0.6} />

        {/* Spring trees */}
        {[960, 1130, 1310, 1480].map((x, i) => (
          <g key={`st-${i}`}>
            <rect x={x - 4} y={290} width={8} height={60} fill="#3d2e17" rx={3} />
            <circle cx={x}      cy={270} r={32 + i * 3} fill={BRAND.green}      opacity={0.8} />
            <circle cx={x - 12} cy={278} r={22}         fill={BRAND.greenLight} opacity={0.6} />
          </g>
        ))}

        <circle cx={1400} cy={60} r={35} fill="#FFD700" opacity={0.9} />
        <circle cx={1400} cy={60} r={50} fill="#FFD700" opacity={0.2} />

        <text x={1200} y={440} textAnchor="middle" fontSize={28} fill={BRAND.white}
          fontFamily="-apple-system, sans-serif" fontWeight={700} letterSpacing={6}>SPRING</text>
        <text x={1200} y={470} textAnchor="middle" fontSize={16} fill="rgba(255,255,255,0.7)"
          fontFamily="-apple-system, sans-serif" letterSpacing={2}>CONFIDENCE · FREEDOM</text>

        {/* ══════════════════════════════════════════════
            BRIDGE — animated draw-in at BRIDGE_TRIGGER
            Gold towers → catenary cables → suspenders → planks → STORYSELLING text
        ══════════════════════════════════════════════ */}
        <g>
          {/* ── LEFT TOWER: grows upward from deck ── */}
          <rect
            x={BL - 8} y={TOWER_TOP + (1 - towerProgress) * (TOWER_BASE - TOWER_TOP)}
            width={16}  height={(TOWER_BASE - TOWER_TOP) * towerProgress}
            fill="#F5A623" rx={4} opacity={towerProgress} filter="url(#goldGlow)"
          />
          {/* Tower cap left */}
          <rect x={BL - 14} y={TOWER_TOP + (1 - towerProgress) * (TOWER_BASE - TOWER_TOP) - 8}
            width={28} height={10} fill="#F5A623" rx={3}
            opacity={towerProgress} filter="url(#goldGlow)"
          />

          {/* ── RIGHT TOWER: grows upward from deck ── */}
          <rect
            x={BR - 8} y={TOWER_TOP + (1 - towerProgress) * (TOWER_BASE - TOWER_TOP)}
            width={16}  height={(TOWER_BASE - TOWER_TOP) * towerProgress}
            fill="#F5A623" rx={4} opacity={towerProgress} filter="url(#goldGlow)"
          />
          {/* Tower cap right */}
          <rect x={BR - 14} y={TOWER_TOP + (1 - towerProgress) * (TOWER_BASE - TOWER_TOP) - 8}
            width={28} height={10} fill="#F5A623" rx={3}
            opacity={towerProgress} filter="url(#goldGlow)"
          />

          {/* ── MAIN SUSPENSION CABLE (upper arc, draws in left→right) ── */}
          <path
            d={`M ${BL} ${TOWER_TOP + 10} Q ${BM} ${CABLE_SAG} ${BR} ${TOWER_TOP + 10}`}
            stroke="#F5A623" strokeWidth={5} fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={interpolate(cableProgress, [0, 1], [1, 0])}
            filter="url(#goldGlow)"
            opacity={Math.min(1, cableProgress * 3)}
          />
          {/* Second cable (parallel, 12px below for depth) */}
          <path
            d={`M ${BL} ${TOWER_TOP + 22} Q ${BM} ${CABLE_SAG + 12} ${BR} ${TOWER_TOP + 22}`}
            stroke="#F5A623" strokeWidth={3} fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={interpolate(cableProgress, [0.1, 1], [1, 0])}
            opacity={Math.min(0.6, cableProgress * 2)}
          />

          {/* ── VERTICAL SUSPENDERS (10 cables hanging from main arc to deck) ── */}
          {Array.from({ length: 10 }, (_, i) => {
            const t = (i + 0.5) / 10;
            const suspX = BL + t * (BR - BL);
            // Quadratic bezier y at parameter t:
            // y = (1-t)² * (TOWER_TOP+10) + 2(1-t)t * CABLE_SAG + t² * (TOWER_TOP+10)
            const y0 = TOWER_TOP + 10;
            const cableY = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * CABLE_SAG + t * t * y0;
            const sp = interpolate(cableProgress, [0.25 + i * 0.05, 0.55 + i * 0.04], [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <line key={`susp-${i}`}
                x1={suspX} y1={cableY} x2={suspX} y2={TOWER_BASE - 8}
                stroke={BRAND.white} strokeWidth={1.5} opacity={sp * 0.65}
              />
            );
          })}

          {/* ── DECK PLANKS (drop in sequentially) ── */}
          {Array.from({ length: NUM_PLANKS }, (_, i) => {
            const pp = interpolate(plankProgress, [i / NUM_PLANKS * 0.85, i / NUM_PLANKS * 0.85 + 0.15], [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const pw = (BR - BL) / NUM_PLANKS;
            const px = BL + i * pw + 2;
            const dropY = interpolate(pp, [0, 1], [-18, 0]);
            return (
              <rect key={`plank-${i}`}
                x={px} y={TOWER_BASE - 6 + dropY} width={pw - 4} height={8} rx={2}
                fill="#F5A623" opacity={pp}
                filter={pp > 0.6 ? 'url(#goldGlow)' : undefined}
              />
            );
          })}

          {/* ── DECK RAILINGS ── */}
          <line x1={BL} y1={TOWER_BASE - 14} x2={BR} y2={TOWER_BASE - 14}
            stroke={BRAND.white} strokeWidth={3} opacity={plankProgress} />
          <line x1={BL} y1={TOWER_BASE + 2}  x2={BR} y2={TOWER_BASE + 2}
            stroke={BRAND.white} strokeWidth={3} opacity={plankProgress} />

          {/* ── "STORYSELLING" — large gold text, fades + rises into position ── */}
          <text
            x={BM} y={TOWER_TOP - 18}
            textAnchor="middle"
            fontSize={42}
            fill="#F5A623"
            fontFamily="-apple-system, sans-serif"
            fontWeight={900}
            letterSpacing={5}
            filter="url(#goldTextGlow)"
            opacity={textProgress}
            style={{ transform: `translateY(${interpolate(textProgress, [0, 1], [16, 0])}px)` }}
          >
            STORYSELLING
          </text>
          {/* Subtitle under the big label */}
          <text
            x={BM} y={TOWER_TOP + 2}
            textAnchor="middle"
            fontSize={18}
            fill={BRAND.white}
            fontFamily="-apple-system, sans-serif"
            fontWeight={400}
            letterSpacing={4}
            opacity={interpolate(textProgress, [0.4, 1], [0, 0.75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          >
            THE BRIDGE
          </text>
        </g>
      </svg>
    </div>
  );
};

const ApplicationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = SCENE.APP_END - SCENE.APP_START;

  // "So What?" typewriter — appears at ~22s into this scene (local frame ~660)
  const soWhatDelay = 660;

  // Card shift for B-roll
  const brollLocalFrame = frame - COPILOT_BROLL_START;
  const brollShift = (() => {
    if (brollLocalFrame < 0) return 0;
    if (brollLocalFrame > COPILOT_BROLL_DUR) return Math.max(0, 1 - (brollLocalFrame - COPILOT_BROLL_DUR) / 20);
    return Math.min(1, brollLocalFrame / 20);
  })();
  const cardX = interpolate(brollShift, [0, 1], [0, -340]);
  const cardScale = interpolate(brollShift, [0, 1], [1, 0.85]);

  // Phase detection with crossfade transition (30 frames = 1s)
  const PHASE_TRANSITION = 660;
  const PHASE_FADE = 30;
  const isFrameworkPhase = frame < PHASE_TRANSITION + PHASE_FADE;
  const isCopilotPhase = frame >= PHASE_TRANSITION - PHASE_FADE;
  const frameworkOpacity = frame < PHASE_TRANSITION ? 1 :
    interpolate(frame, [PHASE_TRANSITION, PHASE_TRANSITION + PHASE_FADE], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const copilotOpacity = frame < PHASE_TRANSITION ? 0 :
    interpolate(frame, [PHASE_TRANSITION, PHASE_TRANSITION + PHASE_FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.black }}>
      {/* Animated background */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse 60% 50% at 30% 40%, ${BRAND.green}10 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 70% 60%, ${BRAND.greenDark}15 0%, transparent 50%),
          linear-gradient(180deg, ${BRAND.bgDark} 0%, ${BRAND.black} 100%)
        `,
      }} />
      <ParticleField color={BRAND.green} count={30} seed={35} intensity={0.5} />

      {/* Scene badge */}
      <div style={{
        position: 'absolute', top: 50, left: 70,
        padding: '8px 24px', borderRadius: 8,
        background: `${BRAND.green}20`, border: `1px solid ${BRAND.green}40`,
        fontSize: 18, fontWeight: 700, color: BRAND.green, letterSpacing: 2,
        fontFamily: '-apple-system, sans-serif', textTransform: 'uppercase',
        zIndex: 20,
      }}>
        The Framework
      </div>

      {/* Winter-to-Spring landscape graphic — fades out with crossfade */}
      {frameworkOpacity > 0 && (
        <div style={{ opacity: frameworkOpacity }}>
          <WinterSpringLandscape delay={20} />
        </div>
      )}

      {/* Main content card — positioned below landscape when framework is showing */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isFrameworkPhase ? 'flex-end' : 'center',
        paddingBottom: isFrameworkPhase ? 50 : 0,
        transform: `translateX(${cardX}px) scale(${cardScale})`,
      }}>
        <GlassmorphismCard accentColor={BRAND.green} delay={10} width={1100}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Bridge/compass icon — 2× */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              border: `3px solid ${BRAND.green}70`, background: `${BRAND.green}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
              boxShadow: `0 0 40px ${BRAND.green}40`,
            }}>
              <svg width={54} height={54} viewBox="0 0 40 40">
                <path d="M4 28 Q12 16 20 28 Q28 16 36 28" fill="none"
                  stroke={BRAND.green} strokeWidth={2.5} />
                <line x1={4} y1={28} x2={4} y2={34} stroke={BRAND.green} strokeWidth={2} />
                <line x1={36} y1={28} x2={36} y2={34} stroke={BRAND.green} strokeWidth={2} />
                <line x1={20} y1={20} x2={20} y2={34} stroke={BRAND.green} strokeWidth={2} />
              </svg>
            </div>

            {/* Framework phase title — fades out during crossfade */}
            {frameworkOpacity > 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: frameworkOpacity }}>
                <h2 style={{
                  color: BRAND.white, fontSize: 84, fontWeight: 900, margin: 0, textAlign: 'center',
                  fontFamily: '-apple-system, sans-serif', letterSpacing: -2,
                }}>
                  Winter to <span style={{ color: BRAND.green, textShadow: `0 0 25px ${BRAND.greenGlow}` }}>Spring</span>
                </h2>
                <p style={{
                  color: BRAND.textSecondary, fontSize: 36,
                  fontFamily: '-apple-system, sans-serif',
                  textAlign: 'center', marginTop: 20, lineHeight: 1.5, maxWidth: 900,
                }}>
                  Build a bridge of stories — from fear to freedom, from Winter to Spring.
                </p>
              </div>
            )}
            {/* Co-pilot phase title — fades in during crossfade */}
            {copilotOpacity > 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: copilotOpacity }}>
                <h2 style={{
                  color: BRAND.white, fontSize: 84, fontWeight: 900, margin: 0, textAlign: 'center',
                  fontFamily: '-apple-system, sans-serif', letterSpacing: -2,
                }}>
                  AI: Your <span style={{ color: BRAND.green, textShadow: `0 0 25px ${BRAND.greenGlow}` }}>Co-Pilot</span>
                </h2>
                <p style={{
                  color: BRAND.textSecondary, fontSize: 36,
                  fontFamily: '-apple-system, sans-serif',
                  textAlign: 'center', marginTop: 20, lineHeight: 1.5, maxWidth: 900,
                }}>
                  Generate metaphors. Rehearse conversations. Find the story inside the data.
                </p>
              </div>
            )}
          </div>
        </GlassmorphismCard>
      </AbsoluteFill>

      {/* B-roll: coding/AI (co-pilot segment) */}
      <BRollPlayer
        src="coding.mp4"
        accentColor={BRAND.green}
        startFrame={COPILOT_BROLL_START}
        durationFrames={COPILOT_BROLL_DUR}
      />

      {/* "So What?" typewriter text */}
      {frame >= soWhatDelay && frame < soWhatDelay + 90 && (
        <div style={{
          position: 'absolute', top: 160, left: '50%', transform: 'translateX(-50%)',
          zIndex: 25,
        }}>
          <TypewriterText
            text="So What?"
            delay={0}
            speed={4}
            color={BRAND.green}
            fontSize={56}
            glowColor={BRAND.green}
            fontWeight={800}
          />
        </div>
      )}

      {/* Kinetic text at 85% */}
      <KineticText
        text="AI: YOUR STORYSELLING CO-PILOT"
        color={BRAND.green}
        fontSize={48}
        delay={Math.floor(sceneDuration * 0.85)}
        duration={Math.floor(sceneDuration * 0.13)}
        glow
      />

      <NoiseOverlay opacity={0.03} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4: CTA — Take the 60-Second AI Quiz
// QR code, lower-third, URL banner
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Real QR Code — generated from https://60-second-ai-quiz.netlify.app/ ────
const QRCodeGraphic: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  const entrance = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 80 } });
  const pulseGlow = 0.4 + Math.sin(localFrame * 0.08) * 0.3;
  const pulseScale = 1 + Math.sin(localFrame * 0.06) * 0.02;

  return (
    <div style={{
      position: 'absolute', bottom: 95, right: 80,
      opacity: entrance,
      transform: `scale(${interpolate(entrance, [0, 1], [0.8, 1]) * pulseScale})`,
      zIndex: 20,
    }}>
      {/* White padded frame with pulsing green glow */}
      <div style={{
        padding: 14, background: BRAND.white, borderRadius: 16,
        boxShadow: `
          0 0 ${35 * pulseGlow}px ${BRAND.greenGlow},
          0 0 ${70 * pulseGlow}px ${BRAND.green}20,
          0 8px 32px rgba(0,0,0,0.5)
        `,
        border: `3px solid ${BRAND.green}`,
      }}>
        {/* Real QR code image — scans to https://60-second-ai-quiz.netlify.app/ */}
        <Img
          src={staticFile('qr-60sec-quiz.png')}
          style={{ width: 220, height: 220, display: 'block', borderRadius: 4 }}
        />
      </div>
      <p style={{
        color: BRAND.white, fontSize: 18, fontWeight: 600,
        textAlign: 'center', marginTop: 10,
        fontFamily: '-apple-system, sans-serif',
        letterSpacing: 1,
        textShadow: `0 0 10px ${BRAND.greenGlow}`,
      }}>
        📱 Scan to take the quiz
      </p>
    </div>
  );
};

const LowerThird: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16, stiffness: 80 } });

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
      opacity: entrance,
      transform: `translateY(${interpolate(entrance, [0, 1], [120, 0])}px)`,
      zIndex: 15,
    }}>
      {/* Black banner for URL */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        backgroundColor: BRAND.black, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderTop: `2px solid ${BRAND.green}`,
      }}>
        <span style={{
          fontSize: 28, fontWeight: 800, color: BRAND.white, letterSpacing: 2,
          fontFamily: '-apple-system, sans-serif',
        }}>
          60-second-ai-quiz.netlify.app
        </span>
      </div>

      {/* Green accent strip with credentials */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, width: 500, height: 56,
        background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.green}CC)`,
        display: 'flex', alignItems: 'center', padding: '0 30px',
        borderRadius: '0 8px 0 0',
      }}>
        <div>
          <span style={{
            fontSize: 20, fontWeight: 700, color: BRAND.white,
            fontFamily: '-apple-system, sans-serif',
          }}>
            Scott Magnacca
          </span>
          <span style={{
            fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.8)',
            fontFamily: '-apple-system, sans-serif', marginLeft: 16,
          }}>
            AI & Storyselling Strategist
          </span>
        </div>
      </div>
    </div>
  );
};

const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleIn   = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 12, stiffness: 90 } });
  const ctaIn     = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 14, stiffness: 60 } });
  const taglineIn = spring({ frame: Math.max(0, frame - 80), fps, config: { damping: 18, stiffness: 60 } });

  // Animated glow pulses
  const glowPulse    = 0.5 + Math.sin(frame * 0.06) * 0.35;
  const glowPulse2   = 0.4 + Math.sin(frame * 0.09 + 1.5) * 0.3;
  const ringScale    = 1 + Math.sin(frame * 0.04) * 0.06;
  const ringOpacity  = 0.12 + Math.sin(frame * 0.05) * 0.08;
  const ringScale2   = 1 + Math.sin(frame * 0.035 + 0.8) * 0.08;
  const ringOpacity2 = 0.07 + Math.sin(frame * 0.04 + 1) * 0.05;

  // Animated headline color shimmer (cycles through white → green → white)
  const shimmerT     = (Math.sin(frame * 0.04) + 1) / 2; // 0→1→0
  const humanityGlow = `0 0 ${20 + shimmerT * 40}px ${BRAND.greenGlow}, 0 0 ${40 + shimmerT * 60}px ${BRAND.greenGlow}`;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.black }}>
      {/* Deep radial background */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse 70% 70% at 50% 50%, ${BRAND.green}18 0%, ${BRAND.green}05 40%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 30% 70%, ${BRAND.green}10 0%, transparent 50%),
          linear-gradient(180deg, ${BRAND.bgDark} 0%, ${BRAND.black} 100%)
        `,
      }} />

      {/* Concentric pulsing rings — centered */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${ringScale2})`,
        width: 900, height: 900, borderRadius: '50%',
        border: `1px solid ${BRAND.green}`,
        opacity: ringOpacity2,
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${ringScale})`,
        width: 650, height: 650, borderRadius: '50%',
        border: `1.5px solid ${BRAND.green}`,
        opacity: ringOpacity,
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -60%)`,
        width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(circle, ${BRAND.green}${Math.floor(glowPulse2 * 50).toString(16).padStart(2,'0')} 0%, transparent 70%)`,
      }} />

      <ParticleField color={BRAND.green} count={30} seed={55} intensity={0.4} />

      {/* Main CTA content */}
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', paddingBottom: 140,
      }}>
        {/* Eyebrow label */}
        <div style={{
          fontSize: 22, fontWeight: 600, color: BRAND.green, letterSpacing: 5,
          textTransform: 'uppercase', fontFamily: '-apple-system, sans-serif',
          opacity: titleIn * 0.85, marginBottom: 20,
          textShadow: `0 0 15px ${BRAND.greenGlow}`,
        }}>
          The Bottom Line
        </div>

        {/* Big headline with shimmer */}
        <h1 style={{
          fontSize: 84, fontWeight: 900, color: BRAND.white, margin: 0, textAlign: 'center',
          fontFamily: '-apple-system, sans-serif', letterSpacing: -2, lineHeight: 1.1,
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px) scale(${interpolate(titleIn, [0, 1], [0.95, 1])})`,
          textShadow: `0 2px 40px rgba(255,255,255,0.15)`,
        }}>
          AI amplifies your{' '}
          <span style={{
            color: BRAND.green,
            textShadow: humanityGlow,
            display: 'inline-block',
            transform: `scale(${1 + shimmerT * 0.04})`,
          }}>
            humanity
          </span>
        </h1>

        {/* Sub-headline */}
        <p style={{
          fontSize: 36, fontWeight: 400, color: BRAND.textSecondary, margin: '20px 0 0',
          fontFamily: '-apple-system, sans-serif', textAlign: 'center',
          opacity: spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 16, stiffness: 70 } }),
          letterSpacing: 0.5,
        }}>
          It's a force multiplier for your <span style={{ color: BRAND.white, fontWeight: 700 }}>intent</span>.
        </p>

        {/* CTA box — <a> tag makes it clickable in Remotion Player web embed + iPad/iPhone */}
        <a
          href="https://60-second-ai-quiz.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textDecoration: 'none',
            marginTop: 50, padding: '32px 72px',
            background: `linear-gradient(135deg, ${BRAND.green}20, ${BRAND.green}08)`,
            border: `2px solid ${BRAND.green}`,
            borderRadius: 20, opacity: ctaIn,
            boxShadow: `
              0 0 ${50 * glowPulse}px ${BRAND.greenGlow},
              0 0 ${100 * glowPulse}px ${BRAND.green}30,
              inset 0 0 ${30 * glowPulse}px ${BRAND.green}08,
              0 20px 60px rgba(0,0,0,0.5)
            `,
            transform: `scale(${interpolate(ctaIn, [0, 1], [0.88, 1])})`,
            cursor: 'pointer',
          }}
        >
          <h2 style={{
            fontSize: 54, fontWeight: 900, color: BRAND.white, margin: 0,
            fontFamily: '-apple-system, sans-serif', letterSpacing: -1,
            textShadow: `0 0 ${20 * glowPulse}px ${BRAND.greenGlow}`,
          }}>
            Take the{' '}
            <span style={{
              color: BRAND.green,
              textShadow: `0 0 ${30 * glowPulse}px ${BRAND.greenGlow}, 0 0 ${60 * glowPulse}px ${BRAND.greenGlow}`,
            }}>
              60-Second AI Quiz
            </span>
          </h2>
        </a>

        {/* Tagline */}
        <p style={{
          fontSize: 28, color: BRAND.textSecondary, marginTop: 24,
          fontFamily: '-apple-system, sans-serif',
          opacity: taglineIn, letterSpacing: 2, textTransform: 'uppercase',
        }}>
          Discover your AI storyselling edge
        </p>

        {/* Bouncing arrow pointing at URL */}
        <div style={{
          marginTop: 16,
          transform: `translateY(${Math.sin(frame * 0.1) * 10}px)`,
          opacity: taglineIn,
        }}>
          <svg width={48} height={28} viewBox="0 0 48 28">
            <path d="M6 5 L24 22 L42 5" fill="none" stroke={BRAND.green} strokeWidth={3.5}
              strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 8px ${BRAND.green})` }} />
          </svg>
        </div>
      </AbsoluteFill>

      {/* QR Code */}
      <QRCodeGraphic delay={40} />

      {/* Lower third with credentials + URL banner */}
      <LowerThird delay={30} />

      <NoiseOverlay opacity={0.04} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

export const StorysellingVideo: React.FC<{
  audioSrc?: string;
}> = ({ audioSrc = 'storyselling-ai.mp3' }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.black }}>
      <Audio src={staticFile('audio/' + audioSrc)} />

      {/* Scene 1: Hook (0:00–0:30) */}
      <Sequence from={SCENE.HOOK_START} durationInFrames={SCENE.HOOK_END - SCENE.HOOK_START}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Story Arc (0:30–1:18) */}
      <Sequence from={SCENE.STORY_START} durationInFrames={SCENE.STORY_END - SCENE.STORY_START}>
        <StoryScene />
      </Sequence>

      {/* Scene 3: Application (1:18–2:06) */}
      <Sequence from={SCENE.APP_START} durationInFrames={SCENE.APP_END - SCENE.APP_START}>
        <ApplicationScene />
      </Sequence>

      {/* Scene 4: CTA (2:06–2:28) */}
      <Sequence from={SCENE.CTA_START} durationInFrames={SCENE.CTA_END - SCENE.CTA_START}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// ─── CTA-Only composition: renders just the CTA scene with audio offset ───────
// Audio starts at 3770/30 = 125.67s into the full track
export const StoryselllingCTAOnlyComp: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.black }}>
      <Audio
        src={staticFile('audio/storyselling-ai.mp3')}
        startFrom={3770}   // skip first 125.67s, play from CTA start
      />
      <CTAScene />
    </AbsoluteFill>
  );
};
