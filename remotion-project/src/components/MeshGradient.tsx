import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const MeshGradient: React.FC<{
  colors?: string[];
  speed?: number;
}> = ({ colors = ['#00d4ff', '#0a0e1a', '#1a0a2e'], speed = 1 }) => {
  const frame = useCurrentFrame();

  const x1 = 30 + Math.sin(frame * 0.008 * speed) * 20;
  const y1 = 40 + Math.cos(frame * 0.006 * speed) * 20;
  const x2 = 70 + Math.sin(frame * 0.01 * speed + 2) * 15;
  const y2 = 60 + Math.cos(frame * 0.007 * speed + 1) * 15;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at ${x1}% ${y1}%, ${colors[0]}25 0%, transparent 50%),
          radial-gradient(ellipse at ${x2}% ${y2}%, ${colors[2] || colors[0]}20 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, ${colors[1]}40 0%, transparent 80%),
          ${colors[1]}
        `,
      }}
    />
  );
};

/** Spotlight effect for Coach scene */
export const Spotlight: React.FC<{
  color?: string;
}> = ({ color = '#ff6b35' }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.015) * 5;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 40% 80% at ${50 + sway}% 30%, ${color}15 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 50% 100%, ${color}08 0%, transparent 60%),
          linear-gradient(180deg, #0a0e1a 0%, #050810 100%)
        `,
      }}
    />
  );
};
