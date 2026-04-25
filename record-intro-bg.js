const { chromium } = require('playwright');
const fs = require('fs');
const OUTPUT_DIR = '/tmp/video-intro-bg';
const HTML_PATH = 'file:///tmp/intro-bg.html';
const DURATION_MS = 31000;
async function record() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: OUTPUT_DIR, size: { width: 1920, height: 1080 } } });
  const page = await context.newPage();
  await page.goto(HTML_PATH, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  console.log('Recording intro-bg 31s...');
  await page.waitForTimeout(DURATION_MS);
  await context.close(); await browser.close();
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
  console.log('Done:', files);
}
record().catch(e => { console.error(e); process.exit(1); });
