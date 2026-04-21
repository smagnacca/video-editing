import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * MarkerHighlight — Animated neon underline that draws left-to-right.
 * From the Persuasion & Conversion Toolkit (Emphasis effects).
 *
 * Purpose: "Stronger visual hand-off" — draws attention to key phrases
 * without relying on WebkitBackgroundClip (which breaks in Remotion).
 *
 * Renders as an SVG line beneath text. Remotion-safe.
 */
export const MarkerHighlight: React.FC<{
  text: string;
  color?: string;
  delay?: number;
  /** Width of the underline relative to text */
  width?: number;
  fontSize?: number;
  fontWeight?: number;
  /** Thickness of the marker stroke */
  thickness?: number;
}> = ({
  text,
  color = '#00d4ff',
  delay = 0,
  width = 500,
  fontSize = 44,
  fontWeight = 700,
  thickness = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  const textEntrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Underline draws after text has appeared
  const underlineProgress = interpolate(localFrame, [8, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Glow intensifies after underline completes
  const glowIntensity = interpolate(localFrame, [28, 40], [0.3, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: textEntrance,
        transform: `translateY(${interpolate(textEntrance, [0, 1], [15, 0])}px)`,
      }}
    >
      <span
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize,
          fontWeight,
          color: '#ffffff',
          textShadow: `0 0 ${20 * glowIntensity}px ${color}60`,
          letterSpacing: -0.5,
        }}
      >
        {text}
      </span>
      <svg
        width={width}
        height={thickness + 10}
        style={{ marginTop: 4 }}
      >
        <defs>
          <filter id="marker-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Glow layer */}
        <line
          x1={0}
          y1={thickness / 2 + 3}
          x2={width * underlineProgress}
          y2={thickness / 2 + 3}
          stroke={color}
          strokeWidth={thickness + 4}
          strokeLinecap="round"
          opacity={0.3 * glowIntensity}
          filter="url(#marker-glow)"
        />
        {/* Main line */}
        <line
          x1={0}
          y1={thickness / 2 + 3}
          x2={width * underlineProgress}
          y2={thickness / 2 + 3}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          opacity={0.9}
        />
      </svg>
    </div>
  );
};
