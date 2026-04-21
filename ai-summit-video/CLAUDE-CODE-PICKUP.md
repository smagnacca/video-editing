# Video Production Pickup Prompt — Reusable Template

## For: Any new Claude Code session producing a promo video using Scott's pipeline

Paste this entire prompt into a new Claude Code session to replicate the production process for a new video.

---

## Pickup Prompt — Start Here

I need to produce a ~90-second promotional video using Scott Magnacca's video production pipeline. The pipeline uses:

- **ElevenLabs** for voice narration (Scott's cloned voice ID: `QCuXtHVym81CrddhYVa8`)
- **Remotion** (React video framework) for motion graphics, text builds, animations
- **HeyGen Avatar III** (avatar ID: `eea2aab18af24021a438ea59a2f6cf02`) for talking-head overlay — intro + outro only (10-15s each)
- **mlx_whisper** for word-level timestamp extraction to sync graphics to narration

### CRITICAL: Read these memory files FIRST before doing anything:
1. `~/.claude/memory/feedback_video_production_playbook.md` — the master playbook (process order, settings, cost optimization)
2. `~/.claude/memory/feedback_video_qa_rule.md` — mandatory 3-agent QA after 2+ re-edits
3. `~/.claude/memory/feedback_video_design.md` — visual preferences, avatar rules, audio levels

### Reference project (copy as template):
```
~/Documents/Claude/Projects/Co-work sandbox- Scott/ai-summit-video/
```

This project has all reusable components: ParticleField, KineticText, StatCard, CTAButton, DayCard, AvatarLayer, Transitions. Copy the `src/components/` directory — they work for any video.

---

## Step-by-Step Process

### Phase 1: Script + Voice (DO FIRST — no code yet)

1. **Finalize the script** with Scott. Break it into 4-6 segments by topic.
2. **Generate ElevenLabs narration:**
   ```python
   # Settings that produce clean audio (no echo):
   voice_id = 'QCuXtHVym81CrddhYVa8'
   model_id = 'eleven_multilingual_v2'
   output_format = 'mp3_44100_128'
   voice_settings = {
       'stability': 0.7,        # higher = less echo
       'similarity_boost': 0.85,
       'style': 0.1,            # lower = less room reverb
       'use_speaker_boost': True,
   }
   ```
   - Use `...` (ellipsis) in the script for natural pauses — NOT SSML `<break>` tags
   - Target 80-90 seconds for a "90-second" video
3. **Scott listens to the audio and approves** before ANY code is written
4. **Run Whisper** to get word-level timestamps:
   ```bash
   mlx_whisper --model mlx-community/whisper-large-v3-turbo \
     --output-dir /tmp/timestamps --output-format json \
     --language en --word-timestamps True public/audio/narration.mp3
   ```
5. **Build the CUES table** — map every key phrase to its exact timestamp. Put in `src/styles/theme.ts`

### Phase 2: Remotion Graphics

1. **Copy the template project** or create new with `npm init` + `npm install remotion @remotion/cli react react-dom typescript @types/react`
2. **Update `theme.ts`** with:
   - New SEGMENTS boundaries (from Whisper output)
   - New CUES (every key phrase timestamp)
   - VIDEO.DURATION_FRAMES = narration duration + 3 seconds fade
   - Colors/fonts (Babson palette unless project-specific)
3. **Write sequence files** — one per segment. Rules:
   - ALL text center-screen
   - One phrase per screen, matching exactly what narrator says
   - Use `cue()` helper for all timing: `const cue = (absTime: number) => sec(absTime) - segStart`
   - No gaps between segments — extend last visual to fill
   - No placeholder text ever
4. **Render 12+ QA test frames** at key narration moments:
   ```bash
   npx remotion still src/index.ts MainComposition out/qa/fNNN.png --frame=NNN --image-format=png
   ```
5. **Visually verify** each frame shows correct text for that moment in the narration

### Phase 3: Avatar (DO LAST — minimal usage)

1. Avatar only appears for **intro (10-15s) + outro (10-15s)** — middle of video is voice + graphics only
2. Upload narration to HeyGen:
   ```bash
   curl -X POST 'https://api.heygen.com/v3/assets' \
     -H "x-api-key: $HEYGEN_API_KEY" \
     -F "file=@public/audio/narration.mp3"
   ```
3. Generate avatar:
   ```bash
   curl -X POST 'https://api.heygen.com/v3/videos' \
     -H "x-api-key: $HEYGEN_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"type":"avatar","avatar_id":"eea2aab18af24021a438ea59a2f6cf02","audio_asset_id":"ASSET_ID","resolution":"1080p","aspect_ratio":"16:9","remove_background":true}'
   ```
4. Download, save to `public/avatar/`
5. **CRITICAL: Set `volume={0}` on OffthreadVideo** — avatar video has embedded audio that MUST be muted. The narration.mp3 Audio component is the only sound source.

### Phase 4: Final Render + QA

**After 2+ re-edits, AUTOMATICALLY run 3-agent QA:**

```
Agent 1 (Audio): Verify single audio source, avatar muted, volumes correct, fade-out working
Agent 2 (Timing): Run Whisper, compare ALL cue points, flag drift >0.5s
Agent 3 (Visuals): Render 12+ frames, verify text matches narration, no placeholders, no gaps
```

Then run independent checklist:
- [ ] Single audio source (avatar muted)
- [ ] All cue point deltas <0.5s
- [ ] 12+ frames visually verified
- [ ] No placeholder text
- [ ] Avatar only in intro + outro
- [ ] Music at 0.04 volume (2/10)
- [ ] 3-second fade out
- [ ] Video duration = narration + 3s

Only render after ALL checks pass.

---

## Audio Preferences
| Setting | Value |
|---|---|
| Narration volume | 0.9 |
| Background music | 0.04 (2/10) |
| Fade out | 3 seconds, both audio + visuals |
| ElevenLabs stability | 0.7 |
| ElevenLabs style | 0.1 |

## Visual Preferences
| Setting | Value |
|---|---|
| All text | Center-screen |
| Avatar position | Fixed circular PIP, bottom-right, scale 0.22 |
| Avatar timing | Intro (10-15s) + outro (10-15s) only |
| Min font size | 44px |
| Heading font | Playfair Display, italic for accents |
| Body font | Inter, weight 600-900 |
| Key word color | Gold (#DDD055) or Mango (#EEAF00) |
| Background | Dark (#0A0A0A) + gold particle field |

## Cost Per Video
| Item | Cost |
|---|---|
| ElevenLabs TTS | Free (128kbps tier) |
| HeyGen Avatar (25s intro+outro) | ~$0.42 |
| Remotion render | Free (local) |
| Whisper timestamps | Free (local mlx_whisper) |
| **Total** | **~$0.42** |

## Known Issues to Avoid
1. **NEVER regenerate the voice without re-running Whisper and updating ALL timestamps** — timestamps drift and visuals desync
2. **ALWAYS mute the avatar video** (`volume={0}`) — it has embedded audio that causes double-narration
3. **NEVER show Scott a video without running the 3-agent QA first** if there have been 2+ edits
4. **Ellipsis for pauses, not SSML** — `<break>` tags add too much silence
5. **Close ALL gaps between segments** — no black frames between topic transitions

## API Keys (Scott provides at session start)
- `ELEVEN_API_KEY` — ElevenLabs (starts with `sk_`)
- HeyGen API key — set via `heygen auth login`

## Tools Required
- Node.js 18+ with npm
- `mlx_whisper` (installed via pip/homebrew)
- HeyGen CLI: `curl -fsSL https://static.heygen.ai/cli/install.sh | bash`
- ElevenLabs Python SDK: `pip3 install elevenlabs`
