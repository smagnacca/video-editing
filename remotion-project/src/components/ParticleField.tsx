import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

type Particle = { x: number; y: number; size: number; speed: number; opacity: number; phase: number };

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const ParticleField: React.FC<{
  color?: string;
  count?: number;
  seed?: number;
  intensity?: number;
  pulseColor?: string;
}> = ({ color = '#00d4ff', count = 40, seed = 42, intensity = 1, pulseColor }) => {
  const frame = useCurrentFrame();
  const rand = seededRandom(seed);

  const particles: Particle[] = Array.from({ length: count }, () => ({
    x: rand() * 1920,
    y: rand() * 1080,
    size: rand() * 3.5 + 1,
    speed: (rand() * 0.5 + 0.2) * intensity,
    opacity: rand() * 0.6 + 0.2,
    phase: rand() * Math.PI * 2,
  }));

  // Color pulse: flash brighter periodically
  const pulseWave = Math.sin(frame * 0.03) * 0.5 + 0.5;
  const isPulsing = pulseWave > 0.85;
  const pulseBoost = isPulsing ? interpolate(pulseWave, [0.85, 1], [1, 1.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const activeColor = pulseColor && isPulsing ? pulseColor : color;

  const threshold = 180;
  const currentPositions = particles.map((p) => ({
    x: ((p.x + Math.sin(frame * p.speed * 0.03 + p.phase) * 50 + frame * p.speed * 0.3) % 1960) - 20,
    y: ((p.y + Math.cos(frame * p.speed * 0.025 + p.phase) * 40 + Math.sin(frame * 0.01 + p.phase) * 20) % 1120) - 20,
    size: p.size * (1 + Math.sin(frame * 0.06 + p.phase) * 0.3),
    opacity: Math.min(1, p.opacity * (0.6 + Math.sin(frame * 0.08 + p.phase * 3) * 0.4) * pulseBoost),
  }));

  const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
  for (let i = 0; i < currentPositions.length; i++) {
    for (let j = i + 1; j < currentPositions.length; j++) {
      const dx = currentPositions[i].x - currentPositions[j].x;
      const dy = currentPositions[i].y - currentPositions[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) {
        lines.push({ x1: currentPositions[i].x, y1: currentPositions[i].y, x2: currentPositions[j].x, y2: currentPositions[j].y, opacity: (1 - dist / threshold) * 0.25 });
      }
    }
  }

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
      {lines.map((line, i) => (
        <line key={`l${i}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={activeColor} strokeWidth={0.5} opacity={line.opacity} />
      ))}
      {currentPositions.map((p, i) => (
        <React.Fragment key={`p${i}`}>
          <circle cx={p.x} cy={p.y} r={p.size * 3} fill={activeColor} opacity={p.opacity * 0.15} />
          <circle cx={p.x} cy={p.y} r={p.size} fill={activeColor} opacity={p.opacity} />
        </React.Fragment>
      ))}
    </svg>
  );
};
