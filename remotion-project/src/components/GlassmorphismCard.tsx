import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const GlassmorphismCard: React.FC<{
  children: React.ReactNode;
  accentColor?: string;
  delay?: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({ children, accentColor = '#00d4ff', delay = 0, width = 700, style = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const translateY = interpolate(entrance, [0, 1], [60, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        padding: '40px 48px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 40px ${accentColor}15`,
        transform: `translateY(${translateY}px)`,
        opacity,
        ...style,
      }}
    >
      {/* Accent glow top border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          borderRadius: '0 0 4px 4px',
          opacity: 0.6,
        }}
      />
      {children}
    </div>
  );
};
