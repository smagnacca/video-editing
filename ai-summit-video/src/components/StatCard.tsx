import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { colors, fonts, easing } from "../styles/theme";

interface StatCardProps {
  stat: string;
  label: string;
  startFrame: number;
  statColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  stat,
  label,
  startFrame,
  statColor = colors.brightGold,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const slideUp = spring({ frame: localFrame, fps, config: easing.springConfig });
  const translateY = interpolate(slideUp, [0, 1], [80, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 60px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        border: `1px solid rgba(221,208,85,0.2)`,
        backdropFilter: "blur(10px)",
        opacity: slideUp,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          fontFamily: fonts.body,
          color: statColor,
          lineHeight: 1,
        }}
      >
        {stat}
      </div>
      <div
        style={{
          fontSize: 20,
          fontFamily: fonts.body,
          color: colors.textMuted,
          marginTop: 12,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        {label}
      </div>
    </div>
  );
};
