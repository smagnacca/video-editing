import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { fonts, colors, easing } from "../styles/theme";

interface KineticTextProps {
  text: string;
  startFrame: number;
  style?: "fadeUp" | "slideRight" | "slideLeft" | "typewriter" | "scaleIn" | "staccato";
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic";
  delay?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  startFrame,
  style = "fadeUp",
  fontSize = 64,
  color: textColor = colors.white,
  fontFamily = fonts.body,
  fontWeight = 700,
  fontStyle = "normal",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame - delay;

  if (localFrame < 0) return null;

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    color: textColor,
    textAlign: "center" as const,
    lineHeight: 1.2,
    whiteSpace: "pre-wrap" as const,
  };

  if (style === "typewriter") {
    const charsToShow = Math.floor(localFrame * 2); // ~60ms per char at 30fps
    const visibleText = text.slice(0, charsToShow);
    const cursor = localFrame % 15 < 10 ? "▎" : "";
    return (
      <div style={baseStyle}>
        {visibleText}
        {charsToShow < text.length && <span style={{ opacity: 0.7 }}>{cursor}</span>}
      </div>
    );
  }

  if (style === "staccato") {
    const opacity = interpolate(localFrame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
    const scale = spring({ frame: localFrame, fps, config: easing.snappySpring });
    return (
      <div style={{ ...baseStyle, opacity, transform: `scale(${0.85 + scale * 0.15})` }}>
        {text}
      </div>
    );
  }

  const springVal = spring({ frame: localFrame, fps, config: easing.springConfig });

  const transforms: Record<string, { opacity: number; transform: string }> = {
    fadeUp: {
      opacity: springVal,
      transform: `translateY(${interpolate(springVal, [0, 1], [40, 0])}px)`,
    },
    slideRight: {
      opacity: springVal,
      transform: `translateX(${interpolate(springVal, [0, 1], [-100, 0])}px)`,
    },
    slideLeft: {
      opacity: springVal,
      transform: `translateX(${interpolate(springVal, [0, 1], [100, 0])}px)`,
    },
    scaleIn: {
      opacity: springVal,
      transform: `scale(${interpolate(springVal, [0, 1], [0.9, 1])})`,
    },
  };

  const anim = transforms[style] || transforms.fadeUp;

  return <div style={{ ...baseStyle, ...anim }}>{text}</div>;
};
