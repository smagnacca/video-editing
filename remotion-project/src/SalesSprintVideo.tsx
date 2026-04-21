import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { StatCard } from './components/StatCard';
import { FrameworkCard } from './components/FrameworkCard';
import { TestimonialLine } from './components/TestimonialLine';
import { EventCard } from './components/EventCard';
import { WordReveal } from './components/WordReveal';

// ─── Whisper word-level timestamps (30fps) — Scott's voice @ 113.50s ────────
// f14     (0.48s)  "82%"                → Scene 1 visuals start
// f285    (9.50s)  "But"                → Scene 2 start
// f547    (18.24s) "You won't"          → Scene 3 start
// f569    (18.96s) "replaced" trigger   → strikethrough draws (local f22)
// f619    (20.62s) "You'll"             → line 2 fade-in (local f72)
// f660    (22.00s) "using AI"           → USING AI pulse (local f113)
// f672    (22.40s) "to find buyers"     → popup 1 (local f125)
// f729    (24.27s) "engage them first"  → popup 2 (local f182)
// f787    (26.13s) "book the meeting"   → popup 3 (local f240)
// f894    (29.80s) "77%"                → Scene 4 start
// f1140   (38.00s) "56%"                → counter 2 (local f246)
// f1241   (41.38s) "Introducing"        → Scene 5 start
// f1282   (42.72s) "15"                 → stacked word 2 (local f41)
// f1313   (43.78s) "sprint"             → stacked word 3 (local f72)
// f1349   (44.96s) "One"                → subtitle (local f108)
// f1681   (56.02s) "Minutes 1"          → Scene 6 start
// f1999   (66.62s) "Minutes 6"          → Card 2 (local f318)
// f2190   (73.00s) "Minutes 11"         → Card 3 (local f509)
// f2448   (81.60s) "Marcus"             → Scene 7 start
// f2632   (87.72s) "Priya"              → testimonial 2 (local f184)
// f2754   (91.80s) "Dan"                → testimonial 3 (local f306)
// f2924   (97.48s) "Wednesday"          → Scene 8 start
// f3156   (105.20s)"Reserve"            → Scene 9a start
// f3356   (111.86s)"Don't"              → Scene 9b start

export const SALES_SPRINT_TOTAL_FRAMES = 3555; // 113.50s audio + 5s tail

// ─── Spring helper ───────────────────────────────────────────────────────────
function spr(frame: number, fps: number, damping = 18, stiffness = 90) {
  return spring({ frame: Math.max(0, frame), fps, config: { damping, stiffness } });
}

// ─── Count-up number (no Sequence wrapper — uses useCurrentFrame directly) ──
const CountUp: React.FC<{ to: number; suffix?: string; fontSize?: number; color?: string }> = ({
  to, suffix = '', fontSize = 100, color = '#f5a623',
}) => {
  const frame = useCurrentFrame();
  const easing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const progress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });
  return (
    <span style={{ fontSize, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 900, color, textShadow: `0 0 30px ${color}80` }}>
      {Math.round(to * progress)}{suffix}
    </span>
  );
};

// ─── Typewriter text ─────────────────────────────────────────────────────────
const Typewriter: React.FC<{ text: string; fontSize?: number; color?: string; charsPerFrame?: number }> = ({
  text, fontSize = 43, color = '#f5a623', charsPerFrame = 0.30,
}) => {
  const frame = useCurrentFrame();
  const n = Math.min(text.length, Math.floor(frame * charsPerFrame));
  const cursorOn = Math.round(frame * 0.12) % 2 === 0;
  return (
    <span style={{ fontSize, fontFamily: '"SF Mono", "Fira Code", monospace', fontWeight: 600, color, letterSpacing: 2, textShadow: `0 0 18px ${color}80` }}>
      {text.slice(0, n)}{n < text.length && <span style={{ opacity: cursorOn ? 1 : 0 }}>|</span>}
    </span>
  );
};

// ─── Fade-in wrapper ─────────────────────────────────────────────────────────
const FadeIn: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0, children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(frame - delay, fps);
  const y = interpolate(en, [0, 1], [28, 0]);
  return (
    <div style={{ opacity: en, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};

// ─── Slide-in card wrapper ────────────────────────────────────────────────────
const SlideIn: React.FC<{ delay?: number; from?: 'left' | 'right' | 'bottom'; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0, from = 'left', children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(frame - delay, fps, 20, 80);
  const tx = from === 'left' ? interpolate(en, [0, 1], [-360, 0]) : from === 'right' ? interpolate(en, [0, 1], [360, 0]) : 0;
  const ty = from === 'bottom' ? interpolate(en, [0, 1], [60, 0]) : 0;
  return (
    <div style={{ opacity: interpolate(en, [0, 1], [0, 1]), transform: `translate(${tx}px, ${ty}px)`, ...style }}>
      {children}
    </div>
  );
};

// ─── Speaker oval ─────────────────────────────────────────────────────────────
const SpeakerOval: React.FC<{ show: boolean }> = ({ show }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(Math.max(0, show ? frame : -1), fps, 20, 60);
  const floatY = Math.sin(frame * 0.04) * 4;
  return (
    <div style={{
      position: 'absolute', right: 40, bottom: 40,
      opacity: interpolate(en, [0, 1], [0, 1]),
      transform: `translateX(${interpolate(en, [0, 1], [200, 0])}px) translateY(${floatY}px)`,
    }}>
      <div style={{ width: 200, height: 140, borderRadius: '50%', overflow: 'hidden', border: '3px solid #f5a623', boxShadow: '0 0 24px rgba(245,166,35,0.3)' }}>
        <Img src={staticFile('scott-headshot.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} />
      </div>
      <div style={{ fontSize: 13, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#fff', textAlign: 'center', marginTop: 6 }}>Scott Magnacca</div>
      <div style={{ fontSize: 11, fontFamily: '-apple-system, sans-serif', color: '#f5a623', textAlign: 'center' }}>15 Minute Sales Sprint</div>
    </div>
  );
};

// ─── StatBlock — redesigned to eliminate text overlap ────────────────────────
// Uses useCurrentFrame() directly (no Sequence wrapper) for clean layout.
const StatBlock: React.FC<{ stat: string; label: string; source: string; countTo?: number; countDelay?: number }> = ({
  stat, label, source, countTo, countDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const easing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const localF = Math.max(0, frame - countDelay);
  const progress = interpolate(localF, [0, 90], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing,
  });
  const displayVal = countTo !== undefined ? Math.round(countTo * progress) : null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', borderLeft: '5px solid #f5a623', borderRadius: 14, padding: '32px 52px', minWidth: 520, maxWidth: 720 }}>
      {/* Fixed-height number block prevents layout shift */}
      <div style={{ minHeight: 115, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 100, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 900, color: '#f5a623', textShadow: '0 0 30px rgba(245,166,35,0.5)', lineHeight: 1 }}>
          {displayVal !== null ? `${displayVal}%` : stat}
        </span>
      </div>
      <div style={{ fontSize: 22, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: '-apple-system, sans-serif', color: '#666', fontStyle: 'italic', marginTop: 10 }}>{source}</div>
    </div>
  );
};

// ─── Popup phrase — full black-screen text impact moment ─────────────────────
const PopupPhrase: React.FC<{ text: string; startAt: number; duration?: number; color?: string; size?: number }> = ({
  text, startAt, duration = 58, color = '#00d4ff', size = 84,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startAt;
  if (lf < 0 || lf >= duration) return null;
  const en = spring({ frame: Math.max(0, lf), fps, config: { damping: 10, stiffness: 140 } });
  const fadeOut = interpolate(lf, [duration - 14, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
      <div style={{
        opacity: interpolate(en, [0, 1], [0, 1]) * fadeOut,
        transform: `scale(${interpolate(en, [0, 1], [0.55, 1])})`,
        fontSize: size,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 900,
        color,
        textTransform: 'uppercase' as const,
        letterSpacing: 6,
        textShadow: `0 0 50px ${color}80, 0 0 100px ${color}40`,
        textAlign: 'center' as const,
        padding: '0 120px',
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const SalesSprintVideo: React.FC<{ audioSrc?: string }> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Narrator at 75% volume — natural recording needs slight headroom */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={0.75} />}
      {/* Background music at level 2/10 */}
      <Audio src={staticFile('audio/background-music.mp3')} volume={0.1} />

      {/* Persistent starfield */}
      <ParticleField color="#ffffff" count={55} seed={99} intensity={0.35} />

      {/* ══════════════════════════════════════════════════
          SCENE 1 — f0 → f285  "82% of B2B buyers..."
          Visuals start at f14 when "82%" is spoken
          ══════════════════════════════════════════════════ */}
      <Sequence from={0} durationInFrames={285}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 80, gap: 16 }}>
            <WordReveal text="82% of B2B buyers research you on LinkedIn" color="#ffffff" fontSize={65} delay={14} wordStagger={4} textAlign="left" maxWidth={860} />
            <WordReveal text="before they ever take your call." color="#aaaaaa" fontSize={46} delay={50} wordStagger={5} textAlign="left" maxWidth={860} />
          </div>
          <SlideIn delay={14} from="left" style={{ position: 'absolute', left: 60, bottom: 140 }}>
            <StatBlock stat="82%" label="B2B Research Happens on LinkedIn First" source="LinkedIn Business, 2024" />
          </SlideIn>
          <SpeakerOval show={frame > 20} />
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 2 — f285 → f547  "But most reps..."
          "And they wonder" builds in GOLD and pulses on finish
          ══════════════════════════════════════════════════ */}
      <Sequence from={285} durationInFrames={262}>
        <AbsoluteFill>
          {(() => {
            // Local frame for inline pulse calculations
            const s2Local = frame - 285;
            const andTheyPulseTime = Math.max(0, s2Local - 195);
            const andTheyGlow = andTheyPulseTime > 0 ? 18 + Math.sin(andTheyPulseTime * 0.2) * 14 : 0;
            const andTheyScale = andTheyPulseTime > 0 ? 1 + Math.sin(andTheyPulseTime * 0.12) * 0.012 : 1;
            return (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, padding: '0 140px' }}>
                <FadeIn delay={2}>
                  <div style={{ fontSize: 62, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.3 }}>
                    But most reps have no LinkedIn strategy.
                  </div>
                </FadeIn>
                <FadeIn delay={86}>
                  <div style={{ fontSize: 50, fontFamily: '-apple-system, sans-serif', fontWeight: 400, color: '#aaaaaa', textAlign: 'center', lineHeight: 1.4 }}>
                    They scroll.{' '}
                    {/* Use local frame to correctly animate this span */}
                    <span style={{ opacity: interpolate(s2Local, [96, 112], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
                      They post once in a while.
                    </span>
                  </div>
                </FadeIn>
                {/* "And they wonder" — builds GOLD, then pulses */}
                <FadeIn delay={175}>
                  <div style={{
                    fontSize: 62,
                    fontFamily: '-apple-system, sans-serif',
                    fontWeight: 700,
                    color: '#f5a623',
                    textAlign: 'center',
                    textShadow: andTheyGlow > 0 ? `0 0 ${andTheyGlow}px rgba(245,166,35,0.85), 0 0 ${andTheyGlow * 2}px rgba(245,166,35,0.4)` : 'none',
                    transform: `scale(${andTheyScale})`,
                  }}>
                    And They Wonder Why Their Pipeline Is Empty.
                  </div>
                </FadeIn>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 3 — f547 → f894  Strikethrough reframe
          Strikethrough draws at local f22 — uses local frame for correct animation
          "USING AI" pulses gold when narrator says it (local f113)
          Popup phrases overlay as standalone black-screen moments:
            "TO FIND BUYERS"    local f125–f183
            "ENGAGE THEM FIRST" local f183–f241
            "BOOK THE MEETING"  local f241–f299
          ══════════════════════════════════════════════════ */}
      <Sequence from={547} durationInFrames={347}>
        <AbsoluteFill>
          {(() => {
            const s3Local = frame - 547;
            // "USING AI" pulse — starts when narrator says it at local f113
            const usingAIPulseTime = Math.max(0, s3Local - 113);
            const usingAIGlow = usingAIPulseTime > 0
              ? 25 + Math.sin(usingAIPulseTime * 0.25) * 18
              : 20;
            const usingAIScale = usingAIPulseTime > 0
              ? 1 + Math.sin(usingAIPulseTime * 0.18) * 0.014
              : 1;
            return (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 36 }}>

                {/* Line 1 with animated strikethrough — BOLDER, synced to "replaced" */}
                <FadeIn delay={2}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ fontSize: 70, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#ffffff', textAlign: 'center' }}>
                      You won't be replaced by AI.
                    </div>
                    {/* Strikethrough uses LOCAL frame — draws as narrator says "replaced" */}
                    <div style={{
                      position: 'absolute', top: '50%', left: 0,
                      height: 12,
                      width: `${interpolate(s3Local, [22, 42], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`,
                      background: 'linear-gradient(90deg, #e53e3e, #ff6b6b)',
                      borderRadius: 4,
                      boxShadow: '0 0 22px rgba(229,62,62,0.95), 0 0 44px rgba(229,62,62,0.5)',
                      transform: 'translateY(-50%)',
                    }} />
                  </div>
                </FadeIn>

                {/* Line 2 — "USING AI" pulses gold when spoken */}
                <FadeIn delay={72}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 70, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#ffffff' }}>
                      You'll be replaced by a rep{' '}
                    </span>
                    <span style={{
                      fontSize: 70,
                      fontFamily: '-apple-system, sans-serif',
                      fontWeight: 900,
                      color: '#f5a623',
                      textShadow: `0 0 ${usingAIGlow}px rgba(245,166,35,0.9), 0 0 ${usingAIGlow * 2}px rgba(245,166,35,0.5)`,
                      display: 'inline-block',
                      transform: `scale(${usingAIScale})`,
                    }}>
                      USING AI.
                    </span>
                  </div>
                </FadeIn>
              </div>
            );
          })()}

          {/* Popup phrases — timed to echo narration
              :24 = local f173  TO FIND BUYERS
              :25 = local f203  ENGAGE THEM FIRST
              :27 = local f263  BOOK THE MEETING   */}
          <PopupPhrase text="TO FIND BUYERS"    startAt={173} duration={45} color="#00d4ff" size={84} />
          <PopupPhrase text="ENGAGE THEM FIRST" startAt={203} duration={45} color="#ffffff"  size={84} />
          <PopupPhrase text="BOOK THE MEETING"  startAt={263} duration={45} color="#f5a623"  size={84} />
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 4 — f894 → f1241  77% + 56% counters
          Layout: explicit non-overlapping vertical positions
            77% card:    top 60  → bottom ~310
            skills gap:  top 370 → bottom ~500  (96px text)
            56% card:    top 550 → bottom ~800
          ══════════════════════════════════════════════════ */}
      <Sequence from={894} durationInFrames={347}>
        <AbsoluteFill>
          {/* 77% card — top of screen, slides from left */}
          <SlideIn delay={2} from="left" style={{ position: 'absolute', top: 60, left: 140 }}>
            <StatBlock stat="" label="of Employers Now Expect AI-Ready Professionals" source="CarringtonCrisp, See the Future 2026 (n=1,863, 40 countries)" countTo={77} countDelay={2} />
          </SlideIn>

          {/* "The skills gap" — positioned below 77% card, no transform conflict */}
          <div style={{ position: 'absolute', top: 370, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <FadeIn delay={110}>
              <div style={{
                fontSize: 96,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 900,
                color: '#ffffff',
                textAlign: 'center',
                textShadow: '0 0 50px rgba(255,255,255,0.3), 0 0 100px rgba(255,255,255,0.1)',
                letterSpacing: 2,
              }}>
                The skills gap is already widening.
              </div>
            </FadeIn>
          </div>

          {/* 56% card — at f1140 global = f246 local, slides from right */}
          <SlideIn delay={246} from="right" style={{ position: 'absolute', top: 550, right: 140 }}>
            <StatBlock stat="" label="Wage Premium for AI-Skilled Workers" source="PwC, Global AI Jobs Barometer 2025" countTo={56} countDelay={246} />
          </SlideIn>
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 5 — f1241 → f1681  "THE 15 MINUTE SALES SPRINT"
          "THE" flashes in bright white at :42
          15 MINUTE / SALES SPRINT drop in with spring
          ONE / POWERFUL / PLAY stagger in under SALES SPRINT
          ══════════════════════════════════════════════════ */}
      <Sequence from={1241} durationInFrames={440}>
        <AbsoluteFill>
          {(() => {
            const s5Local = frame - 1241;
            // "THE" — white burst flash: high-stiffness spring, glow that fades after ~2s
            const theEn = spr(s5Local - 2, fps, 5, 250);
            const theGlow = Math.max(0, 70 - s5Local * 1.6);
            return (
              <div style={{
                position: 'absolute', top: 120, left: 0, right: 0,
                display: 'flex', justifyContent: 'center',
                opacity: interpolate(theEn, [0, 1], [0, 1]),
                transform: `scale(${interpolate(theEn, [0, 1], [1.4, 1])})`,
                fontSize: 62,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 900, color: '#ffffff',
                textTransform: 'uppercase' as const, letterSpacing: 8,
                textShadow: theGlow > 0 ? `0 0 ${theGlow}px rgba(255,255,255,0.98), 0 0 ${theGlow * 2}px rgba(255,255,255,0.5)` : 'none',
              }}>THE</div>
            );
          })()}

          {/* 15 MINUTE and SALES SPRINT */}
          {[
            { text: '15 MINUTE',    color: '#f5a623', size: 134, delay: 41, top: 195 },
            { text: 'SALES SPRINT', color: '#ffffff', size: 103, delay: 72, top: 340 },
          ].map(({ text, color, size, delay, top }, i) => {
            const s5Local = frame - 1241;
            const en = spr(s5Local - delay, fps, 14, 110);
            return (
              <div key={i} style={{
                position: 'absolute', top, left: 0, right: 0,
                display: 'flex', justifyContent: 'center',
                opacity: interpolate(en, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(en, [0, 1], [-60, 0])}px) scale(${interpolate(en, [0, 1], [0.88, 1])})`,
                fontSize: size,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 900, color, textTransform: 'uppercase' as const, letterSpacing: 4,
                textShadow: color === '#f5a623' ? '0 0 30px rgba(245,166,35,0.5), 0 0 80px rgba(245,166,35,0.2)' : 'none',
              }}>{text}</div>
            );
          })}

          {/* ONE / POWERFUL / PLAY — stagger under SALES SPRINT, timed to narration */}
          {[
            { text: 'ONE',      delay: 108, color: '#ffffff' },
            { text: 'POWERFUL', delay: 123, color: '#ffffff' },
            { text: 'PLAY',     delay: 138, color: '#f5a623' },
          ].map(({ text, delay, color }, i) => {
            const s5Local = frame - 1241;
            const en = spr(s5Local - delay, fps, 12, 120);
            const glowAmt = color === '#f5a623' && s5Local > delay ? 28 + Math.sin((s5Local - delay) * 0.15) * 10 : 0;
            return (
              <div key={`opp${i}`} style={{
                position: 'absolute', top: 480 + i * 80,
                left: 0, right: 0, display: 'flex', justifyContent: 'center',
                opacity: interpolate(en, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(en, [0, 1], [50, 0])}px)`,
                fontSize: 65,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 900, color, letterSpacing: 6,
                textTransform: 'uppercase' as const,
                textShadow: glowAmt > 0 ? `0 0 ${glowAmt}px rgba(245,166,35,0.7)` : 'none',
              }}>{text}</div>
            );
          })}

          <SpeakerOval show={frame - 1241 > 60} />
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 6 — f1681 → f2448  Framework cards
          Card 1 at f1681 (= f0 local)    "Minutes 1–5"
          Card 2 at f1999 (= f318 local)  "Minutes 6–10"
          Card 3 at f2190 (= f509 local)  "Minutes 11–15"
          ══════════════════════════════════════════════════ */}
      <Sequence from={1681} durationInFrames={767}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
            <FadeIn delay={2} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 22, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#f5a623', letterSpacing: 4, textTransform: 'uppercase' as const }}>
                What you'll learn in 15 minutes
              </div>
            </FadeIn>

            <FrameworkCard badge="Minutes 1 – 5" headline="The AI prompt that surfaces your buyer's real pain" description="In 60 seconds — so your outreach lands warm, not cold like every other rep." delay={4}   index={0} />
            <FrameworkCard badge="Minutes 6 – 10" headline="The 1-line connection request that gets accepted" description="By the right people — without sounding like every other rep in their inbox." delay={318} index={1} />
            <FrameworkCard badge="Minutes 11 – 15" headline="The follow-up that turns profile views into discovery calls" description="The move most reps are too busy — or too proud — to use." delay={509} index={2} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 7 — f2448 → f2924  Testimonials
          Marcus at f2448 (= f0 local)
          Priya  at f2632 (= f184 local)
          Dan    at f2754 (= f306 local)
          ══════════════════════════════════════════════════ */}
      <Sequence from={2448} durationInFrames={476}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
            <FadeIn delay={2} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 20, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#888', letterSpacing: 4, textTransform: 'uppercase' as const }}>What past sprint attendees did with one 15-minute idea</div>
            </FadeIn>
            <TestimonialLine name="Marcus T." title="Enterprise AE, SaaS"        quote="I tried Scott's LinkedIn move on a Tuesday. By Friday I had 4 booked discovery calls — without spending a dime." delay={2}   />
            <TestimonialLine name="Priya S."  title="Financial Advisor"           quote="My reply rate doubled. Sunday prep cut to 15 minutes."                                                                        delay={184} />
            <TestimonialLine name="Dan R."    title="Regional Sales Manager"      quote="One specific play. Two VP meetings booked that same week."                                                                    delay={306} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 8 — f2924 → f3156  Event card
          "Wednesday" spoken at f2924 — card fades in immediately
          ══════════════════════════════════════════════════ */}
      <Sequence from={2924} durationInFrames={232}>
        <AbsoluteFill>
          <EventCard
            eyebrow="The 15 Minute Sales Sprint · Free Live Event"
            title="AI Is Your Advantage."
            subtitle="Wednesday, June 17 · 7:00 PM ET"
            details="Free · Live · 55 Seats · No Pitch · No Upsell"
            delay={5}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 9a — f3156 → f3356  Reserve / URL typewriter
          ══════════════════════════════════════════════════ */}
      <Sequence from={3156} durationInFrames={200}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
            <FadeIn delay={2}>
              <div style={{ fontSize: 38, fontFamily: '-apple-system, sans-serif', fontWeight: 400, color: '#aaa', letterSpacing: 2, textAlign: 'center' }}>
                Reserve your spot now at
              </div>
            </FadeIn>
            <FadeIn delay={20}>
              <Typewriter text="15-minute-sales-sprint.netlify.app" fontSize={43} color="#f5a623" charsPerFrame={0.30} />
            </FadeIn>
            <FadeIn delay={120}>
              <div style={{
                padding: '20px 60px',
                background: 'rgba(245,166,35,0.12)',
                border: '2px solid #f5a623',
                borderRadius: 50,
                boxShadow: `0 0 ${24 + Math.sin(frame * 0.08) * 8}px rgba(245,166,35,0.4)`,
              }}>
                <span style={{ fontSize: 31, fontFamily: '-apple-system, sans-serif', fontWeight: 800, color: '#f5a623', letterSpacing: 3, textTransform: 'uppercase' as const }}>
                  Reserve Your Spot →
                </span>
              </div>
            </FadeIn>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 9b — f3356 → f3555  "Don't. Miss. Out."
          "Don't" @ f3356 (local f0) — font +20% = 144px
          "miss"  @ f3377 (local f21)
          "out."  @ f3390 (local f34)
          ══════════════════════════════════════════════════ */}
      <Sequence from={3356} durationInFrames={199}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            {[
              { text: "DON'T.", delay: 2  },
              { text: 'MISS.',  delay: 21 },
              { text: 'OUT.',   delay: 34 },
            ].map(({ text, delay }, i) => {
              const localFrame = frame - 3356;
              const en = spr(localFrame - delay, fps, 12, 120);
              // Intensifying background glow as each word lands
              const glowTime = Math.max(0, localFrame - delay - 8);
              const glow = glowTime > 0 ? 40 + Math.sin(glowTime * 0.15) * 15 : 40;
              return (
                <div key={i} style={{
                  opacity: interpolate(en, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(en, [0, 1], [-80, 0])}px) scale(${interpolate(en, [0, 1], [0.8, 1])})`,
                  fontSize: 144,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 900,
                  color: '#f5a623',
                  textTransform: 'uppercase' as const,
                  letterSpacing: 8,
                  lineHeight: 1,
                  textShadow: `0 0 ${glow}px rgba(245,166,35,0.6), 0 0 ${glow * 2}px rgba(245,166,35,0.25)`,
                }}>
                  {text}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
