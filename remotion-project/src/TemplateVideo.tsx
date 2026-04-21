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
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { GlassmorphismCard } from './components/GlassmorphismCard';
import { KineticText, KineticTextSequence } from './components/KineticText';
import { BRollPlayer } from './components/BRollPlayer';
import { NoiseOverlay, DynamicHueShift } from './components/NoiseOverlay';
import { LiquidReveal, CrossfadeTransition } from './components/SceneTransition';
import { TypewriterText } from './components/TypewriterText';
import { MarkerHighlight } from './components/MarkerHighlight';
import { IntroScene } from './components/IntroScene';
import { OutroScene } from './components/OutroScene';

// ─── Types ──────────────────────────────────────────────────────
interface VideoColors {
  bg: string;
  accent1: string;
  accent2: string;
  accent3: string;
  textPrimary: string;
  textSecondary: string;
}

interface EffectsConfig {
  particles: boolean;
  noiseOverlay: boolean;
  sceneTransitions: 'liquid' | 'crossfade' | 'none';
  hueShift: boolean;
  kineticStyle: 'spring-glow' | 'typewriter' | 'marker-highlight';
}

interface BRollConfig {
  src: string;
  maxDuration: number;
}

interface BridgeCard {
  title: string;
  color: string;
  subtitle: string;
  icon: string;
}

interface KineticSequenceItem {
  text: string;
  color: string;
}

interface SceneConfig {
  type: 'hook' | 'archetype' | 'bridge' | 'cta' | 'montage' | 'quote' | 'intro' | 'outro';
  title?: string;
  titleLine2?: string;
  subtitle?: string;
  number?: number;
  accentColor: string;
  icon?: string;
  kineticText?: string;
  kineticColor?: string;
  kineticEffects?: string[];
  kineticSequence?: KineticSequenceItem[];
  broll?: BRollConfig;
  bgColors?: string[];
  cards?: BridgeCard[];
  narration?: string;
  markerPhrase?: string | null;
  holdFrames?: number;
  // Intro scene fields
  hookText?: string;
  hookColor?: string;
  topicTitle?: string;
  topicSubtitle?: string;
  speakerName?: string;
  speakerTitle?: string;
  // Outro scene fields
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  // Avatar (HeyGen) — path relative to public/, e.g. "avatar/intro-avatar.mp4"
  avatarSrc?: string;
  timing: {
    startFrame: number;
    endFrame: number;
  };
}

interface VideoConfig {
  title: string;
  compositionId: string;
  audio: {
    file: string;
  };
  colors: VideoColors;
  effects: EffectsConfig;
  ctaUrl: string;
  ctaTagline: string;
  scenes: SceneConfig[];
}

// ─── Color Resolution ───────────────────────────────────────────
const resolveColor = (colorRef: string, colors: VideoColors): string => {
  const map: Record<string, string> = {
    accent1: colors.accent1,
    accent2: colors.accent2,
    accent3: colors.accent3,
    bg: colors.bg,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
  };
  return map[colorRef] || colorRef; // Return as-is if it's a hex value
};

// ─── Animated Background ─────────────────────────────────────────
const AnimatedBackground: React.FC<{
  color1?: string; color2?: string; color3?: string; speed?: number;
}> = ({ color1 = '#00d4ff', color2 = '#1a0a2e', color3 = '#0a0e1a', speed = 1 }) => {
  const frame = useCurrentFrame();
  const x1 = 25 + Math.sin(frame * 0.006 * speed) * 20;
  const y1 = 35 + Math.cos(frame * 0.005 * speed) * 20;
  const x2 = 75 + Math.sin(frame * 0.008 * speed + 2) * 18;
  const y2 = 65 + Math.cos(frame * 0.007 * speed + 1) * 18;
  const x3 = 50 + Math.sin(frame * 0.004 * speed + 4) * 15;
  const y3 = 50 + Math.cos(frame * 0.009 * speed + 3) * 15;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 50% 50% at ${x1}% ${y1}%, ${color1}20 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at ${x2}% ${y2}%, ${color2}30 0%, transparent 50%),
          radial-gradient(ellipse 60% 60% at ${x3}% ${y3}%, ${color1}10 0%, transparent 70%),
          linear-gradient(135deg, ${color3} 0%, #050810 50%, ${color3} 100%)
        `,
      }}
    />
  );
};

// ─── Scene Number Badge ──────────────────────────────────────────
const SceneNumber: React.FC<{ number: number; color: string; delay?: number }> = ({ number, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 100 } });

  return (
    <div
      style={{
        position: 'absolute', top: 60, left: 80, display: 'flex', alignItems: 'center', gap: 16,
        opacity: entrance, transform: `translateX(${interpolate(entrance, [0, 1], [-30, 0])}px)`, zIndex: 10,
      }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: '50%', border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800, color, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {number}
      </div>
      <div style={{ height: 2, width: 60, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
};

// ─── Scene Icon ──────────────────────────────────────────────────
const SceneIcon: React.FC<{ type: string; color: string; delay?: number }> = ({ type, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 80 } });
  const pulse = 1 + Math.sin(frame * 0.05) * 0.03;

  return (
    <div style={{
      width: 70, height: 70, borderRadius: '50%', border: `2px solid ${color}60`, background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      transform: `scale(${entrance * pulse})`, opacity: entrance, boxShadow: `0 0 30px ${color}30`,
    }}>
      <svg width={36} height={36} viewBox="0 0 40 40">
        {type === 'believer' && (
          <>
            <circle cx={20} cy={12} r={8} fill="none" stroke={color} strokeWidth={2} />
            <path d="M20 22 L20 36 M12 28 L28 28" stroke={color} strokeWidth={2} fill="none" />
          </>
        )}
        {type === 'peer' && (
          <>
            <circle cx={14} cy={14} r={6} fill="none" stroke={color} strokeWidth={2} />
            <circle cx={26} cy={14} r={6} fill="none" stroke={color} strokeWidth={2} />
            <path d="M8 32 Q14 24 20 32 Q26 24 32 32" stroke={color} strokeWidth={2} fill="none" />
          </>
        )}
        {type === 'coach' && (
          <>
            <circle cx={20} cy={20} r={14} fill="none" stroke={color} strokeWidth={2} />
            <path d="M20 8 L20 20 L28 20" stroke={color} strokeWidth={2} fill="none" />
            <circle cx={20} cy={20} r={3} fill={color} />
          </>
        )}
        {/* Generic icon fallback — star */}
        {!['believer', 'peer', 'coach'].includes(type) && (
          <path d="M20 5 L24 15 L35 15 L26 22 L30 33 L20 26 L10 33 L14 22 L5 15 L16 15 Z"
            fill="none" stroke={color} strokeWidth={2} />
        )}
      </svg>
    </div>
  );
};

// ─── Hook Scene ──────────────────────────────────────────────────
const HookScene: React.FC<{
  scene: SceneConfig;
  colors: VideoColors;
  effects: EffectsConfig;
}> = ({ scene, colors, effects }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accentColor = resolveColor(scene.accentColor, colors);
  const kineticColor = resolveColor(scene.kineticColor || 'accent2', colors);
  const sceneDuration = scene.timing.endFrame - scene.timing.startFrame;

  const titleEntrance = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 18, stiffness: 60 } });
  const subtitleEntrance = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 18, stiffness: 60 } });

  const bgContent = (
    <>
      <AnimatedBackground color1={accentColor} color2="#1a0a2e" color3={colors.bg} speed={0.5} />
      {effects.particles && <ParticleField color={accentColor} count={50} seed={1} intensity={0.8} />}
    </>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {effects.hueShift ? <DynamicHueShift range={8} cycleDuration={sceneDuration}>{bgContent}</DynamicHueShift> : bgContent}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.04} />}

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{
          color: colors.textPrimary, fontSize: 78,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 800, textAlign: 'center', opacity: titleEntrance,
          transform: `translateY(${interpolate(titleEntrance, [0, 1], [40, 0])}px)`,
          letterSpacing: -2, lineHeight: 1.15, maxWidth: 1200, margin: 0,
        }}>
          {scene.title}<br />
          {scene.titleLine2 && <span style={{ color: accentColor }}>{scene.titleLine2}</span>}
        </h1>
        {scene.subtitle && (
          <p style={{
            color: colors.textSecondary, fontSize: 32,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400, textAlign: 'center', opacity: subtitleEntrance,
            transform: `translateY(${interpolate(subtitleEntrance, [0, 1], [20, 0])}px)`,
            marginTop: 24, letterSpacing: 2, textTransform: 'uppercase',
          }}>
            {scene.subtitle}
          </p>
        )}
      </AbsoluteFill>

      {scene.kineticText && (
        <KineticText
          text={scene.kineticText}
          color={kineticColor}
          delay={Math.floor(sceneDuration * 0.6)}
          duration={Math.floor(sceneDuration * 0.35)}
          shimmer={scene.kineticEffects?.includes('shimmer')}
          glow={scene.kineticEffects?.includes('glow') ?? true}
        />
      )}

      {effects.sceneTransitions === 'liquid' && (
        <LiquidReveal triggerFrame={sceneDuration - 15} duration={15} color={colors.bg} />
      )}
      {effects.sceneTransitions === 'crossfade' && (
        <CrossfadeTransition triggerFrame={sceneDuration - 12} duration={12} />
      )}
    </AbsoluteFill>
  );
};

// ─── Archetype Scene ─────────────────────────────────────────────
const ArchetypeSceneTemplate: React.FC<{
  scene: SceneConfig;
  colors: VideoColors;
  effects: EffectsConfig;
}> = ({ scene, colors, effects }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accentColor = resolveColor(scene.accentColor, colors);
  const kineticColor = resolveColor(scene.kineticColor || scene.accentColor, colors);
  const sceneDuration = scene.timing.endFrame - scene.timing.startFrame;

  const titleEntrance = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 18, stiffness: 70 } });
  const subtitleEntrance = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 18, stiffness: 60 } });

  // B-roll timing: starts ~45% into scene
  const brollStartFrame = scene.broll ? Math.floor(sceneDuration * 0.45) : 0;
  const brollDuration = scene.broll ? Math.min(scene.broll.maxDuration, sceneDuration - brollStartFrame - 30) : 0;

  // Card shift for side-by-side B-roll layout
  const brollLocalFrame = frame - brollStartFrame;
  const brollActive = scene.broll && brollLocalFrame >= 0 && brollLocalFrame <= brollDuration;

  const shiftProgress = (() => {
    if (!scene.broll || brollLocalFrame < 0) return 0;
    if (brollLocalFrame > brollDuration) {
      const returnFrame = brollLocalFrame - brollDuration;
      return Math.max(0, 1 - returnFrame / 20);
    }
    return Math.min(1, brollLocalFrame / 20);
  })();

  const cardX = interpolate(shiftProgress, [0, 1], [0, -340]);
  const cardScale = interpolate(shiftProgress, [0, 1], [1, 0.85]);

  // Kinetic text at ~80% through scene
  const kineticDelay = Math.floor(sceneDuration * 0.8);

  // Background colors
  const bg1 = scene.bgColors?.[0] || accentColor;
  const bg2 = scene.bgColors?.[1] || '#1a0a2e';
  const bg3 = scene.bgColors?.[2] || colors.bg;

  const bgContent = (
    <>
      <AnimatedBackground color1={bg1} color2={bg2} color3={bg3} speed={0.8} />
      {effects.particles && <ParticleField color={accentColor} count={35} seed={(scene.number || 1) * 10} intensity={0.6} />}
    </>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {effects.hueShift ? <DynamicHueShift range={10} cycleDuration={sceneDuration}>{bgContent}</DynamicHueShift> : bgContent}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.04} />}

      {scene.number && <SceneNumber number={scene.number} color={accentColor} delay={5} />}

      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: `translateX(${cardX}px) scale(${cardScale})`,
      }}>
        <GlassmorphismCard accentColor={accentColor} delay={20} width={700}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {scene.icon && <SceneIcon type={scene.icon} color={accentColor} delay={30} />}
            <h2 style={{
              color: colors.textPrimary, fontSize: 52, fontWeight: 800,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              margin: 0, textAlign: 'center', opacity: titleEntrance, letterSpacing: -1,
            }}>
              The <span style={{ color: accentColor }}>{scene.title}</span>
            </h2>
            {scene.subtitle && (
              <p style={{
                color: colors.textSecondary, fontSize: 26,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 400, textAlign: 'center', marginTop: 14,
                opacity: subtitleEntrance, lineHeight: 1.5, maxWidth: 580,
              }}>
                {scene.subtitle}
              </p>
            )}
          </div>
        </GlassmorphismCard>
      </AbsoluteFill>

      {scene.broll && (
        <BRollPlayer
          src={scene.broll.src}
          accentColor={accentColor}
          startFrame={brollStartFrame}
          durationFrames={brollDuration}
        />
      )}

      {scene.kineticText && (
        <KineticText text={scene.kineticText} color={kineticColor} delay={kineticDelay} duration={180} glow />
      )}

      {effects.sceneTransitions === 'liquid' && (
        <LiquidReveal triggerFrame={sceneDuration - 15} duration={15} color={colors.bg} />
      )}
      {effects.sceneTransitions === 'crossfade' && (
        <CrossfadeTransition triggerFrame={sceneDuration - 12} duration={12} />
      )}
    </AbsoluteFill>
  );
};

// ─── Bridge Scene ────────────────────────────────────────────────
const BridgeScene: React.FC<{
  scene: SceneConfig;
  colors: VideoColors;
  effects: EffectsConfig;
}> = ({ scene, colors, effects }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = scene.timing.endFrame - scene.timing.startFrame;

  const bgContent = (
    <>
      <AnimatedBackground color1={colors.accent1} color2={colors.accent3} color3={colors.bg} speed={1.2} />
      {effects.particles && <ParticleField color={colors.accent1} count={60} seed={50} intensity={1.2} />}
    </>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {effects.hueShift ? <DynamicHueShift range={12}>{bgContent}</DynamicHueShift> : bgContent}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.04} />}

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, padding: '0 80px' }}>
        {(scene.cards || []).map((card, i) => {
          const cardColor = resolveColor(card.color, colors);
          const cardDelay = 15 + i * 20;
          const entrance = spring({ frame: Math.max(0, frame - cardDelay), fps, config: { damping: 18, stiffness: 70 } });
          const pulse = 1 + Math.sin((frame - cardDelay) * 0.04) * 0.015;
          const glow = interpolate(frame, [300, 500], [0.3, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              width: 480, padding: '48px 36px', background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)', borderRadius: 20, border: `1px solid ${cardColor}30`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 ${40 * glow}px ${cardColor}20`,
              transform: `translateY(${interpolate(entrance, [0, 1], [60, 0])}px) scale(${entrance * pulse})`,
              opacity: entrance, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: 2,
                background: `linear-gradient(90deg, transparent, ${cardColor}, transparent)`, opacity: 0.6,
              }} />
              <div style={{
                width: 60, height: 60, borderRadius: '50%', border: `2px solid ${cardColor}50`, background: `${cardColor}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20,
                boxShadow: `0 0 20px ${cardColor}20`,
              }}>
                {card.icon === 'search' ? '🔍' : card.icon === 'book' ? '📚' : card.icon === 'bolt' ? '⚡' : '✦'}
              </div>
              <h3 style={{
                color: cardColor, fontSize: 36, fontWeight: 800,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                margin: 0, marginBottom: 12,
              }}>
                {card.title}
              </h3>
              <p style={{
                color: colors.textSecondary, fontSize: 22,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                lineHeight: 1.5, margin: 0,
              }}>
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </AbsoluteFill>

      {scene.kineticSequence && (
        <KineticTextSequence
          words={scene.kineticSequence.map(item => ({
            text: item.text,
            color: resolveColor(item.color, colors),
          }))}
          delay={Math.floor(sceneDuration * 0.4)}
          stagger={25}
        />
      )}

      {effects.sceneTransitions === 'liquid' && (
        <LiquidReveal triggerFrame={sceneDuration - 15} duration={15} color={colors.bg} />
      )}
    </AbsoluteFill>
  );
};

// ─── CTA Scene ───────────────────────────────────────────────────
const CTAScene: React.FC<{
  scene: SceneConfig;
  colors: VideoColors;
  effects: EffectsConfig;
  ctaUrl: string;
  ctaTagline: string;
}> = ({ scene, colors, effects, ctaUrl, ctaTagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const urlEntrance = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 14, stiffness: 60 } });
  const taglineEntrance = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 18, stiffness: 70 } });
  const glowPulse = 0.6 + Math.sin(frame * 0.06) * 0.4;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AnimatedBackground color1={colors.accent1} color2="#0a1a3a" color3={colors.bg} speed={0.4} />
      {effects.particles && <ParticleField color={colors.accent1} count={25} seed={60} intensity={0.4} pulseColor="#ffffff" />}
      {effects.noiseOverlay && <NoiseOverlay opacity={0.03} />}

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{
          color: colors.textSecondary, fontSize: 32,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 400, textAlign: 'center', marginBottom: 40,
          opacity: taglineEntrance,
          transform: `translateY(${interpolate(taglineEntrance, [0, 1], [20, 0])}px)`,
          letterSpacing: 1,
        }}>
          Your circle is your catalyst. Choose it wisely.
        </p>
        <div style={{
          padding: '32px 64px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          borderRadius: 16, border: `1px solid ${colors.accent1}30`,
          boxShadow: `0 0 ${60 * glowPulse}px ${colors.accent1}30, 0 8px 32px rgba(0,0,0,0.3)`,
          opacity: urlEntrance, transform: `scale(${interpolate(urlEntrance, [0, 1], [0.9, 1])})`,
          overflow: 'hidden', position: 'relative',
        }}>
          {effects.kineticStyle === 'typewriter' ? (
            <TypewriterText text={ctaUrl} delay={40} speed={3} color={colors.accent1} fontSize={72} glowColor={colors.accent1} fontWeight={800} />
          ) : (
            <h1 style={{
              fontSize: 72, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 800, margin: 0, letterSpacing: -1, color: colors.accent1,
              textShadow: `0 0 20px ${colors.accent1}80, 0 0 60px ${colors.accent1}40, 0 0 100px ${colors.accent1}20`,
            }}>
              {ctaUrl}
            </h1>
          )}
        </div>
        <p style={{
          color: colors.textSecondary, fontSize: 24,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 400, textAlign: 'center', marginTop: 32,
          opacity: spring({ frame: Math.max(0, frame - 60), fps, config: { damping: 18, stiffness: 60 } }),
          letterSpacing: 2, textTransform: 'uppercase',
        }}>
          {ctaTagline}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene Router ────────────────────────────────────────────────
const SceneRenderer: React.FC<{
  scene: SceneConfig;
  colors: VideoColors;
  effects: EffectsConfig;
  ctaUrl: string;
  ctaTagline: string;
}> = (props) => {
  switch (props.scene.type) {
    case 'hook': return <HookScene scene={props.scene} colors={props.colors} effects={props.effects} />;
    case 'archetype': return <ArchetypeSceneTemplate scene={props.scene} colors={props.colors} effects={props.effects} />;
    case 'bridge': return <BridgeScene scene={props.scene} colors={props.colors} effects={props.effects} />;
    case 'cta': return <CTAScene scene={props.scene} colors={props.colors} effects={props.effects} ctaUrl={props.ctaUrl} ctaTagline={props.ctaTagline} />;
    case 'intro': return <IntroScene scene={props.scene} colors={props.colors} effects={props.effects} />;
    case 'outro': return <OutroScene scene={props.scene} colors={props.colors} effects={props.effects} ctaUrl={props.ctaUrl} ctaTagline={props.ctaTagline} />;
    default: return <HookScene scene={props.scene} colors={props.colors} effects={props.effects} />;
  }
};

// ─── Main Template Composition ──────────────────────────────────
export const TemplateVideo: React.FC<{
  config: VideoConfig;
}> = ({ config }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: config.colors.bg }}>
      <Audio src={staticFile('audio/' + config.audio.file)} />

      {config.scenes.map((scene, i) => (
        <Sequence
          key={i}
          from={scene.timing.startFrame}
          durationInFrames={scene.timing.endFrame - scene.timing.startFrame}
        >
          <SceneRenderer
            scene={scene}
            colors={config.colors}
            effects={config.effects}
            ctaUrl={config.ctaUrl}
            ctaTagline={config.ctaTagline}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
