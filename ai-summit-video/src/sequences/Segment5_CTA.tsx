import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { KineticText } from "../components/KineticText";
import { CTAButton } from "../components/CTAButton";
import { colors, fonts, easing, SEGMENTS } from "../styles/theme";

const sec = (s: number) => Math.round(s * 30);
const segStart = SEGMENTS.S5_CTA.start;
const cue = (absTime: number) => sec(absTime) - segStart;

export const Segment5CTA: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBg }}>
      <ParticleField count={30} maxOpacity={0.4} />

      <Sequence from={cue(63.1)} durationInFrames={cue(65.2) - cue(63.1)}>
        <DontMissOut />
      </Sequence>

      <Sequence from={cue(65.2)} durationInFrames={cue(70.5) - cue(65.2)}>
        <CompressText />
      </Sequence>

      <Sequence from={cue(70.5)} durationInFrames={cue(72.0) - cue(70.5)}>
        <StaccatoWords />
      </Sequence>

      <Sequence from={cue(72.0)} durationInFrames={cue(76.5) - cue(72.0)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="AI Is Your Advantage." startFrame={0} style="scaleIn" fontSize={60} fontWeight={700} color={colors.brightGold} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(76.5)} durationInFrames={cue(77.5) - cue(76.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="Don't get frustrated." startFrame={0} style="scaleIn" fontSize={60} fontWeight={700} color={colors.mangoPunch} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(77.5)} durationInFrames={cue(78.5) - cue(77.5)}>
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <KineticText text="Don't try to do it all." startFrame={0} style="scaleIn" fontSize={60} fontWeight={700} color={colors.brightGold} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={cue(78.5)} durationInFrames={cue(85.0) - cue(78.5)}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

const DontMissOut: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = cue(65.2) - cue(63.1);
  const third = Math.floor(totalFrames / 3);
  const words = ["Don't.", "Miss.", "Out."];
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
      {words.map((word, i) => {
        const showAt = i * third;
        const localFrame = frame - showAt;
        if (localFrame < 0) return null;
        const opacity = interpolate(localFrame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
        const scale = interpolate(localFrame, [0, 8], [0.8, 1], { extrapolateRight: "clamp" });
        return (
          <span key={i} style={{ fontSize: 80, fontFamily: fonts.body, fontWeight: 900, color: colors.brightGold, opacity, transform: `scale(${scale})`, display: "inline-block" }}>{word}</span>
        );
      })}
    </AbsoluteFill>
  );
};

const CompressText: React.FC = () => {
  const frame = useCurrentFrame();
  const fullText = "Compress decades into days.";
  const charsVisible = Math.min(fullText.length, Math.floor(frame * 0.6));
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 72, fontFamily: fonts.heading, fontStyle: "italic", textAlign: "center" }}>
        {fullText.slice(0, charsVisible).split("").map((char, i) => {
          const isDecades = i >= 9 && i <= 15;
          const isDays = i >= 22;
          return <span key={i} style={{ color: isDecades ? colors.textMuted : isDays ? colors.brightGold : colors.white, fontWeight: isDays ? 800 : 400 }}>{char}</span>;
        })}
        {charsVisible < fullText.length && <span style={{ color: colors.brightGold, opacity: frame % 15 < 10 ? 1 : 0 }}>▎</span>}
      </div>
    </AbsoluteFill>
  );
};

const StaccatoWords: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = cue(72.0) - cue(70.5);
  const third = Math.floor(totalFrames / 3);
  const words = [
    { text: "SIMPLE.", color: colors.white, s: 0, e: third },
    { text: "ACTIONABLE.", color: colors.mangoPunch, s: third, e: third * 2 },
    { text: "YOUR ADVANTAGE.", color: colors.brightGold, s: third * 2, e: totalFrames },
  ];
  const w = words.find((w) => frame >= w.s && frame < w.e);
  if (!w) return null;
  const lf = frame - w.s;
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 100, fontFamily: fonts.body, fontWeight: 900, color: w.color, opacity: interpolate(lf, [0, 3], [0, 1], { extrapolateRight: "clamp" }), transform: `scale(${interpolate(lf, [0, 5], [0.85, 1], { extrapolateRight: "clamp" })})`, letterSpacing: "0.05em" }}>{w.text}</div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const dateOpacity = interpolate(frame, [10, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const url = "the-ai-mastery-summit.netlify.app";
  const urlChars = Math.min(url.length, Math.floor(Math.max(0, frame - 20) * 2));
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {frame < 25 && <div style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [0, 25], [1, 0], { extrapolateRight: "clamp" }) }}><ParticleField count={40} color={colors.brightGold} maxOpacity={1} /></div>}
      <CTAButton startFrame={0} large text="⚡ Reserve My Free Seat Now →" />
      <div style={{ marginTop: 32, display: "flex", gap: 32, opacity: dateOpacity }}>
        {[{ icon: "📅", text: "June 18, 2026" }, { icon: "🕐", text: "11:00 AM PT / 2:00 PM ET" }, { icon: "⏱", text: "90 Min/Day" }].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 18, fontFamily: fonts.body, color: colors.textMuted }}>{item.text}</span>
          </div>
        ))}
      </div>
      {urlChars > 0 && <div style={{ marginTop: 40, fontSize: 22, fontFamily: fonts.body, fontWeight: 600, color: colors.alfrescoBlue, letterSpacing: "0.03em" }}>{url.slice(0, urlChars)}</div>}
    </AbsoluteFill>
  );
};
