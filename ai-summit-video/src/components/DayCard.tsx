import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { colors, fonts, easing } from "../styles/theme";

interface DayCardProps {
  day: number;
  title: string;
  description: string;
  startFrame: number;
  index: number;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  title,
  description,
  startFrame,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const staggerDelay = index * 9; // 0.3s stagger at 30fps
  const localFrame = frame - startFrame - staggerDelay;

  if (localFrame < 0) return null;

  const slideIn = spring({ frame: localFrame, fps, config: easing.springConfig });
  const rotation = interpolate(slideIn, [0, 1], [3, 0]);

  return (
    <div
      style={{
        width: 340,
        padding: "32px",
        background: "rgba(10,10,10,0.9)",
        borderRadius: 16,
        border: `1px solid rgba(221,208,85,0.25)`,
        opacity: slideIn,
        transform: `translateX(${interpolate(slideIn, [0, 1], [120, 0])}px) rotate(${rotation}deg)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            border: `2px solid ${colors.deepGreen}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, textTransform: "uppercase" }}>
            DAY
          </div>
          <div style={{ fontSize: 22, fontFamily: fonts.body, fontWeight: 800, color: colors.deepGreen }}>
            {String(day).padStart(2, "0")}
          </div>
        </div>
        <div style={{ fontSize: 20, fontFamily: fonts.heading, fontWeight: 700, color: colors.white }}>
          {title}
        </div>
      </div>
      <div style={{ fontSize: 15, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 1.5 }}>
        {description}
      </div>
    </div>
  );
};
