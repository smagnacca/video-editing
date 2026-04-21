# Video Production Design Specification
**Project:** Scott Magnacca Video Pipeline  
**Last Updated:** 2026-04-07  
**Applies to:** All videos in this project and any new video projects in Claude Code / Cowork

---

## 1. Brand Identity

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0a0e1a` | Primary background (navy) |
| `bgDark` | `#050505` | Deep black for high-contrast scenes |
| `cyan` | `#00d4ff` | Primary accent, kinetic text, links |
| `gold` | `#f5a623` | Emphasis words, pulse moments, CTA highlights |
| `orange` | `#ff6b35` | Secondary accent, heat/energy |
| `white` | `#ffffff` | Body text, headings |
| `textSecondary` | `#a0aec0` | Subtitles, descriptions |
| `green` (brand) | `#005A3B` | Borders, underlines, SVG accents ONLY — never for text on dark bg |
| `greenLight` | `#00804F` | Hover states, subtle glows |
| `cardBg` | `rgba(255,255,255,0.05)` | Glassmorphism card backgrounds |

### Typography
- **Primary:** Inter / -apple-system / BlinkMacSystemFont (system sans-serif)
- **Accent:** Georgia, serif (for pull quotes)
- **Min font size for interactive/key content:** 36px rendered
- **Heading size:** 64–80px
- **Body:** 38–44px
- **Labels/eyebrow:** 24–30px, `letterSpacing: 4–6`, `textTransform: uppercase`

---

## 2. Visual Style Principles

### Dark Background Rule
All videos use a dark navy/black background (`#0a0e1a` or `#050505`). This means:
- **Text must be light** (white, cyan, gold) — never dark green on black
- **B-roll goes in a framed side-by-side player** — never as an opacity overlay (invisible on dark bg)
- **Glow effects add depth** — use `textShadow` for emphasis, `boxShadow` for cards

### Emphasis Color Hierarchy
1. **Gold `#f5a623`** — highest emphasis: numbers, "the most important idea", CTA, pulse moments
2. **Cyan `#00d4ff`** — secondary emphasis: supporting ideas, links, kinetic text headers
3. **White `#ffffff`** — body text, narrative statements
4. **Grey `#a0aec0`** — subtitles, descriptors, secondary info
5. **`#005A3B` green** — NEVER use for text that needs to be read. Borders/lines/SVG accents only.

### Contrast Rule
All text must pass WCAG AA (4.5:1 minimum). Key combos:
- White on `#0a0e1a` ✅
- `#f5a623` gold on `#0a0e1a` ✅
- `#00d4ff` cyan on `#0a0e1a` ✅
- `#005A3B` dark green on black ❌ — fails, invisible

---

## 3. Animation Standards

### Entrance Animations
All key elements use spring physics entrance:
```tsx
const entrance = spring({ frame: Math.max(0, frame - delay), fps,
  config: { damping: 14–18, stiffness: 70–100 } });
// Apply: opacity: entrance, translateY: interpolate(entrance, [0,1], [30,0])
```

### Emphasis Pulse (single use)
For critical lines the narrator delivers emotionally:
```tsx
// One pulse (scale 1→1.06→1 over 40 frames) — NEVER loop
transform: `scale(${1 + Math.sin(((frame - delay) / 40) * Math.PI) * 0.06 *
  (frame > delay && frame < delay + 40 ? 1 : 0)})`
```

### Crossfade Transitions
Between any two sub-scenes: 30-frame (1s) opacity crossfade. Never hard cuts on dark-background compositions.
```tsx
const fadeOut = interpolate(frame, [TRANSITION-15, TRANSITION+15], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fadeIn  = interpolate(frame, [TRANSITION-15, TRANSITION+15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
```

### Typewriter Text
For reveal moments timed to narration:
```tsx
<TypewriterText text="The real question is..." color="#f5a623" fontSize={52} startFrame={X} />
// Component: remotion-project/src/components/TypewriterText.tsx
```

### Kinetic Text
For scene-title punch moments. Use solid color + glow. **NO `WebkitBackgroundClip: 'text'`.**
```tsx
<KineticText text="YOUR MESSAGE" color={COLORS.cyan} delay={X} duration={180} glow />
```

---

## 4. Layout Standards

### Safe Zone
Keep all text and key visuals within a **1760×940 safe zone** (centered in 1920×1080). Nothing important closer than 80px from any edge.

### Side-by-Side Layout
When avatar + content appear together:
- Left panel: 50% width, content/text
- Right panel: 50% width, avatar or B-roll player
- Avatar: always right side, explicit px dimensions (NOT objectFit)
- B-roll: framed player with gold/cyan border, `overflow: hidden`, explicit px dimensions

### Card Constraints
- Max card width: **700px** (prevents off-screen clipping at 1920×1080)
- Must always be centered: `marginLeft: 'auto', marginRight: 'auto'` OR `left: '50%', transform: 'translateX(-50%)'`
- Never use raw `left: X` pixel offset without centering strategy

### SVG Content
- `fontSize` must yield ≥ 20 screen pixels. Formula: `screen_px = (fontSize / viewBoxWidth) × rendered_svg_width`
- Prominent labels: ≥ 36px screen
- Graphical spans: ≥ 20% of viewBox width to be visible
- Pre-render scan: `grep -n "fontSize={[0-9]\b\|fontSize={1[0-9]}" remotion-project/src/*.tsx`

---

## 5. Scene Architecture

### Standard Scene Types
| Type | Duration | Components |
|------|----------|-----------|
| HOOK | 20–35s | Large title, animated background, particle field, kinetic text reveal |
| ARCHETYPE | 40–60s | Number badge, glassmorphism card, B-roll side-by-side, kinetic text |
| BRIDGE | 20–30s | Multi-card summary, gold circle markers, green checkmarks, kinetic sequence |
| CTA | 15–25s | URL display, bouncing arrow, QR code, pulsing glow, tagline |

### Transition Bridge Between Intro and Scene 1
**Every video must have visual content within the first 3 seconds of composition start.** If Scene 1 has a slow fade-in, add timed text overlays synced to the audio narration to fill the gap. Never deliver a video where the first 6 seconds post-intro-splice is black/dark.

### Side-by-Side Content Rule
When a side-by-side layout follows a single-panel segment, the LEFT panel must show NEW narrative content — not a repeat of the previous segment. Use Whisper timestamps to sync replacement text to exact narration cues.

---

## 6. Audio Production Standards

### Voice
- Engine: **Edge TTS — en-US-AndrewMultilingualNeural**
- Rate: `+12%`
- Pitch: `-2Hz`
- API: `edge_tts.Communicate(text, voice, rate, pitch).save(path)` — never CLI (timeouts on long narrations)

### Banned Words (garbles in TTS)
`charts, flawless, sharp [before consonant], jargon, buzzwords`
→ Replacements: graphs/data, crisp/clean, polished, fluff/noise, fluff/hype

### Verification Protocol
1. Generate audio
2. Run Whisper word-level transcription
3. Compare against script — fix any garbled words
4. Run silence detection to find scene boundary gaps
5. Only then embed in composition

### Script Version Control
- Markdown script (.md) = source of truth for CONTENT
- Python TTS script (.py) = source of truth for AUDIO TEXT
- These can diverge — always rewrite TTS text fresh from markdown. Add `assert` checks for key phrases.

---

## 7. Intro/Outro System

### Current Reusable Assets
- **Intro:** `assets/New Intro-2026-04-07.mp4` (23.06s, 1920×1080, 30fps)
- **Outro:** `assets/New Outro-2026-04-07.mp4` (21.48s, 1920×1080, 30fps)

### Outro Config for Generic Use
In `Root.tsx → GenericOutroComposition`:
- `kineticText: ''` — leave blank for generic reuse
- `ctaHeadline`, `ctaDescription`, `ctaButtonText` — set per video
- Never leave a previous video's kinetic text in this shared composition

### Splice Formula
```
Final video = New Intro (23s) + Content middle (trimmed) + New Outro (21.5s)
```
Always trim BOTH ends of content videos. Inspect frames at t=0 and t=final of content to find exact baked-in intro/outro boundaries.

---

## 8. Render & Splice Checklist (run for every video)

### Pre-render
- [ ] `node --check` on all modified .tsx files
- [ ] SVG fontSize scan: no fontSize < 20 screen pixels
- [ ] Audio verified with Whisper
- [ ] Scene timing constants match audio silence gaps
- [ ] `kineticText: ''` in GenericOutroComposition (if using generic outro)

### Post-render, pre-splice
- [ ] Extract frame at t=5s of composition — is there visible content?
- [ ] Extract frame at t=outro_boundary − 5s — confirm no baked-in outro
- [ ] Check composition duration matches expected (`ffprobe duration`)

### Post-splice
- [ ] Output duration = intro + content + outro ±2s
- [ ] Frame at t=24s: content visible (not black)
- [ ] Frame at t=outro_start: outro starts correctly
- [ ] Frame at t=total−5s: outro ends cleanly (no abrupt freeze)
- [ ] No text clipped at any key frame
- [ ] Audio clean at all major narration moments (spot-check with silence detection)

---

## 9. File Naming Convention

```
[topic-slug]-[date]-final.mp4           # e.g. 3-types-of-people-4.7.26-final.mp4
[topic-slug]-[date]-v2-final.mp4        # after a fix pass
[topic-slug]-[date]-v[N]-final.mp4      # subsequent passes
```

Only the latest `-final.mp4` should exist in `output/`. All prior versions deleted after approval.

---

## 10. Cross-Project Applicability

These standards apply to **any video, animation, or audio production work** across:
- This project folder (`Cowork-video-editing project`)
- Any future Cowork or Claude Code project involving video
- Any HTML/web animations that share design tokens (colors, fonts, animation timing)

Before starting any new video, verify: colors match brand palette, emphasis words use gold not green, all animations use spring physics or crossfades, cards are centered with max 700px width, and audio has been Whisper-verified.
