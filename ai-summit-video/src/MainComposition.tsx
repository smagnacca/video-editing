import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Segment1Problem } from "./sequences/Segment1_Problem";
import { Segment2Urgency } from "./sequences/Segment2_Urgency";
import { Segment3Reframe } from "./sequences/Segment3_Reframe";
import { Segment4Offer } from "./sequences/Segment4_Offer";
import { Segment5CTA } from "./sequences/Segment5_CTA";
import { AvatarLayer } from "./components/AvatarLayer";
import { SEGMENTS, VIDEO, colors } from "./styles/theme";

export const MainComposition: React.FC = () => {
  const s = SEGMENTS;
  const frame = useCurrentFrame();
  const totalFrames = VIDEO.DURATION_FRAMES;

  // 3-second fade out at the end (last 90 frames)
  const fadeOutStart = totalFrames - 90;
  const fadeOut = interpolate(frame, [fadeOutStart, totalFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Audio volume fade out over last 3 seconds
  const narrationVolume = interpolate(frame, [fadeOutStart, totalFrames], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const musicVolume = interpolate(frame, [fadeOutStart, totalFrames], [0.04, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBg }}>
      {/* Voice narration — Scott's ElevenLabs voice */}
      <Audio src={staticFile("audio/narration.mp3")} volume={narrationVolume} />

      {/* Background music — 2/10 volume */}
      <Audio src={staticFile("audio/background-music.mp3")} volume={musicVolume} />

      <div style={{ opacity: fadeOut, position: "absolute", inset: 0 }}>
        {/* Segment 1: The Problem */}
        <Sequence from={s.S1_PROBLEM.start} durationInFrames={s.S1_PROBLEM.end - s.S1_PROBLEM.start}>
          <Segment1Problem />
        </Sequence>

        {/* Segment 2: The Urgency */}
        <Sequence from={s.S2_URGENCY.start} durationInFrames={s.S2_URGENCY.end - s.S2_URGENCY.start}>
          <Segment2Urgency />
        </Sequence>

        {/* Segment 3: The Reframe */}
        <Sequence from={s.S3_REFRAME.start} durationInFrames={s.S3_REFRAME.end - s.S3_REFRAME.start}>
          <Segment3Reframe />
        </Sequence>

        {/* Segment 4: The Offer */}
        <Sequence from={s.S4_OFFER.start} durationInFrames={s.S4_OFFER.end - s.S4_OFFER.start}>
          <Segment4Offer />
        </Sequence>

        {/* Segment 5: The CTA */}
        <Sequence from={s.S5_CTA.start} durationInFrames={s.S5_CTA.end - s.S5_CTA.start}>
          <Segment5CTA />
        </Sequence>

        {/* Avatar — fixed circular PIP bottom-right */}
        <AvatarLayer />
      </div>
    </AbsoluteFill>
  );
};
