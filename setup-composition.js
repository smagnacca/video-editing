/**
 * Setup script: creates VideoComposition files in the right place
 * Run from ~/video-project with: node setup-composition.js
 */

const fs = require('fs');
const path = require('path');

const REMOTION_DIR = path.join(__dirname, 'remotion-project', 'remotion');
const RENDER_JS = path.join(__dirname, 'render.js');

// ── 1. VideoComposition.tsx ───────────────────────────────────────────────────
const videoComposition = `import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

export type VideoProps = {
  audioSrc?: string;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  accentColor?: string;
};

export const VideoComposition: React.FC<VideoProps> = ({
  audioSrc,
  title = 'My Video',
  subtitle = '',
  backgroundColor = '#0a0a0a',
  accentColor = '#4f8ef7',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const titleY = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: 'clamp' });

  const subtitleOpacity = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const subtitleY = interpolate(frame, [12, 35], [30, 0], { extrapolateRight: 'clamp' });

  const lineWidth = interpolate(frame, [8, 40], [0, 120], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {audioSrc && <Audio src={audioSrc} />}
      <AbsoluteFill
        style={{
          background: \`radial-gradient(ellipse at 30% 50%, \${accentColor}18 0%, transparent 70%)\`,
        }}
      />
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{ width: lineWidth, height: 4, backgroundColor: accentColor, borderRadius: 2, marginBottom: 32 }} />
        <h1
          style={{
            color: '#ffffff',
            fontSize: 80,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 800,
            margin: 0,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: \`translateY(\${titleY}px)\`,
            letterSpacing: '-2px',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              color: '#888888',
              fontSize: 36,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 400,
              marginTop: 28,
              textAlign: 'center',
              opacity: subtitleOpacity,
              transform: \`translateY(\${subtitleY}px)\`,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
`;

// ── 2. VideoRoot.ts (our own separate entry point) ────────────────────────────
const videoRoot = `import { registerRoot } from 'remotion';
import { VideoRoot } from './VideoRoot.component';

registerRoot(VideoRoot);
`;

const videoRootComponent = `import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition, VideoProps } from './VideoComposition';

export const VideoRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'My Video',
          subtitle: 'Created with Remotion + ElevenLabs',
          backgroundColor: '#0a0a0a',
          accentColor: '#4f8ef7',
        } as VideoProps}
      />
    </>
  );
};
`;

// ── 3. Write files ────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(REMOTION_DIR, 'VideoComposition.tsx'), videoComposition);
console.log('✅ remotion/VideoComposition.tsx written');

fs.writeFileSync(path.join(REMOTION_DIR, 'VideoRoot.entry.ts'), videoRoot);
console.log('✅ remotion/VideoRoot.entry.ts written');

fs.writeFileSync(path.join(REMOTION_DIR, 'VideoRoot.component.tsx'), videoRootComponent);
console.log('✅ remotion/VideoRoot.component.tsx written');

// ── 4. Fix render.js entry point ─────────────────────────────────────────────
let renderJs = fs.readFileSync(RENDER_JS, 'utf8');

// Replace any existing --entry-point flag or add the right one
renderJs = renderJs.replace(
  /npx remotion render(?: --entry-point \S+)?/g,
  'npx remotion render --entry-point remotion/VideoRoot.entry.ts'
);

fs.writeFileSync(RENDER_JS, renderJs);
console.log('✅ render.js entry point updated');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ ALL FILES SET UP CORRECTLY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\nNow run the full pipeline test:');
console.log('\n  node generate-video.js --text="Hello Scott, the pipeline is working." --voice=adam --comp=VideoComposition --name=pipeline-test\n');
