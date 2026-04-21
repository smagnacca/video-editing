import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { KineticText } from "../components/KineticText";
import { colors, fonts, easing, SEGMENTS } from "../styles/theme";

const sec = (s: number) => Math.round(s * 30);
const segStart = SEGMENTS.S4_OFFER.start;
const cue = (absTime: number) => sec(absTime) - segStart;

export const Segment4Offer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBg }}>
      <ParticleField count={20} maxOpacity={0.3} />

      {/* 46.5–50.3 — Day cards: 50% BIGGER, HORIZONTAL, sequential L→R, pills CENTER TOP */}
      <Sequence from={cue(46.6)} durationInFrames={cue(50.6) - cue(46.6)}>
        <DayCardsWithPills />
      </Sequence>

      <Sequence from={cue(50.6)} durationInFrames={cue(52.8) - cue(50.6)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="How things used to be..." startFrame={0} style="fadeUp" fontSize={48} fontWeight={600} color={colors.textMuted} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(52.8)} durationInFrames={cue(55.0) - cue(52.8)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="How you can do it now... in seconds." startFrame={0} style="scaleIn" fontSize={48} fontWeight={700} color={colors.white} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(55.0)} durationInFrames={cue(56.5) - cue(55.0)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="Do it more profitably." startFrame={0} style="scaleIn" fontSize={52} fontWeight={700} color={colors.brightGold} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(56.5)} durationInFrames={cue(59.3) - cue(56.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="Do something right now..." startFrame={0} style="fadeUp" fontSize={48} fontWeight={600} color={colors.white} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(59.3)} durationInFrames={cue(60.5) - cue(59.3)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="In your business..." startFrame={0} style="scaleIn" fontSize={48} fontWeight={700} color={colors.mangoPunch} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(60.5)} durationInFrames={cue(62.9) - cue(60.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="In your life... or career." startFrame={0} style="scaleIn" fontSize={48} fontWeight={700} color={colors.brightGold} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const DayCardsWithPills: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dayData = [
    { day: 1, title: "ROI-First AI Thinking", desc: "Frame every tech decision as a revenue or time multiplier." },
    { day: 2, title: "Decision Intelligence", desc: "Build the judgment that separates AI-native professionals." },
    { day: 3, title: "Advanced Prompting", desc: "Master techniques for sales, research, and content creation." },
  ];

  const pills = [{ text: "90 min/day", icon: "⏱" }, { text: "100% Free", icon: "🎯" }, { text: "Virtual", icon: "🌍" }];

  return (
    <AbsoluteFill>
      {/* Pills — CENTER TOP of screen */}
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24 }}>
        {pills.map((p, i) => {
          const s = spring({ frame: Math.max(0, frame - i * 5), fps, config: easing.smoothSpring });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 28px",
              backgroundColor: colors.deepGreen, borderRadius: 30, border: `1px solid rgba(221,208,85,0.3)`,
              opacity: s, transform: `translateY(${interpolate(s, [0, 1], [15, 0])}px)`,
            }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <span style={{ fontSize: 20, fontFamily: fonts.body, fontWeight: 700, color: colors.white }}>{p.text}</span>
            </div>
          );
        })}
      </div>

      {/* Day cards — 50% BIGGER, HORIZONTAL (side by side), sequential cascade L→R */}
      <div style={{ position: "absolute", top: 160, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 28, paddingTop: 40 }}>
        {dayData.map((d, i) => {
          const stagger = i * 12; // 0.4s stagger
          const s = spring({ frame: Math.max(0, frame - stagger - 10), fps, config: easing.springConfig });
          const rotation = interpolate(s, [0, 1], [3, 0]);
          return (
            <div key={i} style={{
              width: 480, // 50% bigger than 320
              padding: "36px",
              background: "rgba(10,10,10,0.9)",
              borderRadius: 16,
              border: `1px solid rgba(221,208,85,0.25)`,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [80, 0])}px) rotate(${rotation}deg)`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 10, border: `2px solid ${colors.deepGreen}`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, textTransform: "uppercase" }}>DAY</div>
                  <div style={{ fontSize: 26, fontFamily: fonts.body, fontWeight: 800, color: colors.deepGreen }}>{String(d.day).padStart(2, "0")}</div>
                </div>
                <div style={{ fontSize: 22, fontFamily: fonts.heading, fontWeight: 700, color: colors.white }}>{d.title}</div>
              </div>
              <div style={{ fontSize: 16, fontFamily: fonts.body, color: colors.textMuted, lineHeight: 1.5 }}>{d.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
