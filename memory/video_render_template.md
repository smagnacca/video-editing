# Video Render Template — Zero-Rework Protocol
# Built from NotebookLM v3→v5 session (April 2026)
# Goal: Compress render-to-approved from 2 hours → 10 minutes

---

## BEFORE WRITING A SINGLE LINE OF CODE

### Step 1 — Font Selection (MANDATORY)
- **ALWAYS use Lato-Black for bold** (`/usr/share/fonts/truetype/lato/Lato-Black.ttf`)
- **ALWAYS use Lato-Regular for body** (`/usr/share/fonts/truetype/lato/Lato-Regular.ttf`)
- **NEVER use** Liberation Sans, Poppins — both render "U" as "II" at large sizes
- **NEVER use Unicode symbols** (→ ✓ ⚡ ★ etc.) — Lato doesn't have them
- **ALWAYS use ASCII alternatives** (`>>` not `✓`, `>>` not `→`) or `draw_arrow()` programmatically
- **NEVER use emoji** in any draw_text call — renders as box glyph

### Step 2 — Time Gate Rule (NON-NEGOTIABLE)
Every animated element MUST have BOTH a start AND end time:
```python
# CORRECT — always this form:
if START < t < END:
    draw_text_on(...)

# BANNED — causes invisible element accumulation:
if t > START:
    draw_text_on(...)
```
**Why:** canvas is rebuilt fresh each frame via `base_canvas()`. Every condition evaluates 
simultaneously for every frame. A bare `if t > 1.2` stays TRUE forever — elements stack 
invisibly with new content in later frames.

**Checklist before first render:**
- [ ] Every text element has `if A < t < B`
- [ ] Every shape/line has `if A < t < B`  
- [ ] Phase transitions clear all prior elements before adding new ones

### Step 3 — cx_center Bug (FIXED in template)
`draw_text_on` must implement:
```python
def draw_text_on(canvas_f, text, cx_center, cy_center, f, color, x_shift=0, y_shift=0):
    base_x = W//2 if cx_center == 0 else cx_center
    px = base_x - w_//2 + x_shift   # CORRECT
    # WRONG was: px = W//2 - w_//2 + x_shift  (always used screen center, ignored cx_center)
```

### Step 4 — Layout Pixel Budget (verify BEFORE coding)
For 1920×1080, lower-third at y=1008:
- Available canvas height: 0–1008px
- Safe zone: leave 60px margin top, 20px gap above lower-third
- Phase 1 max usable: 60–988px (928px total)
- At F(280) numbers: height ≈ 370px → center cy must be ≥ 245 and ≤ 743
- At F(110) text: width of "SALESPEOPLE" ≈ 750px → fits within 1920px

**Pre-compute ALL positions as constants before writing phase functions:**
```python
NUM_CY  = 340    # Phase 2 number center y
LBL_CY  = 520    # label center y
CK_BASE = 660    # checklist row 1 cy
CK_STEP = 90     # checklist row spacing
```

---

## STANDARD RENDERER SCAFFOLD
```python
#!/usr/bin/env python3
W, H, FPS = 1920, 1080, 30
TOTAL = int(DURATION * FPS)

# Colors
BG    = (10, 14, 26)
GOLD  = (245, 166, 35)
TEAL  = (0, 229, 255)
WHITE = (255, 255, 255)
GRAY  = (110, 125, 145)
ORANGE= (255, 115, 0)

# Fonts — ALWAYS Lato-Black/Regular
BOLD = '/usr/share/fonts/truetype/lato/Lato-Black.ttf'
REG  = '/usr/share/fonts/truetype/lato/Lato-Regular.ttf'

# Film grain (static seed for consistency)
_gr = np.random.default_rng(42).integers(0, 18, (H,W,3), dtype=np.uint8)
def base_canvas():
    c = np.full((H,W,3), BG, dtype=np.float32)
    c += (_gr * 0.04)
    return np.clip(c, 0, 255)

# draw_text_on with cx_center fix
def draw_text_on(canvas_f, text, cx_center, cy_center, f, color, x_shift=0, y_shift=0):
    w_, h_ = tsz(text, f)
    base_x = W//2 if cx_center == 0 else cx_center
    px = base_x - w_//2 + x_shift
    py = cy_center - h_//2 + y_shift
    ...

# Programmatic arrow (no font glyph)
def draw_arrow(canvas_f, cx, cy, color, length=140, thickness=10):
    hw = thickness * 3
    shaft_x1 = cx + length//2 - hw
    ya=max(0,cy-thickness//2); yb=min(H,cy+thickness//2)
    xa=max(0,cx-length//2);    xb=min(W,shaft_x1)
    if ya<yb and xa<xb:
        canvas_f[ya:yb,xa:xb] = np.array(color, dtype=np.float32)
    tip_x = cx + length//2
    tmp = Image.fromarray(canvas_f.astype(np.uint8))
    ImageDraw.Draw(tmp).polygon(
        [(tip_x,cy),(tip_x-hw,cy-hw),(tip_x-hw,cy+hw)], fill=color)
    canvas_f[:] = np.array(tmp, dtype=np.float32)
```

---

## QA PROTOCOL (MANDATORY before full render)

### Phase 1 — Compute QA (no rendering needed)
Run this check BEFORE generating any video frames:
1. List every animated element
2. For each: write `START`, `END` explicitly as comments
3. Verify: no element has `if t > X` without `< Y` upper bound
4. Verify: phases are mutually exclusive in main `render()`
5. Verify: all text uses ASCII-safe characters only
6. Verify: layout cy values fit within 60–988px

### Phase 2 — Frame QA (10 key frames, NOT 3)
Extract frames at every 2-3 seconds of full animation:
```python
checkpoints = {
    "t_early":   2.0,   # first text element
    "t_mid1":    6.0,   # mid-phase 1
    "t_mid2":    10.0,  # full phase 1
    "t_flash":   16.5,  # transition
    "t_p2_open": 18.0,  # phase 2 opens
    "t_p2_mid":  21.5,  # arrow + left column
    "t_p2_full": 26.5,  # countdown to 5 + burst
    "t_check":   27.5,  # checklist
    "t_p3_open": 31.5,  # phase 3 FREE
    "t_end":     39.0,  # typewriter
}
```

### Phase 3 — Character-Level Verification
For EVERY text element in every QA frame, read each character individually:
- "MINUTES" → M-I-N-U-T-E-S (confirm U is not II)
- "SALESPEOPLE" → S-A-L-E-S-P-E-O-P-L-E (confirm fits in frame)
- Arrow → confirm shaft + triangle (not box glyph)
- No element overlaps another
- No text clips frame edges

**DO NOT DECLARE QA PASSED until all 10 frames read character-by-character.**

---

## RENDER EXECUTION (3 batches, stay under 45s timeout)

```python
# Batch 1: frames 0–409
python3 -c "
from render_X_vN import render
for i in range(410):
    sys.stdout.buffer.write(render(i).tobytes())
" | ffmpeg -y -f rawvideo -pixel_format rgb24 -video_size 1920x1080 -framerate 30 \
  -i pipe:0 -c:v libx264 -preset fast -crf 16 -pix_fmt yuv420p batch1.mp4

# Repeat for batches 2 and 3 (410-819, 820-end)

# Concat
ffmpeg -y -f concat -safe 0 -i list.txt -c:v libx264 -preset fast -crf 16 animation_vN.mp4
```

---

## SPLICE FORMULA (Jensen trim + animation + demo + outro)

```bash
ffmpeg -y \
  -i SOURCE.mp4 \
  -i animation_vN.mp4 \
  -i outro_vN.mp4 \
  -filter_complex "
    [0:v]trim=start=0:end=25,setpts=PTS-STARTPTS,fade=t=out:st=22:d=3[jv];
    [1:v]setpts=PTS-STARTPTS[av];
    [0:v]trim=start=82:end=170,setpts=PTS-STARTPTS[dv];
    [2:v]setpts=PTS-STARTPTS[outv];
    [jv][av][dv][outv]concat=n=4:v=1:a=0[vout];
    [0:a]atrim=start=0:end=25,asetpts=PTS-STARTPTS[ja];
    [0:a]atrim=start=41:end=82,asetpts=PTS-STARTPTS[aa];
    [0:a]atrim=start=82:end=170,asetpts=PTS-STARTPTS[da];
    [0:a]atrim=start=170:end=201,asetpts=PTS-STARTPTS[oa];
    [ja][aa][da][oa]concat=n=4:v=0:a=1[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k \
  FINAL-vN.mp4
```

---

## ANIMATION DESIGN RULES (apply on first draft — no exceptions)

### Must-Have Effects (apply to ALL videos)
1. **Film grain** — static seed numpy noise overlay (0.04 alpha) — cinematic texture
2. **Floating particles** — 16-20 gray dots drifting upward, `default_rng(i*17)` seeded
3. **Text slams** — use `bo()` (back-out easing) with bounce coefficient s=1.7–2.2
4. **Exponential out** — use `xo()` for lines, bars, underlines extending
5. **Flash transitions** — white flash between phases (0.7s): `fade_to(cv, WHITE, ...)`
6. **Lower third** — always present: name, credentials, gold separator line at y=1008
7. **Gold glow** — precompute `build_glow()` for hero text, blend via `glow()` with sin pulse
8. **Fade in from black** — first 1.5s: `fade_to(cv, (0,0,0), 1-xo(t/1.5))`
9. **Fade out to black** — last 1s: `fade_to(cv, (0,0,0), xo(rm(t, end-1, end)))`
10. **Orange underline bar** — extends via `xo()` easing under context subtitle

### Checklist Slides (right-sliding teal)
```python
x_shift=int(lp(800, 0, xo(cht)))   # slides IN from right
# Not: lp(160, 0, ...) — that slides LEFT (bug in v4)
```

### Phase Transition Clarity
- Every phase ends with a flash (white or black) covering the transition
- The next phase starts with a compensating fade-in
- Glow precomputed for: hero text, CTA button — blended with sin(t) pulse

---

## OUTRO TEMPLATE (use render_outro_v1.py as starting scaffold)

31-second structure:
- **0–13s:** Event announcement (badge slam, headline typewriter, subtitle, bottom bar)  
- **13–28s:** Full CTA card (badge, stacked headlines, "Zero fluff." glow, stat boxes, button, URL)
- **28–31s:** Gold pulse + fade to black

Stat box drawing: border draws in first, value slams up, label fades after.
Button: rounded_rectangle filled gold, dark text, pulsing scale sin(t), glow overlay.
URL: typewriter character-by-character.

---

## CONTEXT WINDOW RULES
- At 60% context: write pickup prompt + offer fresh session
- Pickup prompt format: paste-ready block with file locations, current state, next step
- Never cross 80% without having written the pickup prompt first
