import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
  staticFile,
} from 'remotion';
import { ParticleField } from './ParticleField';
import { NoiseOverlay } from './NoiseOverlay';
import { LiquidReveal, CrossfadeTransition } from './SceneTransition';

// ─── Local types ──────────────────────────────────────────────────────────────
interface VideoColors {
  bg: string; accent1: string; accent2: string; accent3: string;
  textPrimary: string; textSecondary: string;
}
interface EffectsConfig {
  particles: boolean; noiseOverlay: boolean;
  sceneTransitions: 'liquid' | 'crossfade' | 'none';
  hueShift: boolean; kineticStyle: 'spring-glow' | 'typewriter' | 'marker-highlight';
}
interface SceneConfig {
  type: string; accentColor: string;
  hookText?: string; hookColor?: string; topicTitle?: string; topicSubtitle?: string;
  speakerName?: string; speakerTitle?: string;
  kineticText?: string; kineticColor?: string; avatarSrc?: string;
  timing: { startFrame: number; endFrame: number };
}

// ─── Color resolver ───────────────────────────────────────────────────────────
const rc = (ref: string | undefined, colors: VideoColors, fallback: string): string => {
  if (!ref) return fallback;
  const m: Record<string, string> = {
    accent1: colors.accent1, accent2: colors.accent2, accent3: colors.accent3,
    bg: colors.bg, textPrimary: colors.textPrimary, textSecondary: colors.textSecondary,
  };
  return m[ref] || ref;
};

// ─── Phase opacity helper (smooth crossfades) ─────────────────────────────────
const phaseOpacity = (frame: number, enter: number, exit: number, fade = 18): number => {
  if (frame < enter || frame > exit) return 0;
  const inFade  = Math.min(1, (frame - enter) / fade);
  const outFade = Math.min(1, (exit - frame) / fade);
  return Math.min(inFade, outFade);
};

// ─── Word-by-word sparkle text build ─────────────────────────────────────────
const SparkleWords: React.FC<{
  words: string[]; color: string; fontSize?: number;
  startFrame: number; stagger?: number;
}> = ({ words, color, fontSize = 54, startFrame, stagger = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '12px 16px',
      justifyContent: 'center', maxWidth: 720,
    }}>
      {words.map((word, i) => {
        const wf = Math.max(0, frame - (startFrame + i * stagger));
        const ent = spring({ frame: wf, fps, config: { damping: 12, stiffness: 110 } });
        // Sparkle: intensity peaks briefly right as word appears then settles
        const sparkle = wf < 10
          ? interpolate(wf, [0, 4, 10], [1.5, 3.0, 1.0], { extrapolateRight: 'clamp' })
          : 1.0;
        return (
          <span key={i} style={{
            fontSize,
            fontWeight: 900,
            color,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: 2,
            opacity: ent,
            transform: `scale(${interpolate(ent, [0, 1], [0.6, 1])})`,
            display: 'inline-block',
            textShadow: `0 0 ${20 * sparkle}px ${color}90, 0 0 ${40 * sparkle}px ${color}50, 0 0 ${70 * sparkle}px ${color}25`,
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ─── Exponential learning curve SVG ──────────────────────────────────────────
const LearningCurve: React.FC<{
  startFrame: number; duration: number; accentColor: string; orange: string;
}> = ({ startFrame, duration, accentColor, orange }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const progress = Math.min(1, lf / Math.max(1, duration));
  const fadeIn = spring({ frame: lf, fps, config: { damping: 16, stiffness: 60 } });

  // Curve path length (empirically ~420 for this bezier)
  const pathLength = 420;
  const dashOffset = pathLength * (1 - progress);
  const showLabel = progress > 0.88;
  const showDot = progress > 0.78;

  return (
    <div style={{ opacity: fadeIn, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontSize: 22, color: '#a0aec0', letterSpacing: 4, textTransform: 'uppercase',
        fontFamily: '-apple-system, sans-serif', marginBottom: 16, fontWeight: 700,
        textShadow: `0 0 20px ${accentColor}40`,
      }}>
        THE LEARNING CURVE
      </div>
      {/* 25% bigger than 2× original: 1075×650 */}
      <svg viewBox="0 0 440 300" width="1075" height="650">
        {/* Axes — bright white for clarity */}
        <line x1="30" y1="20" x2="30" y2="270" stroke="#ffffff" strokeWidth="2.5" />
        <line x1="30" y1="270" x2="420" y2="270" stroke="#ffffff" strokeWidth="2.5" />
        {/* Axis labels — bright white */}
        <text x="225" y="292" fill="#ffffff" fontSize="17" textAnchor="middle" fontFamily="sans-serif" fontWeight="700">Time</text>
        <text x="12" y="145" fill="#ffffff" fontSize="17" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" transform="rotate(-90 12 145)">Mastery</text>

        {/* Traditional path — flat, slow, dashed orange */}
        <path d="M 30 250 C 120 248, 250 235, 415 215"
          fill="none" stroke={orange} strokeWidth="2.5"
          strokeDasharray="8 5" opacity={0.7}
        />

        {/* Exponential curve — gold sparkle */}
        <path
          d="M 30 268 C 180 265, 330 210, 415 22"
          fill="none" stroke="#DDD055" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={pathLength} strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 ${8 + 6 * Math.sin(lf * 0.12)}px #DDD055) drop-shadow(0 0 ${18 + 10 * Math.sin(lf * 0.09)}px #DDD05580)` }}
        />

        {/* Endpoint dot — gold */}
        {showDot && (
          <circle cx="415" cy="22" r={interpolate(progress, [0.78, 1], [0, 10], { extrapolateRight: 'clamp' })}
            fill="#DDD055" style={{ filter: `drop-shadow(0 0 18px #DDD055)` }} />
        )}

        {/* Compressed label — gold */}
        {showLabel && (
          <g opacity={interpolate(progress, [0.88, 1], [0, 1], { extrapolateRight: 'clamp' })}>
            <line x1="415" y1="22" x2="350" y2="60" stroke="#DDD055" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
            <text x="342" y="56" fill="#DDD055" fontSize="16" textAnchor="end"
              fontFamily="sans-serif" fontWeight="800">Compressed</text>
          </g>
        )}

        {/* Start/end markers — white */}
        <text x="30" y="287" fill="#ffffff90" fontSize="13" textAnchor="middle" fontFamily="sans-serif">Start</text>
        <text x="415" y="287" fill="#ffffff90" fontSize="13" textAnchor="middle" fontFamily="sans-serif">Now</text>
      </svg>
    </div>
  );
};

// ─── Phase 1: Credential card ─────────────────────────────────────────────────
const CredentialCard: React.FC<{ opacity: number; colors: VideoColors; accentColor: string }> = ({ opacity, colors, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame: Math.max(0, frame), fps, config: { damping: 16, stiffness: 70 } });
  const glow = 0.5 + Math.sin(frame * 0.05) * 0.3;

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [20, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
    }}>
      {/* salesforlife.ai logo — bright green globe + gold arrow on black */}
      <div style={{
        width: 180, height: 180, borderRadius: '50%',
        background: '#000000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: [
          `0 0 ${50 * glow}px #00C04B50`,
          `0 0 ${80 * glow}px #DDD05520`,
          `inset 0 0 30px #00000080`,
        ].join(', '),
      }}>
        <svg viewBox="0 0 200 200" width="150" height="150" style={{
          filter: `drop-shadow(0 0 ${10 * glow}px #00C04B) drop-shadow(0 0 ${22 * glow}px #00C04B60)`,
        }}>
          {/* Globe outer ring */}
          <circle cx="100" cy="100" r="72" fill="none" stroke="#00C04B" strokeWidth="7"/>
          {/* Vertical meridian */}
          <line x1="100" y1="28" x2="100" y2="172" stroke="#00C04B" strokeWidth="3.5"/>
          {/* Horizontal equator */}
          <line x1="28" y1="100" x2="172" y2="100" stroke="#00C04B" strokeWidth="3.5"/>
          {/* Left longitude arc */}
          <path d="M 100 28 Q 52 100 100 172" fill="none" stroke="#00C04B" strokeWidth="3"/>
          {/* Right longitude arc */}
          <path d="M 100 28 Q 148 100 100 172" fill="none" stroke="#00C04B" strokeWidth="3"/>
          {/* North latitude arc */}
          <path d="M 52 66 Q 100 57 148 66" fill="none" stroke="#00C04B" strokeWidth="2.5"/>
          {/* South latitude arc */}
          <path d="M 52 134 Q 100 143 148 134" fill="none" stroke="#00C04B" strokeWidth="2.5"/>
          {/* Orbital arrow: arcs from lower-left around globe bottom, shoots upper-right */}
          <path d="M 18 168 C 55 205, 145 205, 182 32"
            fill="none" stroke="#DDD055" strokeWidth="10" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px #DDD055)` }}/>
          {/* Arrowhead — pointing along curve direction at upper-right */}
          <polygon points="182,32 169,46 189,50" fill="#DDD055"
            style={{ filter: `drop-shadow(0 0 6px #DDD055)` }}/>
        </svg>
      </div>
      <div style={{
        fontSize: 52, fontWeight: 800, color: colors.textPrimary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center', letterSpacing: -1,
      }}>
        Scott Magnacca
      </div>
      <div style={{
        height: 3, width: 240,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: 0.8,
      }} />
      <div style={{
        fontSize: 30, fontWeight: 500, color: colors.textSecondary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center', letterSpacing: 3, textTransform: 'uppercase',
      }}>
        Co-Founder
      </div>
      <div style={{
        fontSize: 40, fontWeight: 800, color: accentColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center',
        textShadow: `0 0 20px ${accentColor}80, 0 0 40px ${accentColor}40`,
      }}>
        Salesforlife.ai
      </div>
    </div>
  );
};

// ─── Phase 2: 25 Years flash text ────────────────────────────────────────────
const YearsFlash: React.FC<{ opacity: number; colors: VideoColors }> = ({ opacity, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Count up 1→25 over 3 seconds (90 frames) starting at f125, then flash at f215
  const countStart = 125;
  const countEnd   = 215;  // 90 frames = 3s at 30fps
  const cf = Math.max(0, frame - countStart);
  const currentNum = frame < countEnd
    ? Math.round(interpolate(frame, [countStart, countEnd], [1, 25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))
    : 25;
  // Flash pulse when counter hits 25 (frames 215–255)
  const flashF = Math.max(0, frame - countEnd);
  const flashT = flashF < 40 ? Math.abs(Math.sin(flashF * Math.PI / 10)) : 0;
  const flashScale = 1 + 0.18 * flashT;
  const flashGlow  = 1 + 3.0  * flashT;
  const numEnt = spring({ frame: cf, fps, config: { damping: 10, stiffness: 120 } });
  const labelEnt = spring({ frame: Math.max(0, frame - 162), fps, config: { damping: 14, stiffness: 80 } });

  return (
    <div style={{ opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Counter / "25" — large, punchy, counts up then flashes */}
      <div style={{
        fontSize: 160, fontWeight: 900, color: '#ffffff', lineHeight: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        opacity: numEnt,
        transform: `scale(${interpolate(numEnt, [0, 1], [0.5, 1]) * flashScale})`,
        textShadow: `0 0 ${30 * flashGlow}px #ffffff80, 0 0 ${60 * flashGlow}px #DDD05540`,
        letterSpacing: -8,
      }}>
        {currentNum}
      </div>
      {/* "YEARS" */}
      <div style={{
        fontSize: 44, fontWeight: 800, color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        letterSpacing: 12, textTransform: 'uppercase',
        opacity: numEnt,
        transform: `translateY(${interpolate(numEnt, [0, 1], [20, 0])}px)`,
      }}>
        YEARS
      </div>
      {/* Accent line */}
      <div style={{
        height: 2, width: interpolate(labelEnt, [0, 1], [0, 280]),
        background: `linear-gradient(90deg, transparent, ${colors.accent2}, transparent)`,
        opacity: labelEnt,
      }} />
      {/* "IN FINANCIAL SERVICES" */}
      <div style={{
        fontSize: 22, fontWeight: 600, color: colors.textSecondary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        letterSpacing: 4, textTransform: 'uppercase',
        opacity: labelEnt,
        transform: `translateY(${interpolate(labelEnt, [0, 1], [15, 0])}px)`,
      }}>
        in Financial Services
      </div>
    </div>
  );
};

// ─── Phase 4: Gold sparkle words for "change the way..." ─────────────────────
const ChangeWords: React.FC<{ opacity: number; accentColor: string; startFrame?: number }> = ({ opacity, accentColor, startFrame = 476 }) => {
  // Whisper timestamps relative to when Scott says "change" (f535) and subsequent words
  // Stagger each word group in at its whisper-timed frame
  const frame = useCurrentFrame();
  const pulseLf = Math.max(0, frame - startFrame);
  // Single gold pulse on entrance (half-sine over 45 frames ≈ 1.5s)
  const onePulse = pulseLf < 45 ? Math.sin(pulseLf * Math.PI / 45) : 0;
  const potentialShadow = onePulse > 0.01
    ? `0 0 ${28 * onePulse}px #DDD055, 0 0 ${55 * onePulse}px #EEAF0070, 0 0 ${90 * onePulse}px #EEAF0030`
    : '0 0 10px #DDD05445';

  const lines = [
    { words: ['CHANGE THE WAY'], startFrame: 535 },
    { words: ['YOU WORK,'], startFrame: 557 },
    { words: ['LEAD'], startFrame: 571 },
    { words: ['& GROW'], startFrame: 606 },
    { words: ['IN THE NEXT', '12 MONTHS'], startFrame: 627 },
  ];

  return (
    <div style={{
      opacity,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, maxWidth: 880,
    }}>
      {/* THE POTENTIAL TO — 200% bigger, bold, bright gold, single entrance pulse */}
      <div style={{
        fontSize: 42, fontWeight: 900, color: '#DDD055',
        letterSpacing: 3, textTransform: 'uppercase',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        marginBottom: 8,
        textShadow: potentialShadow,
      }}>
        THE POTENTIAL TO
      </div>
      {lines.map((line, li) => (
        <SparkleWords
          key={li}
          words={line.words}
          color={accentColor}
          fontSize={li === 0 ? 50 : li === 3 || li === 4 ? 40 : 52}
          startFrame={line.startFrame}
          stagger={6}
        />
      ))}
    </div>
  );
};

// ─── Phase 5: Hook + Topic reveal ────────────────────────────────────────────
const TopicReveal: React.FC<{
  opacity: number; hookText: string; topicTitle: string;
  topicSubtitle?: string; hookColor: string; accentColor: string; colors: VideoColors;
}> = ({ opacity, hookText, topicTitle, topicSubtitle, hookColor, accentColor, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent1 = spring({ frame: Math.max(0, frame - 691), fps, config: { damping: 14, stiffness: 80 } });
  const ent2 = spring({ frame: Math.max(0, frame - 706), fps, config: { damping: 16, stiffness: 70 } });
  const ent3 = spring({ frame: Math.max(0, frame - 716), fps, config: { damping: 16, stiffness: 70 } });

  return (
    <div style={{
      opacity, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 14,
    }}>
      <div style={{
        fontSize: 36, fontWeight: 900, color: hookColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center',
        opacity: ent1, transform: `scale(${interpolate(ent1, [0, 1], [0.8, 1])})`,
        textShadow: `0 0 20px ${hookColor}80, 0 0 40px ${hookColor}40`,
      }}>
        {hookText}
      </div>
      <div style={{
        height: 2, width: 200,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: ent2,
      }} />
      <div style={{
        fontSize: 26, fontWeight: 700, color: colors.textPrimary,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        textAlign: 'center', maxWidth: 680, lineHeight: 1.3,
        opacity: ent2, transform: `translateY(${interpolate(ent2, [0, 1], [20, 0])}px)`,
      }}>
        {topicTitle}
      </div>
      {topicSubtitle && (
        <div style={{
          fontSize: 16, fontWeight: 400, color: colors.textSecondary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center',
          opacity: ent3,
        }}>
          {topicSubtitle}
        </div>
      )}
    </div>
  );
};

// ─── IntroScene ───────────────────────────────────────────────────────────────
export const IntroScene: React.FC<{
  scene: SceneConfig; colors: VideoColors; effects: EffectsConfig;
}> = ({ scene, colors, effects }) => {
  const frame = useCurrentFrame();
  const sceneDuration = scene.timing.endFrame - scene.timing.startFrame;
  const accentColor = rc(scene.accentColor, colors, colors.accent1);
  const hookColor   = rc(scene.hookColor, colors, colors.accent2);
  const hookText    = scene.hookText ?? "YOUR EDGE ISN'T WHAT YOU THINK";
  const topicTitle  = scene.topicTitle ?? '';
  const topicSubtitle = scene.topicSubtitle;

  // ── Phase opacities (Whisper-timed) ──────────────────────────────────────
  const op1 = phaseOpacity(frame, 0, 135, 20);         // Credential: 0–f135
  const op2 = phaseOpacity(frame, 125, 370, 18);       // 25 Years: f125–f370
  const op3 = phaseOpacity(frame, 362, 486, 18);       // Curve: f362–f486
  const op4 = phaseOpacity(frame, 476, 700, 18);       // Sparkle: f476–f700
  const op5 = phaseOpacity(frame, 691, sceneDuration, 18); // Topic: f691–end

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>

      {/* ── Background ──────────────────────────────────────────────────────── */}
      <AbsoluteFill style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, #050810 50%, ${colors.bg} 100%)`,
      }} />

      {/* ── Particles ───────────────────────────────────────────────────────── */}
      {effects.particles && (
        <ParticleField color={accentColor} count={25} seed={99} intensity={0.5} />
      )}

      {/* ── Avatar — RIGHT HALF ─────────────────────────────────────────────── */}
      {/* CRITICAL: Never use objectFit/objectPosition on OffthreadVideo — Remotion's headless
          renderer ignores CSS objectFit, causing the full 1920×1080 video to overflow the
          container rightward. Always use explicit px dimensions instead. */}
      {scene.avatarSrc && (
        <div style={{
          position: 'absolute', right: 0, top: 0, width: 960, height: 1080,
          overflow: 'hidden', backgroundColor: colors.bg,
        }}>
          {/* Render at full 1920×1080, anchored right — overflow:hidden clips to right 960px */}
          <OffthreadVideo
            src={staticFile(scene.avatarSrc)}
            style={{ position: 'absolute', right: 0, top: 0, width: 1920, height: 1080 }}
          />
          {/* Feather left edge so avatar blends into left panel */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 120, height: 1080,
            background: `linear-gradient(90deg, ${colors.bg}, transparent)`,
            pointerEvents: 'none',
          }} />
        </div>
      )}

      {/* ── Left panel — phased content ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px',
      }}>
        {/* Phase 1: Credential card */}
        {op1 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <CredentialCard opacity={op1} colors={colors} accentColor={accentColor} />
          </div>
        )}

        {/* Phase 2: 25 Years */}
        {op2 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <YearsFlash opacity={op2} colors={colors} />
          </div>
        )}

        {/* Phase 3: Learning Curve */}
        {op3 > 0.01 && (
          <div style={{ position: 'absolute', opacity: op3 }}>
            <LearningCurve
              startFrame={362} duration={80}
              accentColor={accentColor} orange={colors.accent3}
            />
          </div>
        )}

        {/* Phase 4: Sparkle words */}
        {op4 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <ChangeWords opacity={op4} accentColor={colors.accent2} startFrame={476} />
          </div>
        )}

        {/* Phase 5: Topic reveal */}
        {op5 > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <TopicReveal
              opacity={op5} hookText={hookText} topicTitle={topicTitle}
              topicSubtitle={topicSubtitle} hookColor={hookColor}
              accentColor={accentColor} colors={colors}
            />
          </div>
        )}
      </div>

      {/* ── Vertical separator ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
        background: `linear-gradient(180deg, transparent 0%, ${accentColor}30 30%, ${accentColor}30 70%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Noise overlay ────────────────────────────────────────────────────── */}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.04} />}

      {/* ── Scene transition ─────────────────────────────────────────────────── */}
      {effects.sceneTransitions === 'liquid' && (
        <LiquidReveal triggerFrame={sceneDuration - 15} duration={15} color={colors.bg} />
      )}
      {effects.sceneTransitions === 'crossfade' && (
        <CrossfadeTransition triggerFrame={sceneDuration - 12} duration={12} />
      )}
    </AbsoluteFill>
  );
};
