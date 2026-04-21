#!/bin/bash
# ============================================================
# Video Pipeline Setup Script
# Creates ~/video-project with all scripts ready to run
# ============================================================

echo ""
echo "🎬 Setting up your video pipeline..."
echo ""

# Fix npm permissions
echo "🔧 Fixing npm permissions..."
sudo chown -R $(id -u):$(id -g) "$HOME/.npm" 2>/dev/null || true

# Clean up accidental package.json in home dir
rm -f ~/package.json ~/package-lock.json

# Create project folder
mkdir -p ~/video-project
cd ~/video-project

echo "📁 Created ~/video-project"

# ── .env ──────────────────────────────────────────────────
cat > .env << 'ENVEOF'
ELEVENLABS_API_KEY=sk_f4c33d829097bb16a020a2b2bf0eca02af5a8a144ec17fcc
REMOTION_PROJECT_PATH=./remotion-project
ENVEOF

# ── .gitignore ────────────────────────────────────────────
cat > .gitignore << 'GITEOF'
.env
node_modules/
out/
*.mp4
*.mp3
GITEOF

# ── elevenlabs.js ─────────────────────────────────────────
cat > elevenlabs.js << 'JSEOF'
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const VOICES = {
  rachel:  '21m00Tcm4TlvDq8ikWAM',
  domi:    'AZnzlk1XvdvUeBnXmlld',
  bella:   'EXAVITQu4vr4xnSDxMaL',
  antoni:  'ErXwobaYiN019PkySvjV',
  elli:    'MF3mGyEYCl7XYWbV9V6O',
  josh:    'TxGEqnHWrfWFTfGW9XjX',
  arnold:  'VR6AewLTigWG4xSOukaG',
  adam:    'pNInz6obpgDQGcFmaJgB',
  sam:     'yoZ06aMxZJJ28mfd3POQ',
};

const API_KEY = process.env.ELEVENLABS_API_KEY;
const OUTPUT_DIR = './audio';

async function generateVoiceover(text, voiceName = 'adam', outputFile = null) {
  if (!API_KEY) { console.error('❌ ELEVENLABS_API_KEY not found in .env'); process.exit(1); }
  const voiceId = VOICES[voiceName.toLowerCase()];
  if (!voiceId) { console.error(`❌ Voice "${voiceName}" not found. Available: ${Object.keys(VOICES).join(', ')}`); process.exit(1); }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filename = outputFile || `voiceover_${Date.now()}.mp3`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  console.log(`🎙️  Generating voiceover — voice: ${voiceName}`);
  const body = JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75 } });
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.elevenlabs.io', path: `/v1/text-to-speech/${voiceId}`, method: 'POST', headers: { Accept: 'audio/mpeg', 'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      if (res.statusCode !== 200) { let e=''; res.on('data',c=>e+=c); res.on('end',()=>{ console.error(`❌ API Error ${res.statusCode}:`,e); reject(new Error(e)); }); return; }
      const stream = fs.createWriteStream(outputPath);
      res.pipe(stream);
      stream.on('finish', () => { console.log(`✅ Audio saved: ${outputPath}`); resolve(outputPath); });
      stream.on('error', reject);
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

if (require.main === module) {
  const [,, text='Hello world', voice='adam', out] = process.argv;
  generateVoiceover(text, voice, out).catch(console.error);
}

module.exports = { generateVoiceover, VOICES };
JSEOF

# ── render.js ─────────────────────────────────────────────
cat > render.js << 'JSEOF'
require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const REMOTION_PROJECT = process.env.REMOTION_PROJECT_PATH || './remotion-project';
const OUTPUT_DIR = './output';

async function renderVideo({ composition = 'MyComp', outputFile = null, props = {} } = {}) {
  if (!fs.existsSync(REMOTION_PROJECT)) {
    console.error(`❌ Remotion project not found at: ${REMOTION_PROJECT}`);
    console.error('Run: npm create video@latest remotion-project');
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filename = outputFile || `video_${Date.now()}.mp4`;
  const outputPath = path.resolve(path.join(OUTPUT_DIR, filename));
  const projectPath = path.resolve(REMOTION_PROJECT);
  const propsFlag = Object.keys(props).length ? `--props='${JSON.stringify(props)}'` : '';
  const cmd = `cd "${projectPath}" && npx remotion render ${composition} "${outputPath}" ${propsFlag}`;
  console.log(`🎬 Rendering: ${composition} → ${filename}`);
  return new Promise((resolve, reject) => {
    const child = exec(cmd);
    child.stdout.on('data', d => process.stdout.write(d));
    child.stderr.on('data', d => { if (!d.includes('ExperimentalWarning')) process.stderr.write(d); });
    child.on('close', code => {
      if (code === 0 && fs.existsSync(outputPath)) { console.log(`✅ Video saved: ${outputPath}`); resolve(outputPath); }
      else reject(new Error(`Render failed (exit ${code})`));
    });
    child.on('error', reject);
  });
}

if (require.main === module) {
  const [,, comp='MyComp', out] = process.argv;
  renderVideo({ composition: comp, outputFile: out }).catch(console.error);
}

module.exports = { renderVideo };
JSEOF

# ── generate-video.js ─────────────────────────────────────
cat > generate-video.js << 'JSEOF'
require('dotenv').config();
const path = require('path');
const { generateVoiceover } = require('./elevenlabs');
const { renderVideo } = require('./render');

async function generateVideo({ text = 'Welcome to my video.', voice = 'adam', composition = 'MyComp', outputName = null } = {}) {
  const base = outputName || `video_${Date.now()}`;
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 VIDEO PIPELINE STARTING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('STEP 1/2 — ElevenLabs voiceover...');
  const audioPath = await generateVoiceover(text, voice, `${base}.mp3`);
  console.log('\nSTEP 2/2 — Remotion render...');
  const videoPath = await renderVideo({ composition, outputFile: `${base}.mp4`, props: { audioSrc: path.resolve(audioPath) } });
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DONE');
  console.log(`   🎙️  ${audioPath}`);
  console.log(`   🎬 ${videoPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  return { audioPath, videoPath };
}

if (require.main === module) {
  const args = process.argv.slice(2).reduce((a,arg) => { const m=arg.match(/^--(\w+)=(.+)$/); if(m) a[m[1]]=m[2]; return a; }, {});
  generateVideo({ text: args.text || 'Hello, this is a test video.', voice: args.voice || 'adam', composition: args.comp || 'MyComp', outputName: args.name }).catch(console.error);
}

module.exports = { generateVideo };
JSEOF

echo ""
echo "📦 Installing npm dependencies..."
npm init -y > /dev/null 2>&1
npm install dotenv

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Your project is at: ~/video-project"
echo ""
echo "NEXT STEP — Create your Remotion project:"
echo ""
echo "  npm create video@latest remotion-project"
echo ""
echo "Then test ElevenLabs:"
echo ""
echo "  node elevenlabs.js \"Hello, this is a test.\" adam test.mp3"
echo ""
