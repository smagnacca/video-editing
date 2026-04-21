import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const TestimonialLine: React.FC<{
  name: string;
  title: string;
  quote: string;
  delay?: number;
}> = ({ name, title, quote, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 70 },
  });

  const translateY = interpolate(entrance, [0, 1], [50, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '0 40px',
        textAlign: 'center',
      }}
    >
      {/* Quote mark */}
      <div
        style={{
          fontSize: 48,
          color: 'rgba(245,166,35,0.4)',
          lineHeight: 1,
          fontFamily: 'Georgia, serif',
          fontWeight: 900,
        }}
      >
        "
      </div>
      <div
        style={{
          fontSize: 38,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 600,
          color: '#ffffff',
          lineHeight: 1.5,
          maxWidth: 1100,
        }}
      >
        {quote}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
        <div
          style={{
            width: 40,
            height: 2,
            background: '#f5a623',
            borderRadius: 1,
          }}
        />
        <div>
          <span
            style={{
              fontSize: 26,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 700,
              color: '#f5a623',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: 20,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 400,
              color: '#888888',
              marginLeft: 8,
            }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            width: 40,
            height: 2,
            background: '#f5a623',
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  );
};
