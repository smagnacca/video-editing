---
name: Video Production Workflow Template — Prompt to Final Video
description: Complete reusable pipeline for producing A-quality promo videos. Intake → Script → Audio → Remotion → QA → Output. First-draft excellence, zero rework goal.
type: project
---

# Video Production Workflow Template

**Purpose:** Drop in any topic, duration, and CTA → get a polished, QA-verified promo video on the first try.

---

## STAGE 0 — INTAKE (Ask these 3 questions first)

```
1. TOPIC: What are you promoting? (product, event, course, service, idea)
2. DURATION: How long? (default: 90 seconds)
3. CTA: What do you want viewers to do? (URL, register, book a call, etc.)
```

Optional refinements to gather:
- Key stats or proof points (numbers anchor credibility)
- Testimonials / social proof (names + outcomes)
- Target audience (who is this for?)
- Tone (urgency vs. inspiration vs. authority)
- Any existing branding (colors, fonts, logo)

---

## STAGE 1 — SCRIPT GENERATION

Claude generates a narration script in this format:

```markdown
## Script — [Title] — [Duration]s

| Time | Visual | Narration |
|------|--------|-----------|
| 0–6s | Opening stat or hook | [narrator line] |
| 6–14s | Problem reframe | [narrator line] |
| 14–22s | Stakes / contrast | [narrator line] |
| 22–32s | Key proof stats | [narrator line] |
| 32–44s | Product/event name reveal | [narrator line] |
| 44–62s | 3 key benefits/sections | [narrator line] |
| 62–73s | Social proof / testimonials | [narrator line] |
| 73–84s | Event/offer details | [narrator line] |
| 84–90s | CTA + URL | [narrator line] |
```

**Script rules:**
- Conversational, not corporate. Read it aloud — does it sound like a human?
- Short punchy sentences. Max 12 words per sentence at key moments.
- Build urgency toward the CTA
- Hook in first 3 seconds (stat, provocative question, or bold claim)
- Gold moments: the one sentence that should animate in large gold text

**Recording instructions for Scott:**
- Quiet room, phone close to mouth
- Read conversationally — not presenting, just talking
- Slight pause (0.5s) before key phrases
- One take straight through; stumbles are fine
- Save as .m4a or .mp3

---

## STAGE 2 — AUDIO PROCESSING

```bash
# 1. Trim leading silence (adjust 0.74 to actual lead-in)
ffmpeg -ss 0.74 -i input.m4a narration-raw.mp3

# 2. Normalize to broadcast standard
ffmpeg -i narration-raw.mp3 -af "loudnorm=I=-16:TP=-1.5:LRA=11,highpass=f=80" narration-clean.mp3

# 3. Generate word-level timestamps for scene boundaries
whisper narration-clean.mp3 --model medium --word_timestamps True --output_format json

# 4. Verify quality
whisper narration-clean.mp3 --model medium --output_format txt
# Review transcript — should match script exactly
```

Save timestamps to `assets/narration-timestamps.json`.

---

## STAGE 3 — REMOTION COMPOSITION

### Project structure

```
my-video-remotion/
├── src/
│   ├── MyVideo.tsx          ← Main composition (scenes + sequences)
│   ├── Root.tsx             ← Registers composition
│   └── components/
│       ├── ParticleField.tsx
│       ├── StatCard.tsx / StatBlock (inline)
│       ├── PopupPhrase.tsx (inline in main)
│       ├── FrameworkCard.tsx
│       ├── TestimonialLine.tsx
│       ├── EventCard.tsx
│       ├── WordReveal.tsx
│       ├── SlideIn / FadeIn (inline helpers)
│       └── SpeakerOval.tsx
├── public/
│   └── audio/
│       ├── narration-clean.mp3
│       └── background-music.mp3
└── assets/
    ├── narration-clean.mp3
    ├── background-music.mp3
    └── narration-timestamps.json
```

### Composition settings (1920×1080, 30fps)

```tsx
// Root.tsx
<Composition
  id="MyVideo"
  component={MyVideoComponent}
  durationInFrames={audioSeconds * 30 + 150} // audio duration + 5s tail
  fps={30}
  width={1920}
  height={1080}
/>
```

### Audio mix (non-negotiable)

```tsx
<Audio src={staticFile('audio/narration-clean.mp3')} volume={0.75} />
<Audio src={staticFile('audio/background-music.mp3')} volume={0.1} />
```

### Component reuse guide

| Scene type | Component | Notes |
|------------|-----------|-------|
| Opening hook stat | `StatBlock` inline | count-up, no Sequence wrapper |
| Problem statement text | `WordReveal` or `FadeIn` | word-by-word or fade |
| Strikethrough contrast | inline with local frame | 12px height, gradient, glow |
| Impact words | `PopupPhrase` | black screen, spring scale, cyan→white→gold |
| Product reveal | stacked word drops | 134px+, spring damping=12, stiffness=120 |
| Title flash word ("THE") | inline burst spring | damping=5, stiffness=250, white glow |
| Content sections | `FrameworkCard` | badge + headline (white→gold) + description |
| Social proof | `TestimonialLine` | name + quote |
| Event details | `EventCard` | centered bordered panel |
| URL close | `Typewriter` | 43px monospace, gold |
| Speaker presence | `SpeakerOval` | bottom-right, fades in after first line |

### Whisper timestamp → scene boundary conversion

```
globalFrame = Math.round(whisperTimestampSeconds * 30)
localFrame = globalFrame - sequenceStartFrame
```

Always add a 2-frame cushion so visuals appear just before the word is spoken.

### Critical: local vs global frame

```tsx
// ✅ Sub-components (FadeIn, SlideIn, etc.) get local frame automatically
// ✅ Inline calculations in parent MUST subtract sequence start:
const s3Local = frame - 547; // ← always subtract
interpolate(s3Local, [22, 42], [0, 100], ...)
```

---

## STAGE 4 — RENDER

```bash
# Always rsync to /tmp first — workspace mount has EPERM
rsync -a my-video-remotion/ /tmp/my-video-remotion/
cd /tmp/my-video-remotion
npx remotion render --concurrency=2 MyVideo /tmp/output.mp4

# Copy to output folder
cp /tmp/output.mp4 "/Users/scottmagnacca/Documents/Claude/Projects/Video editing/output/[video-name]-v1.mp4"
```

---

## STAGE 5 — 3-AGENT QA (always run before showing Scott)

Spin up all three in parallel:

### Agent 1 — Audio Narration QA

Review criteria:
- Tone matches the target audience and energy of the script
- Tempo is paced — not too fast, not monotone
- Pauses before key phrases (gold moments, stats, CTA)
- Inflection rises on questions, drops on authority statements
- No filler words, artifacts, or clipping
- Audio LUFS: -16 to -22 combined (run `ffmpeg loudnorm` check)
- True peak: < -1.5 dBTP
- No silences > 1.0s

```bash
ffmpeg -i output.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | grep input_i
ffmpeg -i output.mp4 -af "silencedetect=noise=-35dB:d=0.5" -f null - 2>&1 | grep silence_duration
```

### Agent 2 — Graphic Design, Animation & Visual Effects QA

Review criteria:
- **Typography:** hero ≥65px, body ≥50px, stacked reveals ≥134px, stat numbers 100px
- **Colors:** gold #f5a623 only on highest-emphasis moments, white for body, gray for secondary
- **No text overlap** — all elements have clear vertical separation
- **Nothing clipped** at screen edges (1920×1080 safe area: 80px margin minimum)
- **Stat cards:** dark bg, gold number, white label, italic source citation
- **Popup phrases:** full black screen, text centered, correct color progression
- **Gold pulse** on emotional peaks (textShadow + scale animation)
- **Strikethrough:** 12px+ height, red gradient, glow visible
- **Scott oval:** bottom-right, gold border, name label visible
- **Framework card headlines:** white→gold transition visible as narrator speaks

Extract frames at peak of each scene for visual check:
```bash
for t in 3 11 16 20 23 25 27 30 36 38 44 50 57 67 75 85 88; do
  ffmpeg -y -ss $t -i output.mp4 -frames:v 1 /tmp/qa_$t.jpg 2>/dev/null
done
```

### Agent 3 — Audio-Visual Timing Accuracy QA

Review criteria:
- Stat card appears within 1 frame of narrator saying the number
- Strikethrough starts when narrator says the word being crossed out
- Popup phrases appear within 0.5s of narrator saying the echoed phrase
- Framework cards slide in when narrator begins describing that section
- CTA/URL typewriter starts when narrator says the URL
- Count-up animation is running (3 different values across 3 frames = ✓)
- Stacked words drop in cadence with narration beats

Check count-up running:
```bash
for t in $(seq START 1 $((START+3))); do
  ffmpeg -y -ss $t -i output.mp4 -frames:v 1 /tmp/countup_$t.jpg 2>/dev/null
done
# Three frames must show 3 different numbers
```

---

## STAGE 6 — FIX AND RE-RENDER

If any agent flags an issue:
1. Identify the specific frame/time where the problem occurs
2. Identify the exact component or inline code responsible
3. Fix surgically (Edit tool, not full rewrite)
4. Re-rsync and re-render
5. Re-extract only the affected QA frames to confirm fix
6. Do NOT re-run full QA if only 1 scene was changed — spot-check only

---

## STAGE 7 — INDEPENDENT CLAUDE QA PASS

Before releasing to Scott, Claude does its own check:
- Read the original script — does the visual structure match every beat?
- Check: is the CTA clear, prominent, and timed correctly?
- Check: does the video end with a strong close (not fade to nothing)?
- Check: is there a visual hook in the FIRST 3 SECONDS?
- Check: are all stats shown with their source citations?
- Audio final listen: narrator volume clearly dominant over music?

---

## STAGE 8 — OUTPUT

```bash
cp /tmp/output.mp4 "/Users/scottmagnacca/Documents/Claude/Projects/Video editing/output/[video-name]-FINAL.mp4"
```

Naming: `[topic-slug]-FINAL.mp4` (no version numbers on the final)

---

## Pre-Draft-1 Checklist (apply before writing a single line of code)

- [ ] Intake complete: topic, duration, CTA confirmed
- [ ] Script approved by Scott
- [ ] Audio recorded and processed to narration-clean.mp3
- [ ] Whisper timestamps generated
- [ ] Narrator volume: 0.75 | Music: 0.1
- [ ] Typography: all sizes per table above
- [ ] Gold used ONLY on peak emphasis moments
- [ ] Count-up stats: no Sequence wrapper, 90-frame duration, local frame
- [ ] Strikethrough: 12px, gradient, animated with local frame
- [ ] Popup phrases: black screen, spring scale 0.55→1, cyan→white→gold
- [ ] Stacked word reveals: 134px+
- [ ] Speaker oval: bottom-right
- [ ] QA frames plan mapped out before render

---

## Typography Reference (1920×1080)

| Element | Size |
|---------|------|
| Hero hook / title flash | 65–70px |
| Body narration text | 50–62px |
| Stacked reveal words | 134–144px |
| Title flash word (THE, etc.) | 60–70px |
| Stat numbers (count-up) | 100px |
| Framework card headline | 38px |
| Framework card description | 24px |
| Testimonial quote | 38px |
| Event card title | 62px |
| URL typewriter | 43px |
| Stat card labels | 22px uppercase |
| Source citations | 13px italic |

**Rule: When in doubt, go BIGGER.**

---

## Color Hierarchy

1. **Gold `#f5a623`** — stats, product name, CTA, "USING AI"-style peaks
2. **Cyan `#00d4ff`** — first popup phrase, secondary impact
3. **White `#ffffff`** — body text, second popup phrase
4. **Gray `#aaaaaa`** — secondary/subtitle text
5. **Red `#e53e3e`** — strikethrough animations ONLY
6. **Never green for text** — invisible on dark backgrounds

---

## Scene Structure Template (90s video)

```
Scene 1 (0–9s):    Opening stat + hook — SlideIn StatBlock, WordReveal
Scene 2 (9–18s):   Problem statement — FadeIn text builds
Scene 3 (18–30s):  Stakes/contrast — strikethrough + PopupPhrases
Scene 4 (30–42s):  Proof stats — 2x StatBlocks with count-up
Scene 5 (42–52s):  Product/event name reveal — stacked words + subtitle words
Scene 6 (52–73s):  3 benefit sections — FrameworkCards with gold headlines
Scene 7 (73–82s):  Social proof — TestimonialLines (sequential)
Scene 8 (82–90s):  Event/offer details — EventCard centered
Scene 9 (90–96s):  CTA close — Typewriter URL + pulsing CTA text
```

Adjust scene durations based on actual Whisper timestamps.

---

## Reusable Spring Configs

```tsx
// Standard entrance
spring({ frame: Math.max(0, lf), fps, config: { damping: 18, stiffness: 90 } })

// Snappy card slide
spring({ frame: Math.max(0, lf), fps, config: { damping: 20, stiffness: 80 } })

// Title flash / burst (THE, DON'T, etc.)
spring({ frame: Math.max(0, lf), fps, config: { damping: 5, stiffness: 250 } })

// Popup phrase
spring({ frame: Math.max(0, lf), fps, config: { damping: 10, stiffness: 140 } })

// Stacked word reveal
spring({ frame: Math.max(0, lf), fps, config: { damping: 12, stiffness: 120 } })
```

---

## QA Frame Extraction Times (90s video)

```bash
for t in 3 11 16 20 23 25 27 30 36 38 44 50 57 67 75 82 88; do
  ffmpeg -y -ss $t -i output.mp4 -frames:v 1 /tmp/qa_$t.jpg 2>/dev/null
done
# Also extract at +0.3s offsets for popup/spring animations (which start at opacity 0)
```

**Important:** Spring animations start at opacity ≈ 0 at frame 0. Always check +0.3s after start time for popups and burst animations, not just the exact second.

---

## Known Gotchas (learned the hard way)

1. **rsync to /tmp before render** — workspace mount has EPERM that silently breaks renders
2. **Spring opacity at frame boundary** — QA frames at exact second boundaries may show black for popup scenes. Check +0.3s offset.
3. **Local vs global frame** — inline calcs inside `<Sequence from={N}>` MUST subtract N. Sub-components are fine.
4. **Count-up: NO Sequence wrapper** — always use `Math.max(0, frame - countDelay)` directly inside the stat component
5. **Strikethrough height: 12px minimum** — 5px is invisible at 1080p
6. **Gold glow pulse formula:** `const glow = 20 + Math.sin(localFrame * 0.25) * 15`
7. **White→Gold color transition:** `rgb(${255+(245-255)*p}, ${255+(166-255)*p}, ${255+(35-255)*p})`
8. **FadeIn transform conflict** — if using absolute positioning around a FadeIn, wrap in outer div; don't pass transform in style prop
9. **Music file must exist in BOTH** `assets/` AND `public/audio/` for Remotion
10. **Trial-era API keys** — if ElevenLabs returns quota error but dashboard shows credits, regenerate the key
