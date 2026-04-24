# Video Editing Project — Scott's Rules

This project consolidates video production knowledge from the Cowork-video-editing project into a single reference.

## Quick Start

**Memory index:** `.claude/projects/.../memory/MEMORY.md`

**Essential docs in this folder:**
- `VIDEO-DESIGN-SPEC.md` — Brand colors, typography, layout, animation rules
- `VIDEO-TEMPLATE.md` — Template for new video scripts
- `SETUP.md` — Remotion project setup and dependencies
- `CHANGELOG.md` — Historical edits and fixes (for learning from past work)

---

## 🚨 MANDATORY SESSION START — READ BEFORE TOUCHING ANY FILE

**This is not optional. Every session starts here. No exceptions.**

### Hard-Stop Rules (Learned from painful rework — do NOT skip)

1. **Avatar = PIP only, NEVER full-screen.** Avatar clips go as small overlays (320×180) in corner. The graphics/animations are the star. Full-screen avatar = immediate rebuild.

2. **No AI clip art.** No brain graphics, no neural network visualizations, no lightning bolts, no generic "AI imagery." Use real business photos, professional infographics, or data charts only. Check every b-roll before using it.

3. **Asset audit FIRST.** Before writing a single line of ffmpeg, list every asset on disk: avatar clips, narration, music, b-roll, headshot. Run: `ls assets/` and verify `/tmp/` files exist. This prevents building the wrong thing.

4. **B-roll images are PIP inserts (640×360, lower-right), not full-frame overlays.** They accent the graphics, not replace them.

5. **Avatar lip-sync note:** The `practical-ai-INTRO/MIDDLE/OUTRO.mp4` clips were recorded for a prior video. Use them as PIP — the lip-sync mismatch is acceptable at small size. If Scott records new narration, flag that new avatar clips are needed.

6. **Music at 0.02 volume, narrator at 0.96.** Always. No exceptions. (Confirmed 2026-04-24: was 0.75, bumped to 0.96 after Scott's explicit request.)

7. **Use FULL authority clips** (Jensen etc.) — never trim mid-thought.

8. **Concat = filter_complex only.** Never concat demuxer. Never.

9. **Render to /tmp first**, then copy to Desktop. Workspace mount has EPERM.

10. **20-minute target.** If a task is taking longer than 5 minutes on any single stage, stop and reassess. Most rework comes from starting without a clear plan.

11. **NO EMOJI as icons.** Zero emoji in video compositions (🧠⚡📚🚀⚙️ etc). All icons must be SVG with geometric shapes and stroke-dashoffset animations. Scott called emoji "cheap and low quality" (AI Buy-Back, 2026-04-24).

12. **Check for Scott's narration FIRST.** Before ANY audio work, look for .m4a/.mp3 uploads in the conversation AND run `ls assets/*.m4a assets/*.mp3`. If Scott recorded his own voice, use it. Never generate TTS when a recording exists.

13. **Never rebuild approved sections.** Once Scott says "X is great" — that part is LOCKED. Only rebuild sections explicitly flagged as problems.

### The 20-Minute Pipeline (follow this order exactly)
1. Asset audit (`ls assets/`, check /tmp/, check for uploaded .m4a) — 2 min
2. Whisper transcription → get word timestamps — 3 min
3. Plan scenes on paper (timestamps, no code yet) — 2 min
4. Build HTML/Remotion composition with timing matched to Whisper VTT seconds — 5 min
5. Render composition to webm/mp4 — 3 min
6. Mix audio: narrator 0.96 + music 0.02 (ffmpeg filter_complex) — 1 min
7. Final concat: intro + jensen + composition + cta — 2 min
8. QA + open for review — 2 min

---

## Before Starting Any Video

1. **Check memory files** — Read `design_standards.md` and `pitfalls.md` for what to avoid
2. **Use the template** — Start with `VIDEO-TEMPLATE.md` for script structure
3. **Brand colors locked:**
   - Emphasis: gold `#f5a623`
   - Secondary: cyan `#00d4ff`
   - Body: white `#ffffff`
   - Background: navy `#0a0e1a`
   - **NEVER dark green `#005A3B` for readable text** (invisible on dark bg)

---

## Video Pipeline (3 Stages)

### Stage 1: Script → Audio
```bash
# Write script in markdown (see VIDEO-TEMPLATE.md)
# Run TTS with Edge (en-US-AndrewMultilingualNeural, +12% rate, -2Hz pitch)
# Verify with Whisper, name clean.mp3
```

### Stage 2: Remotion Composition
- Use Whisper timestamps for scene boundaries
- SVG fontSize ≥20 screen pixels
- No WebkitBackgroundClip, no objectFit
- Reusable intro (23s) and outro (21.5s) from assets/

### Stage 3: FFmpeg Splice
```bash
# filter_complex ONLY (concat demuxer is banned)
ffmpeg -i intro.mp4 -i content.mp4 -i outro.mp4 \
  -filter_complex "[0][1]concat=n=2:v=1:a=1[v01];[v01][2]concat=n=2:v=1:a=1[v]" \
  -map "[v]" -c:v libx264 -c:a aac output-final.mp4
```

---

## Critical Rules (Earned Through Failure)

1. **Never use ffmpeg drawbox for SVG erasing** → Fix source, re-render
2. **filter_complex ONLY for concat** → concat demuxer causes timestamp drift
3. **Audio file names must be explicit** → `clean.mp3` or `garbled.mp3`, never `fixed.mp3`
4. **Whisper-verify every audio** → Filename alone is not proof of quality
5. **Trim content before splice** → Prevent double intros/outros
6. **Dark green ONLY on borders/SVG** → Never use for readable text (fails contrast)
7. **Visual content in first 3 seconds** → Add narration-synced overlays if slow fade-in
8. **rsync to /tmp before Remotion render** → Workspace mount has EPERM

---

## Two Video Pipelines Available

This project now has access to TWO complete professional pipelines:

### 1. Remotion (Existing) — React/TypeScript-based
- ✅ Reusable intro/outro, full design spec, 8 documented fixes
- Best for: Complex logic, data-driven visuals, component reuse
- Workflow: Script → TTS → Remotion composition → Splice → Final

### 2. Hyperframes (NEW) — HTML/GSAP-based
- ✅ 11-law motion philosophy, 38 pre-built blocks, live preview with hot reload
- Best for: Short-form promos, motion graphics, fast iteration
- Workflow: Storyboard → HTML composition → Live preview → Render

**See `memory/two_video_pipelines.md` for a complete comparison and when to use each.**

## Memory & Learning

**Remotion workflow:**
- `memory/design_standards.md` — Brand palette, typography, animation rules
- `memory/render_protocol.md` — Remotion render & ffmpeg splice checklist
- `memory/audio_standards.md` — TTS config, banned words, Whisper verification
- `memory/pitfalls.md` — 10 costly mistakes + prevention
- `memory/pipeline_checklist.md` — Full 11-stage video production checklist
- `memory/project_roi_audit.md` — Render cost tracking, rework prevention

**Hyperframes workflow (Nate Herk's aesthetic):**
- `memory/hyperframes_motion_philosophy.md` — The 11 laws, pacing, colors, animations
- `memory/hyperframes_build_system.md` — CLI commands, composition structure, render contract
- `memory/nate_herk_aesthetic.md` — Design signature, transitions, 3-act structure

**Comparison & guidance:**
- `memory/two_video_pipelines.md` — When to use Remotion vs. Hyperframes, hybrid workflow

**Estimated lifetime savings from documented rules:** $4,095+ (Remotion) + $3,000+ (Hyperframes new rules being created)

---

## Reusable Assets

- **Intro:** `assets/New Intro-2026-04-07.mp4` (23.06s, 1920×1080)
- **Outro:** `assets/New Outro-2026-04-07.mp4` (21.48s, 1920×1080)

Both are generic and configurable. Update `GenericOutroComposition` in `Root.tsx` with video-specific CTA text/headline, then render.

---

## File Structure

```
Video editing/
├── CLAUDE.md (this file)
├── VIDEO-DESIGN-SPEC.md (brand standards)
├── VIDEO-TEMPLATE.md (script template)
├── SETUP.md (Remotion setup)
├── CHANGELOG.md (past edits)
├── assets/
│   ├── New Intro-2026-04-07.mp4
│   ├── New Outro-2026-04-07.mp4
│   └── [B-roll, avatars, audio files]
├── output/
│   └── [Final -final.mp4 files only]
└── .claude/projects/.../memory/
    ├── MEMORY.md (index)
    ├── design_standards.md
    ├── render_protocol.md
    ├── audio_standards.md
    ├── pitfalls.md
    ├── pipeline_checklist.md
    └── project_roi_audit.md
```

---

## When to Use Claude Code vs. Cowork

### Claude Code (this project — terminal work)
- Remotion rendering (`npx remotion render`)
- ffmpeg splicing
- Whisper transcription
- Audio generation (Python edge_tts)
- Git commits + pushes
- File system operations

### Claude Cowork (script writing, strategy)
- Script composition and editing
- Storyboarding and visual planning
- Copy/narration refinement
- Design reviews and feedback
- Strategy/concept development

---

## Starting a New Video

1. **Create script** in `templates/SCRIPT-FORMAT.md` format (or use `VIDEO-TEMPLATE.md`)
2. **Generate audio:** `python3 scripts/orchestrate.py scripts/my-video.md --render`
3. **Edit Remotion:** Update composition with scene timings from Whisper, add B-roll
4. **Render:** `rsync` to /tmp, then `npx remotion render --concurrency=2 Root`
5. **Splice:** filter_complex concat with intro + trimmed content + outro
6. **Validate:** Run post-splice checklist from `memory/pipeline_checklist.md`
7. **Push:** Git commit + push, update CHANGELOG.md

---

## Questions? Check the Memory

- **Design question?** → `design_standards.md`
- **How do I render?** → `render_protocol.md`
- **What audio format?** → `audio_standards.md`
- **What went wrong last time?** → `pitfalls.md`
- **Full checklist?** → `pipeline_checklist.md`
- **What's the cost of rework?** → `project_roi_audit.md`

All memory files are linked in `.claude/projects/.../memory/MEMORY.md`.
