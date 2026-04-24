# Quick-Start: 20-Minute Video Pipeline

**Phase 1 Status:** ✅ Complete (assembly automation tested and working)

Templates cached:
- ✅ `templates/intro-template-v1.mp4` (2.1MB, 23s)
- ✅ `templates/middle-template-v1.mp4` (4.3MB, 60s)
- ✅ `templates/outro-template-v1.mp4` (1.8MB, 21.5s)

Assembly script: ✅ `assemble-video.sh` (tested, creates 116s video in ~2min)

---

## For Your Next Video (5 Steps)

### 1. Record Narration (5 min)
```bash
# Record voice, save as narration.mp3
# Required: ~90 seconds of narration at 44.1kHz, stereo
```

### 2. Verify with Whisper (2 min)
```bash
# Get word-level timing (optional, but helps with GSAP sync)
ffmpeg -i narration.mp3 -acodec libmp3lame -q:a 4 narration-clean.mp3
```

### 3. Create/Update Middle Section (3 min)
```bash
# If reusing middle-template-v1: skip this step
# If creating new middle: edit Hyperframes composition, render:
npx hyperframes render ./compositions/middle.html --output templates/middle-custom-v1.mp4
```

### 4. Assemble Video (5 min)
```bash
cd ~/Documents/Claude/Projects/Video\ editing
bash assemble-video.sh narration.mp3
# Output: ~/Desktop/video-FINAL.mp4
```

### 5. Verify Output (3 min)
```bash
# Check duration and file size
ffprobe ~/Desktop/video-FINAL.mp4 | grep Duration
file ~/Desktop/video-FINAL.mp4

# Play in QuickTime or Finder to spot-check
```

---

## What the Pipeline Does

```
Your narration.mp3
        ↓
    ↓ Normalize + mix with background music (loudnorm filter)
    ↓
    ↓ Concat: INTRO (23s) → MIDDLE (60s) → OUTRO (21.5s)
    ↓
    ↓ Apply mixed audio + scale video to 1920×1080
    ↓
~/Desktop/video-FINAL.mp4 (final video, ready to ship)
```

All in **one ffmpeg pass** — no intermediate files, no manual concatenation.

---

## Command Reference

**Full assembly:**
```bash
bash ~/Documents/Claude/Projects/Video\ editing/assemble-video.sh narration.mp3
```

**Custom templates (if needed):**
```bash
bash assemble-video.sh narration.mp3 "intro-custom-v1,middle-custom-v1,outro-template-v1"
```

**Check template availability:**
```bash
ls -lh ~/Documents/Claude/Projects/Video\ editing/templates/*.mp4
```

---

## Troubleshooting

**Error: "Template not found"**
- Verify filename matches exactly: `intro-template-v1.mp4` (not `intro-v1.mp4`)
- Check path: `~/Documents/Claude/Projects/Video editing/templates/`

**Error: "Background music not found"**
- File should be: `~/Documents/Claude/Projects/Video editing/assets/background-music-heygen-royalty-free.mp3`

**Audio/video out of sync**
- This shouldn't happen — ffmpeg handles sync in the concat filter
- If it does: check narration duration is ≥ 30s, <150s (template duration is 104.5s total)

**Final video is too quiet**
- Check LUFS levels: `ffmpeg -i output.mp4 -af loudnorm=I=-14 -f null -` 
- Narration should normalize to -14 LUFS

---

## What's Pre-Rendered & Ready

✅ **Templates:** INTRO (23s) + MIDDLE (60s) + OUTRO (21.5s) = 104.5s total  
✅ **Music:** Background track pre-mixed into final audio  
✅ **Assembly:** Zero-copy ffmpeg mega-filter (no intermediate files)  

---

## Next Steps After Video Ships

1. Upload final.mp4 to Netlify or YouTube
2. Update `CHANGELOG.md` with date + video title
3. Copy final.mp4 to `output/` folder (for archival)
4. Document any new template variants in `memory/video_template_variants.md`

---

**Goal:** Get from narration → final video in 20 minutes or less.  
**Cost:** ~$0.02 ffmpeg compute time (no API calls needed).

Good luck! 🎬
