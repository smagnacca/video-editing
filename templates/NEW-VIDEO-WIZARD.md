# New Video Wizard — Zero-Rework First Draft Protocol

**Goal:** Produce a production-quality first draft in ≤10 minutes using minimal tokens.
**Template reference:** `remotion-project/src/ClaudeCoworkSalesVideo.tsx` (the gold standard)
**Design rules:** `VIDEO-DESIGN-SPEC.md` + `memory/video_production_checklist_v2.md`

---

## HOW TO START A NEW VIDEO

When Scott says "new video" or "let's make a video," run through these 7 intake questions IN ORDER. Ask them all at once in a single message. Do not start building until all answers are in.

---

## INTAKE QUESTIONS (ask all 7 at once)

```
Before I start, I need 7 quick answers:

1. TOPIC — What's this video about? (1 sentence)
2. AUDIENCE — Who is watching? (e.g., salespeople, founders, Babson students)
3. GOAL — What should they DO after watching? (1 action: visit URL, book call, buy, etc.)
4. LENGTH — Target duration? (60s / 90s / 2–3 min)
5. AUDIO — Will you record your own voice, or should I generate TTS with your ElevenLabs clone?
   → If your voice: I'll give you a clean script + recording instructions.
   → If TTS: I'll generate automatically. Remind me to get final approval before any API call.
6. CTA URL — What URL or call-to-action goes at the end?
7. KEY STAT or HOOK — Is there a specific number, claim, or provocative question to open with?
   (e.g., "Only 35% of your day is selling." or "Most salespeople waste 2 hours a day on admin.")
```

---

## AFTER INTAKE — EXECUTION ORDER

Once all 7 answers are in, execute in this exact order. Do not skip steps.

### Step 1 — Write the Script (2–3 min)
- Follow `templates/SCRIPT-FORMAT.md` structure
- 9-scene structure: Hook → Problem → Solution → 4× Feature archetypes → Bridge → CTA
- Match scene count to target length (60s = 6 scenes, 90s = 8–9 scenes, 2–3min = 10–12 scenes)
- Mark every key phrase that gets GOLD emphasis
- Mark every stat that gets a COUNT-UP animation
- Mark strikethrough lines (admin tasks, old behaviors to kill)
- Write phonetic pronunciation guide for any unusual words
- Show Scott the script BEFORE generating audio. Wait for approval.

### Step 2 — Generate Audio
**If Scott records own voice:**
- Output: clean formatted script in a code block
- Add recording instructions: quiet room, phone 6–8" away, natural pace, no filler words
- After recording: normalize with `ffmpeg -i raw.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11 clean.mp3`
- Run Whisper to get timestamps: `python3 scripts/whisper_timestamps.py audio/clean.mp3`

**If ElevenLabs TTS:**
- GET SCOTT'S APPROVAL before any API call
- Use voice ID `QCuXtHVym81CrddhYVa8`, model `eleven_turbo_v2_5`
- Save output to `audio/[video-slug].mp3`
- Normalize immediately after generation

### Step 3 — Build Remotion Composition
- Copy `remotion-project/src/ClaudeCoworkSalesVideo.tsx` → rename to `[VideoSlug]Video.tsx`
- Map Whisper timestamps to scene boundaries (frame = seconds × 30)
- Apply ALL pre-Draft-1 standards from `memory/video_production_checklist_v2.md`:
  - Narrator volume: 0.75
  - Background music: 0.20
  - Typography: per the table (hero ≥65px, body ≥50px, stacked reveals ≥144px)
  - Color: gold → cyan → white hierarchy
  - Count-up stats: 90-frame duration, no Sequence wrapper, local frame
  - Strikethrough: 12px height, glow, local frame
  - Popup phrases: black canvas, spring scale 0.55→1, color progression cyan→white→gold
- Register in `remotion-project/remotion/Root.tsx`

### Step 4 — Render
```bash
rsync -a /path/to/remotion-project /tmp/remotion-project/
cd /tmp/remotion-project && npx remotion render --concurrency=2 Root [CompositionId] /path/to/output/[slug]-draft1.mp4
```

### Step 5 — QA (run BEFORE showing Scott)
Run 4-agent QA from `memory/pre_publish_qa_protocol.md`:
1. Extract frames at peak of each scene → check text, colors, no cutoffs
2. Audio LUFS check → target -16 to -20 LUFS
3. Count-up animation check → 3 different values in first 3 seconds of each stat card
4. Popup timing check → text at full brightness at midpoint

Fix any failures. Re-render only the affected scene if possible.

### Step 6 — Show Scott
Present: `output/[slug]-draft1.mp4`
State: "Draft 1 is ready. All QA checks passed. Here are the scene timestamps if you want to jump to anything specific."

---

## COMPONENT LIBRARY (already built — use these)

| Component | File | Use for |
|-----------|------|---------|
| ParticleField | `components/ParticleField.tsx` | Dark bg with animated particles |
| KineticText | `components/KineticText.tsx` | Big pop-in words |
| WordReveal | `components/WordReveal.tsx` | Staggered word builds |
| StackedWordReveal | `components/StackedWordReveal.tsx` | DON'T.MISS.OUT style |
| StatCard | `components/StatCard.tsx` | Count-up stat blocks |
| GlassmorphismCard | `components/GlassmorphismCard.tsx` | Feature cards with glow borders |
| FrameworkCard | `components/FrameworkCard.tsx` | Numbered framework reveals |
| StrikethroughText | `components/StrikethroughText.tsx` | Animated strike-through |
| TypewriterText | `components/TypewriterText.tsx` | URL / code reveals |
| MeshGradient | `components/MeshGradient.tsx` | Animated gradient backgrounds |
| SceneTransition | `components/SceneTransition.tsx` | Cross-fade between scenes |
| SpeakerOval | `components/SpeakerOval.tsx` | Scott's headshot oval |
| LowerThird | `components/LowerThird.tsx` | Name/title bar |

**Do not build a new component if an existing one fits.** Customize via props first.

---

## BRAND TOKENS (never deviate)

```
Background:  #0a0e1a  (near-black navy)
Gold:        #f5a623  (peak emphasis — stats, CTAs, emotional peaks)
Cyan:        #00d4ff  (secondary impact)
White:       #ffffff  (body text)
Gray:        #aaaaaa  (subtitles, secondary)
Red:         #e53e3e  (strikethrough ONLY)
Orange:      #ff6b35  (tertiary — bridge scenes)
Font:        Inter (already in project)
```

---

## CRITICAL BUGS TO NEVER REPEAT

1. **Local vs. global frame** — `useCurrentFrame()` at parent = global. Inside `<Sequence from={N}>`, subtract N for inline math.
2. **Count-up Sequence wrapper** — NEVER wrap count-up in `<Sequence>`. Use `Math.max(0, frame - countDelay)` directly.
3. **Strikethrough height** — Minimum 12px. 5px is invisible at 1080p.
4. **concat demuxer** — NEVER use concat demuxer for FFmpeg splicing. Always use `filter_complex`.
5. **External image URLs** — Always download images locally with `curl`. Never hotlink.
6. **EPERM on render** — Always `rsync` to `/tmp` before `npx remotion render`.
7. **Audio file naming** — Only `clean.mp3` or `garbled.mp3`. Never `fixed.mp3` — it's ambiguous.

---

## TIME BUDGET (target: ≤10 min total)

| Step | Target time |
|------|------------|
| Intake Q&A | 1 min |
| Script write | 2 min |
| Audio (TTS) or hand off script | 1–2 min |
| Whisper timestamps | 30s |
| Remotion composition build | 3–4 min |
| Render | runs async |
| QA | 1 min |
| **Total** | **~10 min** |

Render time is async — start the render and do QA prep while it runs.
