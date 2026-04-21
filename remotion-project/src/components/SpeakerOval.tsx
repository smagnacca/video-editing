import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img } from 'remotion';

export const SpeakerOval: React.FC<{
  src?: string;
  delay?: number;
  name?: string;
  title?: string;
}> = ({
  src = 'scott-headshot.png',
  delay = 0,
  name,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const translateX = interpolate(entrance, [0, 1], [200, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Gentle float
  const floatY = Math.sin(frame * 0.04) * 4;

  return (
    <div
      style={{
        position: 'absolute',
        right: 40,
        bottom: 40,
        transform: `translateX(${translateX}px) translateY(${floatY}px)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Oval portrait */}
      <div
        style={{
          width: 200,
          height: 140,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid #f5a623',
          boxShadow: '0 0 24px rgba(245,166,35,0.3), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 10%',
          }}
        />
      </div>
      {name && (
        <div
          style={{
            fontSize: 14,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: 1,
          }}
        >
          {name}
        </div>
      )}
      {title && (
        <div
          style={{
            fontSize: 12,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400,
            color: '#f5a623',
            textAlign: 'center',
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};
