import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import React, { useMemo } from "react";
import { colors } from "../styles/theme";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
  maxOpacity?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 40,
  color = colors.brightGold,
  maxOpacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    const seeded: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const seed = i * 7919 + 1;
      seeded.push({
        x: ((seed * 13) % width),
        y: ((seed * 17) % height),
        size: 2 + ((seed * 3) % 4),
        speed: 0.3 + ((seed * 7) % 10) / 15,
        opacity: 0.2 + ((seed * 11) % 10) / 25,
        delay: (seed * 5) % 60,
      });
    }
    return seeded;
  }, [count, width, height]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const t = (frame + p.delay) * p.speed;
        const yPos = ((p.y - t * 0.8) % height + height) % height;
        const xDrift = Math.sin(t * 0.02 + i) * 30;
        const flicker = interpolate(
          Math.sin(frame * 0.05 + i * 2),
          [-1, 1],
          [p.opacity * 0.5, p.opacity * maxOpacity]
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + xDrift,
              top: yPos,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: flicker,
              filter: `blur(${p.size > 4 ? 1 : 0}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
