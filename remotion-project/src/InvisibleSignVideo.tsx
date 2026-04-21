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
  Img,
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { NoiseOverlay } from './components/NoiseOverlay';
import { BRollPlayer } from './components/BRollPlayer';
import { TypewriterText } from './components/TypewriterText';

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY CLIENT WEARS AN INVISIBLE SIGN — v2
// Storyselling in the Age of AI · Chapter 2
// All animation timings derived from Whisper word-level timestamps.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Palette: core Storyselling brand + Babson accent colors ─────────────────
const BRAND = {
  // Core
  green:        '#005A3B',
  greenLight:   '#00804F',
  greenDark:    '#003D28',
  white:        '#FFFFFF',
  black:        '#000000',
  bgDark:       '#050505',
  textSecondary:'#b0b0b0',
  cardBg:       'rgba(0, 90, 59, 0.08)',
  cardBorder:   'rgba(0, 90, 59, 0.30)',
  // Babson emphasis palette — used for sparkle, color-wave, key word highlights
  brightGold:   '#DDD055',  // Babson Bright Gold — primary sparkle/emphasis
  mangoPunch:   '#EEAF00',  // Babson Mango Punch — warm secondary emphasis
  ochre:        '#AD9001',  // Babson Ochre — muted gold accent
  peacockBlue:  '#54818B',  // Babson Peacock Blue — cool accent
  sherwoodGrn:  '#9EB28F',  // Babson Sherwood Green — subtle secondary text
  summerNights: '#005172',  // Babson Summer Nights — deep blue punch
};

// ─── Scene boundaries — all derived from Whisper × 30fps ─────────────────────
// Audio v5: 150.960s → 4529 frames. Buffer to 4540.
// New: TwoSignsScene inserted between MayaScene and CTAScene (2026-04-02)
//   "These two signs say" at f4232 | "Make me feel important" f4272 | "treat me like a friend" f4321
//   "Take the sixty-second quiz" at f4369
const SCENE = {
  HOOK_START:      0,
  HOOK_END:        840,    // "He read the invisible sign" at f811
  S1_START:        840,
  S1_END:          2050,   // "Here's the question" at f2028
  S2_START:        2050,
  S2_END:          2700,   // "the hardest" at f2682
  S3_START:        2700,
  S3_END:          3280,   // "matter most" at f3276
  STORY_START:     3280,
  STORY_END:       4232,   // extended: "Every client... listening for it." now runs to ~f4220
  TWOSIGNS_START:  4232,   // "These two signs say" at f4232
  TWOSIGNS_END:    4369,   // "Take the sixty-second quiz" at f4369
  CTA_START:       4369,
  CTA_END:         4540,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const phaseOpacity = (frame: number, enter: number, exit: number, fade = 18): number => {
  if (frame < enter || frame > exit) return 0;
  return Math.min(Math.min(1, (frame - enter) / fade), Math.min(1, (exit - frame) / fade));
};
const sineVal = (frame: number, speed = 0.05, min = 0.5, max = 1.0) =>
  min + (max - min) * (0.5 + 0.5 * Math.sin(frame * speed));

// ─── SparkleGold — Babson bright gold word with layered sparkle burst ─────────
// Use on KEY insight words: "INVISIBLE", "PROUD", "TRUTH", win moments
const SparkleGold: React.FC<{
  text: string; fontSize?: number; startFrame?: number;
  letterSpacing?: number; textTransform?: 'uppercase' | 'none';
}> = ({ text, fontSize = 80, startFrame = 0, letterSpacing = 3, textTransform = 'uppercase' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const ent = spring({ frame: lf, fps, config: { damping: 9, stiffness: 115 } });
  // Burst on entrance, then a gentle pulse
  const burst = lf < 24
    ? interpolate(lf, [0, 6, 24], [4.0, 6.5, 1.0], { extrapolateRight: 'clamp' })
    : 1.0 + 0.10 * Math.sin(lf * 0.08);
  return (
    <span style={{
      fontSize, fontWeight: 900,
      color: BRAND.brightGold,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      textTransform,
      letterSpacing,
      opacity: ent,
      transform: `scale(${interpolate(ent, [0, 1], [0.4, 1])}) translateY(${interpolate(ent, [0, 1], [22, 0])}px)`,
      display: 'inline-block',
      textShadow: [
        `0 0 ${16 * burst}px ${BRAND.brightGold}`,
        `0 0 ${35 * burst}px ${BRAND.brightGold}AA`,
        `0 0 ${65 * burst}px ${BRAND.mangoPunch}80`,
        `0 0 ${110 * burst}px ${BRAND.mangoPunch}45`,
      ].join(', '),
    }}>
      {text}
    </span>
  );
};

// ─── ColorWaveText — Babson palette wave sweeping across characters ───────────
// Use on section headers and hero phrases for visual interest
const ColorWaveText: React.FC<{
  text: string; fontSize?: number; startFrame?: number;
  speed?: number; fontWeight?: number;
}> = ({ text, fontSize = 64, startFrame = 0, speed = 0.055, fontWeight = 900 }) => {
  const frame = useCurrentFrame();
  const lf = Math.max(0, frame - startFrame);
  const palette = [BRAND.brightGold, BRAND.mangoPunch, BRAND.white, BRAND.greenLight, BRAND.brightGold];
  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {text.split('').map((char, i) => {
        const wave = Math.sin(lf * speed + i * 0.65); // -1 to 1
        const idx = Math.min(
          Math.max(Math.floor(((wave + 1) / 2) * (palette.length - 1)), 0),
          palette.length - 1
        );
        const c = palette[idx];
        return (
          <span key={i} style={{
            fontSize, fontWeight,
            color: c,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: 'inline-block',
            textShadow: `0 0 ${10 + 8 * ((wave + 1) / 2)}px ${c}80`,
          }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};

// ─── Reusable scene background with breathing radial gradient ─────────────────
const SceneBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const alpha = Math.round((0.06 + 0.03 * Math.sin(frame * 0.015)) * 255).toString(16).padStart(2, '0');
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDark }}>
      <AbsoluteFill style={{
        background: [
          `radial-gradient(ellipse at 18% 52%, ${BRAND.green}${alpha} 0%, transparent 58%)`,
          `radial-gradient(ellipse at 82% 22%, ${BRAND.greenDark}12 0%, transparent 48%)`,
          BRAND.bgDark,
        ].join(', '),
      }} />
      {children}
    </AbsoluteFill>
  );
};

// ─── Scene label strip ─────────────────────────────────────────────────────────
const SceneLabel: React.FC<{ text: string }> = ({ text }) => (
  <div style={{
    position: 'absolute', top: 52, left: '50%', transform: 'translateX(-50%)',
    fontSize: 15, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
    fontFamily: 'sans-serif', fontWeight: 700, opacity: 0.65,
    whiteSpace: 'nowrap',
  }}>
    {text}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK  (global f0–f840)
// Whisper key frames (absolute = local since HOOK_START=0):
//   f178 "I need to think about it"  f339 "In 1977"  f768 "He read"  f800 "invisible"  f811 "sign"
// ═══════════════════════════════════════════════════════════════════════════════

// Phase 1 (lf 0→335): Refusal wall — "I need to think about it" × 7 accumulated objections
const RefusalWall: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    { text: '"I need to think about it."', bold: true,  gold: false },
    { text: 'Better data. Better numbers.', bold: false, gold: true },
    { text: '"I need to think about it."', bold: true,  gold: false },
    { text: 'Better returns. Still losing.', bold: false, gold: true },
    { text: '"I need to think about it."', bold: true,  gold: false },
    { text: 'Not the right time.', bold: false, gold: false },
    { text: '"I need to think about it."', bold: true,  gold: false },
  ];
  return (
    <div style={{
      opacity, width: 900,
      display: 'flex', flexDirection: 'column', gap: 18,
      alignItems: 'flex-start',
    }}>
      {lines.map((line, i) => {
        // Stagger appearances — all visible by f60 so wall feels accumulated
        const lf = Math.max(0, frame - i * 8);
        const ent = spring({ frame: lf, fps, config: { damping: 18, stiffness: 85 } });
        // Pulse the refusal lines after "I need to think about it" spoken at f178
        const pulse = frame >= 178 && line.bold
          ? 1.0 + 0.12 * Math.sin((frame - 178) * 0.1 + i)
          : 1.0;
        const goldPulse = line.gold
          ? 1.0 + 0.15 * Math.sin(frame * 0.08 + i * 0.7)
          : 1.0;
        const lineColor = line.bold ? BRAND.white : line.gold ? BRAND.brightGold : BRAND.textSecondary;
        const lineOpacity = line.bold ? 1.0 : line.gold ? 0.92 : 0.38;
        return (
          <div key={i} style={{
            opacity: ent * lineOpacity,
            transform: `translateX(${interpolate(ent, [0, 1], [-40, 0])}px)`,
            fontSize: line.bold ? 44 : 28,
            fontWeight: line.bold ? 900 : line.gold ? 700 : 400,
            fontStyle: line.bold ? 'normal' : 'italic',
            color: lineColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            borderLeft: line.bold ? `4px solid ${BRAND.brightGold}` : line.gold ? `4px solid ${BRAND.brightGold}80` : '4px solid transparent',
            paddingLeft: 20,
            textShadow: line.bold
              ? `0 0 ${20 * pulse}px ${BRAND.brightGold}50`
              : line.gold
                ? `0 0 ${16 * goldPulse}px ${BRAND.brightGold}70, 0 0 ${30 * goldPulse}px ${BRAND.mangoPunch}40`
                : 'none',
          }}>
            {line.text}
          </div>
        );
      })}
      <div style={{
        marginTop: 12,
        fontSize: 18, color: BRAND.textSecondary, fontFamily: 'sans-serif',
        letterSpacing: 3, textTransform: 'uppercase', opacity: 0.55,
      }}>
        Six months. Same answer. Still losing.
      </div>
    </div>
  );
};

// Phase 2 (lf 315→770): George Lucas quote — appears exactly when spoken (f339)
const LucasQuote: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Card enters at f339 (when "In 1977 George Lucas" begins)
  const ent = spring({ frame: Math.max(0, frame - 339), fps, config: { damping: 16, stiffness: 60 } });
  // "He read the invisible sign." text appears at f768 when spoken
  const showKeyline = frame >= 768
    ? Math.min(1, (frame - 768) / 14)
    : 0;

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [28, 0])}px)`,
      maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 22,
    }}>
      {/* Decorative quote mark */}
      <div style={{
        fontSize: 160, color: BRAND.brightGold, fontFamily: 'Georgia, serif',
        lineHeight: 0.7, opacity: 0.22, marginBottom: -12,
      }}>"</div>
      {/* Main quote */}
      <div style={{
        fontSize: 46, fontWeight: 700, color: BRAND.white,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.35, fontStyle: 'italic',
      }}>
        George Lucas sold the Star Wars film rights<br />
        for $150,000. He kept the merchandise rights.
      </div>
      <div style={{
        fontSize: 30, fontWeight: 400, color: BRAND.textSecondary,
        fontFamily: 'sans-serif', fontStyle: 'italic', lineHeight: 1.4,
      }}>
        Nobody thought toys mattered. Lucas did.
      </div>
      {/* Accent rule — draws in */}
      <div style={{
        height: 3,
        width: interpolate(Math.min(1, Math.max(0, (frame - 370) / 40)), [0, 1], [0, 320]),
        background: `linear-gradient(90deg, ${BRAND.brightGold}, transparent)`,
      }} />
      {/* Key line — appears at f768 when spoken */}
      <div style={{ opacity: showKeyline }}>
        <ColorWaveText
          text="He read the invisible sign."
          fontSize={44}
          startFrame={768}
          speed={0.04}
          fontWeight={900}
        />
      </div>
    </div>
  );
};

// Phase 3 (lf 750→825): "THE INVISIBLE SIGN" — word slam at exact Whisper frames
// THE at f768, INVISIBLE at f800, SIGN at f811
const InvisibleSignSlam: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Exact Whisper frames for each word
  const wordDefs = [
    { text: 'THE',       whisperFrame: 768, size: 80,  color: BRAND.white },
    { text: 'INVISIBLE', whisperFrame: 800, size: 130, color: BRAND.brightGold },
    { text: 'SIGN',      whisperFrame: 811, size: 80,  color: BRAND.white },
  ];
  return (
    <div style={{
      opacity, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10,
    }}>
      {wordDefs.map((w, i) => {
        const wf = Math.max(0, frame - w.whisperFrame);
        const ent = spring({ frame: wf, fps, config: { damping: 9, stiffness: 120 } });
        const burst = wf < 20
          ? interpolate(wf, [0, 5, 20], [4.0, 6.0, 1.0], { extrapolateRight: 'clamp' })
          : 1.0 + 0.08 * Math.sin(wf * 0.07);
        return (
          <div key={i} style={{
            fontSize: w.size, fontWeight: 900,
            color: w.color,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase', letterSpacing: w.size > 100 ? 8 : 4,
            opacity: ent,
            transform: `scale(${interpolate(ent, [0, 1], [0.3, 1])}) translateY(${interpolate(ent, [0, 1], [30, 0])}px)`,
            textShadow: w.color === BRAND.brightGold
              ? [
                  `0 0 ${28 * burst}px ${BRAND.brightGold}`,
                  `0 0 ${55 * burst}px ${BRAND.brightGold}AA`,
                  `0 0 ${100 * burst}px ${BRAND.mangoPunch}70`,
                ].join(', ')
              : `0 0 ${22 * burst}px rgba(255,255,255,0.45)`,
          }}>
            {w.text}
          </div>
        );
      })}
    </div>
  );
};

// Phase 4 (lf 800→840): Title reveal at end of hook
const TitleCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame: Math.max(0, frame - 800), fps, config: { damping: 16, stiffness: 65 } });
  const glow = sineVal(frame, 0.04, 0.6, 1.0);
  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [20, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, maxWidth: 900,
    }}>
      <div style={{
        fontSize: 15, color: BRAND.green, letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 700,
      }}>
        Storyselling in the Age of AI · Chapter 2
      </div>
      <div style={{
        height: 3, width: 100,
        background: `linear-gradient(90deg, ${BRAND.brightGold}, transparent)`,
      }} />
      <div style={{
        fontSize: 72, fontWeight: 900, color: BRAND.white,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        lineHeight: 1.1, letterSpacing: -1,
        textShadow: `0 0 ${40 * glow}px rgba(255,255,255,0.08)`,
      }}>
        Every Client Wears an Invisible Sign
      </div>
      <div style={{
        fontSize: 32, color: BRAND.textSecondary,
        fontFamily: 'sans-serif', fontStyle: 'italic',
      }}>
        Can you read it?
      </div>
    </div>
  );
};

const HookScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  // All phases: FULL WIDTH — maximum cinematic impact, no B-roll split
  // Phase timings match Whisper audio events:
  //   lf 0→335:   Refusal wall (narration f0–f313 "still losing")
  //   lf 315→770: Lucas quote  (narration f339 "In 1977 George Lucas")
  //   lf 750→825: Slam         (narration f768 "He read the invisible sign")
  //   lf 800→840: Title card   (transitions into scene 1)
  const op1 = phaseOpacity(lf, 0,   335, 22);
  const op2 = phaseOpacity(lf, 315, 770, 22);
  // op3 starts at 775 (after op2 fully fades at 770) to avoid overlap, 12-frame fade for snap
  // TitleCard (op4) removed — it flashed too briefly to read; op3 holds to end of hook
  const op3 = phaseOpacity(lf, 775, duration, 12);

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={22} seed={42} intensity={0.6} />
      {/* Full-width centered content panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 160px 0',
      }}>
        {op1 > 0.01 && <div style={{ position: 'absolute' }}><RefusalWall opacity={op1} /></div>}
        {op2 > 0.01 && <div style={{ position: 'absolute' }}><LucasQuote opacity={op2} /></div>}
        {op3 > 0.01 && <div style={{ position: 'absolute' }}><InvisibleSignSlam opacity={op3} /></div>}
      </div>
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — THE THREE ARCHETYPES  (global f840–f2050)
// All local = absolute − 840
// Key whisper frames (local):
//   lf27:  "every person walks into a room"
//   lf304: "safe" · lf332: "valued" · lf361: "ready"
//   lf407: "three primary signs"
//   lf466: "The builder"      lf652: "The protector"    lf828: "The achiever"
//   lf1017: "Most advisors"   lf1151: "I need to think about it"
// ═══════════════════════════════════════════════════════════════════════════════

// Hanging sign graphic — swings in on entrance, glows on accent color
const ArchetypeSign: React.FC<{
  label: string; subtext: string; icon: string; color: string; whisperFrame: number; opacity: number;
}> = ({ label, subtext, icon, color, whisperFrame, opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - whisperFrame);
  const ent = spring({ frame: lf, fps, config: { damping: 13, stiffness: 65 } });
  const swing = interpolate(lf, [0, 30, 55, 80], [0, -4, 2, 0], { extrapolateRight: 'clamp' });
  const glow = sineVal(frame, 0.055, 0.55, 1.0);
  const isGold = color === BRAND.brightGold;

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `scale(${interpolate(ent, [0, 1], [0.80, 1])}) translateY(${interpolate(ent, [0, 1], [40, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Chains */}
      <div style={{ display: 'flex', gap: 56, marginBottom: -2 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: 3, height: 44, background: `${color}55`,
            borderRadius: 2,
            opacity: interpolate(lf, [0, 25], [0, 1], { extrapolateRight: 'clamp' }),
          }} />
        ))}
      </div>
      {/* Sign board */}
      <div style={{
        transform: `rotate(${swing}deg)`,
        background: 'rgba(8,8,8,0.96)',
        border: `2px solid ${color}`,
        borderRadius: 14,
        padding: '32px 52px',
        width: 720,
        boxShadow: [
          `0 0 ${28 * glow}px ${color}45`,
          `0 0 ${55 * glow}px ${color}22`,
          'inset 0 1px 0 rgba(255,255,255,0.04)',
          '0 12px 40px rgba(0,0,0,0.5)',
        ].join(', '),
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 68 }}>{icon}</div>
        {/* Label: use SparkleGold for achiever (gold), regular for others */}
        {isGold ? (
          <SparkleGold text={label} fontSize={48} startFrame={whisperFrame} letterSpacing={4} />
        ) : (
          <div style={{
            fontSize: 48, fontWeight: 900, color,
            fontFamily: '-apple-system, sans-serif', textTransform: 'uppercase',
            letterSpacing: 4, textAlign: 'center',
            textShadow: `0 0 ${18 * glow}px ${color}90`,
          }}>
            {label}
          </div>
        )}
        <div style={{
          height: 2, width: 200,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }} />
        <div style={{
          fontSize: 30, fontWeight: 600, color: BRAND.white,
          fontFamily: '-apple-system, sans-serif', textAlign: 'center',
          lineHeight: 1.3, fontStyle: 'italic', opacity: 0.92,
        }}>
          "{subtext}"
        </div>
      </div>
    </div>
  );
};

const ThreeSignsScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  // Phase timings — all match Whisper local frames for S1 (abs - 840):
  //   opIntro   lf 0→450    role theory (narration lf27–lf407)
  //   opBuilder lf 430→680  builder sign (narration lf466)
  //   opProt    lf 640→860  protector sign (narration lf652)
  //   opAchiev  lf 835→1040 achiever sign (narration lf828)
  //   opSynth   lf 1000→end synthesis "most advisors pitch" (narration lf1017)
  const opIntro   = phaseOpacity(lf, 0,    450,  22);
  const opBuilder = phaseOpacity(lf, 430,  680,  22);
  const opProt    = phaseOpacity(lf, 640,  860,  22);
  const opAchiev  = phaseOpacity(lf, 835,  1040, 22);
  const opSynth   = phaseOpacity(lf, 1000, duration, 22);

  const brollSynth = lf > 1000;

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={18} seed={7} intensity={0.5} />
      <SceneLabel text="Secret #1 — Read the Invisible Sign" />

      {/* Content — full width for sign phases, left panel for synthesis + B-roll */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: brollSynth ? 960 : 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: brollSynth ? '0 40px' : '0 80px',
      }}>

        {/* Role theory intro — SAFE VALUED READY words Whisper-timed */}
        {opIntro > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opIntro,
            display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1050,
          }}>
            {/* ROLE THEORY label — appears at lf27 (Whisper: "every person walks") and stays */}
            <div style={{
              fontSize: 18, letterSpacing: 7, fontWeight: 800, textTransform: 'uppercase',
              color: BRAND.brightGold,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              padding: '8px 28px',
              border: `1px solid ${BRAND.brightGold}55`,
              borderRadius: 5,
              background: `rgba(221,208,85,0.07)`,
              display: 'inline-flex', alignSelf: 'flex-start',
              opacity: Math.min(1, Math.max(0, (lf - 27) / 14)),
              textShadow: `0 0 16px ${BRAND.brightGold}55`,
              boxShadow: `0 0 18px ${BRAND.brightGold}15`,
            }}>
              ROLE THEORY
            </div>
            <div style={{
              fontSize: 56, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', lineHeight: 1.2,
            }}>
              Every person walks into the room{' '}
              <span style={{ color: BRAND.brightGold,
                textShadow: `0 0 25px ${BRAND.brightGold}70` }}>
                already playing a role.
              </span>
            </div>
            <div style={{
              fontSize: 30, color: BRAND.textSecondary,
              fontFamily: 'sans-serif', lineHeight: 1.5, maxWidth: 860,
            }}>
              Your client is wearing a sign that tells you exactly what they need to say yes.
            </div>
            {/* SAFE / VALUED / READY — Whisper frames: lf304, lf332, lf361 */}
            <div style={{ display: 'flex', gap: 28, marginTop: 8 }}>
              {[
                { word: 'SAFE',   triggerFrame: 304 },
                { word: 'VALUED', triggerFrame: 332 },
                { word: 'READY',  triggerFrame: 361 },
              ].map(({ word, triggerFrame }) => {
                const wf = Math.max(0, lf - triggerFrame);
                const ent = spring({ frame: wf, fps: 30, config: { damping: 13, stiffness: 90 } });
                return (
                  <div key={word} style={{
                    padding: '14px 32px',
                    border: `1px solid ${BRAND.brightGold}50`,
                    borderRadius: 8,
                    background: `rgba(221,208,85,0.06)`,
                    fontSize: 28, fontWeight: 800, color: BRAND.brightGold,
                    fontFamily: 'sans-serif', letterSpacing: 3, textTransform: 'uppercase',
                    opacity: ent,
                    transform: `translateY(${interpolate(ent, [0, 1], [18, 0])}px)`,
                    textShadow: `0 0 ${18 * sineVal(lf, 0.05, 0.6, 1.0)}px ${BRAND.brightGold}60`,
                  }}>
                    {word}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Builder sign — enters at lf466 (Whisper: "The builder") */}
        {opBuilder > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <ArchetypeSign
              label="The Builder" subtext="Help me grow this."
              icon="🏗️" color={BRAND.green} whisperFrame={466} opacity={opBuilder}
            />
          </div>
        )}

        {/* Protector sign — enters at lf652 (Whisper: "The protector") */}
        {opProt > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <ArchetypeSign
              label="The Protector" subtext="Don't let me lose what I built."
              icon="🛡️" color={BRAND.white} whisperFrame={652} opacity={opProt}
            />
          </div>
        )}

        {/* Achiever sign — enters at lf828 (Whisper: "The achiever") — Babson gold */}
        {opAchiev > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <ArchetypeSign
              label="The Achiever" subtext="Recognize what I accomplished."
              icon="🏆" color={BRAND.brightGold} whisperFrame={828} opacity={opAchiev}
            />
          </div>
        )}

        {/* Synthesis — "most advisors pitch the same product to all three" */}
        {opSynth > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSynth,
            display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900,
          }}>
            <div style={{
              fontSize: 52, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', lineHeight: 1.2,
            }}>
              Most advisors pitch the{' '}
              <span style={{
                color: BRAND.textSecondary,
                textDecoration: 'line-through',
                textDecorationColor: `rgba(255,80,80,0.6)`,
              }}>same product</span>
              {' '}to all three.
            </div>
            <div style={{
              fontSize: 42, fontWeight: 700, color: BRAND.textSecondary,
              fontFamily: 'sans-serif', fontStyle: 'italic',
            }}>
              That's why they keep hearing:
            </div>
            <div style={{
              fontSize: 52, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif',
              borderLeft: `5px solid ${BRAND.brightGold}`,
              paddingLeft: 24, fontStyle: 'italic',
              textShadow: `0 0 30px rgba(255,255,255,0.08)`,
            }}>
              "I need to think about it."
            </div>
          </div>
        )}
      </div>

      {/* B-roll during synthesis (right side, BRollPlayer self-positions) */}
      {/* startFrame=1000: when "Most advisors pitch" is spoken (lf1017) */}
      <BRollPlayer
        src="conference.mp4"
        accentColor={BRAND.green}
        startFrame={1000}
        durationFrames={210}
      />

      {brollSynth && (
        <div style={{
          position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
          background: `linear-gradient(180deg, transparent, ${BRAND.green}22 30%, ${BRAND.green}22 70%, transparent)`,
        }} />
      )}
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — THE MAGIC QUESTION  (global f2050–f2700)
// All local = absolute − 2050
// Key whisper frames (local):
//   lf35:  "unlocks every invisible sign"
//   lf74:  "What"  lf78: "are"  lf79: "you"  lf80: "most"  lf85: "proud"  lf92: "of?"
//   lf113: "Four words. That's it."
//   lf252: "handing you their identity"
//   lf299: "A builder tells you"   lf354: "A protector"   lf408: "An achiever"
//   lf489: "Listen for the first thing they say"
// ═══════════════════════════════════════════════════════════════════════════════

const MagicQuestionScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  const opSetup    = phaseOpacity(lf, 0,   88,  18);  // lf35 "unlocks every invisible sign"
  const opQuestion = phaseOpacity(lf, 65,  265, 22);  // lf74 "What are you most proud of"
  const opIdentity = phaseOpacity(lf, 245, duration, 22); // lf252 "handing you their identity"

  const brollIdentity = lf > 245;

  // Word-by-word build: "WHAT(74) ARE(78) YOU(79) MOST(80) PROUD(85) OF?"(92) — exact Whisper frames
  // Quote marks added to first and last words per Scott's request
  const questionWords = [
    { text: '\u201cWHAT', frame: 74,  size: 92,  color: BRAND.white },
    { text: 'ARE',        frame: 78,  size: 80,  color: BRAND.white },
    { text: 'YOU',        frame: 79,  size: 80,  color: BRAND.white },
    { text: 'MOST',       frame: 80,  size: 92,  color: BRAND.white },
    { text: 'PROUD',      frame: 85,  size: 120, color: BRAND.brightGold }, // gold sparkle for PROUD
    { text: 'OF?\u201d',  frame: 92,  size: 80,  color: BRAND.white },
  ];

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={20} seed={13} intensity={0.55} />
      <SceneLabel text="Secret #2 — The Magic Question" />

      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: brollIdentity ? 960 : 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: brollIdentity ? '0 44px' : '100px 140px 0',
      }}>

        {/* Setup: "unlocks every invisible sign" */}
        {opSetup > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSetup,
            display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 960,
          }}>
            <div style={{
              fontSize: 48, fontWeight: 800, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', lineHeight: 1.25,
            }}>
              Here's the question that unlocks{' '}
              <span style={{ color: BRAND.brightGold,
                textShadow: `0 0 22px ${BRAND.brightGold}80` }}>
                every invisible sign.
              </span>
            </div>
          </div>
        )}

        {/* THE QUESTION — word by word, each at exact Whisper frame */}
        {opQuestion > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opQuestion,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '10px 16px',
              justifyContent: 'center', maxWidth: brollIdentity ? 840 : 1200,
            }}>
              {questionWords.map((w, i) => {
                const wf = Math.max(0, lf - w.frame);
                const ent = spring({ frame: wf, fps: 30, config: { damping: 9, stiffness: 118 } });
                const burst = wf < 22
                  ? interpolate(wf, [0, 6, 22], [3.5, 5.5, 1.0], { extrapolateRight: 'clamp' })
                  : w.color === BRAND.brightGold
                    ? 1.0 + 0.12 * Math.sin(wf * 0.08)  // sustained pulse for PROUD
                    : 1.0;
                return (
                  <span key={i} style={{
                    fontSize: w.size, fontWeight: 900,
                    color: w.color,
                    fontFamily: '-apple-system, sans-serif',
                    textTransform: 'uppercase', letterSpacing: 2,
                    opacity: ent,
                    transform: `scale(${interpolate(ent, [0, 1], [0.3, 1])}) translateY(${interpolate(ent, [0, 1], [30, 0])}px)`,
                    display: 'inline-block',
                    textShadow: w.color === BRAND.brightGold
                      ? [
                          `0 0 ${25 * burst}px ${BRAND.brightGold}`,
                          `0 0 ${50 * burst}px ${BRAND.brightGold}BB`,
                          `0 0 ${90 * burst}px ${BRAND.mangoPunch}70`,
                        ].join(', ')
                      : `0 0 ${20 * burst}px rgba(255,255,255,0.4)`,
                  }}>
                    {w.text}
                  </span>
                );
              })}
            </div>
            {/* "Four words. That's it." — appears at lf113 */}
            <div style={{
              fontSize: 26, color: BRAND.textSecondary, fontFamily: 'sans-serif',
              letterSpacing: 3, textTransform: 'uppercase', marginTop: 10,
              opacity: phaseOpacity(lf, 113, 265, 16),
            }}>
              Four words. That's it.
            </div>
          </div>
        )}

        {/* Identity reveal — Whisper-timed entry per archetype */}
        {opIdentity > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opIdentity,
            display: 'flex', flexDirection: 'column', gap: 18,
            maxWidth: brollIdentity ? 860 : 1100,
          }}>
            <div style={{
              fontSize: 36, fontWeight: 800, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', lineHeight: 1.3,
            }}>
              They're not giving you data.{' '}
              <span style={{ color: BRAND.brightGold,
                textShadow: `0 0 20px ${BRAND.brightGold}70` }}>
                They're handing you their identity.
              </span>
            </div>
            {/* Archetype rows — each enters at exact Whisper frame */}
            {[
              { type: 'Builder',   says: 'tells you what they created.',  icon: '🏗️', color: BRAND.green,      frame: 299 },
              { type: 'Protector', says: 'tells you what they preserved.', icon: '🛡️', color: BRAND.white,      frame: 354 },
              { type: 'Achiever',  says: 'tells you a milestone that proves something.', icon: '🏆', color: BRAND.brightGold, frame: 408 },
            ].map((item) => {
              const ef = Math.max(0, lf - item.frame);
              const ent = spring({ frame: ef, fps: 30, config: { damping: 14, stiffness: 80 } });
              return (
                <div key={item.type} style={{
                  display: 'flex', alignItems: 'center', gap: 18,
                  padding: '16px 24px',
                  background: BRAND.cardBg,
                  border: `1px solid ${item.color}28`,
                  borderRadius: 10,
                  opacity: ent,
                  transform: `translateX(${interpolate(ent, [0, 1], [-36, 0])}px)`,
                  boxShadow: `0 0 ${14 * sineVal(lf + item.frame, 0.04, 0.4, 1.0)}px ${item.color}18`,
                }}>
                  <span style={{ fontSize: 38 }}>{item.icon}</span>
                  <div>
                    <span style={{
                      fontSize: 28, fontWeight: 800,
                      color: item.color, fontFamily: 'sans-serif',
                      textShadow: item.color === BRAND.brightGold
                        ? `0 0 15px ${BRAND.brightGold}80` : 'none',
                    }}>
                      A {item.type}{' '}
                    </span>
                    <span style={{ fontSize: 28, color: BRAND.white, fontFamily: 'sans-serif' }}>
                      {item.says}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* "Listen for the first thing they say" — lf489 */}
            <div style={{
              fontSize: 26, color: BRAND.sherwoodGrn, fontFamily: 'sans-serif',
              fontStyle: 'italic', borderLeft: `3px solid ${BRAND.brightGold}`,
              paddingLeft: 18,
              opacity: phaseOpacity(lf, 489, duration, 16),
            }}>
              Listen for the first thing they say. That's the real answer.
            </div>
          </div>
        )}
      </div>

      {/* B-roll during identity reveal — reading/listening */}
      <BRollPlayer
        src="reading.mp4"
        accentColor={BRAND.green}
        startFrame={245}
        durationFrames={405}
      />

      {brollIdentity && (
        <div style={{
          position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
          background: `linear-gradient(180deg, transparent, ${BRAND.green}22 30%, ${BRAND.green}22 70%, transparent)`,
        }} />
      )}
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — SILENCE IS TRUTH SERUM  (global f2700–f3280)
// All local = absolute − 2700
// Key whisper frames (local):
//   lf11: "Silence"  lf18: "is"  lf32: "truth"  lf42: "serum"
//   lf66: "After you ask the question"  lf105: "stop talking"  lf139: "Most advisors fill"
//   lf285: "That's the mistake"  lf317: "Here's the technique"
//   lf353: "Ask"  lf385: "Count to ten"  lf405: "Don't speak"  lf450: "Let them reach"
// ═══════════════════════════════════════════════════════════════════════════════

const SilenceScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  const opSlam      = phaseOpacity(lf, 0,   130, 16);  // SILENCE IS TRUTH SERUM
  const opContext   = phaseOpacity(lf, 110, 340, 22);  // wrong vs. right panels
  const opTechnique = phaseOpacity(lf, 310, duration, 22); // 4-step cards

  // SLAM words — each triggered at exact Whisper frame
  const slamWords = [
    { text: 'SILENCE', frame: 11, size: 150, color: BRAND.white },
    { text: 'IS',      frame: 18, size:  80, color: BRAND.textSecondary },
    { text: 'TRUTH',   frame: 32, size: 150, color: BRAND.brightGold },  // gold sparkle
    { text: 'SERUM.',  frame: 42, size:  80, color: BRAND.white },
  ];

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={16} seed={55} intensity={0.4} />
      <SceneLabel text="Secret #3 — The Silence Technique" />

      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 120px 0',
      }}>

        {/* SLAM — full screen, max impact */}
        {opSlam > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSlam,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            {slamWords.map((w) => {
              const wf = Math.max(0, lf - w.frame);
              const ent = spring({ frame: wf, fps: 30, config: { damping: 10, stiffness: 105 } });
              const burst = wf < 22
                ? interpolate(wf, [0, 6, 22], [3.5, 5.5, 1.0], { extrapolateRight: 'clamp' })
                : 1.0;
              return (
                <div key={w.text} style={{
                  fontSize: w.size, fontWeight: 900,
                  color: w.color,
                  fontFamily: '-apple-system, sans-serif',
                  letterSpacing: w.size > 100 ? 8 : 10,
                  textTransform: 'uppercase', lineHeight: 1.0,
                  opacity: ent,
                  transform: `scale(${interpolate(ent, [0, 1], [0.45, 1])})`,
                  textShadow: w.color === BRAND.brightGold
                    ? [
                        `0 0 ${35 * burst}px ${BRAND.brightGold}`,
                        `0 0 ${70 * burst}px ${BRAND.brightGold}BB`,
                        `0 0 ${120 * burst}px ${BRAND.mangoPunch}80`,
                      ].join(', ')
                    : w.color === BRAND.white
                      ? `0 0 ${22 * burst}px rgba(255,255,255,0.4)`
                      : 'none',
                }}>
                  {w.text}
                </div>
              );
            })}
          </div>
        )}

        {/* Wrong vs. Right panels — appears at lf110 ("After you ask" at lf66, "stop talking" at lf105) */}
        {opContext > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opContext,
            display: 'flex', gap: 56, alignItems: 'stretch', maxWidth: 1560,
          }}>
            {/* Wrong side */}
            <div style={{
              flex: 1, padding: '44px 52px',
              background: 'rgba(255,50,50,0.04)',
              border: '2px solid rgba(255,80,80,0.22)',
              borderRadius: 18,
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              <div style={{ fontSize: 56, textAlign: 'center' }}>❌</div>
              <div style={{
                fontSize: 38, fontWeight: 900, color: '#ff6b6b',
                fontFamily: 'sans-serif', textAlign: 'center',
              }}>Most Advisors</div>
              <div style={{
                fontSize: 26, color: BRAND.white, fontFamily: 'sans-serif',
                textAlign: 'center', lineHeight: 1.45,
              }}>
                Fill the silence with more data. More slides. More information.
              </div>
              <div style={{
                fontSize: 22, color: '#ff6b6b', fontFamily: 'sans-serif',
                textAlign: 'center', fontStyle: 'italic',
              }}>
                That's the mistake.
              </div>
            </div>
            {/* Right side */}
            <div style={{
              flex: 1, padding: '44px 52px',
              background: BRAND.cardBg,
              border: `2px solid ${BRAND.brightGold}35`,
              borderRadius: 18,
              display: 'flex', flexDirection: 'column', gap: 18,
              boxShadow: `0 0 ${24 * sineVal(lf, 0.05, 0.5, 1.0)}px ${BRAND.brightGold}18`,
            }}>
              <div style={{ fontSize: 56, textAlign: 'center' }}>✅</div>
              <div style={{
                fontSize: 38, fontWeight: 900, color: BRAND.brightGold,
                fontFamily: 'sans-serif', textAlign: 'center',
                textShadow: `0 0 18px ${BRAND.brightGold}70`,
              }}>Truth Serum</div>
              <div style={{
                fontSize: 26, color: BRAND.white, fontFamily: 'sans-serif',
                textAlign: 'center', lineHeight: 1.45,
              }}>
                Ask the question. Stop. The words they search for are the ones that matter.
              </div>
              <div style={{
                fontSize: 22, color: BRAND.brightGold, fontFamily: 'sans-serif',
                textAlign: 'center', fontStyle: 'italic',
              }}>
                Let them reach for the words.
              </div>
            </div>
          </div>
        )}

        {/* 4-Step Technique cards — Whisper-timed entrances */}
        {opTechnique > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opTechnique,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            maxWidth: 1400,
          }}>
            <div style={{
              fontSize: 50, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif',
            }}>
              The{' '}
              <span style={{ color: BRAND.brightGold,
                textShadow: `0 0 22px ${BRAND.brightGold}80` }}>4-Step</span>
              {' '}Technique
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              {[
                { num: '1', label: 'Ask the question',     sub: '"What are you most proud of?"', icon: '🎯', frame: 353 },
                { num: '2', label: 'Count to ten',         sub: 'Silently. In your head.',       icon: '🔢', frame: 385 },
                { num: '3', label: "Don't speak",          sub: 'Resist filling the silence.',   icon: '🤫', frame: 405 },
                { num: '4', label: 'Let them reach',       sub: 'Those words matter most.',      icon: '🪞', frame: 450 },
              ].map((step) => {
                const sf = Math.max(0, lf - step.frame);
                const ent = spring({ frame: sf, fps: 30, config: { damping: 14, stiffness: 80 } });
                // Step 4 sub text pulses gold when narrator says "those words matter most" (~lf540)
                const isStep4 = step.num === '4';
                const pulseLf4 = Math.max(0, lf - 540);
                const pulseT4 = isStep4 && pulseLf4 < 80
                  ? Math.abs(Math.cos(pulseLf4 * Math.PI / 40))
                  : 0;
                const subColor = isStep4 && lf >= 540
                  ? `rgb(${Math.round(255 - 34 * pulseT4)}, ${Math.round(255 - 47 * pulseT4)}, ${Math.round(255 - 170 * pulseT4)})`
                  : BRAND.textSecondary;
                const subGlow = pulseT4 > 0.05
                  ? `0 0 ${20 * pulseT4}px ${BRAND.brightGold}90, 0 0 ${36 * pulseT4}px ${BRAND.mangoPunch}55`
                  : 'none';
                return (
                  <div key={step.num} style={{
                    flex: 1, padding: '30px 26px',
                    background: BRAND.cardBg,
                    border: `1px solid ${BRAND.brightGold}28`,
                    borderRadius: 14,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    opacity: ent,
                    transform: `translateY(${interpolate(ent, [0, 1], [32, 0])}px)`,
                    boxShadow: `0 0 ${18 * sineVal(lf + parseInt(step.num) * 20, 0.05, 0.4, 1.0)}px ${BRAND.brightGold}15`,
                  }}>
                    <div style={{ fontSize: 46 }}>{step.icon}</div>
                    <div style={{
                      fontSize: 58, fontWeight: 900, color: BRAND.brightGold,
                      fontFamily: 'sans-serif',
                      textShadow: `0 0 18px ${BRAND.brightGold}70`,
                    }}>
                      {step.num}
                    </div>
                    <div style={{
                      fontSize: 24, fontWeight: 800, color: BRAND.white,
                      fontFamily: 'sans-serif', textAlign: 'center',
                    }}>
                      {step.label}
                    </div>
                    <div style={{
                      fontSize: 18, color: subColor,
                      fontFamily: 'sans-serif', textAlign: 'center',
                      lineHeight: 1.4, fontStyle: 'italic',
                      textShadow: subGlow,
                    }}>
                      {step.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — MAYA'S STORY  (global f3280–f4100)
// All local = absolute − 3280
// Key whisper frames (local):
//   lf22: "Maya"  lf95: "Wall Street"  lf134: "$30"  lf156: "million account"
//   lf186: "She didn't have"  lf289: "She asked"  lf341: "He said"
//   lf365: "my kids"  lf396: "worry"  lf416: "A protector"
//   lf444: "Her entire proposal"  lf526: "his kids would never"  lf582: "Not returns"
//   lf643: "Just that"  lf669: "She won"  lf707: "Wall Street firms"
// ═══════════════════════════════════════════════════════════════════════════════

const MayaScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  const opSetup   = phaseOpacity(lf, 0,   355, 22);  // Maya intro through "He said" (lf341)
  const opQuote   = phaseOpacity(lf, 330, 450, 20);  // "He said" (lf341) → protector (lf416)
  const opProtect = phaseOpacity(lf, 410, 690, 22);  // "A protector" → "She won" (lf669)
  const opWin     = phaseOpacity(lf, 650, duration, 22); // "She won" (lf669) → scene end

  const brollSetup = lf > 0 && lf < 330;
  const brollWin   = lf > 650;

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={20} seed={88} intensity={0.55} />
      <SceneLabel text="The Story — Maya vs. Wall Street" />

      {/* B-roll during setup: conference.mp4 showing competitive landscape */}
      <BRollPlayer
        src="conference.mp4"
        accentColor={BRAND.green}
        startFrame={10}
        durationFrames={320}
      />

      {/* B-roll during win: walking toward light */}
      <BRollPlayer
        src="walking-light.mp4"
        accentColor={BRAND.brightGold}
        startFrame={660}
        durationFrames={160}
      />

      {/* Left content panel */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: (brollSetup || brollWin) ? 960 : 1920,
        height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: (brollSetup || brollWin) ? '0 44px' : '100px 160px 0',
      }}>

        {/* Setup: Maya's context */}
        {opSetup > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opSetup,
            display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 880,
          }}>
            <div style={{
              fontSize: 24, color: BRAND.textSecondary, letterSpacing: 2,
              fontFamily: 'sans-serif', textTransform: 'uppercase',
            }}>
              A junior advisor vs. three Wall Street firms
            </div>
            <div style={{
              fontSize: 64, fontWeight: 900, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', lineHeight: 1.1,
            }}>
              <span style={{ color: BRAND.brightGold,
                textShadow: `0 0 28px ${BRAND.brightGold}80` }}>Maya</span>{' '}
              was competing for a
            </div>
            {/* $30M slam — enters at lf134 */}
            {lf >= 134 && (
              <div style={{
                fontSize: 130, fontWeight: 900, color: BRAND.white,
                fontFamily: '-apple-system, sans-serif',
                lineHeight: 0.9, letterSpacing: -4,
                opacity: Math.min(1, (lf - 134) / 10),
                textShadow: '0 0 60px rgba(255,255,255,0.14)',
              }}>
                $30M
              </div>
            )}
            <div style={{
              fontSize: 32, color: BRAND.textSecondary, fontFamily: 'sans-serif',
            }}>
              account. No biggest name. No longest track record.
            </div>
            {/* "She asked what he was most proud of" — lf289 */}
            <div style={{
              fontSize: 30, color: BRAND.brightGold, fontFamily: 'sans-serif',
              fontStyle: 'italic',
              borderLeft: `3px solid ${BRAND.brightGold}`,
              paddingLeft: 20,
              opacity: phaseOpacity(lf, 289, 355, 16),
              textShadow: `0 0 18px ${BRAND.brightGold}60`,
            }}>
              She asked what he was most proud of.
            </div>
          </div>
        )}

        {/* Quote: "That my kids never had to worry." — lf341 */}
        {opQuote > 0.01 && (
          <div style={{
            position: 'absolute', opacity: opQuote,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
            maxWidth: 960,
          }}>
            <div style={{
              fontSize: 140, color: BRAND.brightGold, fontFamily: 'Georgia, serif',
              lineHeight: 0.7, opacity: 0.18,
            }}>"</div>
            <div style={{
              fontSize: 66, fontWeight: 800, color: BRAND.white,
              fontFamily: '-apple-system, sans-serif', textAlign: 'center',
              lineHeight: 1.2, fontStyle: 'italic',
            }}>
              That my kids never had to worry.
            </div>
            <div style={{
              fontSize: 26, color: BRAND.textSecondary, fontFamily: 'sans-serif',
              fontStyle: 'italic', opacity: 0.75,
            }}>
              — the client's answer
            </div>
          </div>
        )}

        {/* Protector reveal — "A PROTECTOR." slams in at lf416 */}
        {opProtect > 0.01 && (() => {
          const wf = Math.max(0, lf - 416);
          const ent = spring({ frame: wf, fps: 30, config: { damping: 9, stiffness: 110 } });
          const burst = wf < 24
            ? interpolate(wf, [0, 6, 24], [3.5, 5.5, 1.0], { extrapolateRight: 'clamp' })
            : 1.0;
          // "centered on one idea" sub-text at lf444
          const subEnt = spring({ frame: Math.max(0, lf - 444), fps: 30, config: { damping: 16, stiffness: 70 } });
          // "his kids would never have to worry" at lf526
          const ideaEnt = spring({ frame: Math.max(0, lf - 526), fps: 30, config: { damping: 16, stiffness: 70 } });
          return (
            <div style={{
              position: 'absolute', opacity: opProtect,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
            }}>
              <div style={{
                fontSize: 170, fontWeight: 900, color: BRAND.white,
                fontFamily: '-apple-system, sans-serif',
                letterSpacing: 10,
                opacity: ent, transform: `scale(${interpolate(ent, [0, 1], [0.45, 1])})`,
                textShadow: `0 0 ${40 * burst}px rgba(255,255,255,0.5)`,
              }}>
                A
              </div>
              <div style={{
                fontSize: 110, fontWeight: 900, color: BRAND.brightGold,
                fontFamily: '-apple-system, sans-serif',
                letterSpacing: 6, textTransform: 'uppercase',
                opacity: ent, transform: `scale(${interpolate(ent, [0, 1], [0.45, 1])})`,
                textShadow: [
                  `0 0 ${45 * burst}px ${BRAND.brightGold}`,
                  `0 0 ${90 * burst}px ${BRAND.brightGold}BB`,
                  `0 0 ${150 * burst}px ${BRAND.mangoPunch}70`,
                ].join(', '),
              }}>
                PROTECTOR.
              </div>
              <div style={{
                fontSize: 34, color: BRAND.textSecondary, fontFamily: 'sans-serif',
                fontStyle: 'italic', opacity: subEnt * 0.85, marginTop: 8,
              }}>
                Her entire proposal centered on one idea.
              </div>
              <div style={{
                fontSize: 40, fontWeight: 800, color: BRAND.white,
                fontFamily: '-apple-system, sans-serif', textAlign: 'center',
                lineHeight: 1.2, fontStyle: 'italic',
                opacity: ideaEnt,
                transform: `translateY(${interpolate(ideaEnt, [0, 1], [18, 0])}px)`,
              }}>
                "That his kids would never have to worry."
              </div>
              <div style={{
                fontSize: 26, color: BRAND.textSecondary, fontFamily: 'sans-serif',
                fontStyle: 'italic',
                opacity: phaseOpacity(lf, 582, 690, 16),
              }}>
                Not returns. Not numbers. Just that.
              </div>
            </div>
          );
        })()}

        {/* Win — "She won the account" at lf669 */}
        {opWin > 0.01 && (() => {
          const winEnt = spring({ frame: Math.max(0, lf - 669), fps: 30, config: { damping: 14, stiffness: 80 } });
          const wallEnt = spring({ frame: Math.max(0, lf - 707), fps: 30, config: { damping: 14, stiffness: 70 } });
          return (
            <div style={{
              position: 'absolute', opacity: opWin,
              display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 880,
            }}>
              <div style={{
                opacity: winEnt,
                transform: `translateY(${interpolate(winEnt, [0, 1], [22, 0])}px)`,
                display: 'flex', alignItems: 'center', gap: 22,
                padding: '24px 36px',
                background: `linear-gradient(135deg, ${BRAND.brightGold}12, transparent)`,
                border: `2px solid ${BRAND.brightGold}50`,
                borderRadius: 14,
                boxShadow: `0 0 ${30 * sineVal(lf, 0.04, 0.5, 1.0)}px ${BRAND.brightGold}30`,
              }}>
                <span style={{ fontSize: 56 }}>🏆</span>
                <div>
                  <div style={{
                    fontSize: 48, fontWeight: 900, color: BRAND.brightGold,
                    fontFamily: '-apple-system, sans-serif',
                    textShadow: `0 0 22px ${BRAND.brightGold}80`,
                  }}>
                    She won the account.
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 28, color: BRAND.textSecondary, fontFamily: 'sans-serif',
                fontStyle: 'italic', lineHeight: 1.4,
                opacity: wallEnt,
                transform: `translateY(${interpolate(wallEnt, [0, 1], [14, 0])}px)`,
                borderLeft: `3px solid ${BRAND.green}`,
                paddingLeft: 18,
              }}>
                The Wall Street firms never knew what sign he was wearing.
              </div>
              <div style={{
                fontSize: 32, fontWeight: 700, color: BRAND.white,
                fontFamily: '-apple-system, sans-serif', lineHeight: 1.35,
                opacity: phaseOpacity(lf, 797, duration, 16),
              }}>
                Every client you will ever meet is already{' '}
                <span style={{ color: BRAND.brightGold }}>telling you who they are.</span>
              </div>
            </div>
          );
        })()}
      </div>

      {(brollSetup || brollWin) && (
        <div style={{
          position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
          background: `linear-gradient(180deg, transparent, ${BRAND.green}22 30%, ${BRAND.green}22 70%, transparent)`,
        }} />
      )}
      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — TWO SIGNS  (global f4232–f4369)
// Whisper frames (local, abs − 4232):
//   lf0: "these two signs say"
//   lf40: "make me feel important"
//   lf89: "treat me like a friend"
// ═══════════════════════════════════════════════════════════════════════════════

// Stylized person + hanging cardboard sign (inspired by user sketch)
const PersonSign: React.FC<{
  enterFrame: number;
  signText: string[];
  signColor: string;
  lf: number;
  side: 'left' | 'right';
}> = ({ enterFrame, signText, signColor, lf, side }) => {
  const { fps } = useVideoConfig();
  const sf = Math.max(0, lf - enterFrame);
  const ent = spring({ frame: sf, fps, config: { damping: 13, stiffness: 65 } });
  // Gentle pendulum swing on entrance
  const swing = side === 'left'
    ? interpolate(sf, [0, 25, 45, 65, 80], [-6, 5, -2, 1, 0], { extrapolateRight: 'clamp' })
    : interpolate(sf, [0, 25, 45, 65, 80], [6, -5, 2, -1, 0], { extrapolateRight: 'clamp' });
  const glow = 0.6 + 0.25 * Math.sin(lf * 0.06 + (side === 'left' ? 0 : 1.5));

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: ent,
      transform: `scale(${interpolate(ent, [0, 1], [0.75, 1])}) translateY(${interpolate(ent, [0, 1], [50, 0])}px)`,
    }}>
      {/* Person silhouette — SVG head + body */}
      <svg width="140" height="200" viewBox="0 0 140 200" style={{ overflow: 'visible' }}>
        {/* Head */}
        <circle cx="70" cy="42" r="32" fill={signColor} opacity="0.18"
          style={{ filter: `drop-shadow(0 0 12px ${signColor}60)` }}/>
        <circle cx="70" cy="42" r="32" fill="none" stroke={signColor} strokeWidth="3" opacity="0.70"/>
        {/* Neck */}
        <line x1="70" y1="74" x2="70" y2="94" stroke={signColor} strokeWidth="4" opacity="0.55" strokeLinecap="round"/>
        {/* Shoulders */}
        <path d="M 20 120 C 30 94 50 90 70 90 C 90 90 110 94 120 120"
          fill="none" stroke={signColor} strokeWidth="4" opacity="0.60" strokeLinecap="round"/>
        {/* Body torso */}
        <line x1="70" y1="90" x2="70" y2="175" stroke={signColor} strokeWidth="4" opacity="0.45" strokeLinecap="round"/>
        {/* Arms holding sign — angled down and in */}
        <path d="M 30 122 L 48 160" stroke={signColor} strokeWidth="4" opacity="0.55" strokeLinecap="round"/>
        <path d="M 110 122 L 92 160" stroke={signColor} strokeWidth="4" opacity="0.55" strokeLinecap="round"/>
        {/* Legs */}
        <path d="M 70 175 L 52 200" stroke={signColor} strokeWidth="4" opacity="0.40" strokeLinecap="round"/>
        <path d="M 70 175 L 88 200" stroke={signColor} strokeWidth="4" opacity="0.40" strokeLinecap="round"/>
      </svg>

      {/* Sign rope / chain strings */}
      <div style={{ display: 'flex', gap: 56, marginBottom: -2, marginTop: -4 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: 2.5, height: 32, background: `${signColor}55`, borderRadius: 2,
            transform: `rotate(${swing * 0.4}deg)`,
          }} />
        ))}
      </div>

      {/* Cardboard sign */}
      <div style={{
        width: 300, minHeight: 140,
        background: `rgba(221,208,85,0.04)`,
        border: `2.5px solid ${signColor}70`,
        borderRadius: 8,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '22px 24px',
        transform: `rotate(${swing * 0.6}deg)`,
        boxShadow: `0 0 ${28 * glow}px ${signColor}25, inset 0 0 20px ${signColor}08`,
      }}>
        {signText.map((line, i) => (
          <div key={i} style={{
            fontSize: 38, fontWeight: 900, color: signColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.1,
            textShadow: `0 0 ${16 * glow}px ${signColor}90, 0 0 ${32 * glow}px ${signColor}50`,
          }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const TwoSignsScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  // Header fades in at lf=0 ("these two signs say")
  const opHeader = Math.min(1, Math.max(0, lf / 18));
  const glow = 0.5 + 0.3 * Math.sin(lf * 0.04);

  return (
    <SceneBg>
      <ParticleField color={BRAND.green} count={16} seed={99} intensity={0.45} />

      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 40,
      }}>

        {/* Header — "Every client already wearing one of two signs" */}
        <div style={{
          opacity: opHeader,
          fontSize: 36, fontWeight: 700, color: BRAND.textSecondary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: 2, textAlign: 'center', maxWidth: 1200,
          transform: `translateY(${interpolate(opHeader, [0, 1], [-20, 0])}px)`,
        }}>
          Every client you will ever meet is already telling you who they are.{' '}
          <span style={{
            color: BRAND.brightGold,
            textShadow: `0 0 ${18 * glow}px ${BRAND.brightGold}80`,
          }}>
            These two signs say it all.
          </span>
        </div>

        {/* Two person+sign graphics */}
        <div style={{ display: 'flex', gap: 120, alignItems: 'flex-start' }}>
          <PersonSign
            enterFrame={40}
            signText={['MAKE ME FEEL', 'IMPORTANT']}
            signColor={BRAND.brightGold}
            lf={lf}
            side="left"
          />
          <PersonSign
            enterFrame={89}
            signText={['TREAT ME LIKE', 'A FRIEND']}
            signColor={BRAND.greenLight}
            lf={lf}
            side="right"
          />
        </div>
      </div>

      <NoiseOverlay opacity={0.04} />
    </SceneBg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 7 — CTA  (global f4369–f4540)
// ═══════════════════════════════════════════════════════════════════════════════

const CTAScene: React.FC<{ localFrame: number; duration: number }> = ({ localFrame: lf, duration }) => {
  const { fps } = useVideoConfig();
  const ent = spring({ frame: lf, fps, config: { damping: 16, stiffness: 58 } });
  const glow = sineVal(lf, 0.05, 0.6, 1.1);
  const bounceY = Math.sin(lf * 0.12) * 11;
  const globalFade = lf > duration - 22
    ? interpolate(lf, [duration - 22, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bgDark, opacity: globalFade }}>
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 50% 50%, ${BRAND.green}10 0%, transparent 62%), ${BRAND.bgDark}`,
      }} />
      <ParticleField color={BRAND.brightGold} count={24} seed={33} intensity={0.55} />

      {/* Concentric pulsing rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width: 520 + i * 190,
          height: 520 + i * 190,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `1px solid ${i === 1 ? BRAND.brightGold : BRAND.green}`,
          opacity: (0.5 + 0.5 * Math.sin(lf * 0.08 + i * 1.2)) * 0.18,
          scale: String(0.9 + (0.5 + 0.5 * Math.sin(lf * 0.07 + i * 1.4)) * 0.14),
        }} />
      ))}

      {/* Main CTA content */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 90,
        opacity: ent,
        transform: `translateY(${interpolate(ent, [0, 1], [32, 0])}px)`,
      }}>
        {/* Left: headline + button + URL */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 880,
        }}>
          <div style={{
            fontSize: 18, color: BRAND.brightGold, letterSpacing: 4,
            textTransform: 'uppercase', fontFamily: 'sans-serif', fontWeight: 700,
            textShadow: `0 0 14px ${BRAND.brightGold}70`,
          }}>
            Every Client is Already Telling You
          </div>
          {/* Typewriter headline + gold→white double pulse on "Listening" */}
          {(() => {
            // Each character fades in at 3-frame intervals, 6-frame fade
            // "Are You " = 8 chars (0-7)  → lf 0–21
            // "Listening" = 9 chars (0-8) → lf 24–48
            // " For It?" = 8 chars (0-7)  → lf 51–72   (fully typed at lf≈78)
            // Pulse starts at lf=90: 2 gold→white cycles (|cos| over 40-frame half-period)
            const pulseStart = 90;
            const pulseDuration = 80; // 2 cycles × 40 frames each
            const pulseLf = Math.max(0, lf - pulseStart);
            const pulseActive = lf >= pulseStart && lf < pulseStart + pulseDuration;
            // |cos| starts at 1 (gold), dips to 0 (white), peaks at 1 (gold), 0 (white) — 2 cycles
            const pulseT = pulseActive ? Math.abs(Math.cos(pulseLf * Math.PI / 40)) : 0;
            // Interpolate #DDD055 (gold=221,208,85) → #ffffff (255,255,255)
            const lR = Math.round(255 - 34 * pulseT);
            const lG = Math.round(255 - 47 * pulseT);
            const lB = Math.round(255 - 170 * pulseT);
            const listeningColor = lf >= pulseStart ? `rgb(${lR},${lG},${lB})` : BRAND.white;
            const listeningGlow = pulseT > 0.05
              ? `0 0 ${18 * pulseT}px #DDD055, 0 0 ${36 * pulseT}px #EEAF0070`
              : 'none';

            const charStyle = (globalCharIndex: number, overrideColor?: string, overrideGlow?: string) => {
              const charLf = Math.max(0, lf - globalCharIndex * 3);
              return {
                opacity: Math.min(1, charLf / 6),
                color: overrideColor ?? BRAND.white,
                textShadow: overrideGlow,
                fontSize: 62, fontWeight: 900 as const,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                display: 'inline-block',
              };
            };
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', lineHeight: 1.2 }}>
                {'Are You '.split('').map((ch, i) => (
                  <span key={`p1${i}`} style={charStyle(i)}>{ch === ' ' ? '\u00A0' : ch}</span>
                ))}
                {'Listening'.split('').map((ch, i) => (
                  <span key={`p2${i}`} style={charStyle(8 + i, listeningColor, listeningGlow)}>{ch}</span>
                ))}
                {' For It?'.split('').map((ch, i) => (
                  <span key={`p3${i}`} style={charStyle(17 + i)}>{ch === ' ' ? '\u00A0' : ch}</span>
                ))}
              </div>
            );
          })()}
          <div style={{
            fontSize: 28, color: BRAND.textSecondary, fontFamily: 'sans-serif', lineHeight: 1.45,
          }}>
            Take the 60-second quiz and discover which signals you're already catching —
            and which ones you're missing.
          </div>
          {/* CTA button */}
          <div style={{
            background: BRAND.brightGold,
            borderRadius: 12,
            padding: '22px 52px',
            textAlign: 'center',
            fontSize: 30, fontWeight: 900, color: BRAND.black,
            fontFamily: '-apple-system, sans-serif', letterSpacing: 2,
            boxShadow: [
              `0 0 ${28 * glow}px ${BRAND.brightGold}90`,
              `0 0 ${55 * glow}px ${BRAND.mangoPunch}55`,
              `0 0 ${90 * glow}px ${BRAND.mangoPunch}25`,
            ].join(', '),
          }}>
            TAKE THE FREE QUIZ →
          </div>
          {/* Bouncing arrow + typewriter URL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: -6 }}>
            <div style={{
              fontSize: 40, color: BRAND.brightGold,
              transform: `translateY(${bounceY}px)`,
              textShadow: `0 0 18px ${BRAND.brightGold}80`,
            }}>↑</div>
            <TypewriterText
              text="scottmagnacca.com"
              delay={60}
              speed={3}
              color={BRAND.textSecondary}
              fontSize={26}
              glowColor={BRAND.brightGold}
              fontWeight={400}
              cursor={false}
            />
          </div>
        </div>

        {/* Right: QR code */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
        }}>
          <div style={{
            padding: 20, background: BRAND.black,
            border: `3px solid ${BRAND.brightGold}`,
            borderRadius: 16,
            boxShadow: [
              `0 0 ${38 * glow}px ${BRAND.brightGold}55`,
              `0 0 ${75 * glow}px ${BRAND.mangoPunch}30`,
            ].join(', '),
          }}>
            <Img
              src={staticFile('qr-scottmagnacca.png')}
              style={{ width: 260, height: 260, display: 'block', borderRadius: 8 }}
            />
          </div>
          <div style={{
            fontSize: 20, color: BRAND.brightGold, letterSpacing: 2,
            fontFamily: 'sans-serif', textTransform: 'uppercase',
            textShadow: `0 0 16px ${BRAND.brightGold}80`,
          }}>
            Scan to start
          </div>
        </div>
      </div>

      {/* Lower third — speaker credentials */}
      <div style={{
        position: 'absolute', bottom: 64, left: 80,
        display: 'flex', alignItems: 'center', gap: 20,
        opacity: phaseOpacity(lf, 30, duration, 18),
      }}>
        <div style={{
          width: 4, height: 56,
          background: `linear-gradient(180deg, ${BRAND.brightGold}, transparent)`,
        }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: BRAND.white, fontFamily: 'sans-serif' }}>
            Scott Magnacca
          </div>
          <div style={{
            fontSize: 17, color: BRAND.brightGold, fontFamily: 'sans-serif',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            AI &amp; Storyselling Strategist · SalesForLife.ai
          </div>
        </div>
      </div>

      {/* URL bar at very bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 52, background: BRAND.brightGold,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: Math.min(1, lf / 18),
      }}>
        <div style={{
          fontSize: 22, fontWeight: 800, color: BRAND.black,
          fontFamily: '-apple-system, sans-serif', letterSpacing: 2, textTransform: 'uppercase',
        }}>
          scottmagnacca.com · 60-Second AI Risk Quiz · Free
        </div>
      </div>
      <NoiseOverlay opacity={0.04} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

export const InvisibleSignVideo: React.FC<{ audioSrc?: string }> = ({
  audioSrc = 'audio/invisible-sign.mp3',
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Audio src={staticFile(audioSrc)} />
      <Sequence from={SCENE.HOOK_START} durationInFrames={SCENE.HOOK_END - SCENE.HOOK_START}>
        <HookScene localFrame={frame - SCENE.HOOK_START} duration={SCENE.HOOK_END - SCENE.HOOK_START} />
      </Sequence>
      <Sequence from={SCENE.S1_START} durationInFrames={SCENE.S1_END - SCENE.S1_START}>
        <ThreeSignsScene localFrame={frame - SCENE.S1_START} duration={SCENE.S1_END - SCENE.S1_START} />
      </Sequence>
      <Sequence from={SCENE.S2_START} durationInFrames={SCENE.S2_END - SCENE.S2_START}>
        <MagicQuestionScene localFrame={frame - SCENE.S2_START} duration={SCENE.S2_END - SCENE.S2_START} />
      </Sequence>
      <Sequence from={SCENE.S3_START} durationInFrames={SCENE.S3_END - SCENE.S3_START}>
        <SilenceScene localFrame={frame - SCENE.S3_START} duration={SCENE.S3_END - SCENE.S3_START} />
      </Sequence>
      <Sequence from={SCENE.STORY_START} durationInFrames={SCENE.STORY_END - SCENE.STORY_START}>
        <MayaScene localFrame={frame - SCENE.STORY_START} duration={SCENE.STORY_END - SCENE.STORY_START} />
      </Sequence>
      <Sequence from={SCENE.TWOSIGNS_START} durationInFrames={SCENE.TWOSIGNS_END - SCENE.TWOSIGNS_START}>
        <TwoSignsScene localFrame={frame - SCENE.TWOSIGNS_START} duration={SCENE.TWOSIGNS_END - SCENE.TWOSIGNS_START} />
      </Sequence>
      <Sequence from={SCENE.CTA_START} durationInFrames={SCENE.CTA_END - SCENE.CTA_START}>
        <CTAScene localFrame={frame - SCENE.CTA_START} duration={SCENE.CTA_END - SCENE.CTA_START} />
      </Sequence>
    </AbsoluteFill>
  );
};
