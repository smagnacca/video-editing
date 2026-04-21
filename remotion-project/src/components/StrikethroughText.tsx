import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const StrikethroughText: React.FC<{
  line1: string;
  line2: string;
  line2Emphasis?: string;
  delay?: number;
  strikeDelay?: number;
  line2Delay?: number;
}> = ({
  line1,
  line2,
  line2Emphasis,
  delay = 0,
  strikeDelay = 40,
  line2Delay = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line 1 entrance
  const line1Entrance = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Strikethrough line sweeps from left (0→100%) starting at strikeDelay
  const strikeProgress = interpolate(
    frame - (delay + strikeDelay),
    [0, 20],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Line 2 entrance
  const line2Entrance = spring({
    frame: Math.max(0, frame - (delay + line2Delay)),
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  const line2Y = interpolate(line2Entrance, [0, 1], [40, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
      }}
    >
      {/* Line 1 with strikethrough */}
      <div style={{ position: 'relative', display: 'inline-block', opacity: line1Entrance }}>
        <div
          style={{
            fontSize: 56,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          {line1}
        </div>
        {/* Animated strikethrough line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            height: 4,
            width: `${strikeProgress}%`,
            background: '#e53e3e',
            borderRadius: 2,
            boxShadow: '0 0 12px rgba(229,62,62,0.6)',
            transform: 'translateY(-50%)',
            transition: 'none',
          }}
        />
      </div>

      {/* Line 2 replacement */}
      <div
        style={{
          opacity: line2Entrance,
          transform: `translateY(${line2Y}px)`,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {line2}{line2Emphasis ? ' ' : ''}
        </span>
        {line2Emphasis && (
          <span
            style={{
              fontSize: 56,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 900,
              color: '#f5a623',
              textShadow: '0 0 20px rgba(245,166,35,0.5)',
            }}
          >
            {line2Emphasis}
          </span>
        )}
      </div>
    </div>
  );
};
