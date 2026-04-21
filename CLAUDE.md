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
