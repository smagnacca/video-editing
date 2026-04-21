# Changelog

---

## 2026-04-20 — 15 Minute Sales Sprint Promo v7 + Reusable Pipeline Template

**Output:** `output/15-minute-sales-sprint-v7-FINAL.mp4` (17MB, 113s, 1920×1080 30fps)

### What was done
- Built complete Remotion promo from scratch for "15 Minute Sales Sprint" (June 17, 7 PM ET)
- 9-scene structure: hook stat → problem → strikethrough/popups → proof stats → title reveal → framework cards → testimonials → event card → CTA URL
- v6→v7 refinements: music 0.2→0.1, popup timing adjusted to Scott's narration (:24/:25/:27), "THE" white burst flash (damping=5, stiffness=250), ONE/POWERFUL/PLAY stacked words, FrameworkCard headlines white→gold transition
- All component text sizes upgraded for 1080p readability: FrameworkCard (38/24px), TestimonialLine (38/26/20px), EventCard (18/62/34/26px)
- Scene 4 redesigned with explicit non-overlapping vertical positions (77% at top:60, skills gap at top:370, 56% at top:550)
- 3-agent QA passed: Visual ✓, Animation ✓, Audio -19.84 LUFS ✓
- Created global VIDEO-PRODUCTION-RULES.md + Section 18 in CLAUDE.md global rules
- Created reusable `memory/video_production_workflow_template.md` — prompt-to-video pipeline for any topic

### Key lessons documented
- Spring opacity bug: QA frames at exact second boundaries show black for popup animations (spring at frame 0 = opacity 0). Always check +0.3s offset.
- FadeIn transform conflict: don't pass `transform` in style prop to FadeIn — wraps in outer div instead
- rsync to /tmp before every render (EPERM on workspace mount)
- FrameworkCard headline white→gold: `rgb(${255+(245-255)*p}, ...)` pattern

### Next steps
- Use `memory/video_production_workflow_template.md` as intake template for next video
- Source new background music track for variety

---

## 2026-04-07 — 3-Types Audio Re-sync (Claude Code)

**Output:** `output/3-types-of-people-synced.mp4` (199s / 5970 frames, content-only render)

### What was done
- `audio/3-types-of-people.mp3` regenerated with Edge TTS `en-US-AndrewMultilingualNeural` (+12% rate, -2Hz pitch). All text assertions passed.
- Whisper word-level timestamps verified. Scene boundaries confirmed exact:
  - "Number one" → 16.24s = frame 487 (Believer)
  - "Number two" → 60.76s = frame 1822 (Peer)
  - "Number three" → 110.20s = frame 3306 (Coach)
  - "These three types" → 149.92s = frame 4497 (Bridge)
  - "Your circle is your catalyst" → 182.68s = frame 5480 (CTA)
- Scene timing constants in `ThreeTypesVideo.tsx` updated (1–3 frame micro-adjustments)
- Kinetic text delays: Believer=1068, Peer=1187, Coach=953 (set to 80% through each scene)
- B-roll start frames adjusted: Peer clips 260→272, 677→714
- Pull quote delays recalculated to new Whisper timestamps
- Frame-verified: correct card on screen at each narrator cue

### What remains (content fixes — pending next Claude Code session)
See `CLAUDE-CODE-PROMPT.md` for 8 fixes across both videos (black screen, gold text, audio garble, CTA card, side-by-side, crossfade). Final deliverables: `3-types-of-people-4.7.26-v2-final.mp4` and `storyselling-ai-4.7.26-v2-final.mp4`.

---

## 2026-04-07 — Edit Pass 2 Complete (Claude Code)

**Outputs:**
- `output/3-types-of-people-4.7.26-v2-final.mp4` (227.2s, 1920×1080) ✅
- `output/storyselling-ai-4.7.26-v2-final.mp4` (169.4s, 1920×1080) ✅

### 3 Types of People — 3 Fixes

**Fix 1 — Hook scene text overlays** (`ThreeTypesVideo.tsx`)
- Added two timed narration-synced overlays to SceneHook to eliminate the perceived "black screen" after the new intro splices in
- Overlay A: boosted ParticleField intensity to 1.5 during hook open
- Overlay B (frames 15–150): fade-in/out "In a world that's changing faster than ever"
- Overlay C (frames 120–270): cyan "The most dangerous thing you can do" + gold "is stay the same."
- Delayed title card entrance to frame 240 so overlays land before the hook title

**Fix 2 — Outro kinetic text removed** (`Root.tsx`)
- `GenericOutroComposition` `kineticText` changed from `'THREE IDEAS. ONE EDGE.'` → `''`
- Outro `GenericOutroSceneComp` re-rendered

**Fix 3 — QuizCard scale corrected** (`OutroScene.tsx`)
- CTA card scale reduced from `scale(1.75)` (overflowing frame) → `scale(0.85)`
- Card now fits within the outro frame without clipping

### Storyselling in the Age of AI — 5 Fixes

**Fix 4 — "second" / "month" gold highlight** (`StorysellingVideo.tsx` ~line 253)
- Color changed from invisible `BRAND.green` (#005A3B) → gold `#f5a623` with glow `textShadow: '0 0 20px #f5a62360'`

**Fix 5 — "Borrowed time" emphasis** (`StorysellingVideo.tsx` ~line 306)
- "Your career is on borrowed time" changed from grey `BRAND.textSecondary` → gold with single-pulse animation at frame 430

**Fix 6 — Segment 4 dramatic pause** (`StorysellingVideo.tsx`, frames ~610–810)
- Replaced instant STORYSELLING title card with a staged dramatic reveal:
  - "It already has." (gold, frames 680–760)
  - TypewriterText "The real question is…" (starts frame 726)
  - Title card fades in at frame 790

**Fix 7 — Audio verification** (`StorysellingVideo.tsx`)
- Confirmed original `storyselling-ai.mp3` says "no fluff" correctly (no garble)
- `storyselling-ai-fixed.mp3` was found to be the garbled version — was NOT used
- Composition kept on original audio; scene timings verified against Whisper JSON

**Fix 8 — Phase crossfade** (`StorysellingVideo.tsx`)
- Added 30-frame crossfade at framework→copilot boundary (composition frame 660) to smooth the previously abrupt scene cut

### Pending (GitHub push)
- Git commit + push: all modified source files unstaged. See `CLAUDE-CODE-PROMPT.md` for commit message.
- Cleanup approval needed: old output versions in `output/`

---

## 2026-04-07 — Edit Pass 2 Review + Design Documentation

### Videos Prepared for Edit Pass 2
- `output/3-types-of-people-4.7.26-final.mp4` — 3:47, 42MB, 1920×1080
- `output/storyselling-ai-4.7.26-final.mp4` — 2:51, 25MB, 1920×1080

Both spliced using the new reusable intro (`assets/New Intro-2026-04-07.mp4`) and outro (`assets/New Outro-2026-04-07.mp4`) via ffmpeg filter_complex concat (3-segment: intro + trimmed content + outro).

**Trim points identified by frame inspection:**
- 3-types: `ss=0 to=182.5` (no baked-in intro; old scottmagnacca.com CTA cut at 183s)
- storyselling: `ss=23.5 to=150.0` (HeyGen intro trimmed; old CTA cut at 152s)

### Fixes Identified (queued for Claude Code pass 2 — see CLAUDE-CODE-PROMPT.md)
1. **3-types t=23–29**: Black screen after intro splice — composition fade-in too slow. Fix: add narration-synced text overlays to SceneHook (3 timed overlays: background animation + "In a world…" + cyan/gold text pair).
2. **3-types t=3:26**: "THREE IDEAS. ONE EDGE." kinetic text in GenericOutroComposition — config drift from Invisible Sign video. Fix: set `kineticText: ''` in Root.tsx.
3. **3-types t=3:35**: CTA card off-screen left + oversized. Fix: center with `left: 50% / translateX(-50%)`, reduce to max 700px width.
4. **Storyselling t=31**: "second" / "month" in dark green (#005A3B) — near invisible on black. Fix: change to gold `#f5a623`.
5. **Storyselling t=41**: "Your career is on borrowed time" in grey — no emphasis. Fix: gold + single pulse animation.
6. **Storyselling t=44–50**: Side-by-side left panel repeats prior content. Fix: replace with "It already has." (gold) + TypewriterText "The real question is…"
7. **Storyselling t=1:18**: Audio garble — "No jargon" (banned TTS word) → "hargonne". Fix: verify storyselling-ai-fixed.mp3 and update composition to use it; re-verify scene timing constants.
8. **Storyselling t=2:28**: Abrupt scene cut. Fix: add 30-frame crossfade at composition frame ~3135.

### concat demuxer bug documented
Using `-f concat -safe 0` demuxer caused timestamp drift → 1331s and 1002s output durations. Fixed by switching to `filter_complex` concat (correct output: 227s and 171s).

### Documentation Written
- `CLAUDE-CODE-PROMPT.md` — full precision pickup prompt with exact frame numbers, component locations, code samples for all 8 fixes
- `VIDEO-DESIGN-SPEC.md` — master design specification covering colors, typography, animations, layout, audio, render/splice protocol, and file naming (cross-project applicable)
- Memory: `feedback_video_production_lessons.md` — 7 production rules from this session
- Memory: `feedback_audio_tts_rules.md` — complete TTS protocol, banned words, verification steps
- Memory: `feedback_remotion_render_splice.md` — render environment, splice protocol, CSS restrictions, verification checklist

---

## 2026-04-07 — Invisible Sign v7 Final (Clean Splice + Outro Layout Fix)

**Output:** `output/invisible-sign-v7-final.mp4` (190s / 3:10, 1920x1080, 30fps)

### Root Cause — Double Intro/Outro in v6
`invisible-sign-v5-final.mp4` had its OWN intro (0–24.5s) and outro (170s–197.8s) baked in from a previous Remotion render. The v6 splice naively concatenated the full file between the new intro and outro, creating a double intro and double outro.

### Fix — FFmpeg Trim
- Content trimmed with `ss=24.5` (skips baked-in intro) and `to=170.0` (cuts before baked-in outro)
- Trim points verified via frame extraction: 24.5s = "EVERY CLIENT WEARS AN INVISIBLE SIGN" hook (real content start), 170.0s = transition frame (baked-in CTA starting)
- Result: 145.5s of pure content, no duplicate intro/outro segments

### OutroScene.tsx — Two Layout Fixes
1. **Phase overlap fixed:** Kinetic text ("THREE IDEAS. ONE EDGE.") and gold word build ("SEVERAL / POWERFUL / IDEAS") were rendering simultaneously from frame 28–95. Fixed by separating phases: kinetic text f0–f55, gold words f70–f275 (clean sequential handoff with brief gap).
2. **Gold word collision fixed:** `GoldWordBuild` component used `flexWrap: 'wrap'` with `gap: '10px 14px'` — at fontSize 68, the three words collapsed into one line with no visible gap ("SEVERALPOWERFUL"). Changed to `flexDirection: 'column'` so each word stacks vertically with proper spacing.

### GenericOutroComposition Props (Root.tsx)
- `kineticText`: `""` → `"THREE IDEAS. ONE EDGE."`
- `ctaHeadline`: `"Want to Go Deeper?"` → `"Take the 60-Second AI Quiz"`
- `ctaDescription`: updated to "Discover how AI will impact your career in the next 12 months"
- `ctaButtonText`: `"LEARN MORE"` → `"START THE QUIZ →"`

### Cleanup
- Deleted `assets/intro-outro/` subfolder (old renders from March, superseded by `assets/New Intro-2026-04-07.mp4` and `assets/New Outro-2026-04-07.mp4`)

---

## 2026-04-07 — New Intro/Outro Assets (Invisible Sign)

**Output:**
- `assets/New Intro-2026-04-07.mp4` (6.2MB, 23s, 1920x1080, 30fps)
- `assets/New Outro-2026-04-07.mp4` (3.3MB, 17.8s, 1920x1080, 30fps)

### Intro Fix
- **Removed "Traditional: 25 years" green text label** from the learning curve chart in `IntroScene.tsx`
  - Dashed orange line, gold sparkle exponential curve, and all other chart animations preserved
  - Fix was in source (deleted `<text>` element at line 130-131), then re-rendered `InvisibleSignIntroComp`
  - Previous approach attempted ffmpeg drawbox paint-over — abandoned in favor of clean Remotion re-render
- **Fade to black** from 23.0s to end of clip (natural composition end at 23.06s)
- **Avatar speech preserved** — completes naturally at ~22.67s before fade
- **No black opening frame** — re-encoded with `-movflags +faststart`

### Outro
- `assets/New Outro-2026-04-07.mp4` — trimmed/processed outro for Invisible Sign video

### Source Change
- `remotion-project/src/components/IntroScene.tsx` — removed `<text>` element "Traditional: 25 years" (line 130-131)

---

## [Storyselling v8] 2026-04-01 — New Outro Video (Scott_outro_4.1.26) + All Fixes

**Output:** `output/storyselling-ai-v8-final.mp4` (28MB, 3:14)
**Files:** `public/avatar/outro-avatar.mp4`, `src/components/OutroScene.tsx`, `remotion/Root.tsx`

### Changes
- **New HeyGen outro** (`Scott_outro_4.1.26.mp4`) recorded by Scott, replaces old outro-avatar.mp4
  - New duration: 21.42s → 643 frames (was 22.06s / 662 frames)
  - New script: *"So we just discussed several powerful ideas... If this resonated with you, click the link or scan the QR code on your screen and take the 60-second quiz and let's continue this conversation. I'll see you in the next one."*
- **OutroScene.tsx phase timings updated** to match new Whisper word timestamps:
  - Phase 1 (kinetic text): f0–f95
  - Phase 2 (gold word build): f28–f275, words "SEVERAL POWERFUL IDEAS" (was "THREE POWERFUL IDEAS"), stagger=17 to match Scott's cadence at f30/f47/f64
  - Phase 3 (sprint B-roll): f103–f295
  - Phase 4 (quiz card): f280–end
- **Root.tsx**: All `endFrame` and `durationInFrames` updated 662→643 (OutroSceneComp + StorysellingOutroComp)
- **Audio silence fix retained**: 1:20–1:22 muted from v7 carried forward

### Going forward
- This outro is now the **evergreen standard outro** for ALL future videos
- Works for any topic — no reference to a specific video's content
- Combine with existing intro (`intro-avatar.mp4`) for all new videos

---

## [Storyselling v7] 2026-04-01 — Surgical Silence Fix at 1:20–1:22

**Output:** `output/storyselling-ai-v7-final.mp4` (28MB, 3:14)

### Changes
- ffmpeg `volume=enable='between(t,80,82)':volume=0` muted the remaining mispronounced segment
- No re-render required — pure audio post-processing

---

## [Storyselling v6] 2026-04-01 — Full Audio Mispronunciation Scan + Fix

**Output:** `output/storyselling-ai-v6-final.mp4` (28MB, 3:14)
**Files:** `scripts/generate_storyselling_tts.py`

### Changes
Full Whisper scan of the entire audio revealed **3 confirmed mispronunciations** by Edge TTS:

| Time (final) | Script word | TTS said | Fixed to |
|---|---|---|---|
| ~0:28 | "Charts." (hook) | "shots" | **Graphs** |
| ~0:59 | "Crisp charts." | "crisp shots" | **Polished slides** |
| ~1:21 | "No jargon." | "no cargo" | **No fluff** |

### Root cause
Edge TTS `en-US-AndrewMultilingualNeural` has confirmed trouble with:
- "Charts" → garbles the "ch" cluster as "sh" → says "shots"
- "Jargon" → mispronounces initial "j+ar" → says "cargo"
- "Buzzwords" → garbles compound → multi-syllable noise
- "Flawless" → mispronounces → "Flownos shaw"

### Lessons saved
- **CLAUDE.md Rule 3 updated:** Run Whisper AFTER generating TTS, compare against script, fix before render
- **`feedback_remotion_rules.md`:** Full banned-words table with safe replacements
- **`feedback_first_draft_excellence.md` Phase 1.2a:** Banned word scan added as mandatory pre-TTS step
- **`generate_storyselling_tts.py`:** 9 assertion guards now prevent any banned word from reaching TTS

---

## [Storyselling v5] 2026-04-01 — Bridge Rebuild + Audio Fix

**Output:** `output/storyselling-ai-v5-final.mp4` (28MB, 3:14)
**Files:** `src/StorysellingVideo.tsx`, `scripts/generate_storyselling_tts.py`

### Changes
- **Bridge graphic rebuilt** (`WinterSpringLandscape`):
  - Span: 96px → 360px (22% of 1600px canvas — was 6%, visually invisible)
  - `STORYSELLING` text: `fontSize={11}` → `fontSize={42}`, color `#F5A623` gold with double feDropShadow glow filter
  - Added `"THE BRIDGE"` subtitle, fontSize=18, white, letterSpacing=4
  - Full suspension bridge: gold towers slide up → catenary arc cables draw in via `strokeDashoffset` (pathLength=1) → white suspenders appear → gold planks drop sequentially → text rises with CSS `translateY`
  - Animation trigger: localFrame 300 (when "bridge of stories" narrated, ~10s into APP scene)
  - `overflow="visible"` on SVG to prevent filter clipping
- **TTS audio fix:** "Flawless charts" → "Crisp charts" (Edge TTS mispronounced "Flawless" as "Flownos shaw")
  - New audio: 147.19s (was 147.8s), 862KB

### Lessons saved to memory
- **CLAUDE.md Rule 2b (NEW):** SVG `fontSize` must yield ≥ 20 screen pixels — calculate `fontSize / viewBoxWidth × renderedWidth`. `fontSize=11` in 1600-wide viewBox = 11px on screen (illegible).
- **Pre-render Check #4b (NEW):** SVG Internal Font Size Audit + graphic span-width audit (≥20% of viewBox). Grep command: `grep -n "fontSize={[0-9]\b\|fontSize={1[0-9]}" src/*.tsx`
- **Postmortem table updated:** 3 new rows — microscopic SVG text, invisible bridge span, TTS mispronunciation

---

## [Storyselling v4] 2026-03-31 — Real QR Code + Clickable CTA

**Output:** `output/storyselling-ai-v4-final.mp4` (28MB, 3:15)
**Files:** `src/StorysellingVideo.tsx`, `remotion/Root.tsx`, `public/qr-60sec-quiz.png`

### Changes
- Real scannable QR code generated via Python `qrcode` library (green on white, RoundedModuleDrawer) — replaced placeholder SVG
- CTA button wrapped in `<a href="https://60-second-ai-quiz.netlify.app/">` for Player embed clickability
- `StoryselllingCTAOnlyComp` composition added (680 frames, `Audio startFrom={3770}`) — enabled partial re-render of CTA only (~2 min vs 20 min full render)

---

## [Storyselling v3] 2026-03-31 — Babson Removed + Scale Overflow Fixed

**Output:** `output/storyselling-ai-v3-final.mp4` (27MB, 3:14)
**Files:** `src/StorysellingVideo.tsx`

### Changes
- Removed all "Babson College" references — replaced with "Connection · Story · Impact"
- BalanceScale SVG: viewBox extended from `0 0 500 280` → `0 0 500 340`, `overflow="visible"` added, tilt reduced 18°→10°, pan labels raised to y=65
- Content card: `justifyContent: 'center'` → `'flex-end'` with paddingBottom=60

---

## [Storyselling v2] 2026-03-31 — 2× Sizing + Polish Pass

**Output:** `output/storyselling-ai-v2-final.mp4` (27MB, 3:14)
**Files:** `src/StorysellingVideo.tsx`, `src/components/IntroScene.tsx`

### Changes
- All credential cards, icons, SVGs scaled to 2× baseline
- Cards: 1100px wide, titles 80–96px, subtitles 32–44px
- Hook scene: 4-segment left-panel rotation (data wall → pull quote → bold stat → title card), 18-frame crossfades
- Balance scale moved to top-center
- CTA: concentric rings, shimmer headline, bouncing arrow, pulsing glow box

---

## [Storyselling v1] 2026-03-31 — Initial Build

**Output:** `output/storyselling-ai-final.mp4` (35MB, 3:16)

### What was built
- Full 4-scene video: Hook → Story Arc → Application → CTA
- Green #005A3B / white / black brand palette (NOT default navy)
- Edge TTS voiceover (`en-US-AndrewMultilingualNeural`), Whisper timestamps
- WinterSpringLandscape, BalanceScale, QRCodeGraphic, FinancialDataWall SVG components
- HeyGen Storyselling intro/outro with green-palette IntroScene/OutroScene

### Issues found in v1 review (→ all fixed in v2–v5)
- Graphics 50% too small, scale not at top-center (v2)
- "Babson College" text visible (v3)
- Fake QR code (v4)
- Bridge 6% of canvas, fontSize=11, "Flawless" mispronounced (v5)

---

## 2026-03-31 — Avatar Off-Screen Bug Fix + Fixed Final Video (v3)

### Bug Fixed
**Root cause:** `objectFit: 'cover'` and `objectPosition: 'center'` on `<OffthreadVideo>` are silently ignored by Remotion's headless Chrome renderer. The video renders at its native 1920×1080 resolution and overflows its container, pushing Scott's avatar completely off the right edge of the frame.

**Fix applied to:** `IntroScene.tsx` and `OutroScene.tsx`
- **Before (broken):** `<OffthreadVideo style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />`
- **After (correct):** `<OffthreadVideo style={{ position: 'absolute', right: 0, top: 0, width: 1920, height: 1080 }} />` — full resolution, anchored right, clipped by `overflow: hidden` on the 960px parent container. Shows the right-half of the HeyGen frame where Scott is framed.

### Critical Rule Added to CLAUDE.md
Rule 1b: **NEVER use objectFit/objectPosition on OffthreadVideo** — always use explicit pixel dimensions.

### Outputs
- `assets/intro-outro/intro-rendered.mp4` — re-rendered (6.7MB) ✅
- `assets/intro-outro/outro-rendered.mp4` — re-rendered (7.7MB) ✅
- `output/3-types-of-people-final-v3.mp4` — **43MB, 4:05** — fixed final with avatar properly visible ✅

### Layout Architecture (corrected standard — apply to ALL future videos)
- Avatar: right 960px panel, `width: 1920, height: 1080, position: absolute, right: 0, top: 0`, parent `overflow: hidden` — **NO objectFit**
- Content: left 960px panel, absolutely positioned phases that crossfade with `phaseOpacity()` helper
- Feather gradient: 120px on left edge of avatar panel, blends avatar into left content panel
- Background: solid #0a0e1a matches HeyGen avatar BG — no seam visible

---

## 2026-03-31 — Whisper-Timed Left-Panel Animations + Split Avatar Layout (v2)

### Final Output
- `output/3-types-of-people-final-v2.mp4` — 39MB, **4:05** total
- Split layout: avatar RIGHT half, animated content LEFT half — both intro and outro

### IntroScene — 5 Whisper-Timed Phases
All timings sourced from faster-whisper word-level timestamps on avatar audio:
- **Phase 1 (f0–135):** Credential card — Scott Magnacca / Co-Founder / Salesforlife.ai with spring entrance and glow ring
- **Phase 2 (f125–370):** "25 YEARS" slams in white at f147 (when Scott says "25"), "IN FINANCIAL SERVICES" fades below at f172
- **Phase 3 (f362–486):** Animated SVG exponential learning curve — traditional flat dashed line vs. animated cyan exponential path drawing in with strokeDashoffset technique. Labels: "Traditional: 25 years" (orange) vs "Compressed" (cyan dot + callout)
- **Phase 4 (f476–700):** Gold sparkle word-by-word text build — each word triggered at its Whisper frame: "CHANGE THE WAY" (f535), "YOU WORK" (f562), "LEAD" (f571), "& GROW" (f606), "IN THE NEXT 12 MONTHS" (f627). Sparkle: textShadow pulses 3x on word entry then settles.
- **Phase 5 (f691–728):** hookText + topicTitle spring in for "Let's get into it"

### OutroScene — 4 Whisper-Timed Phases
Scott actually said MORE than the script — captured by Whisper (includes "free AI risk assessment" and "Will your job be next?"):
- **Phase 1 (f0–91):** "YOUR CIRCLE IS YOUR CATALYST" KineticText (cyan, existing style)
- **Phase 2 (f28–230):** "THREE POWERFUL IDEAS" — gold word-by-word build at f28/f40/f56 (Whisper-timed "three"/"powerful"/"ideas")
- **Phase 3 (f92–235):** Sprint B-roll — framed OffthreadVideo player with corner accent markers, "Radically shift your trajectory" label
- **Phase 4 (f229–end):** AI quiz card — styled Remotion recreation of scottmagnacca.com quiz, TypewriterText URL. Card matches brand (navy bg, blue border glow, answer options A–D)

### Layout Architecture (new standard for all future videos)
- Avatar: right 960px panel, explicit `width:1920 height:1080` anchored right (see v3 bugfix — `objectFit` is not used), feathered left edge gradient blends into left panel
- Content: left 960px panel, absolutely positioned phases that crossfade with `phaseOpacity()` helper
- Vertical separator: subtle `${accentColor}30` gradient line at x=952
- Background: solid #0a0e1a matches HeyGen avatar BG — no seam visible

### New Assets
- `public/broll/sprint-win.mp4` — 6s, 1920x1080, h264, no audio (YouTube, trimmed)

### Best Practices Established (see memory)
- Run Whisper on avatar audio BEFORE coding animations — always use exact frame timestamps
- phaseOpacity(frame, enter, exit, fade) helper for smooth crossfades between phases
- SparkleWords component: each word triggered at its individual Whisper frame, not estimated
- Quiz card built as Remotion component (not static PNG) — animates, matches palette

### GitHub
- Committed: e158786 → `smagnacca/smagnacca-video-editing-project` (main)

---

## 2026-03-31 — Avatar Intro/Outro Spliced into First Complete Video

### Final Output
- `output/3-types-of-people-final.mp4` — 42MB, **4:05 total** (was 3:18)
- Structure: Intro (0:24) → Main Content (3:18) → Outro (0:22)

### HeyGen Avatar Files
- Recorded on HeyGen Creator plan, background #0a0e1a (navy match)
- `public/avatar/intro-avatar.mp4` — 24.28s (728 frames) — Scott's generic branded intro
- `public/avatar/outro-avatar.mp4` — 22.06s (662 frames) — Scott's generic CTA outro
- Files are reusable across ALL future videos (Option A — record once, reuse forever)

### Intro Script (evergreen — works for any video)
> "Hi, I'm Scott Magnacca, co-founder of Salesforlife.ai. It's taken me 25 years at the executive level in financial services to fully understand — and use — what I'm about to share with you. We're going to compress those 25 years into just a few minutes. What I'm about to share has the potential to change the way you work, lead, and grow in the next 12 months and beyond. Let's get into it."

### Outro Script (evergreen — update "three powerful ideas" count per video if desired)
> "So we just discussed three powerful ideas — concepts that can radically shift your career trajectory, if you use them. If this landed for you, take the 60-second quiz at scottmagnacca.com. I'll see you in the next one."

### Components Built This Session
- `LowerThird.tsx` — Speaker name/title with staggered spring entrance from left
- `IntroScene.tsx` — 3-phase MasterClass-style intro (hook text → authority → topic reveal)
- `OutroScene.tsx` — Seamless CTA outro (animated card, bouncing arrow, TypewriterText URL)
- `avatarSrc` prop wired into both: `<OffthreadVideo>` replaces animated bg when avatar provided
- Root.tsx updated: `IntroSceneComp` (728f) + `OutroSceneComp` (662f) as standalone compositions

### Render Pipeline
- Intro/Outro rendered as standalone Remotion compositions → ffmpeg concat with main video
- Render path: rsync to /tmp/ (exclude node_modules, symlink) → render → concat
- No EPERM issues at /Users/ path (only affects /mnt/ mounts)

### Per-Video Workflow (going forward)
1. Write content script → orchestrate → render main video
2. Update intro config (hookText, topicTitle) — 2 fields only
3. ffmpeg concat: intro-rendered + main + outro-rendered → final MP4
4. Avatar MP4s never change — only the text overlays update per video

---

## 2026-03-31 — Intro/Outro Scene System + HeyGen Avatar Integration Design

### New Components
- **`LowerThird.tsx`** — Reusable speaker name/title lower-third graphic. Accent line + staggered spring entrance from left. Configurable delay, duration, colors. Auto-fades on exit.
- **`IntroScene.tsx`** — MasterClass-style 3-phase intro scene:
  - Phase 1 (0–3s): Hook text slams in (scale 0.7→1, gold glow, ALL CAPS), continuous subtle zoom for forward momentum
  - Phase 2 (3–8s): LowerThird enters at 5s; gold flash pattern interrupt at 3s re-engages attention
  - Phase 3 (8–10s): Hook fades, topic title + subtitle spring in, LiquidReveal transition fires
- **`OutroScene.tsx`** — Seamless CTA outro (no "wrap-up" feel):
  - Bottom accent line draws left→right over 60 frames (visual funnel)
  - CTA GlassmorphismCard slides from right at 2s; bouncing arrow enters at 3s
  - CTA button pulses on sine wave; URL types in via TypewriterText
  - Kinetic text reinforcement on left half; gentle overall fade last 30 frames

### TemplateVideo.tsx Updates
- Added `'intro' | 'outro'` to `SceneConfig.type` union
- Added optional fields to `SceneConfig`: `hookText`, `hookColor`, `topicTitle`, `topicSubtitle`, `speakerName`, `speakerTitle`, `ctaHeadline`, `ctaDescription`, `ctaButtonText`
- Added `IntroScene` and `OutroScene` cases to `SceneRenderer`

### Config Schema
- `templates/video.config.example.json` updated with intro scene (first) and outro scene (last)
- `ctaTagline` updated to "Discover your AI leadership edge"

### HeyGen Avatar Integration Design
- Researched Creator plan capabilities for avatar delivery of intro/outro
- Best practice: set HeyGen background to `#0a0e1a` (exact navy match) → no transparent WebM needed
- Avatar MP4 goes to `remotion-project/public/avatar/`, loaded via `<OffthreadVideo>` in IntroScene/OutroScene
- `avatarSrc` prop pattern designed for future implementation

---

## 2026-03-31 (v5.1) — CTA Closing Fix
- Replaced spoken name/URL in CTA with: "Visit me at my personal website below to learn how you can master and apply these skills today"
- URL still displayed visually (`scottmagnacca.com`) — only the spoken narration changed
- Regenerated TTS, re-ran Whisper, updated all scene timings and cue points
- Video duration: 3:19, 5971 frames, 30fps, 1920x1080, 41.5 MB

---

## 2026-03-31 (v5) — Comprehensive B-Roll, Visual Polish & Narration Updates

### Narration Changes
- Rewrote Bridge section: "These three types of people all share three common attributes. They are attributes that virtually all successful people have." (removed mis-spoken "separates" line)
- Fixed name pronunciation: `scott mag-na-ka dot com` for correct "Mag-na-ka" delivery
- Regenerated TTS audio and re-ran Whisper for all new word-level timestamps
- Updated all scene timing constants to match new audio

### Comprehensive B-Roll Coverage (9 clips across 4 scenes)
- **Believer scene (3 clips):** horse racing ("bet on you early"), empty room ("front row"), texting close-up ("how's the project going")
- **Peer scene (3 clips):** teamwork hands ("keep building"), conference room ("masterminds"), coding ("building real AI skills")
- **Coach scene (2 clips):** laptop ("give you a mirror"), reading book ("lifelong learners")
- **Bridge scene (1 clip):** walking toward window ("walk through it")
- B-Roll Auto-Curation Skill created (`.claude/skills/broll-curation/SKILL.md`)
- B-Roll Catalog with tags for reuse (`remotion-project/public/broll/CATALOG.md`)

### Bridge Scene — Gold Markers & Checkmarks
- Gold animated border circles each card when its attribute is spoken
- Green checkmarks spring in sequentially above each card: Curiosity → Lifelong Learning → Adaptability
- Timed to Whisper word-level timestamps (158.10s, 159.20s, 160.34s)

### Visual Polish Pass
- **Pull quotes** — Key narration phrases appear as styled italic quotes with colored accent borders (6 quotes across Believer, Peer, Coach scenes)
- **Pulsing gold/white frame** around hook title text
- **Kinetic text moved to top** of screen for better visual hierarchy
- **CTA bouncing arrow** animation pointing to scottmagnacca.com
- **NoiseOverlay** — Cinematic film grain across entire video for premium feel
- **KineticTextSequence** timing aligned to Whisper cue points in Bridge scene

### Infrastructure
- GitHub repo created: `smagnacca/smagnacca-video-editing-project` (private)
- Whisper timestamps saved to `scripts/whisper_timestamps.json` for reuse
- Video duration: 3:18, 5940 frames, 30fps, 1920x1080, 41 MB

---

## 2026-03-30 (v4) — Reusable Video Template System + Audio Sync Fix

### Audio/Timing Sync Fix
- Regenerated TTS audio with Edge TTS (fixed "Magnacca" pronunciation, fixed Peer section text)
- Ran faster-whisper for word-level timestamps at scene boundaries
- Updated all scene timing constants in `ThreeTypesVideo.tsx` to match Whisper data
- Scene timings now driven by actual audio word timestamps, not estimates
- B-roll starts at ~45% into each archetype scene, kinetic text at ~80%
- Rendered and verified: all 6 scene transitions now align with narration
- Video duration: 3:18, 5953 frames, 30fps, 1920x1080

### Reusable Template System (NEW)
- **Standardized Script Format** (`templates/SCRIPT-FORMAT.md`)
  - YAML frontmatter for voice, colors, phonetic overrides
  - Machine-readable scene markers (type, title, color, icon, B-roll, kinetic text)
  - Narration in blockquotes, visual directions in brackets
- **Config-Driven Composition** (`remotion-project/src/TemplateVideo.tsx`)
  - Reads a JSON config and renders any video dynamically
  - Supports scene types: HOOK, ARCHETYPE, BRIDGE, CTA
  - Auto-calculates B-roll timing and kinetic text delays
  - Pluggable visual effects (particles, noise, hue shift, transitions)
- **Video Config Schema** (`templates/video.config.example.json`)
  - Complete example config showing all available options
- **Orchestrator Pipeline** (`scripts/orchestrate.py`)
  - Single command: `python3 scripts/orchestrate.py scripts/my-video.md --render`
  - Chains: parse script → generate TTS → run Whisper → build config → render
  - Flags: `--skip-tts`, `--skip-whisper`, `--preview`, `--name`

### New Visual Effects (from Persuasion & Conversion Toolkit)
- **LiquidReveal** (`SceneTransition.tsx`) — organic blob wipe transition
- **CrossfadeTransition** (`SceneTransition.tsx`) — simple opacity fade
- **TypewriterText** (`TypewriterText.tsx`) — character-by-character with cursor
- **MarkerHighlight** (`MarkerHighlight.tsx`) — animated neon underline
- **NoiseOverlay** (`NoiseOverlay.tsx`) — cinematic film grain
- **DynamicHueShift** (`NoiseOverlay.tsx`) — subtle background color cycling

### Skills & Documentation
- Created video-pipeline skill (`.claude/skills/video-pipeline/SKILL.md`)
- Updated `CLAUDE.md` with template system, component inventory, orchestrator usage
- Updated `Root.tsx` to register `TemplateVideo` composition

---

## 2026-03-30 (v3) — Session Close: Claude Code Prompt + Best Practices

### Workflow Decision
- Scene timing alignment requires Whisper speech-to-text for millisecond-accurate word timestamps — beyond what Cowork's sandbox can reliably do
- Created `CLAUDE-CODE-PROMPT.md` with full step-by-step instructions for Claude Code to fix timing
- Prompt covers: audio regen (with "Mag-na-ka" pronunciation fix), Whisper timing extraction, scene constant updates, B-roll/kinetic text adjustment, render, frame verification

### Best Practices Saved
- **Cowork vs Claude Code routing:** Design/planning/docs in Cowork, coding/rendering/debugging in Claude Code
- **Session compression:** All learnings saved to auto-memory (15 entries) and CLAUDE.md (10 critical rules)
- **Visual Effects Skill:** `.claude/skills/visual-effects/SKILL.md` — 25+ categorized effects with persuasive purpose

### Known Issue
- Scene transitions still misaligned with audio narration — Claude Code prompt ready to fix this via Whisper word timestamps

---

## 2026-03-30 (v2) — Audio Fix, Timing Realignment, Visual Effects Skill

### Audio Fix
- Rewrote Peer intro to completely fresh language: "We made a pact. Neither of us would let the other give up. On my worst days, Mark was the one who said, keep building."
- Added assertion checks in TTS generation script to verify old text is absent and new text is present

### Timing Realignment
- All 6 scene transitions recalculated using silence detection + word-count proportions
- Hook: 0-14s, Believer: 14-65.5s, Peer: 65.5-99s, Coach: 99-122s, Bridge: 122-166s, CTA: 166-199s
- B-roll start/duration adjusted for new scene lengths
- Root.tsx durationInFrames updated to 5970

### New Skill
- Created `.claude/skills/visual-effects/SKILL.md` — The Persuasion & Conversion Toolkit (2026)
- 25+ categorized effects with persuasive purpose and implementation prompts
- Includes Scott's preferred palette and Remotion-safe implementation notes

### New Best Practices Documented
- Rule #8: Use silence detection for scene transitions
- Rule #9: TTS text is a separate copy — always rewrite fresh with assertions
- Rule #10: Visual Effects Skill reference

---

## 2026-03-30 (v1) — "3 Types of People" Video Complete

### Video Delivered
- Final render: `output/3-types-of-people.mp4` (36.8MB, 5780 frames, 3:12 @ 30fps, 1920x1080)
- Audio: Edge TTS `AndrewMultilingualNeural` at +12% rate (191s)

### Components Built
- `ParticleField.tsx` — SVG animated particles with connection lines, glow halos, twinkle, color pulse
- `KineticText.tsx` — Spring-animated text overlays with textShadow glow and opacity shimmer
- `KineticTextSequence` — Staggered multi-word entrance animation
- `GlassmorphismCard.tsx` — Frosted glass card with accent border glow
- `BRollPlayer.tsx` — Framed B-roll video player with spring entrance/fade-out
- `AnimatedBackground` — Moving radial gradients for ambient background motion
- `SceneNumber`, `SceneIcon` — Scene indicator badges

### Scene Structure
1. **Hook** (0:00–0:12) — Title + "CURIOSITY IS YOUR EDGE" kinetic text
2. **The Believer** (0:12–0:55) — Cyan accent, mechanic B-roll, "SHARE YOUR GOALS"
3. **The Peer** (0:55–1:38) — Gold accent, university B-roll, "PROXIMITY IS THE PROGRAM"
4. **The Coach** (1:38–2:22) — Orange accent, laptop B-roll, "FILTER FOR TRUTH"
5. **Bridge** (2:22–2:50) — Three cards (Curiosity/Learning/Adaptability) + word sequence
6. **CTA** (2:50–3:12) — scottmagnacca.com with pulsing glow, holds 5+ seconds

### Bugs Fixed
- **Kinetic text invisible (color bars)**: Removed `WebkitBackgroundClip: 'text'` and `WebkitTextFillColor: 'transparent'` — headless Chrome renders these as solid color bars. Replaced with solid `color` + `textShadow` glow.
- **CTA URL invisible (cyan bar)**: Same WebkitBackgroundClip bug on scottmagnacca.com. Fixed with solid cyan color + glow.
- **B-roll invisible on dark background**: Overlay/blend approaches failed on #0a0e1a background. Implemented side-by-side layout with card-shift animation instead.
- **Script text not corrected in audio**: "when he wanted to quit, I kept going" not updated to "he urged me to keep going". Root cause: TTS text was separate from script markdown. Fixed by regenerating audio from verified script text.
- **Particles too static**: Rewrote with per-particle phase offsets, larger movement amplitudes, twinkle opacity variation, glow halos, and periodic color pulse.
- **Audio too long (3:41)**: Rate was -5%. Fixed with +12% rate → 3:09.
- **Root.tsx duration mismatch**: durationInFrames was 5700 but scenes extended to 5780. Updated to match.
- **ElevenLabs 402 error**: Free tier blocked API. Switched to Edge TTS.
- **Remotion browser EPERM**: Can't unlink in mounted workspace. Render in writable /sessions/ directory.

### Documentation
- Updated `.claude/CLAUDE.md` with critical rules, best practices, and mistake prevention
- Created `VIDEO-TEMPLATE.md` — reusable architecture reference for future videos
- Created `CHANGELOG.md` (this file)
- Added auto-memory entries: Remotion CSS restrictions, B-roll layout, Edge TTS fallback, script verification
