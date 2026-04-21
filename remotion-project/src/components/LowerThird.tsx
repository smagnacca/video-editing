import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface LowerThirdProps {
  name: string;
  title: string;
  accentColor?: string;
  delay?: number;
  duration?: number;
  nameColor?: string;
  titleColor?: string;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  accentColor = '#00d4ff',
  delay = 150,
  duration = 150,
  nameColor = '#ffffff',
  titleColor = '#a0aec0',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  // Exit: fade out in last 20 frames
  const isExiting = localFrame > duration - 20;
  const exitProgress = isExiting
    ? interpolate(localFrame, [duration - 20, duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const overallOpacity = 1 - exitProgress;
  const exitX = interpolate(exitProgress, [0, 1], [0, -20]);

  // Accent line: slides in from frame 0
  const lineEntrance = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const lineX = interpolate(lineEntrance, [0, 1], [-200, 0]);

  // Name: fades in starting at frame 10
  const nameEntrance = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const nameX = interpolate(nameEntrance, [0, 1], [-30, 0]);

  // Title: fades in starting at frame 20
  const titleEntrance = spring({
    frame: Math.max(0, localFrame - 20),
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const titleX = interpolate(titleEntrance, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 120,
        left: 80,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        opacity: overallOpacity,
        transform: `translateX(${exitX}px)`,
        zIndex: 10,
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: 3,
          height: 50,
          backgroundColor: accentColor,
          borderRadius: 2,
          boxShadow: `0 0 10px ${accentColor}80, 0 0 20px ${accentColor}40`,
          transform: `translateX(${lineX}px)`,
          opacity: lineEntrance,
          flexShrink: 0,
        }}
      />

      {/* Name + Title stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: nameColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: 1,
            opacity: nameEntrance,
            transform: `translateX(${nameX}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: titleColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: 2,
            textTransform: 'uppercase',
            lineHeight: 1,
            opacity: titleEntrance,
            transform: `translateX(${titleX}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};
