# Standardized Video Script Format

Write scripts in this format so the orchestrator can automatically parse scenes, generate TTS, detect timestamps, and render the video.

---

## Format Rules

1. **Title**: First `# heading` becomes the video title
2. **Scenes**: Each `## SCENE` block defines a scene with a type marker
3. **Scene types**: `HOOK`, `ARCHETYPE`, `BRIDGE`, `CTA`, `MONTAGE`, `QUOTE`
4. **Narration**: Lines inside `> ` blockquotes are the spoken narration (sent to TTS)
5. **Visual notes**: Lines in `**[Visual: ...]**` are visual direction (not spoken)
6. **Kinetic text**: Lines in `**[Kinetic: "TEXT" color=cyan]**` define the punch text
7. **B-roll**: Lines in `**[B-roll: filename.mp4]**` assign B-roll to that scene
8. **Config overrides**: YAML frontmatter sets video-level defaults

---

## Template

```markdown
---
voice: en-US-AndrewMultilingualNeural
rate: "+12%"
pitch: "-2Hz"
fps: 30
width: 1920
height: 1080
style: cinematic-dark
colors:
  bg: "#0a0e1a"
  accent1: "#00d4ff"
  accent2: "#f5a623"
  accent3: "#ff6b35"
cta_url: "scottmagnacca.com"
phonetic:
  Magnacca: "mag-nah-kah"
---

# Video Title Here

## SCENE 1 — HOOK (title: "Your Hook Title")

**[Visual: Dark particle field, geometric nodes connecting]**

> First line of narration here.
> Second line continues the hook.

**[Kinetic: "PUNCH LINE TEXT" color=gold shimmer]**

## SCENE 2 — ARCHETYPE (title: "The Archetype Name" color=cyan icon=believer)

**[Visual: Glassmorphism card with cyan accents]**
**[B-roll: filename.mp4]**

> Number one. The Archetype Name.
> Rest of the narration for this section.

**[Kinetic: "KEY PHRASE" color=cyan]**

## SCENE 3 — BRIDGE (title: "Connecting Theme")

**[Visual: Three cards appear in a row]**

> Narration that ties the archetypes together.

**[Kinetic: "WORD1" color=cyan → "WORD2" color=gold → "WORD3" color=orange]**

## SCENE 4 — CTA

**[Visual: Clean dark background, URL fades in]**

> Your call to action narration.

**[Kinetic: "scottmagnacca.com" color=cyan]**
```

---

## Scene Type Reference

### HOOK
Opening scene. Big title, particle field, sets the tone.
- No B-roll
- Kinetic text appears late as punctuation

### ARCHETYPE
The workhorse scene — a titled card with icon, subtitle, B-roll support.
- **Required**: `title`, `color` (accent color name or hex)
- **Optional**: `icon` (believer/peer/coach/custom), `subtitle` (override)
- B-roll appears side-by-side (card shifts left)
- Kinetic text at ~80% through scene

### BRIDGE
Synthesis/connecting scene. Shows multiple cards or a unifying message.
- Supports multi-word kinetic text sequences (use `→` separator)
- Higher particle intensity

### CTA
Call-to-action closer. URL display with glow, tagline.
- Short scene, holds 5s past audio end
- Auto-uses `cta_url` from frontmatter

### MONTAGE
A scene with multiple short clips or images. No card.
- Uses full-width B-roll with text overlay

### QUOTE
A single powerful quote with attribution.
- Perspective fold effect from Visual Effects toolkit
- Attribution text below

---

## Marker Phrases for Scene Detection

The orchestrator uses Whisper to find these phrases in the audio to set exact frame boundaries. Each ARCHETYPE scene should start with a numbered intro:

- "Number one" → start of first archetype
- "Number two" → start of second archetype
- "Number three" → start of third archetype
- (etc.)

For BRIDGE scenes, start with a clear transition phrase.
For CTA scenes, start with the closing hook phrase.

The orchestrator will detect these automatically from the narration text.
