import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { KineticText } from "../components/KineticText";
import { StatCard } from "../components/StatCard";
import { GoldFlash } from "../components/Transitions";
import { colors, fonts, SEGMENTS } from "../styles/theme";

const sec = (s: number) => Math.round(s * 30);
const segStart = SEGMENTS.S1_PROBLEM.start;
const cue = (s: number) => sec(s) - segStart;

export const Segment1Problem: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBg }}>
      <ParticleField count={30} maxOpacity={0.4} />
      <Sequence from={cue(0)} durationInFrames={cue(4.2)}>
        <ColdOpenText />
      </Sequence>
      <Sequence from={cue(2.5)} durationInFrames={cue(9) - cue(2.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 200 }}>
          <StatCard stat="52%" label="of recent grads underemployed" startFrame={0} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(5.4)} durationInFrames={cue(9.5) - cue(5.4)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="Jobs are disappearing." startFrame={0} style="typewriter" fontSize={52} fontWeight={700} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(9.6)} durationInFrames={cue(11.8) - cue(9.6)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 52, fontFamily: fonts.body, fontWeight: 700, color: colors.white, textAlign: "center" }}>
            People are <span style={{ color: colors.brightGold, fontWeight: 900 }}>OVERWHELMED</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(11.8)} durationInFrames={cue(13.5) - cue(11.8)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="A new AI product every day..." startFrame={0} style="fadeUp" fontSize={44} fontWeight={600} color={colors.textMuted} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(13.5)} durationInFrames={cue(15.5) - cue(13.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="...or every week." startFrame={0} style="fadeUp" fontSize={44} fontWeight={600} color={colors.white} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(15.5)} durationInFrames={cue(17.0) - cue(15.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="They don't know where to start." startFrame={0} style="scaleIn" fontSize={48} fontWeight={700} color={colors.mangoPunch} />
        </AbsoluteFill>
      </Sequence>
      <GoldFlash at={cue(16.7)} duration={3} />
    </AbsoluteFill>
  );
};

const ColdOpenText: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = cue(4.2);
  const opacity = interpolate(frame, [0, 15, totalFrames - 10, totalFrames], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 15], [0.98, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity, transform: `scale(${scale})` }}>
      <div style={{ fontSize: 52, fontFamily: fonts.heading, fontStyle: "italic", color: colors.white, textAlign: "center", maxWidth: 900, lineHeight: 1.3 }}>
        For the first time in modern history...
      </div>
    </div>
  );
};
