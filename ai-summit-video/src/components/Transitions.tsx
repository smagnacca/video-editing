import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../styles/theme";

interface GoldFlashProps {
  at: number;
  duration?: number;
}

export const GoldFlash: React.FC<GoldFlashProps> = ({ at, duration = 3 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - at;

  if (localFrame < 0 || localFrame >= duration) return null;

  const opacity = interpolate(localFrame, [0, duration], [0.15, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.brightGold,
        opacity,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
};

interface WipeTransitionProps {
  at: number;
  duration?: number;
  direction?: "left" | "right";
  color?: string;
}

export const WipeTransition: React.FC<WipeTransitionProps> = ({
  at,
  duration = 10,
  direction = "left",
  color = colors.darkBg,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - at;

  if (localFrame < 0 || localFrame >= duration) return null;

  const progress = interpolate(localFrame, [0, duration], [0, 100], {
    extrapolateRight: "clamp",
  });

  const clipPath =
    direction === "left"
      ? `inset(0 ${100 - progress}% 0 0)`
      : `inset(0 0 0 ${100 - progress}%)`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: color,
        clipPath,
        zIndex: 90,
        pointerEvents: "none",
      }}
    />
  );
};

interface StrikethroughProps {
  at: number;
  width: number;
  top: number;
  left: number;
  duration?: number;
}

export const Strikethrough: React.FC<StrikethroughProps> = ({
  at,
  width,
  top,
  left,
  duration = 9,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - at;

  if (localFrame < 0) return null;

  const progress = interpolate(localFrame, [0, duration], [0, width], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: progress,
        height: 4,
        backgroundColor: colors.redStrike,
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
};
