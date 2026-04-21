/**
 * Full pipeline test — no arguments needed.
 * Run with: node run-test.js
 */

require('dotenv').config();
const path = require('path');
const { generateVoiceover } = require('./elevenlabs');
const { renderVideo } = require('./render');

async function main() {
  const text = 'Hello Scott. The ElevenLabs and Remotion pipeline is fully working.';
  const voice = 'adam';
  const composition = 'VideoComposition';
  const baseName = 'pipeline-test';

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STEP 1: Generating voiceover...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const audioPath = await generateVoiceover(text, voice, baseName + '.mp3');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STEP 2: Rendering video with Remotion...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const videoPath = await renderVideo({
    composition,
    outputFile: baseName + '.mp4',
    props: {
      audioSrc: path.resolve(audioPath),
      title: 'Pipeline Test',
      subtitle: 'ElevenLabs + Remotion ✓',
    },
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ DONE — opening your video now...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { exec } = require('child_process');
  exec(`open "${videoPath}"`);
}

main().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
