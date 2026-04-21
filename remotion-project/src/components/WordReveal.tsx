import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const WordReveal: React.FC<{
  text: string;
  color?: string;
  fontSize?: number;
  delay?: number;
  wordStagger?: number;
  textAlign?: 'center' | 'left';
  maxWidth?: number;
}> = ({
  text,
  color = '#ffffff',
  fontSize = 44,
  delay = 0,
  wordStagger = 6,
  textAlign = 'center',
  maxWidth = 1400,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: textAlign === 'center' ? 'center' : 'flex-start',
        alignItems: 'flex-end',
        gap: fontSize * 0.28,
        maxWidth,
        textAlign,
      }}
    >
      {words.map((word, i) => {
        const wordDelay = delay + i * wordStagger;
        const localFrame = frame - wordDelay;

        const entrance = spring({
          frame: Math.max(0, localFrame),
          fps,
          config: { damping: 16, stiffness: 90 },
        });

        const translateY = interpolate(entrance, [0, 1], [30, 0]);
        const opacity = interpolate(entrance, [0, 1], [0, 1]);

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
              fontSize,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 600,
              color,
              lineHeight: 1.4,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
