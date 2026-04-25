const { chromium } = require('playwright');
const fs = require('fs');

const OUTPUT_DIR = '/tmp/video-linkedin';
const HTML_PATH = 'file:///Users/scottmagnacca/Documents/Claude/Projects/Video%20editing/linkedin-skill/composition/index.html';
const DURATION_MS = 146 * 1000; // 145.8s composition + 0.2s buffer

async function record() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log('Opening LinkedIn composition...');
  await page.goto(HTML_PATH, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log(`Recording for ${DURATION_MS / 1000}s — do not interrupt...`);

  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(`  ${elapsed}s / ${DURATION_MS / 1000}s elapsed`);
  }, 20000);

  await page.waitForTimeout(DURATION_MS);
  clearInterval(interval);

  console.log('Finalizing recording...');
  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
  console.log('Done. Output files:', files);
  if (files.length === 0) {
    console.error('ERROR: No webm files found in', OUTPUT_DIR);
    process.exit(1);
  }
}

record().catch(err => {
  console.error('Record failed:', err);
  process.exit(1);
});
