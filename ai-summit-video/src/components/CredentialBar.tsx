import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { colors, fonts, easing } from "../styles/theme";

interface CredentialBarProps {
  startFrame: number;
}

const credentials = [
  "Fidelity Investments",
  "Harvard University",
  "4,127+ Advisors",
  "Published Author — 4 Books",
];

export const CredentialBar: React.FC<CredentialBarProps> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const slideUp = spring({ frame: localFrame, fps, config: easing.smoothSpring });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        opacity: slideUp,
        transform: `translateY(${interpolate(slideUp, [0, 1], [30, 0])}px)`,
        padding: "20px 40px",
        background: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        border: `1px solid rgba(221,208,85,0.15)`,
      }}
    >
      {credentials.map((cred, i) => {
        const stagger = spring({
          frame: localFrame - i * 5,
          fps,
          config: easing.snappySpring,
        });
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                style={{
                  width: 1,
                  height: 24,
                  backgroundColor: colors.mangoPunch,
                  opacity: 0.4,
                }}
              />
            )}
            <div
              style={{
                fontSize: 18,
                fontFamily: fonts.body,
                fontWeight: 600,
                color: i === 1 ? colors.mangoPunch : colors.white,
                opacity: stagger,
                letterSpacing: "0.02em",
              }}
            >
              {cred}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
