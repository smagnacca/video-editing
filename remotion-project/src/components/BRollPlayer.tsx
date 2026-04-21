import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
  staticFile,
} from 'remotion';

/**
 * BRollPlayer: Renders B-roll video in a styled frame that appears center-right
 * while the text card shifts to the left. Includes rounded corners,
 * accent border glow, and fade in/out.
 */
export const BRollPlayer: React.FC<{
  src: string;
  accentColor?: string;
  /** Frame offset within the parent Sequence when B-roll starts */
  startFrame?: number;
  /** How many frames the B-roll plays */
  durationFrames?: number;
}> = ({
  src,
  accentColor = '#00d4ff',
  startFrame = 120,
  durationFrames = 360,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > durationFrames) return null;

  // Spring entrance
  const entrance = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  // Fade out in last 30 frames
  const fadeOut = localFrame > durationFrames - 30
    ? interpolate(localFrame, [durationFrames - 30, durationFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const opacity = entrance * fadeOut;
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const translateX = interpolate(entrance, [0, 1], [80, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        right: 80,
        top: '50%',
        transform: `translateY(-50%) translateX(${translateX}px) scale(${scale})`,
        opacity,
        width: 780,
        height: 440,
        borderRadius: 20,
        overflow: 'hidden',
        border: `2px solid ${accentColor}60`,
        boxShadow: `0 0 40px ${accentColor}25, 0 8px 32px rgba(0,0,0,0.5)`,
        zIndex: 5,
      }}
    >
      {/* Accent glow top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          zIndex: 2,
          opacity: 0.8,
        }}
      />

      {/* Video */}
      <OffthreadVideo
        src={staticFile('broll/' + src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        startFrom={0}
        muted
      />

      {/* Subtle dark vignette overlay for polish */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
