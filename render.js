require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const REMOTION_PROJECT = process.env.REMOTION_PROJECT_PATH || './remotion-project';
const OUTPUT_DIR = './output';

async function renderVideo({ composition = 'VideoComposition', outputFile = null, props = {} } = {}) {
  if (!fs.existsSync(REMOTION_PROJECT)) {
    console.error('❌ Remotion project not found at: ' + REMOTION_PROJECT);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // ── Audio: copy to remotion public/ so it can be served via staticFile() ──
  let resolvedProps = Object.assign({}, props);
  if (resolvedProps.audioSrc) {
    const srcAudioPath = resolvedProps.audioSrc;
    const audioFilename = path.basename(srcAudioPath);
    const publicAudioDir = path.join(path.resolve(REMOTION_PROJECT), 'public', 'audio');
    const destAudioPath = path.join(publicAudioDir, audioFilename);

    if (!fs.existsSync(publicAudioDir)) {
      fs.mkdirSync(publicAudioDir, { recursive: true });
    }

    fs.copyFileSync(srcAudioPath, destAudioPath);
    console.log('🔊 Audio copied to public/audio/' + audioFilename);

    // Pass only the filename — VideoComposition uses staticFile('audio/<name>')
    resolvedProps.audioSrc = audioFilename;
  }

  const filename = outputFile || ('video_' + Date.now() + '.mp4');
  const outputPath = path.resolve(path.join(OUTPUT_DIR, filename));
  const projectPath = path.resolve(REMOTION_PROJECT);
  const propsFlag = Object.keys(resolvedProps).length
    ? '--props=' + JSON.stringify(JSON.stringify(resolvedProps))
    : '';

  const cmd = 'cd "' + projectPath + '" && npx remotion render remotion/VideoRoot.entry.ts ' + composition + ' "' + outputPath + '" ' + propsFlag;

  console.log('🎬 Rendering: ' + composition + ' → ' + filename);

  return new Promise(function(resolve, reject) {
    const child = exec(cmd);
    child.stdout.on('data', function(d) { process.stdout.write(d); });
    child.stderr.on('data', function(d) {
      const line = d.toString();
      if (!line.includes('ExperimentalWarning')) process.stderr.write(line);
    });
    child.on('close', function(code) {
      if (code === 0 && fs.existsSync(outputPath)) {
        const sizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(1);
        console.log('✅ Video saved: ' + outputPath + ' (' + sizeMB + ' MB)');
        resolve(outputPath);
      } else {
        reject(new Error('Render failed (exit ' + code + ')'));
      }
    });
    child.on('error', reject);
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const comp = args[0] || 'VideoComposition';
  const out = args[1] || null;
  renderVideo({ composition: comp, outputFile: out }).catch(console.error);
}

module.exports = { renderVideo };
