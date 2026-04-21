import React from 'react';
import {
  AbsoluteFill,
  Video,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
} from 'remotion';

export const BRollLayer: React.FC<{
  src: string;
  opacity?: number;
  delay?: number;
  fadeIn?: number;
  fadeOut?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  startFrom?: number;
}> = ({
  src,
  opacity = 0.25,
  delay = 30,
  fadeIn = 30,
  fadeOut = 20,
  overlayColor = '#0a0e1a',
  overlayOpacity = 0.6,
  startFrom = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in
  const fadeInProgress = interpolate(
    frame,
    [delay, delay + fadeIn],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out near end of sequence
  const fadeOutProgress = interpolate(
    frame,
    [durationInFrames - fadeOut, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentOpacity = opacity * fadeInProgress * fadeOutProgress;

  if (currentOpacity <= 0) return null;

  return (
    <>
      {/* B-roll video layer */}
      <AbsoluteFill style={{ opacity: currentOpacity }}>
        <OffthreadVideo
          src={staticFile('broll/' + src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          startFrom={startFrom}
          muted
        />
      </AbsoluteFill>

      {/* Dark overlay to maintain text readability */}
      <AbsoluteFill
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity * fadeInProgress,
        }}
      />

      {/* Vignette effect */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${overlayColor} 100%)`,
          opacity: 0.5 * fadeInProgress,
        }}
      />
    </>
  );
};
