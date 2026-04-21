import React from "react";
import { useCurrentFrame, OffthreadVideo, staticFile, interpolate, Sequence } from "remotion";
import { VIDEO, SEGMENTS } from "../styles/theme";

type AvatarPosition = "right" | "left" | "center" | "pip-br" | "pip-bl";

interface AvatarSegment {
  from: number;
  duration: number;
  position: AvatarPosition;
  scale?: number;
  circular?: boolean;
}

const sec = (s: number) => Math.round(s * 30);

// Avatar: intro (10s) + outro (12s) only — saves 72% on HeyGen costs
const avatarSchedule: AvatarSegment[] = [
  { from: sec(1), duration: sec(12), position: "pip-br", scale: 0.22, circular: true },   // intro
  { from: sec(70), duration: sec(12), position: "pip-br", scale: 0.22, circular: true },   // outro
];

const positionStyles: Record<AvatarPosition, React.CSSProperties> = {
  right: { right: 0, top: 0, display: "flex", justifyContent: "flex-end", alignItems: "center" },
  left: { left: 0, top: 0, display: "flex", justifyContent: "flex-start", alignItems: "center" },
  center: { left: 0, top: 0, display: "flex", justifyContent: "center", alignItems: "center" },
  "pip-br": { right: 40, bottom: 40, display: "flex" },
  "pip-bl": { left: 40, bottom: 40, display: "flex" },
};

export const AvatarLayer: React.FC = () => {
  return (
    <>
      {avatarSchedule.map((seg, i) => (
        <Sequence key={i} from={seg.from} durationInFrames={seg.duration}>
          <AvatarClip segmentFrom={seg.from} position={seg.position} scale={seg.scale} circular={seg.circular} />
        </Sequence>
      ))}
    </>
  );
};

interface AvatarClipProps {
  segmentFrom: number;
  position: AvatarPosition;
  scale?: number;
  circular?: boolean;
}

const AvatarClip: React.FC<AvatarClipProps> = ({ segmentFrom, position, scale = 0.5, circular }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, 18], [1.02, 1], { extrapolateRight: "clamp" });

  const videoWidth = VIDEO.WIDTH * scale;
  const videoHeight = VIDEO.HEIGHT * scale;

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles[position],
        width: position === "center" ? "100%" : "auto",
        height: position === "center" ? "100%" : "auto",
        opacity: fadeIn,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: videoWidth,
          height: videoHeight,
          overflow: "hidden",
          borderRadius: circular ? "50%" : 0,
          transform: `scale(${zoom})`,
          border: circular ? "3px solid rgba(221,208,85,0.4)" : "none",
        }}
      >
        <OffthreadVideo
          src={staticFile("avatar/scott-avatar.mp4")}
          startFrom={segmentFrom}
          volume={0}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};
