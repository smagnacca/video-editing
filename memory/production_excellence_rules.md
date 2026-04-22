---
name: Production Excellence Rules — First-Render Quality Standards
description: All design, animation, layout, audio alignment, and QA rules distilled from ClaudeCoworkSalesVideo v5. Apply these on Draft 1 to achieve zero rework.
type: project
---

# Production Excellence Rules
## Distilled from ClaudeCoworkSalesVideo v5 — April 2026

These rules are validated. Every item below was tested in a real render and confirmed visually correct by Scott. Follow them exactly on the first draft.

---

## 1. LAYOUT — Split-Screen Scenes

Split-screen is the standard layout for feature/archetype scenes (number one, two, three...).

**Column proportions (validated):**
```
Left column:  width: '50%',  paddingLeft: 80
Right column: width: '48%',  padding: '0 8px'
Gap (implicit): 2%
```

**Do NOT use:**
- Left: 55% / Right: 42% — right panel feels too small, visually unbalanced
- Right padding `'0 28px'` — wastes too much space, shrinks the mock UI

**Right panel positioning:**
```tsx
<div style={{ position: 'absolute', top: 0, right: 0, width: '48%', bottom: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
  <SlideIn delay={20} from="right" style={{ width: '100%' }}>
    <MockUIWindow scene={N} localFrame={lf} />
  </SlideIn>
</div>
```

**Left panel positioning:**
```tsx
<div style={{ position: 'absolute', top: 0, left: 0, width: '50%', bottom: 0,
  display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 80, gap: 24 }}>
```

---

## 2. ANIMATION — Voice/Narrator Alignment Rules

**The golden rule: graphics must FOLLOW the narrator, not lead.**

The narrator is the authority. Animations are visual confirmation of what was just said.

### Staggered list timing (strikethrough / bullet reveals)
- **First item**: starts at local frame 110 (~3.7s into scene)
- **Subsequent items**: 40-frame gap between each (1.33s)
- **Standard sequence**: 110 / 150 / 190 / 230 / 270
- **What NOT to do**: Starting at frame 50 (1.67s) — too early, graphics run ahead of narrator

### Scene entrance delay rule
- Scene opens with background + header
- First text element: `FadeIn delay={4}` (appears almost immediately — header/label only)
- First content item: minimum local frame 80–110
- Narration synced items: match Whisper word timestamps from the MP3
- **2-second buffer minimum** between scene start and first animated content item

### Strikethrough animation
```tsx
const strikeDelay = startAt + 40;  // always 40 frames after item appears
const strikeW = interpolate(lf, [strikeDelay, strikeDelay + 20], [0, 100], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
});
// Draw red line: height 6px, gradient #e53e3e→#ff6b6b, boxShadow glow
```

### Spring animations (spr helper)
```tsx
// Standard entrance spring — smooth, not bouncy
const en = spr(lf - startAt, fps, 16, 90);  // stiffness 16, damping 90
// Use for: item reveals, card entrances, stat punch-ins
```

---

## 3. ANIMATION — Kinetic Text Rules

**Gold kinetic text (emphasis moments):**
```tsx
fontSize: 38, fontWeight: 900, color: '#f5a623',
letterSpacing: 2, textShadow: '0 0 30px rgba(245,166,35,0.6)'
```

**Cyan kinetic text (feature headers / CTA):**
```tsx
fontSize: 38, fontWeight: 900, color: '#00d4ff',
letterSpacing: 4, textTransform: 'uppercase',
textShadow: '0 0 30px rgba(0,212,255,0.7)'
```

**White kinetic text (neutral statements):**
```tsx
fontSize: 30, fontWeight: 900, color: '#ffffff',
letterSpacing: 3, textTransform: 'uppercase',
textShadow: '0 0 20px rgba(255,255,255,0.3)'
```

**Timing for kinetic punch lines:**
- Appear at 70–80% through the scene's duration
- Fade in over 30–40 frames
- Hold until scene fadeout begins
- Example: scene duration 666 frames → kinetic at frame 480

**NEVER use:**
- `WebkitBackgroundClip: 'text'` — renders as solid color bars in headless Chrome
- `WebkitTextFillColor: 'transparent'` — same bug
- Use solid `color` + `textShadow` for all glow effects

---

## 4. ANIMATION — List Item Spacing

**Bullet/list item gap (validated):**
```tsx
gap: 16   // tight, centered, professional
```

**Do NOT use:**
- `gap: 28` — too much whitespace, items feel disconnected
- `gap: 36+` — items drift to edges, black gap appears in center of screen

**Centering list content:**
```tsx
display: 'flex', flexDirection: 'column',
justifyContent: 'center', alignItems: 'center', gap: 16
```

---

## 5. AUDIO — TTS Configuration (Edge TTS)

**Validated voice settings:**
```
Voice:  en-US-AndrewMultilingualNeural
Rate:   +12%
Pitch:  -2Hz
```

**Why these settings work:**
- +12% rate: brings 3-min natural speech to ~2.5 min, matches visual scene pacing
- -2Hz pitch: adds authority, reduces synthetic edge
- Andrew Multilingual: clearest diction, best for stats and technical terms

**Banned words (TTS mispronounces or sounds awkward):**
- "charts" → use "reports" or "data"
- "flawless" → use "clean" or "sharp"
- "jargon" → use "buzzwords"
- "seamlessly" → use "instantly" or "in seconds"

**Phonetic overrides in script header:**
```yaml
phonetic:
  Cowork: "co-work"
  Magnacca: "mag-nah-kah"
```

**Audio file naming convention:**
- `[video-name]-clean.mp3` — final approved audio
- `[video-name]-raw.m4a` — original recording
- `[video-name]-normalized.mp3` — ffmpeg loudnorm pass
- NEVER name anything `fixed.mp3` — ambiguous, causes confusion

---

## 6. AUDIO — Whisper Alignment Protocol

Always run Whisper on the final MP3 before building scene timing constants.

```bash
whisper audio/clean.mp3 --model medium --word_timestamps True --output_format json
```

**Scene boundary extraction:**
- Find the EXACT word that triggers each new scene
- Use the `start` timestamp from Whisper JSON
- Convert to frames: `frame = Math.round(timestamp_seconds * fps)`
- Add 2–4 frames of visual lead (show scene just before word lands)

**Verification step:**
- Run Whisper txt output and diff against script
- If >3 words differ → re-generate audio, do not proceed
- If audio says different words than script → narrator or TTS error, fix at source

---

## 7. SCENE STRUCTURE — 9-Scene Standard

For a 2.5–3 min video targeting salespeople or professionals:

```
Scene 1 — HOOK         Stat count-up, provocative number, gold kinetic
Scene 2 — PROBLEM      Strikethrough list of pain points (5 items)
Scene 3 — SOLUTION     Centered reveal, product name lands
Scene 4 — FEATURE 1    Split screen: bullets left, mock UI right
Scene 5 — FEATURE 2    Split screen: prompt/result cards left, mock UI right
Scene 6 — FEATURE 3    Split screen: slash commands left, plugin UI right
Scene 7 — FEATURE 4    Split screen: progress bars left, skill builder right
Scene 8 — BRIDGE       3 glassmorphism cards (less/more/better)
Scene 9 — CTA          Dark centered, typewriter URL, 5+ second hold
```

**Scene duration guidelines (at 30fps):**
- Hook: 400–500 frames (~14s)
- Problem: 600–700 frames (~20s)
- Solution: 350–400 frames (~12s)
- Feature scenes: 600–700 frames each (~20s)
- Bridge: 200–260 frames (~8s)
- CTA: 400–500 frames (~14s)

---

## 8. DESIGN — Color Palette (Locked)

```
Background:     #0a0e1a   (deep navy — never use pure black)
Cyan accent:    #00d4ff   (features, headers, links)
Gold accent:    #f5a623   (emphasis, stats, punch lines)
Orange accent:  #ff6b35   (third option, warnings, energy)
White:          #ffffff   (body text, bullet points)
Grey:           #aaaaaa   (secondary narration text)
Dark grey:      #888888   (scene labels, timestamps)
Red strike:     #e53e3e → #ff6b6b (strikethrough only)
```

**NEVER USE for readable text:**
- `#005A3B` (dark green) — invisible on #0a0e1a background, fails WCAG AA
- Pure `#000000` background — use #0a0e1a instead

---

## 9. DESIGN — Typography

```
Primary font:   -apple-system, sans-serif
Code/mono:      "SF Mono", monospace
```

**Size hierarchy:**
```
Scene label (NUMBER ONE):   18–22px, weight 700, letterSpacing 3–4, uppercase, color: accent
Scene title (Connect Your Inbox): 56–68px, weight 700, white
Body/bullets:   28–32px, weight 600, white
Sub-text:       22–26px, weight 400, #aaaaaa
Kinetic punch:  34–44px, weight 900, gold or cyan
Stat number:    80–144px, weight 900, gold
CTA URL:        60–72px, weight 700, cyan + glow
```

---

## 10. MOCK UI WINDOW — Design Spec

The MockUIWindow is the right-panel visual for all feature scenes. It simulates the Claude Cowork interface.

**Window chrome:**
```tsx
// Title bar
background: '#0e1018', borderBottom: '1px solid rgba(255,255,255,0.07)'
// Traffic lights: red #ff5f57, yellow #febc2e, green #28c840 — 12px diameter, gap 7
// Title text: "Claude Cowork", color: #666, fontSize: 13, centered
```

**Tab bar:** Chat / Cowork / Skills — active tab has cyan underline `#00d4ff`

**Content area:** `background: '#080b10'`, each scene has unique content

**Animation:** Rows appear with `opacity` interpolation, staggered by scene frame

**Scene routing:**
- Scene 4 → Outlook inbox scan (email list with status labels)
- Scene 5 → Pipeline report (prompt → structured output)
- Scene 6 → Plugin library (slash commands)
- Scene 7 → Skill builder (progress bars → "Skill packaged" confirmation)

---

## 11. RENDER PROTOCOL

```bash
# Step 1: rsync to /tmp (CRITICAL — workspace mount has EPERM on render)
rsync -a "/path/to/remotion-project/" /tmp/remotion-render/

# Step 2: render with 2x concurrency
cd /tmp/remotion-render && npx remotion render --concurrency=2 remotion/index.ts CompositionName /output/path/video-vN.mp4

# Entry point is ALWAYS remotion/index.ts (contains registerRoot)
# NEVER use remotion/Root.tsx as entry point — it does not call registerRoot
```

**Output naming:**
```
[topic]-draft.mp4      → first render, rough
[topic]-v2.mp4         → after first round of feedback
[topic]-v5.mp4         → final approved (iterate until clean)
[topic]-final.mp4      → after intro/outro splice, ready to publish
```

---

## 12. INTRO/OUTRO SPLICE

```bash
# Trim content video (remove any accidental double intro/outro)
ffmpeg -ss [content_start] -to [content_end] -i content.mp4 content-trimmed.mp4

# Splice with filter_complex ONLY (concat demuxer causes timestamp drift)
ffmpeg -i intro.mp4 -i content-trimmed.mp4 -i outro.mp4 \
  -filter_complex "[0][1]concat=n=2:v=1:a=1[v01];[v01][2]concat=n=2:v=1:a=1[v]" \
  -map "[v]" -c:v libx264 -c:a aac output-final.mp4
```

**Reusable assets:**
- Intro: `assets/New Intro-2026-04-07.mp4` (23.06s, 1920×1080)
- Outro: `assets/New Outro-2026-04-07.mp4` (21.48s, 1920×1080)
- Update `GenericOutroComposition` CTA text in Root.tsx before rendering outro

---

## 13. PRE-COMMIT QA CHECKLIST

Run this mentally before every git push. 15 seconds. No exceptions.

- [ ] `node --check` or `tsc --noEmit` — zero syntax errors in changed files
- [ ] Kinetic text: no WebkitBackgroundClip anywhere in new code
- [ ] All `startAt` values reviewed against Whisper timestamps
- [ ] Right panel width: 48%, padding: '0 8px'
- [ ] Left panel width: 50%
- [ ] List gap: 16 (not 28+)
- [ ] No `.claude/worktrees/` in `git status` — add to .gitignore if present
- [ ] Audio file named `clean.mp3` (not `fixed.mp3`)
- [ ] CTA URL holds ≥5 seconds before fadeout

---

## 14. WHAT EARNED AN A-GRADE (v5 validated)

These specific choices produced the "this is perfect" result:

1. Strikethrough items start at frame 110 (not 50) — narrator leads, graphics follow
2. Item gap reduced to 16px — text cluster feels tight and intentional
3. Right panel at 48% / 8px padding — fills the frame, feels premium
4. Left panel at 50% — creates genuine breathing room between columns
5. Spring animations with stiffness=16, damping=90 — smooth, not bouncy
6. Andrew Multilingual +12% rate, -2Hz pitch — authoritative, clear, paced
7. Gold glow on punch lines — textShadow not WebkitBackgroundClip
8. 5-item strikethrough list (not 3, not 7) — feels comprehensive but fast
9. Scene 3 "Claude Cowork changes that" lands clean after problem list — emotional reset
10. CTA typewriter at end — URL appears letter by letter, high attention hold

---

*Last validated: 2026-04-22 — ClaudeCoworkSalesVideo v5*
