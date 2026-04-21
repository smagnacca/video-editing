/**
 * ElevenLabs Voiceover Script
 * Converts text to speech and saves as .mp3
 * Usage: node elevenlabs.js "Your text here" [voice_name] [output_filename]
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Available Free Tier Voices ───────────────────────────────────────────────
const VOICES = {
  'rachel':  '21m00Tcm4TlvDq8ikWAM',  // Calm, young American female
  'domi':    'AZnzlk1XvdvUeBnXmlld',  // Strong, American female
  'bella':   'EXAVITQu4vr4xnSDxMaL',  // Soft, young American female
  'antoni':  'ErXwobaYiN019PkySvjV',  // Well-rounded American male
  'elli':    'MF3mGyEYCl7XYWbV9V6O',  // Young American female
  'josh':    'TxGEqnHWrfWFTfGW9XjX',  // Deep American male
  'arnold':  'VR6AewLTigWG4xSOukaG',  // Crisp American male
  'adam':    'pNInz6obpgDQGcFmaJgB',  // Deep American male narrator
  'sam':     'yoZ06aMxZJJ28mfd3POQ',  // Energetic American male
};

// ─── Config ───────────────────────────────────────────────────────────────────
const API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE = 'adam';
const OUTPUT_DIR = './audio';

// ─── Main Function ────────────────────────────────────────────────────────────
async function generateVoiceover(text, voiceName = DEFAULT_VOICE, outputFile = null) {
  if (!API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not found in .env file');
    process.exit(1);
  }

  const voiceId = VOICES[voiceName.toLowerCase()];
  if (!voiceId) {
    console.error(`❌ Voice "${voiceName}" not found. Available: ${Object.keys(VOICES).join(', ')}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const filename = outputFile || `voiceover_${timestamp}.mp3`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  console.log(`🎙️  Generating voiceover...`);
  console.log(`   Voice: ${voiceName} (${voiceId})`);
  console.log(`   Text: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
  console.log(`   Output: ${outputPath}`);

  const requestBody = JSON.stringify({
    text,
    model_id: 'eleven_turbo_v2_5',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', (chunk) => { errorData += chunk; });
        res.on('end', () => {
          console.error(`❌ API Error ${res.statusCode}:`, errorData);
          reject(new Error(`API Error: ${res.statusCode}`));
        });
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        const stats = fs.statSync(outputPath);
        console.log(`✅ Voiceover saved! (${(stats.size / 1024).toFixed(1)} KB)`);
        console.log(`   📁 ${outputPath}`);
        resolve(outputPath);
      });

      fileStream.on('error', reject);
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// ─── CLI Usage ────────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node elevenlabs.js "Your text here" [voice] [output.mp3]');
    console.log('');
    console.log('Available voices:', Object.keys(VOICES).join(', '));
    console.log('');
    console.log('Examples:');
    console.log('  node elevenlabs.js "Hello world"');
    console.log('  node elevenlabs.js "Hello world" adam intro.mp3');
    process.exit(0);
  }

  const [text, voice, output] = args;
  generateVoiceover(text, voice, output).catch(console.error);
}

module.exports = { generateVoiceover, VOICES };
