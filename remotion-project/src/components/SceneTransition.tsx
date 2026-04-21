import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

/**
 * SceneTransition — Liquid Reveal effect from the Persuasion & Conversion Toolkit.
 * Creates an organic blob expansion that wipes between scenes.
 * Place this as the LAST element in a scene's AbsoluteFill to overlay the transition.
 *
 * Purpose (from toolkit): "A high-end transition that makes page loads feel like art."
 */
export const LiquidReveal: React.FC<{
  /** Frame within the scene when the transition starts (typically sceneEnd - transitionDuration) */
  triggerFrame: number;
  /** Duration in frames for the full wipe */
  duration?: number;
  /** Color of the liquid blob (defaults to scene accent) */
  color?: string;
  /** Direction: 'in' reveals content, 'out' covers it */
  direction?: 'in' | 'out';
}> = ({ triggerFrame, duration = 20, color = '#0a0e1a', direction = 'out' }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - triggerFrame;

  if (localFrame < 0 || localFrame > duration + 5) return null;

  const progress = Math.min(1, Math.max(0, localFrame / duration));
  // Eased progress for organic feel
  const eased = progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const targetProgress = direction === 'out' ? eased : 1 - eased;

  // Use multiple overlapping circles for organic blob shape
  const baseRadius = targetProgress * 160;
  const wobble1 = Math.sin(localFrame * 0.3) * 8;
  const wobble2 = Math.cos(localFrame * 0.25) * 6;

  return (
    <AbsoluteFill style={{ zIndex: 100, pointerEvents: 'none' }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <defs>
          <filter id="liquid-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10"
              result="goo"
            />
          </filter>
        </defs>
        <g filter="url(#liquid-blur)">
          <circle cx={960} cy={540} r={baseRadius * 10} fill={color} />
          <circle cx={960 + wobble1 * 10} cy={540 + wobble2 * 10} r={baseRadius * 8} fill={color} />
          <circle cx={300 + wobble2 * 5} cy={300} r={baseRadius * 7} fill={color} />
          <circle cx={1600 - wobble1 * 5} cy={800} r={baseRadius * 7} fill={color} />
          <circle cx={480} cy={800 + wobble1 * 3} r={baseRadius * 6} fill={color} />
          <circle cx={1400} cy={280 - wobble2 * 3} r={baseRadius * 6} fill={color} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * CrossfadeTransition — Simple opacity crossfade between scenes.
 * Lighter-weight alternative to LiquidReveal.
 */
export const CrossfadeTransition: React.FC<{
  triggerFrame: number;
  duration?: number;
}> = ({ triggerFrame, duration = 15 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - triggerFrame;

  if (localFrame < 0 || localFrame > duration) return null;

  const opacity = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0e1a',
        opacity,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    />
  );
};
