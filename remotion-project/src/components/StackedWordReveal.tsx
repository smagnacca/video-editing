import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface WordLine {
  text: string;
  color?: string;
  size?: number;
}

export const StackedWordReveal: React.FC<{
  lines: WordLine[];
  delay?: number;
  stagger?: number;
}> = ({ lines, delay = 0, stagger = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {lines.map((line, i) => {
        const lineDelay = delay + i * stagger;
        const localFrame = frame - lineDelay;

        const entrance = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: { damping: 14, stiffness: 110 },
        });

        const translateY = interpolate(entrance, [0, 1], [-60, 0]);
        const opacity = interpolate(entrance, [0, 1], [0, 1]);
        const scale = interpolate(entrance, [0, 1], [0.85, 1]);

        const color = line.color ?? '#f5a623';
        const fontSize = line.size ?? 96;

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              fontSize,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 900,
              color,
              textTransform: 'uppercase',
              letterSpacing: 6,
              textAlign: 'center',
              textShadow:
                color === '#f5a623'
                  ? `0 0 30px rgba(245,166,35,0.5), 0 0 80px rgba(245,166,35,0.25)`
                  : 'none',
              lineHeight: 1.1,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};
