import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { colors, fonts, easing } from "../styles/theme";

interface CTAButtonProps {
  startFrame: number;
  text?: string;
  large?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  startFrame,
  text = "⚡ Reserve My Free Seat Now →",
  large = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const scaleIn = spring({ frame: localFrame, fps, config: easing.springConfig });

  // Pulsing glow effect
  const pulse = interpolate(
    Math.sin((frame - startFrame) * 0.08),
    [-1, 1],
    [0, 20]
  );

  const size = large ? { fontSize: 36, padding: "28px 72px" } : { fontSize: 24, padding: "20px 48px" };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...size,
        fontFamily: fonts.body,
        fontWeight: 700,
        color: colors.darkBg,
        backgroundColor: colors.brightGold,
        borderRadius: 12,
        opacity: scaleIn,
        transform: `scale(${interpolate(scaleIn, [0, 1], [0.8, 1])})`,
        boxShadow: `0 0 ${pulse + 10}px ${pulse}px rgba(221,208,85,0.4)`,
        letterSpacing: "0.02em",
      }}
    >
      {text}
    </div>
  );
};
