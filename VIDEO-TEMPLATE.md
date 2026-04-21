# Video Template Reference

This document describes the reusable architecture, components, and code patterns from the "3 Types of People" video. Use this as a starting template for future videos to minimize setup time and token usage.

## Architecture Overview

```
remotion-project/
├── remotion/
│   ├── Root.tsx          # Composition registration (id, duration, fps, dimensions)
│   └── index.ts          # Entry point (registerRoot)
├── src/
│   ├── [VideoName].tsx   # Main composition (scenes + layout)
│   └── components/       # Reusable components
│       ├── ParticleField.tsx       # Animated SVG particle background
│       ├── KineticText.tsx         # Animated text overlays (single + sequence)
│       ├── GlassmorphismCard.tsx   # Frosted glass card with accent glow
│       ├── BRollPlayer.tsx         # Framed B-roll video player
│       └── MeshGradient.tsx        # Mesh gradient + spotlight effects
└── public/
    ├── audio/            # MP3 voiceover files
    └── broll/            # B-roll video clips (MP4, 1920x1080, muted)
```

## Scene Architecture Pattern

Each video follows this structure:

1. **Constants block** — Colors and scene timing constants
2. **AnimatedBackground** — Moving radial gradients on dark base
3. **Scene components** — One React component per scene
4. **Main composition** — `<Sequence>` wrappers for each scene + `<Audio>` for voiceover

### Scene Timing Formula
```
audio_duration_seconds × fps = total_frames
```
Scene boundaries are set based on narration content. Use ffprobe to verify audio duration.

## Reusable Components

### ParticleField
Animated SVG particles with connection lines, glow halos, and color pulse.
```tsx
<ParticleField color="#00d4ff" count={40} seed={42} intensity={0.8} pulseColor="#ffffff" />
```
Props: `color`, `count`, `seed`, `intensity`, `pulseColor`

### KineticText
Spring-animated text overlay with glow. Appears at `delay`, fades out before `delay + duration`.
```tsx
<KineticText text="KEY PHRASE" color="#f5a623" delay={200} duration={180} glow shimmer />
```
Props: `text`, `color`, `fontSize`, `delay`, `duration`, `glow`, `shimmer`

### KineticTextSequence
Multiple words appearing in staggered sequence (e.g., "CURIOSITY" → "LEARNING" → "ADAPTABILITY").
```tsx
<KineticTextSequence
  words={[{ text: 'WORD1', color: '#00d4ff' }, { text: 'WORD2', color: '#f5a623' }]}
  delay={500} stagger={25}
/>
```

### GlassmorphismCard
Frosted glass card with accent-colored top border glow and spring entrance.
```tsx
<GlassmorphismCard accentColor="#00d4ff" delay={20} width={700}>
  {children}
</GlassmorphismCard>
```

### BRollPlayer
Styled video player frame that appears on the right side during B-roll segments.
```tsx
<BRollPlayer src="clip.mp4" accentColor="#00d4ff" startFrame={240} durationFrames={420} />
```

### AnimatedBackground
Three moving radial gradients creating subtle ambient motion.
```tsx
<AnimatedBackground color1="#00d4ff" color2="#1a0a2e" color3="#0a0e1a" speed={0.8} />
```

## Color Palette (scottmagnacca.com)

| Name | Hex | Usage |
|------|-----|-------|
| Background | #0a0e1a | Base dark navy |
| Cyan | #00d4ff | Primary accent, Believer scenes, CTA |
| Gold | #f5a623 | Secondary accent, Peer scenes |
| Orange | #ff6b35 | Tertiary accent, Coach scenes |
| Card BG | rgba(255,255,255,0.05) | Glassmorphism card background |
| Card Border | rgba(255,255,255,0.1) | Card edge |
| Text Primary | #ffffff | Headlines |
| Text Secondary | #a0aec0 | Body text, subtitles |

## Creating a New Video (Quick Steps)

1. **Write script** with scene breakdowns in `scripts/[name]-script.md`
2. **Generate audio**: Python Edge TTS script with `AndrewMultilingualNeural`, `+12%` rate, `-2Hz` pitch
3. **Check audio duration**: `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio.mp3`
4. **Calculate scene timings**: `seconds × 30fps = frames`
5. **Clone ThreeTypesVideo.tsx** as starting point, rename, update:
   - Color constants (keep same palette or customize per-scene)
   - Scene timing constants
   - Scene components (adjust titles, subtitles, icons, kinetic text)
   - B-roll sources and timing
6. **Register in Root.tsx**: New `<Composition>` entry with correct duration
7. **Render**: `npx remotion render remotion/index.ts [CompId] out/[name].mp4 --concurrency=2`
8. **Verify**: Extract frames with ffmpeg to spot-check text, particles, B-roll, CTA

## Rendering Notes

- Always render in a writable directory (not the Cowork mount)
- Use `--concurrency=2` to avoid memory issues
- Copy audio to `public/audio/` before render
- Copy B-roll clips to `public/broll/` before render
- Extract verification frames: `ffmpeg -i video.mp4 -vf "select='eq(n\,FRAME)'" -vsync vfr frame.png`
