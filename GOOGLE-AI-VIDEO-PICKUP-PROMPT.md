# Pickup Prompt — Remotion Promo Video Pipeline
# For use with any AI assistant (Google Gemini, AI Studio, Claude, etc.)

Paste this entire document into your AI assistant, then add your 3 inputs at the bottom.

---

## What I want you to build

A professional, kinetic-text promo video using **Remotion** (React/TypeScript, 30fps, 1920×1080). The visual style is: pure black background, floating white particle starfield, gold/white/cyan typography, spring-animated text builds, stat cards with count-up numbers, popup impact phrases, and a centered event card at close.

I will record my own narration audio. You will generate the script for me to read, process it with ffmpeg + Whisper, and build the full Remotion composition. You will run 3 parallel QA checks before showing me the output. I expect A-quality on the first attempt with no rework.

---

## Tech stack

- **Remotion v4** — React/TypeScript video framework
- **ffmpeg** — audio normalization, frame extraction for QA
- **Whisper (medium model)** — word-level timestamps for scene sync
- **Node.js / npm** — standard

---

## My 3 inputs (fill these in)

```
TOPIC: [What are you promoting? e.g. "LinkedIn sales training webinar"]
DURATION: [Target length in seconds, default 90]
CTA: [What should viewers do? e.g. "Register at myevent.netlify.app"]
```

---

## Script format to generate

Build a narration script in this exact table format. Each row is a scene.

```markdown
| Time | Visual Description | Narration |
|------|-------------------|-----------|
| 0–6s | Opening stat card slides in from left: "[STAT]% of [audience] [problem fact]" | "[first line]" |
| 6–14s | Text builds word-by-word center screen | "[problem reframe — 2-3 short sentences]" |
| 14–22s | Line 1: "[old belief]" → red strikethrough. Line 2 fades gold: "[new truth] USING AI." | "[contrast reframe]" |
| 22–32s | Two stat cards slide in: [STAT1]% [fact]. [STAT2]% [fact]. Small source text. | "[proof stats with sources]" |
| 32–44s | Stacked word reveal: "THE" (white flash) / "[PRODUCT NAME]" (gold 134px) / "[SUBTITLE]" (white 103px). Then ONE / [WORD] / [WORD] appear under. | "[product name + one-line value prop]" |
| 44–62s | Three content cards slide in sequentially. Each has: badge (gold uppercase), headline (white→gold), description (gray). | "[3 benefit sections, ~20 words each]" |
| 62–73s | Three testimonial lines appear: name (gold) + outcome (white) | "[3 social proof outcomes — real or representative]" |
| 73–84s | Centered bordered event card: title / date-time / format+seats | "[event details]" |
| 84–90s | URL types on in gold monospace. "Reserve Your Spot" pulses gold. | "[CTA sentence with URL]" |
```

**Script writing rules:**
- Short punchy sentences. ≤12 words per sentence at key moments.
- Conversational, not corporate — reads aloud naturally
- Stat sources must be real and citable (shown in small gray text on card)
- Gold moments: 1-2 peak sentences that animate large in gold text
- Hook in first 3 seconds: stat, bold claim, or provocative question

---

## Recording instructions (for me)

After you generate the script:
1. I'll record in a quiet room, phone close to mouth
2. Conversational pace — not presenting, just talking
3. 0.5s pause before key stats and the CTA
4. One take, save as .m4a or .mp3
5. I'll drop the file into `assets/narration-raw.mp3`

---

## Audio processing (run after I deliver the file)

```bash
# 1. Trim leading silence
ffmpeg -ss 0.74 -i assets/narration-raw.mp3 assets/narration-trimmed.mp3

# 2. Normalize to broadcast standard
ffmpeg -i assets/narration-trimmed.mp3 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,highpass=f=80" \
  assets/narration-clean.mp3

# 3. Generate word-level timestamps
whisper assets/narration-clean.mp3 --model medium \
  --word_timestamps True --output_format json
# → saves narration-clean.json with per-word timestamps

# 4. Verify transcript matches script (spot check 5 words)
whisper assets/narration-clean.mp3 --model medium --output_format txt
```

Convert Whisper timestamps to Remotion frame numbers:
```
globalFrame = Math.round(whisperTimestampSeconds * 30)
localFrame = globalFrame - sequenceStartFrame
```

---

## Remotion project setup

```bash
cd "/Users/scottmagnacca/Documents/Claude/Projects/Video editing"
npx create-video@latest [project-name] --template blank
cd [project-name] && npm install

# Copy audio files
cp assets/narration-clean.mp3 public/audio/narration-clean.mp3
cp assets/background-music.mp3 public/audio/background-music.mp3
```

---

## Component library (build these in src/components/)

### 1. ParticleField.tsx
Animated SVG starfield. 55 white dots, slow drift, opacity 0.35. Uses `useCurrentFrame()` for drift math.

### 2. StatBlock (inline in main composition)
Count-up number. Rules:
- NO `<Sequence>` wrapper — use `useCurrentFrame()` directly
- `const localF = Math.max(0, frame - countDelay)`
- 90-frame duration with quadratic ease-in-out
- `minHeight: 115px` on number container (prevents layout shift)
- Number: 100px gold `#f5a623` with glow
- Label: 22px white uppercase below
- Source: 13px italic gray below that

### 3. PopupPhrase (inline or component)
Full-screen impact moment:
```tsx
const PopupPhrase = ({ text, startAt, duration=58, color='#00d4ff', size=84 }) => {
  const frame = useCurrentFrame(); // local frame (inside Sequence)
  const lf = frame - startAt;
  if (lf < 0 || lf >= duration) return null;
  const en = spring({ frame: Math.max(0, lf), fps, config: { damping: 10, stiffness: 140 } });
  const fadeOut = interpolate(lf, [duration-14, duration], [1, 0], { extrapolateLeft:'clamp', extrapolateRight:'clamp' });
  return (
    <AbsoluteFill style={{ background:'#000', display:'flex', justifyContent:'center', alignItems:'center', zIndex:10 }}>
      <div style={{ fontSize:size, fontWeight:900, color, textTransform:'uppercase',
        letterSpacing:6, opacity: en * fadeOut,
        transform: `scale(${interpolate(en,[0,1],[0.55,1])})`,
        textShadow: `0 0 40px ${color}80` }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

Color progression for 3 popups: cyan `#00d4ff` → white `#ffffff` → gold `#f5a623`

### 4. FrameworkCard.tsx
Left-accent-bar content card:
- Width: 1100px
- Background: `rgba(20,20,20,0.95)`, border: `1px solid rgba(245,166,35,0.2)`, borderRadius: 12
- Left accent bar: 6px wide, `#f5a623`, glow
- Badge: 18px, gold, uppercase, letterSpacing 3
- Headline: 38px, 800 weight — starts white, transitions to gold as narrator speaks it
- Description: 24px, `#aaaaaa`
- Entrance: `translateX` spring from x:500 → 0

White→Gold headline transition:
```tsx
const hlFrame = Math.max(0, frame - delay - 15);
const hlProgress = interpolate(hlFrame, [0, 20], [0, 1], { extrapolateLeft:'clamp', extrapolateRight:'clamp' });
const headlineColor = `rgb(${Math.round(255+(245-255)*hlProgress)},${Math.round(255+(166-255)*hlProgress)},${Math.round(255+(35-255)*hlProgress)})`;
```

### 5. TestimonialLine.tsx
- Quote mark: 48px, `rgba(245,166,35,0.4)`
- Quote text: 38px, white, maxWidth 1100
- Attribution: gold bar (40×2px) + name (26px gold) + title (20px gray) + gold bar
- Entrance: translateY from 50 → 0, spring

### 6. EventCard.tsx
Centered bordered panel:
- Width: 820px, padding: 56px 72px
- Background: `rgba(10,10,10,0.95)`
- Border: `1px solid rgba(245,166,35,${borderGlow})` where borderGlow oscillates with `Math.sin(frame * 0.05) * 0.15`
- boxShadow: `0 0 60px rgba(245,166,35,0.1), 0 20px 60px rgba(0,0,0,0.5)`
- Eyebrow: 18px gold uppercase, letterSpacing 4
- Title: 62px Georgia serif italic, gold, textShadow glow
- Subtitle: 34px white, fontWeight 600
- Details: 26px gray, uppercase, letterSpacing 2

### 7. SlideIn / FadeIn helpers (inline)
```tsx
const FadeIn = ({ delay=0, children, style }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const en = spring({ frame: Math.max(0, frame - delay), fps, config: { damping:18, stiffness:90 }});
  return <div style={{ opacity: en, transform: `translateY(${interpolate(en,[0,1],[28,0])}px)`, ...style }}>{children}</div>;
};

const SlideIn = ({ delay=0, from='left', children, style }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const en = spring({ frame: Math.max(0, frame - delay), fps, config: { damping:20, stiffness:80 }});
  const offset = interpolate(en, [0,1], [from==='right'?500:-500, 0]);
  return <div style={{ transform: `translateX(${offset}px)`, opacity: en, ...style }}>{children}</div>;
};
```

### 8. SpeakerOval (inline)
Bottom-right oval headshot, fades in after first line, gentle float:
```tsx
// Position: absolute, bottom: 40, right: 40
// Oval: width:200, height:140, borderRadius:'50%', border:'2px solid #f5a623'
// Float: top offset = Math.sin(frame * 0.025) * 4
// Label: name below oval in 14px white + 11px gold subtitle
```

Speaker headshot: `public/scott-headshot.jpg`

---

## Main composition structure

```tsx
// src/MyVideo.tsx — skeleton
export const MyVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {/* Audio */}
      <Audio src={staticFile('audio/narration-clean.mp3')} volume={0.75} />
      <Audio src={staticFile('audio/background-music.mp3')} volume={0.1} />

      {/* Persistent starfield */}
      <ParticleField color="#ffffff" count={55} seed={99} intensity={0.35} />

      {/* Scene 1 — f0 → fSCENE2_START */}
      <Sequence from={0} durationInFrames={SCENE2_START}>
        {/* StatBlock + WordReveal + SpeakerOval */}
      </Sequence>

      {/* Scene 2 — problem */}
      <Sequence from={SCENE2_START} durationInFrames={SCENE3_START - SCENE2_START}>
        {/* FadeIn text builds */}
      </Sequence>

      {/* Scene 3 — strikethrough + popups */}
      <Sequence from={SCENE3_START} durationInFrames={SCENE4_START - SCENE3_START}>
        {/* Strikethrough (local frame), PopupPhrases */}
      </Sequence>

      {/* ... continue for each scene */}
    </AbsoluteFill>
  );
};
```

**CRITICAL local frame rule:**
```tsx
// Inside <Sequence from={547}>:
const sLocal = frame - 547; // MUST subtract
// Sub-components (FadeIn, SlideIn) get local frame automatically via Remotion context
```

---

## Audio mix (mandatory — do not change)

```tsx
<Audio src={staticFile('audio/narration-clean.mp3')} volume={0.75} />
<Audio src={staticFile('audio/background-music.mp3')} volume={0.1} />
```

---

## Typography standards (1920×1080)

| Element | Min Size |
|---------|----------|
| Hero hook / scene title | 65–70px |
| Body narration text | 50–62px |
| Stacked reveal words (product name) | 134px |
| Title flash word (THE, etc.) | 62–70px |
| Stat numbers (count-up) | 100px |
| Framework card headline | 38px |
| Framework card description | 24px |
| Testimonial quote | 38px |
| Event card title | 62px |
| URL typewriter | 43px |
| Stat labels | 22px uppercase |
| Source citations | 13px italic |

**When in doubt — go BIGGER.**

---

## Render

```bash
# rsync to /tmp to avoid EPERM on workspace mounts
rsync -a [project-name]/ /tmp/[project-name]/
cd /tmp/[project-name]
npx remotion render --concurrency=2 MyVideo /tmp/output.mp4

# Copy to output folder
cp /tmp/output.mp4 "/Users/scottmagnacca/Documents/Claude/Projects/Video editing/output/[video-name]-v1.mp4"
```

---

## 3-Agent QA (run all three in parallel after render)

### Agent 1 — Audio Narration QA
Check: tone matches audience and script energy, tempo paced not rushed, pauses before stats/CTA, no filler artifacts, LUFS -16 to -22.
```bash
ffmpeg -i output.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | grep input_i
```
Pass: -16 to -22 LUFS, true peak < -1.5 dBTP

### Agent 2 — Graphic Design & Visual Effects QA
Extract frames at peak of every scene:
```bash
for t in 3 11 16 20 23 25 27 36 44 50 57 67 75 82 88; do
  ffmpeg -y -ss $t -i output.mp4 -frames:v 1 /tmp/qa_$t.jpg 2>/dev/null
done
# Also extract +0.3s offset for popup animations (spring starts at opacity 0 at frame 0)
```
Check: no text overlap, correct colors, nothing clipped, gold on emphasis only, popup phrases visible, stat cards readable.

### Agent 3 — Audio-Visual Timing Accuracy QA
Check: stats appear when narrator says the number, strikethrough draws on "replaced"-type words, popups echo narration within 0.5s, CTA URL types when narrator says URL.
Count-up check: extract 3 consecutive frames during first 3s of each stat card — numbers must be different at each frame.

**Fix any issues before releasing. Then do your own independent QA pass.**

---

## Output

```bash
cp /tmp/output.mp4 "/Users/scottmagnacca/Documents/Claude/Projects/Video editing/output/[video-name]-FINAL.mp4"
```

---

## Pre-draft checklist (before writing a single line of code)

- [ ] Topic, duration, CTA confirmed
- [ ] Script generated and shown to me for approval
- [ ] Narration recorded and processed
- [ ] Whisper timestamps converted to frame numbers
- [ ] Narrator 0.75 / Music 0.1
- [ ] All text sizes per table above
- [ ] Gold used only on peak moments
- [ ] Count-up stats: no Sequence wrapper, 90-frame duration
- [ ] Strikethrough: 12px, local frame, gradient + glow
- [ ] Popup phrases: black screen, spring scale 0.55→1, cyan→white→gold
- [ ] Stacked reveals: 134px+
- [ ] QA frame extraction plan ready

---

## Known gotchas (memorize these)

1. **rsync first** — never render directly on workspace mount (EPERM)
2. **Spring frame boundary** — popup QA frames at exact seconds are black (spring opacity ≈ 0 at lf=0). Extract at t+0.3 to see actual peak.
3. **Local vs global frame** — inline math inside `<Sequence from={N}>` must subtract N. Components using `useCurrentFrame()` internally get local frame automatically.
4. **Count-up: no Sequence** — `const localF = Math.max(0, frame - countDelay)` inside the stat component
5. **Strikethrough height: 12px minimum** — 5px is invisible at 1080p
6. **FadeIn transform conflict** — wrap positioned elements in outer div, don't pass `transform` through style prop to FadeIn
7. **Music in both locations** — `assets/background-music.mp3` AND `public/audio/background-music.mp3`
8. **Gold pulse formula** — `const glow = 20 + Math.sin(localFrame * 0.25) * 15`
9. **White→Gold transition** — `rgb(${255+(245-255)*p}, ${255+(166-255)*p}, ${255+(35-255)*p})`

---

## My 3 inputs — fill these in before starting

```
TOPIC: 
DURATION: 90 seconds
CTA: 
```

Start by generating the script. Show it to me before touching any code. I'll record narration and drop the file. Then build the full composition and run all 3 QA agents before showing me the video.
