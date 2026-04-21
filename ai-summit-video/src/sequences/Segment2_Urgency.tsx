import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { KineticText } from "../components/KineticText";
import { Strikethrough } from "../components/Transitions";
import { colors, fonts, easing, SEGMENTS } from "../styles/theme";

const sec = (s: number) => Math.round(s * 30);
const segStart = SEGMENTS.S2_URGENCY.start;
const cue = (absTime: number) => sec(absTime) - segStart;

export const Segment2Urgency: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBg }}>
      <ParticleField count={35} maxOpacity={0.5} />
      <Sequence from={cue(17.0)} durationInFrames={cue(20.1) - cue(17.0)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="Make Sure All of Us Are AI Enabled" startFrame={0} style="scaleIn" fontSize={56} fontWeight={700} color={colors.brightGold} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(20.6)} durationInFrames={cue(27.4) - cue(20.6)}>
        <ReplacedByAI />
      </Sequence>
      <Sequence from={cue(27.4)} durationInFrames={cue(29.4) - cue(27.4)}>
        <CountdownUrgency />
      </Sequence>
      <Sequence from={cue(29.4)} durationInFrames={cue(30.4) - cue(29.4)}>
        <WaveTakeover />
      </Sequence>
    </AbsoluteFill>
  );
};

const ReplacedByAI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line1Spring = spring({ frame, fps, config: easing.springConfig });
  const line1X = interpolate(line1Spring, [0, 1], [200, 0]);
  const strikeAt = sec(23.9 - 20.6);
  const showStrike = frame >= strikeAt;
  const line2Delay = strikeAt + 10;
  const line2Opacity = interpolate(frame, [line2Delay, line2Delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2Y = interpolate(frame, [line2Delay, line2Delay + 15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 56, fontFamily: fonts.body, fontWeight: 700, color: colors.white, opacity: line1Spring, transform: `translateX(${line1X}px)` }}>You won't be replaced by AI.</div>
        {showStrike && <Strikethrough at={0} width={750} top={35} left={0} />}
      </div>
      <div style={{ marginTop: 40, opacity: line2Opacity, transform: `translateY(${line2Y}px)` }}>
        <span style={{ fontSize: 56, fontFamily: fonts.body, fontWeight: 700, color: colors.white }}>You'll be replaced by someone </span>
        <span style={{ fontSize: 56, fontFamily: fonts.body, fontWeight: 800, color: colors.brightGold }}>USING AI.</span>
      </div>
    </AbsoluteFill>
  );
};

const CountdownUrgency: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = cue(29.4) - cue(27.4);
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const countValue = Math.max(0, Math.round(18 - (frame / totalFrames) * 18));
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fadeIn }}>
      <div style={{ fontSize: 160, fontFamily: fonts.body, fontWeight: 900, color: colors.mangoPunch, lineHeight: 1 }}>{countValue}</div>
      <div style={{ fontSize: 28, fontFamily: fonts.body, color: colors.textMuted, marginTop: 16, textTransform: "uppercase", letterSpacing: "0.2em" }}>months before you miss this wave</div>
    </AbsoluteFill>
  );
};

const WaveTakeover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleSpring = spring({ frame, fps, config: { damping: 8, stiffness: 120, mass: 0.6 } });
  const scale = interpolate(scaleSpring, [0, 1], [1.2, 1]);
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", transform: `scale(${scale})`, opacity: scaleSpring }}>
        <span style={{ fontSize: 90, fontFamily: fonts.heading, fontStyle: "italic", color: colors.white }}>Miss this </span>
        <span style={{ fontSize: 90, fontFamily: fonts.heading, fontStyle: "italic", color: colors.mangoPunch }}>wave</span>
      </div>
    </AbsoluteFill>
  );
};
