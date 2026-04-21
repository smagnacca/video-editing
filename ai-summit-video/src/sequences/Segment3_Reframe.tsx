import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { colors, fonts, easing, SEGMENTS } from "../styles/theme";

const sec = (s: number) => Math.round(s * 30);
const segStart = SEGMENTS.S3_REFRAME.start;
const cue = (absTime: number) => sec(absTime) - segStart;

export const Segment3Reframe: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBg }}>
      <ParticleField count={25} maxOpacity={0.3} />
      <Sequence from={cue(30.6)} durationInFrames={cue(34.0) - cue(30.6)}>
        <GimmickFade />
      </Sequence>
      <Sequence from={cue(34.5)} durationInFrames={cue(36.3) - cue(34.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PowerWord word="ACCELERATOR" color={colors.deepGreen} direction="left" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(36.3)} durationInFrames={cue(37.8) - cue(36.3)}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <div style={{ fontSize: 96, fontFamily: fonts.body, fontWeight: 900, color: colors.deepGreen, letterSpacing: "0.08em" }}>ACCELERATOR</div>
          <PowerWord word="AMPLIFIER" color={colors.brightGold} direction="right" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={cue(37.8)} durationInFrames={cue(41.5) - cue(37.8)}>
        <ThreeIcons />
      </Sequence>
      <Sequence from={cue(41.5)} durationInFrames={cue(46.3) - cue(41.5)}>
        <HeroCardReveal />
      </Sequence>
    </AbsoluteFill>
  );
};

const GimmickFade: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = cue(34.0) - cue(30.6);
  const gimmicks = ["🤖 10x your income with AI!", "💰 Make $50K/month passive!", "🔥 This ONE prompt changes everything!", "🚀 Replace your entire team!", "⚡ AI millionaire in 30 days!"];
  const fadeOut = interpolate(frame, [0, totalFrames * 0.7, totalFrames], [0.6, 0.6, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeOut, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
        {gimmicks.map((g, i) => (
          <div key={i} style={{ fontSize: 32, fontFamily: fonts.body, color: colors.white, padding: "12px 24px", background: "rgba(255,255,255,0.08)", borderRadius: 8, transform: `translateY(${-frame * 1.5 + i * 80}px)` }}>{g}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const PowerWord: React.FC<{ word: string; color: string; direction: "left" | "right" }> = ({ word, color, direction }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: easing.snappySpring });
  const glow = interpolate(frame, [6, 18], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ fontSize: 96, fontFamily: fonts.body, fontWeight: 900, color, opacity: s, transform: `translateX(${interpolate(s, [0, 1], [direction === "left" ? -120 : 120, 0])}px)`, textShadow: `0 0 ${glow}px ${color}`, letterSpacing: "0.08em" }}>{word}</div>
  );
};

const ThreeIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { icon: "💡", label: "Your Ideas", color: colors.mangoPunch, delay: sec(0.3) },
    { icon: "📈", label: "Your Business", color: colors.deepGreen, delay: sec(1.0) },
    { icon: "🚀", label: "Your Life", color: colors.brightGold, delay: sec(1.7) },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 80 }}>
      {items.map((item, i) => {
        const s = spring({ frame: Math.max(0, frame - item.delay), fps, config: easing.springConfig });
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})` }}>
            <div style={{ fontSize: 80 }}>{item.icon}</div>
            <div style={{ fontSize: 24, fontFamily: fonts.body, fontWeight: 600, color: item.color, marginTop: 16 }}>{item.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const HeroCardReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const revealSpring = spring({ frame, fps, config: easing.springConfig });
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", perspective: 1200 }}>
      <div style={{
        width: 900, height: 500, background: `linear-gradient(135deg, ${colors.darkBg}, ${colors.darkGradientEnd})`,
        borderRadius: 20, border: `2px solid rgba(221,208,85,0.3)`, opacity: revealSpring,
        transform: `translateY(${interpolate(revealSpring, [0, 1], [400, 0])}px) rotateX(${interpolate(revealSpring, [0, 1], [15, 0])}deg)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontSize: 16, fontFamily: fonts.body, fontWeight: 600, color: colors.textMuted, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>THE AI MASTERY SUMMIT</div>
        <div style={{ fontSize: 48, fontFamily: fonts.heading, fontStyle: "italic", color: colors.brightGold, textAlign: "center", lineHeight: 1.2, marginBottom: 24 }}>AI Is the Equalizer.{"\n"}Psychology Is the Edge.</div>
        <div style={{ fontSize: 36, fontFamily: fonts.body, fontWeight: 800, color: colors.white }}>3 Days. 90 Minutes. Close the AI Skills Gap.</div>
      </div>
    </AbsoluteFill>
  );
};
