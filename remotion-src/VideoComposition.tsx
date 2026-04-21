import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';

export type VideoProps = {
  audioSrc?: string;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  accentColor?: string;
};

export const VideoComposition: React.FC<VideoProps> = ({
  audioSrc,
  title = 'My Video',
  subtitle = '',
  backgroundColor = '#0a0a0a',
  accentColor = '#4f8ef7',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const titleY = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: 'clamp' });

  const subtitleOpacity = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const subtitleY = interpolate(frame, [12, 35], [30, 0], { extrapolateRight: 'clamp' });

  const lineWidth = interpolate(frame, [8, 40], [0, 120], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {audioSrc && <Audio src={staticFile('audio/' + audioSrc)} />}

      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${accentColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Animated accent line */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: accentColor,
            borderRadius: 2,
            marginBottom: 32,
          }}
        />

        {/* Title */}
        <h1
          style={{
            color: '#ffffff',
            fontSize: 80,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 800,
            margin: 0,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            letterSpacing: '-2px',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle ? (
          <p
            style={{
              color: '#888888',
              fontSize: 36,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 400,
              marginTop: 28,
              textAlign: 'center',
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
