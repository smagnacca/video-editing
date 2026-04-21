/**
 * 🎬 Full Video Generation Pipeline
 * ─────────────────────────────────
 * Step 1: Generate voiceover via ElevenLabs → saves .mp3
 * Step 2: Render video via Remotion (local) → saves .mp4
 *
 * Usage:
 *   node generate-video.js
 *   node generate-video.js --text="Your script" --voice=adam --comp=MyComp
 *
 * Or import and use programmatically:
 *   const { generateVideo } = require('./generate-video');
 *   await generateVideo({ text: "Hello world", voice: "adam", composition: "MyComp" });
 */

require('dotenv').config();
const path = require('path');
const { generateVoiceover } = require('./elevenlabs');
const { renderVideo } = require('./render');

// ─── Pipeline ─────────────────────────────────────────────────────────────────
async function generateVideo({
  text = 'Welcome to my video.',
  voice = 'adam',
  composition = 'MyComp',
  outputName = null,
} = {}) {

  const timestamp = Date.now();
  const baseName = outputName || `video_${timestamp}`;

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 VIDEO GENERATION PIPELINE STARTING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // ── Step 1: Generate Voiceover ─────────────────────────────────────────────
  console.log('STEP 1/2 — Generating voiceover with ElevenLabs...');
  const audioPath = await generateVoiceover(text, voice, `${baseName}.mp3`);
  console.log('');

  // ── Step 2: Render Video with Remotion ────────────────────────────────────
  console.log('STEP 2/2 — Rendering video with Remotion...');
  const videoPath = await renderVideo({
    composition,
    outputFile: `${baseName}.mp4`,
    props: {
      audioSrc: path.resolve(audioPath),  // Pass audio path to Remotion composition
    },
    onProgress: (percent) => {
      process.stdout.write(`\r   Rendering: ${percent}%   `);
    },
  });
  console.log('');

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ PIPELINE COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   🎙️  Audio:  ${audioPath}`);
  console.log(`   🎬 Video:  ${videoPath}`);
  console.log('');

  return { audioPath, videoPath };
}

// ─── CLI Usage ────────────────────────────────────────────────────────────────
if (require.main === module) {
  // Parse simple --key=value args
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) acc[match[1]] = match[2];
    return acc;
  }, {});

  const config = {
    text: args.text || 'Welcome to this video, created with Remotion and ElevenLabs.',
    voice: args.voice || 'adam',
    composition: args.comp || 'MyComp',
    outputName: args.name || null,
  };

  console.log('Config:', config);

  generateVideo(config).catch((err) => {
    console.error('❌ Pipeline failed:', err.message);
    process.exit(1);
  });
}

module.exports = { generateVideo };
