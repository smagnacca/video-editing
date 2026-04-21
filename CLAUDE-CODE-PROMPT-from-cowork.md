# Claude Code Pickup Prompt — Ready for Next Video
**Date:** 2026-04-07 | **Branch:** main (clean, all pushed) | **GitHub:** smagnacca/cowork-video-editing-project

---

## ✅ SESSION COMPLETE — Nothing pending

All work from the 2026-04-07 session is done and pushed:

### Commits on main (most recent)
- `f0c23b2` — chore: delete garbled storyselling-ai-fixed.mp3 from tracking
- `3ca8faa` — fix: video edit pass 2 — 8 fixes across 3-types + storyselling

### Final deliverables (in `output/`)
- `output/3-types-of-people-4.7.26-v2-final.mp4` (227.2s) ✅
- `output/storyselling-ai-4.7.26-v2-final.mp4` (169.4s) ✅

### Cleaned up (deleted from disk + git)
- `output/3-types-of-people-4.7.26-final.mp4` (v1)
- `output/storyselling-ai-4.7.26-final.mp4` (v1)
- `output/3-types-of-people-synced.mp4` (intermediate)
- `audio/storyselling-ai-fixed.mp3` (garbled — was misleadingly named "fixed")

---

## Starting a new video?

Just describe the concept to Scott's Cowork session. The full pipeline runs from there:

1. Script written in `templates/SCRIPT-FORMAT.md` format
2. Run `python3 scripts/orchestrate.py scripts/my-video.md --render`
3. Update `hookText` + `topicTitle` in `Root.tsx` IntroComposition
4. Render `IntroSceneComp` + `OutroSceneComp` → ffmpeg concat → `-final.mp4`

**Key reminders before any render:**
- rsync to `/tmp/remotion-render/` (workspace mount has EPERM)
- `--concurrency=2` for Remotion render
- Splice via `filter_complex` ONLY — concat demuxer is banned (timestamp drift)
- Trim both ends of content video before splice (`ss=` and `to=`)
- SVG fontSize must scale to viewBox (not screen pixels)
- Never use `WebkitBackgroundClip: 'text'` or `objectFit` on OffthreadVideo

**Audio reminders:**
- Banned TTS words: charts, flawless, jargon, buzzwords (see CLAUDE.md for replacements)
- Run Whisper on generated MP3 and diff against script before embedding
- Name audio files `clean.mp3` or `garbled.mp3` — never `fixed.mp3` (ambiguous)

**Brand colors:**
- bg: `#0a0e1a` | cyan: `#00d4ff` | gold: `#f5a623` | orange: `#ff6b35`
- BRAND.green `#005A3B` is near-invisible on dark bg — use gold for emphasis text

---

Repo is clean. Next session starts fresh.
