import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const FrameworkCard: React.FC<{
  badge: string;
  headline: string;
  description: string;
  delay?: number;
  index?: number;
}> = ({ badge, headline, description, delay = 0, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const translateX = interpolate(entrance, [0, 1], [500, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Headline transitions white → gold as narrator speaks (15 frames after card enters)
  const hlFrame = Math.max(0, frame - delay - 15);
  const hlProgress = interpolate(hlFrame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headlineColor = `rgb(${Math.round(255 + (245 - 255) * hlProgress)},${Math.round(255 + (166 - 255) * hlProgress)},${Math.round(255 + (35 - 255) * hlProgress)})`;

  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid rgba(245, 166, 35, 0.2)',
        borderRadius: 12,
        overflow: 'hidden',
        width: 1100,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: 6,
          background: '#f5a623',
          boxShadow: '0 0 16px rgba(245,166,35,0.6)',
          flexShrink: 0,
        }}
      />
      <div style={{ padding: '24px 36px', flex: 1 }}>
        <div
          style={{
            fontSize: 18,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            color: '#f5a623',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          {badge}
        </div>
        <div
          style={{
            fontSize: 38,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 800,
            color: headlineColor,
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400,
            color: '#aaaaaa',
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
