import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const EventCard: React.FC<{
  eyebrow: string;
  title: string;
  subtitle: string;
  details: string;
  delay?: number;
}> = ({ eyebrow, title, subtitle, details, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const scale = interpolate(entrance, [0, 1], [0.92, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Subtle border pulse
  const borderGlow = 0.4 + Math.sin(frame * 0.05) * 0.15;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          width: 820,
          padding: '56px 72px',
          background: 'rgba(10, 10, 10, 0.95)',
          border: `1px solid rgba(245, 166, 35, ${borderGlow})`,
          borderRadius: 20,
          boxShadow: `0 0 60px rgba(245,166,35,0.1), 0 20px 60px rgba(0,0,0,0.5)`,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            color: '#f5a623',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 1,
            background: 'rgba(245,166,35,0.4)',
          }}
        />

        <div
          style={{
            fontSize: 62,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#f5a623',
            lineHeight: 1.2,
            textShadow: '0 0 30px rgba(245,166,35,0.3)',
            textAlign: 'center',
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 34,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: 1,
          }}
        >
          {subtitle}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 100,
            height: 1,
            background: 'rgba(255,255,255,0.15)',
          }}
        />

        <div
          style={{
            fontSize: 26,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 500,
            color: '#aaaaaa',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {details}
        </div>
      </div>
    </div>
  );
};
