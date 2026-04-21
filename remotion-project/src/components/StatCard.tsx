import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const StatCard: React.FC<{
  stat: string;
  label: string;
  source: string;
  delay?: number;
  position?: 'left' | 'center';
}> = ({ stat, label, source, delay = 0, position = 'left' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const translateX = interpolate(entrance, [0, 1], [-400, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const left = position === 'left' ? 60 : undefined;
  const alignSelf = position === 'center' ? 'center' : undefined;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        bottom: 200,
        transform: `translateX(${translateX}px)`,
        opacity,
        alignSelf,
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid rgba(245, 166, 35, 0.4)',
          borderLeft: '4px solid #f5a623',
          borderRadius: 12,
          padding: '32px 48px',
          minWidth: 340,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 900,
            color: '#f5a623',
            lineHeight: 1,
            textShadow: '0 0 30px rgba(245,166,35,0.5)',
          }}
        >
          {stat}
        </div>
        <div
          style={{
            fontSize: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginTop: 8,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 14,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400,
            color: '#666666',
            marginTop: 12,
            fontStyle: 'italic',
          }}
        >
          {source}
        </div>
      </div>
    </div>
  );
};
