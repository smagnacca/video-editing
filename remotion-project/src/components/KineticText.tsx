import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const KineticText: React.FC<{
  text: string;
  color?: string;
  fontSize?: number;
  delay?: number;
  duration?: number;
  glow?: boolean;
  shimmer?: boolean;
}> = ({
  text,
  color = '#f5a623',
  fontSize = 72,
  delay = 0,
  duration = 60,
  glow = true,
  shimmer = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delay;
  if (localFrame < 0 || localFrame > duration) return null;

  const entrance = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Fade out in last 15 frames
  const fadeOut = localFrame > duration - 15
    ? interpolate(localFrame, [duration - 15, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = entrance * fadeOut;

  // Shimmer: pulse brightness instead of gradient clip (which breaks in headless Chrome)
  const shimmerBrightness = shimmer
    ? 0.8 + Math.sin(localFrame * 0.15) * 0.2
    : 1;

  return (
    <div
      style={{
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 900,
          color,
          textTransform: 'uppercase',
          letterSpacing: 6,
          textAlign: 'center',
          transform: `scale(${scale})`,
          opacity: opacity * shimmerBrightness,
          textShadow: glow
            ? `0 0 20px ${color}80, 0 0 60px ${color}40, 0 0 100px ${color}20`
            : 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Three words appearing in sequence */
export const KineticTextSequence: React.FC<{
  words: { text: string; color: string }[];
  delay?: number;
  stagger?: number;
}> = ({ words, delay = 0, stagger = 20 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 60,
        zIndex: 10,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + i * stagger;
        const localFrame = frame - wordDelay;
        if (localFrame < 0) return null;

        const entrance = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        const scale = interpolate(entrance, [0, 1], [0.6, 1]);

        return (
          <div
            key={i}
            style={{
              fontSize: 64,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 900,
              color: word.color,
              letterSpacing: 4,
              textTransform: 'uppercase',
              transform: `scale(${scale})`,
              opacity: entrance,
              textShadow: `0 0 20px ${word.color}80, 0 0 60px ${word.color}40`,
            }}
          >
            {word.text}
          </div>
        );
      })}
    </div>
  );
};
