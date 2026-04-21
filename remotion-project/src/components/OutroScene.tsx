import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
  staticFile,
  Img,
} from 'remotion';
import { ParticleField } from './ParticleField';
import { KineticText } from './KineticText';
import { NoiseOverlay } from './NoiseOverlay';
import { TypewriterText } from './TypewriterText';

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
  ctaHeadline?: string; ctaDescription?: string; ctaButtonText?: string;
  kineticText?: string; kineticColor?: string;
  speakerName?: string; bgColors?: string[]; avatarSrc?: string;
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

// ─── Phase opacity helper ─────────────────────────────────────────────────────
const phaseOpacity = (frame: number, enter: number, exit: number, fade = 18): number => {
  if (frame < enter || frame > exit) return 0;
  return Math.min(
    Math.min(1, (frame - enter) / fade),
    Math.min(1, (exit - frame) / fade)
  );
};

// ─── Word-by-word gold text build ────────────────────────────────────────────
const GoldWordBuild: React.FC<{
  words: string[]; color: string; fontSize?: number; startFrame: number; stagger?: number;
}> = ({ words, color, fontSize = 58, startFrame, stagger = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      justifyContent: 'center', maxWidth: 740,
    }}>
      {words.map((word, i) => {
        const wf = Math.max(0, frame - (startFrame + i * stagger));
        const ent = spring({ frame: wf, fps, config: { damping: 11, stiffness: 110 } });
        const spark = wf < 12
          ? interpolate(wf, [0, 5, 12], [2.0, 3.5, 1.0], { extrapolateRight: 'clamp' })
          : 1.0;
        return (
          <span key={i} style={{
            fontSize, fontWeight: 900, color,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase', letterSpacing: 2,
            opacity: ent,
            transform: `scale(${interpolate(ent, [0, 1], [0.5, 1])}) translateY(${interpolate(ent, [0, 1], [20, 0])}px)`,
            display: 'inline-block',
            textShadow: `0 0 ${20 * spark}px ${color}90, 0 0 ${45 * spark}px ${color}55, 0 0 ${80 * spark}px ${color}25`,
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ─── Sprint B-roll panel ──────────────────────────────────────────────────────
const SprintPanel: React.FC<{
  opacity: number; startFrame: number; accentColor: string;
}> = ({ opacity, startFrame, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const ent = spring({ frame: lf, fps, config: { damping: 16, stiffness: 70 } });
  const glow = 0.5 + Math.sin(lf * 0.07) * 0.3;

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `scale(${interpolate(ent, [0, 1], [0.92, 1])})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      {/* Framed B-roll player */}
      <div style={{
        width: 700, height: 394, borderRadius: 14, overflow: 'hidden',
        border: `2px solid ${accentColor}60`,
        boxShadow: `0 0 ${40 * glow}px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.4)`,
        position: 'relative',
      }}>
        <OffthreadVideo
          src={staticFile('broll/sprint-win.mp4')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Accent overlay frame corners */}
        {[
          { top: 0, left: 0, borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` },
          { top: 0, right: 0, borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` },
          { bottom: 0, left: 0, borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` },
          { bottom: 0, right: 0, borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
        ))}
      </div>
      <div style={{
        fontSize: 13, color: accentColor, letterSpacing: 3, textTransform: 'uppercase',
        fontFamily: 'sans-serif', fontWeight: 600, opacity: 0.8,
      }}>
        Radically shift your trajectory
      </div>
    </div>
  );
};

// ─── Quiz card (recreated from scottmagnacca.com) ─────────────────────────────
const QuizCard: React.FC<{
  opacity: number; startFrame: number; accentColor: string; ctaUrl: string; colors: VideoColors;
}> = ({ opacity, startFrame, accentColor, ctaUrl, colors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);
  const ent = spring({ frame: lf, fps, config: { damping: 16, stiffness: 65 } });
  const glow = 0.5 + Math.sin(lf * 0.05) * 0.35;

  const options = [
    'Very Repetitive / Solely Data',
    'Predominantly Routine',
    'Varies / Moderate',
    'Minimal Routine / Highly Unique',
  ];

  // Gold border draw: animates over ~5.8s (175 frames) once card enters
  const borderProgress = Math.min(1, Math.max(0, lf) / 175);
  // Perimeter of 680×390 rounded rect ≈ 2180px (use 2200 for dash safety)
  const BORDER_PERIMETER = 2200;

  return (
    <div style={{
      opacity: opacity * ent,
      transform: `translateY(${interpolate(ent, [0, 1], [30, 0])}px) scale(0.85)`,
      transformOrigin: 'center center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 680, padding: '22px 28px',
        position: 'relative',
        background: 'rgba(10,14,26,0.97)',
        border: `1px solid ${accentColor}70`,
        borderRadius: 16,
        boxShadow: `0 0 ${35 * glow}px ${accentColor}45, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Animated gold border — draws clockwise over ~5.8s */}
        {borderProgress > 0 && (
          <svg
            style={{
              position: 'absolute', top: -4, left: -4,
              width: 688, height: 400,
              pointerEvents: 'none', overflow: 'visible', zIndex: 10,
            }}
            viewBox="0 0 688 400"
          >
            <rect
              x="3" y="3" width="682" height="394" rx="18"
              fill="none"
              stroke="#DDD055"
              strokeWidth="5"
              strokeDasharray={BORDER_PERIMETER}
              strokeDashoffset={BORDER_PERIMETER * (1 - borderProgress)}
              style={{
                filter: 'drop-shadow(0 0 10px #DDD055) drop-shadow(0 0 22px #EEAF0080)',
              }}
            />
          </svg>
        )}
        {/* Badge */}
        <div style={{
          textAlign: 'center', fontSize: 11, fontWeight: 700,
          color: accentColor, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10,
        }}>
          FREE · 60-SECOND ASSESSMENT
        </div>
        {/* Title */}
        <div style={{
          textAlign: 'center', fontSize: 20, fontWeight: 800,
          color: colors.textPrimary, lineHeight: 1.35, marginBottom: 6,
        }}>
          12-Month AI Disruption Risk Assessment:
          <span style={{ color: accentColor, display: 'block' }}>Will Your Job Be Next?</span>
        </div>
        {/* Divider */}
        <div style={{
          height: 1, margin: '10px 0',
          background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
        }} />
        {/* Question */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: colors.textPrimary,
          textAlign: 'center', marginBottom: 8,
        }}>
          How repetitive or rule-following is your daily work?
        </div>
        {/* Options */}
        {options.map((opt, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 12px', marginBottom: 5, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <span style={{ color: accentColor, fontWeight: 700, fontSize: 11, width: 14 }}>
              {['A','B','C','D'][i]}
            </span>
            <span style={{ color: '#d0d8e8', fontSize: 12 }}>{opt}</span>
          </div>
        ))}
        {/* CTA Button */}
        <div style={{
          marginTop: 10, background: accentColor, borderRadius: 8,
          padding: '9px 0', textAlign: 'center',
          fontSize: 13, fontWeight: 800, color: '#0a0e1a',
          boxShadow: `0 0 20px ${accentColor}60`,
          letterSpacing: 1,
        }}>
          Take the Free Assessment →
        </div>
      </div>
      {/* URL typewriter */}
      <div style={{ opacity: Math.max(0, ent - 0.3) }}>
        <TypewriterText
          text={ctaUrl}
          delay={startFrame + 30}
          speed={3}
          color={colors.textSecondary}
          fontSize={18}
          glowColor={accentColor}
          fontWeight={400}
          cursor={false}
        />
      </div>
    </div>
  );
};

// ─── OutroScene ───────────────────────────────────────────────────────────────
export const OutroScene: React.FC<{
  scene: SceneConfig; colors: VideoColors; effects: EffectsConfig;
  ctaUrl: string; ctaTagline: string;
}> = ({ scene, colors, effects, ctaUrl }) => {
  const frame = useCurrentFrame();
  const sceneDuration = scene.timing.endFrame - scene.timing.startFrame;
  const accentColor  = rc(scene.accentColor, colors, colors.accent2);
  const kineticColor = rc(scene.kineticColor, colors, colors.accent1);

  // ── Phase opacities (Whisper-timed to Scott_outro_4.1.26.mp4 — 643 frames) ──
  // f0–f95:   "So we just discussed" → Kinetic text
  // f28–f275: "several powerful ideas" → gold word build (words at f30/f47/f64)
  // f103–f295: "radically shift your productivity..." → sprint B-roll
  // f280–end: "If this resonated / click link or QR / take the quiz / let's continue" → quiz card
  const opKinetic = phaseOpacity(frame, 0, 55, 18);
  const opGold    = phaseOpacity(frame, 70, 275, 18);
  const opSprint  = phaseOpacity(frame, 103, 295, 22);
  const opQuiz    = phaseOpacity(frame, 280, sceneDuration, 22);

  // Overall fade out (last 30 frames)
  const globalOpacity = frame >= sceneDuration - 30
    ? interpolate(frame, [sceneDuration - 30, sceneDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, opacity: globalOpacity }}>

      {/* ── Background ──────────────────────────────────────────────────────── */}
      <AbsoluteFill style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, #060a18 50%, ${colors.bg} 100%)`,
      }} />

      {/* ── Particles ───────────────────────────────────────────────────────── */}
      {effects.particles && (
        <ParticleField color={accentColor} count={28} seed={77} intensity={0.7} />
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
          {/* Feather left edge */}
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
        padding: '0 40px',
      }}>

        {/* Phase 1: "YOUR CIRCLE IS YOUR CATALYST" kinetic text */}
        {opKinetic > 0.01 && scene.kineticText && (
          <div style={{ position: 'absolute', opacity: opKinetic }}>
            <KineticText
              text={scene.kineticText}
              color={kineticColor}
              fontSize={56}
              delay={0}
              duration={100}
              glow
            />
          </div>
        )}

        {/* Phase 2: "THREE POWERFUL IDEAS" gold word build */}
        {opGold > 0.01 && (
          <div style={{
            position: 'absolute',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            opacity: opGold,
          }}>
            <div style={{
              fontSize: 13, color: '#a0aec0', letterSpacing: 3, textTransform: 'uppercase',
              fontFamily: 'sans-serif', opacity: 0.7,
            }}>
              We just discussed
            </div>
            <GoldWordBuild
              words={['SEVERAL', 'POWERFUL', 'IDEAS']}
              color={colors.accent2}
              fontSize={68}
              startFrame={30}
              stagger={17}
            />
          </div>
        )}

        {/* Phase 3: Sprint B-roll */}
        {opSprint > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <SprintPanel
              opacity={opSprint}
              startFrame={103}
              accentColor={accentColor}
            />
          </div>
        )}

        {/* Phase 4: Quiz card + URL */}
        {opQuiz > 0.01 && (
          <div style={{ position: 'absolute' }}>
            <QuizCard
              opacity={opQuiz}
              startFrame={280}
              accentColor={accentColor}
              ctaUrl={ctaUrl}
              colors={colors}
            />
          </div>
        )}
      </div>

      {/* ── Vertical separator ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 952, top: 0, width: 1, height: 1080,
        background: `linear-gradient(180deg, transparent, ${accentColor}30 30%, ${accentColor}30 70%, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* ── Noise overlay ────────────────────────────────────────────────────── */}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.04} />}
    </AbsoluteFill>
  );
};
