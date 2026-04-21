import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/**
 * NoiseOverlay — Cinematic film grain texture.
 * From the Persuasion & Conversion Toolkit (Surface effects: Noise/Grain Overlay).
 *
 * Purpose: Adds cinematic depth and premium feel. Prevents the "too clean CGI" look
 * that pure particle/gradient backgrounds can have.
 *
 * Uses SVG turbulence filter — lightweight and Remotion-safe.
 */
export const NoiseOverlay: React.FC<{
  /** Opacity of the grain (0.03–0.08 is subtle, 0.12+ is stylized) */
  opacity?: number;
  /** Animate the grain seed for "living" film grain */
  animate?: boolean;
  /** Blend mode */
  blendMode?: string;
}> = ({ opacity = 0.05, animate = true, blendMode = 'overlay' }) => {
  const frame = useCurrentFrame();
  // Cycle through 4 seed values for subtle animation
  const seed = animate ? (frame % 4) + 1 : 1;

  return (
    <AbsoluteFill
      style={{
        zIndex: 50,
        pointerEvents: 'none',
        mixBlendMode: blendMode as any,
        opacity,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * DynamicHueShift — Subtle background color cycling.
 * From the Persuasion & Conversion Toolkit (Mood effects).
 *
 * Purpose: "Subtly refreshes the user's brain to prevent scroll-fatigue."
 * In video context: prevents visual monotony during long narration scenes.
 *
 * Applies a slow hue-rotate filter to children. Wrap around AnimatedBackground.
 */
export const DynamicHueShift: React.FC<{
  children: React.ReactNode;
  /** Degrees of hue rotation per cycle */
  range?: number;
  /** Frames for one full cycle */
  cycleDuration?: number;
}> = ({ children, range = 15, cycleDuration = 600 }) => {
  const frame = useCurrentFrame();
  const hueRotation = Math.sin((frame / cycleDuration) * Math.PI * 2) * range;

  return (
    <div style={{ width: '100%', height: '100%', filter: `hue-rotate(${hueRotation}deg)` }}>
      {children}
    </div>
  );
};
