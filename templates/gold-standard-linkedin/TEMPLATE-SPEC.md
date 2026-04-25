# Gold Standard Video Template — LinkedIn Skill (A+ Quality)

**Approved by Scott: 2026-04-25. "Perfect. Spot on for everything."**
**Rating: A+ / Outstanding — first-pass approval, zero rework on final v3.**

Reference output: `REFERENCE-OUTPUT-v3.mp4` (3:21, 18MB)
Full pipeline: `~/.claude/projects/.../memory/feedback_linkedin_video_pattern.md`

---

## File Map

| File | Purpose |
|---|---|
| `composition/index.html` | Main body (2:25) — the educational content between INTRO and OUTRO |
| `intro-bg.html` | INTRO background (30s) — behind avatar PIP, 3 scene beats |
| `outro-bg.html` | OUTRO background (25.8s) — behind avatar PIP, CTA structure |
| `REFERENCE-OUTPUT-v3.mp4` | Approved final output — use as visual benchmark |

---

## Brand Design System

### Colors (non-negotiable)
```css
--navy:    #0a0e1a;   /* body background — always */
--gold:    #f5a623;   /* peak emphasis: stats, hero numbers, CTAs */
--cyan:    #00d4ff;   /* secondary emphasis: skill labels, URLs, section tags */
--white:   #ffffff;   /* body text */
--gray:    rgba(255,255,255,0.55);  /* supporting/subtext */
--red:     /* strikethrough only — never readable text */
--green:   /* borders/SVG only — never readable text on dark bg */
```

### Typography — Inter (Google Fonts)
```
Hook stat / hero number:   180px  weight:900  color:gold  text-shadow glow
Section break title:        96px  weight:900
Advantage/PracticalAI:     112px  weight:900
Score table number:          32px  weight:900
Body label / section tag:    26px  weight:700
Supporting text:             28px  weight:500  color:gray
Watermark:                   22px  weight:600  color:rgba(255,255,255,0.35)
CTA bar text:                26px  weight:800  color:#0a0e1a (on gold bg)
Prompt text (typewriter):    42px  weight:500  line-height:1.5
```

### Gold Glow (apply to all hero numbers)
```css
text-shadow: 0 0 40px rgba(245,166,35,0.65), 0 0 80px rgba(245,166,35,0.3);
```

### Gold Accent Line
```css
display:block; height:4px;
background: linear-gradient(90deg, #f5a623, #00d4ff);
border-radius: 2px;
```

---

## Canvas Particle System (copy verbatim)

55 particles, mix of gold and cyan, slow drift, opacity 0.1–0.5:

```js
const particles = Array.from({length:55}, () => ({
  x: Math.random()*1920, y: Math.random()*1080,
  r: Math.random()*2+0.5,
  vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
  a: Math.random()*0.4+0.1,
  gold: Math.random() > 0.5
}));
function drawParticles() {
  ctx.clearRect(0,0,1920,1080);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = p.gold ? `rgba(245,166,35,${p.a})` : `rgba(0,212,255,${p.a})`;
    ctx.fill();
    p.x += p.vx; p.y += p.vy;
    if(p.x<0) p.x=1920; if(p.x>1920) p.x=0;
    if(p.y<0) p.y=1080; if(p.y>1080) p.y=0;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();
```

---

## Animation Patterns

### Ken Burns (background images)
```css
.bg { background-size:contain; background-repeat:no-repeat; background-position:center; }
.zoom-slow  { animation: kenBurns     60s linear infinite; }
.zoom-right { animation: kenBurnsRight 30s linear forwards; }
.zoom-left  { animation: kenBurnsLeft  30s linear forwards; }

@keyframes kenBurns      { 0%{transform:scale(1.05) translateX(0)} 50%{transform:scale(1.10) translateX(-20px)} 100%{transform:scale(1.05) translateX(0)} }
@keyframes kenBurnsRight { 0%{transform:scale(1.0) translateX(0)} 100%{transform:scale(1.08) translateX(-30px)} }
@keyframes kenBurnsLeft  { 0%{transform:scale(1.08) translateX(-30px)} 100%{transform:scale(1.0) translateX(0)} }
```

### Spring Physics (hero entrances)
```css
transition: opacity 0.5s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
/* initial: opacity:0; transform:scale(0.7) or translateY(30px) */
/* triggered: opacity:1; transform:none */
```

### Stagger Reveals (lists/rows)
```css
/* Each item has transition-delay staggered by 0.15–0.2s */
.item-1 { transition: opacity 0.4s 0.0s, transform 0.4s 0.0s; }
.item-2 { transition: opacity 0.4s 0.2s, transform 0.4s 0.2s; }
.item-3 { transition: opacity 0.4s 0.4s, transform 0.4s 0.4s; }
/* all start: opacity:0; transform:translateX(30px) or translateY(25px) */
```

### Typewriter (prompt text)
```js
function typeText(elId, text, startMs, charsPerSec, doneCb) {
  const el = document.getElementById(elId);
  const ms = 1000 / charsPerSec;
  const cursorEl = document.createElement('span');
  cursorEl.className = 'prompt-cursor'; // blink animation
  for(let i = 0; i <= text.length; i++) {
    (function(idx){
      setTimeout(() => {
        el.textContent = text.slice(0, idx);
        el.appendChild(cursorEl);
        if(idx === text.length && doneCb) doneCb();
      }, startMs + idx * ms);
    })(i);
  }
}
// Prompt cursor CSS:
// .prompt-cursor { display:inline-block; width:3px; height:44px; background:#f5a623;
//   margin-left:4px; vertical-align:bottom; animation:blink 0.7s step-end infinite; }
// @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
```

### Spinner / Calculating
```css
.spinner {
  width:140px; height:140px; border-radius:50%;
  border:6px solid rgba(0,212,255,0.2); border-top-color:#00d4ff;
  animation:spin 1s linear infinite;
}
.spinner::after {
  content:''; position:absolute; inset:12px; border-radius:50%;
  border:4px solid rgba(245,166,35,0.2); border-bottom-color:#f5a623;
  animation:spin 0.7s linear infinite reverse;
}
@keyframes spin { to { transform:rotate(360deg); } }
```

### Progress Bar Fill
```css
@keyframes fillBar { 0%{width:0%} 30%{width:35%} 60%{width:62%} 80%{width:80%} 100%{width:100%} }
```

### Pulse Dots (loading state)
```css
.dot { width:14px; height:14px; border-radius:50%; background:#00d4ff; }
.dot:nth-child(1) { animation:pulse 1.2s 0.0s ease-in-out infinite; }
.dot:nth-child(2) { animation:pulse 1.2s 0.4s ease-in-out infinite; }
.dot:nth-child(3) { animation:pulse 1.2s 0.8s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
```

---

## Section Structure

### Section Base
```css
.sec {
  position:absolute; width:1920px; height:1080px;
  opacity:0; pointer-events:none;
  /* content layout: flex or absolute positioning */
}
.sec.on { opacity:1; }
```

### Section Switcher
```js
let currentSec = null;
function switchSec(id, fadeMs=400) {
  if(currentSec) {
    const prev = document.getElementById(currentSec);
    prev.style.transition = `opacity ${fadeMs}ms`;
    prev.classList.remove('on');
  }
  const next = document.getElementById(id);
  next.style.transition = `opacity ${fadeMs}ms`;
  setTimeout(() => next.classList.add('on'), currentSec ? fadeMs/2 : 0);
  currentSec = id;
}
function show(id) { document.getElementById(id).classList.add('on'); }
function at(ms, fn) { setTimeout(fn, ms); }
```

### Timing Philosophy
All timestamps in the `T` object are **absolute milliseconds from video start**, anchored to **Whisper word-level timestamps**. Never guess — every `at(T.xxx, fn)` maps to a real Whisper timestamp.

```js
const T = {
  // Format: sectionIn = ~1.5-2s before narrator says the key phrase
  // tagIn    = sectionIn + 500ms
  // element1 = exact Whisper timestamp (ms)
};
```

---

## Callout Box (profile annotations)
```css
.callout {
  position:absolute;
  background: rgba(245,166,35,0.15);
  border: 2.5px solid #f5a623;
  border-radius: 8px;
  box-shadow: 0 0 18px rgba(245,166,35,0.25);   /* gold glow */
  opacity:0; transform:scale(0.95);
  transition: opacity 0.4s, transform 0.4s;
}
.callout.on { opacity:1; transform:scale(1); }
.callout-label {
  position:absolute; top:-32px; left:0;
  background:#f5a623; color:#0a0e1a;
  font-size:20px; font-weight:800;
  padding:6px 18px; border-radius:4px;
}
```

---

## Prompt Box (AI prompt display)
```css
.prompt-box {
  max-width:1300px;
  border: 2px solid rgba(245,166,35,0.4);
  border-radius: 16px;
  padding: 50px 60px;
  background: rgba(255,255,255,0.03);
  position:relative;
}
.prompt-box::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: linear-gradient(90deg, #f5a623, #00d4ff, #f5a623);
  border-radius: 16px 16px 0 0;
}
```

---

## Analysis Card Grid (proof/output display)
```css
.analysis-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
.analysis-card {
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 14px; padding: 28px 32px;
  opacity:0; transform:translateY(25px);
  transition: opacity 0.5s, transform 0.5s;
}
.analysis-card.on { opacity:1; transform:translateY(0); }
.analysis-card.highlight { border-color:rgba(0,212,255,0.5); box-shadow:0 0 28px rgba(0,212,255,0.18); }
.card-heading { font-size:22px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; color:#f5a623; }
.card-bullets li { font-size:20px; line-height:1.4; display:flex; gap:10px; }
.card-bullets li::before { content:''; width:7px; height:7px; border-radius:50%; background:#00d4ff; flex-shrink:0; margin-top:8px; }
```

---

## Privacy / Blur Overlay (for real screenshots)
```css
.priv-bar  { position:absolute; backdrop-filter:blur(22px) saturate(0.2); background:rgba(10,14,26,0.6); z-index:50; }
.priv-face { position:absolute; border-radius:50%; backdrop-filter:blur(28px) saturate(0.3); background:rgba(10,14,26,0.45); z-index:50; }
```
Always verify overlay positions by extracting a frame and checking pixel coordinates.

---

## Avatar PIP Spec (INTRO/OUTRO)

### Layout
- Size: **320×180** (16:9, shows full avatar frame)
- Position: **upper-right** — `x=1560, y=40` (40px from right edge, 40px from top)
- Border: gold `#f5a623`, 3px, via `drawbox=x=1557:y=37:w=326:h=186:color=#f5a623@0.85:t=3`

### ffmpeg PIP command
```bash
ffmpeg -i background.mp4 -i heygen-avatar.mp4 \
  -filter_complex \
  "[1:v]scale=320:180[pip];
   [0:v][pip]overlay=1560:40[ov];
   [ov]drawbox=x=1557:y=37:w=326:h=186:color=#f5a623@0.85:t=3[v]" \
  -map "[v]" -map "1:a" -shortest \
  -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k \
  output-pip.mp4 -y
```

### Background composition structure (3 beats in 30s)
- Beat 1 (0–6s): Name / title card — who is this person
- Beat 2 (6–17s): Authority credentials — why trust them (stats, institutions)
- Beat 3 (17–29s): Core value prop — what they teach / CTA

---

## Audio Mix Formula (MANDATORY)

```bash
# Step 1: Trim narration — 0.5s AFTER last word (verify with Whisper)
ffmpeg -i narration.m4a -t TRIM_POINT -c copy /tmp/narration-trimmed.m4a -y

# Step 2: Mix — narrator 3.0x, music 0.02, normalize=0
ffmpeg -i /tmp/narration-trimmed.m4a \
  -i assets/background-music-heygen-royalty-free.mp3 \
  -filter_complex \
  "[0]volume=3.0[n];[1]volume=0.02,atrim=0:TRIM_POINT[m];[n][m]amix=inputs=2:duration=first:normalize=0" \
  /tmp/audio-mixed.aac -y

# VERIFY before continuing:
ffmpeg -i /tmp/audio-mixed.aac -af "volumedetect" -f null - 2>&1 | grep max_volume
# Must be ≥ -6 dBFS. If lower → increase narrator volume multiplier.

# Step 3: Loudnorm at -14 LUFS (hotter than broadcast standard — more audible)
ffmpeg -y -i assembled.mp4 \
  -af "loudnorm=I=-14:LRA=11:TP=-1.0" \
  -c:v copy -c:a aac -b:a 192k final.mp4
```

---

## Final Assembly Formula

```bash
ffmpeg \
  -i intro-pip.mp4 \
  -i middle-normed.mp4 \
  -i outro-pip.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k \
  assembled-raw.mp4 -y

# Always loudnorm the full assembled video:
ffmpeg -y -i assembled-raw.mp4 \
  -af "loudnorm=I=-14:LRA=11:TP=-1.0" \
  -c:v copy -c:a aac -b:a 192k assembled-final.mp4

# Ship check:
ffmpeg -i assembled-final.mp4 -af "volumedetect" -f null - 2>&1 | grep max_volume
# Must be ≥ -6 dBFS

ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1 assembled-final.mp4
# Must equal: intro_dur + middle_dur + outro_dur (within ±0.5s)
```

---

## What Made This A+

1. **Whisper-anchored timing** — every section appears exactly when the narrator says it
2. **Spring physics entrances** — `cubic-bezier(0.34,1.56,0.64,1)` on all hero elements
3. **Typewriter effect** for AI prompts — builds suspense, matches reading pace
4. **Real data** in score table — Photo 7, About 8, Activity 6.5 (not generic placeholders)
5. **Privacy-first** — blur overlays on all personal info in screenshots
6. **Calculating spinner** — 4.9s of animation while AI "thinks" = high perceived value
7. **Gold glow on stats** — `text-shadow: 0 0 40px rgba(245,166,35,0.65)`
8. **Analysis card reveal** — 4-card grid, staggered, with cyan highlight on "Best Approach"
9. **PIP avatar** — small, professional, doesn't compete with the content
10. **CTA continuity** — `practical-ai-skills-iq.netlify.app` appears in both middle and outro

---

## Reuse Checklist for New Videos

When starting a new video using this template:

- [ ] Copy `composition/index.html` → new project folder, replace all content
- [ ] Copy `intro-bg.html` → adapt Beat 1/2/3 to new topic
- [ ] Copy `outro-bg.html` → adapt CTA URL and class/product name
- [ ] Run Whisper on narration → rebuild `T` object from real timestamps
- [ ] Run 3-agent QA before any render
- [ ] Verify `max_volume ≥ -6 dBFS` before shipping
- [ ] Extract frame at 5s → confirm avatar is PIP (not full-screen)
