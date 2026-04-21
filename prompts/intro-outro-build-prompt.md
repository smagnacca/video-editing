# Claude Code Prompt: Build Reusable Intro & Outro Scene Components

## TASK OVERVIEW
Build 3 new reusable Remotion components for the video pipeline: `IntroScene.tsx`, `OutroScene.tsx`, and `LowerThird.tsx`. These implement MasterClass-style intro hooks and seamless-CTA outro patterns. Also update `TemplateVideo.tsx` to support the new `intro` and `outro` scene types, and update the config schema.

**Working directory:** The Remotion project is in this folder's `remotion-project/` subdirectory.

---

## CRITICAL RULES (from CLAUDE.md — NEVER violate these)
1. **NO `WebkitBackgroundClip: 'text'`** or `WebkitTextFillColor: 'transparent'` or CSS gradient-clip text. They render as SOLID COLOR BARS in Remotion. Use solid `color` + `textShadow` glow instead.
2. **NO overlay B-roll on dark backgrounds** — use side-by-side layout only.
3. **Copy Remotion project to `/sessions/` writable directory for any rendering** (the mount has EPERM on unlink).
4. **Use Remotion's `spring()` function** for all entrance animations. Import from `remotion`.
5. **Match existing style patterns** — see existing components in `remotion-project/src/components/` for font families, glow patterns, glassmorphism, particle usage.

---

## DESIGN SPECIFICATION

### Color Palette (use existing VideoColors interface)
```
bg: #0a0e1a (deep navy)
accent1/cyan: #00d4ff
accent2/gold: #f5a623
accent3/orange: #ff6b35
textPrimary: #ffffff
textSecondary: #a0aec0
cardBg: rgba(255,255,255,0.05)
```

### Animation Physics (match existing spring configs)
- Entrance: damping 14-18, stiffness 60-100
- Card slide: damping 18, stiffness 80
- Text fade: damping 18, stiffness 60
- Font: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

---

## COMPONENT 1: `LowerThird.tsx`

**File:** `remotion-project/src/components/LowerThird.tsx`

### Purpose
A sleek, modern lower-third graphic that displays speaker name and title. Slides in from the left at a configurable frame. Used in IntroScene but reusable anywhere.

### Props Interface
```typescript
interface LowerThirdProps {
  name: string;           // e.g., "Scott Magnacca"
  title: string;          // e.g., "AI & Leadership Strategist"
  accentColor?: string;   // default: '#00d4ff'
  delay?: number;         // frame to start entrance, default: 150 (5s at 30fps)
  duration?: number;      // how long to display, default: 150 (5s)
  nameColor?: string;     // default: '#ffffff'
  titleColor?: string;    // default: '#a0aec0'
}
```

### Visual Design
- **Position:** Bottom-left of screen, 80px from left edge, 120px from bottom
- **Structure (left to right):**
  1. Vertical accent line: 3px wide, 50px tall, `accentColor`, with glow shadow
  2. 16px gap
  3. Name text: 28px, weight 700, `nameColor`, single-line
  4. Title text directly below name: 20px, weight 400, `titleColor`, uppercase, letter-spacing 2px

### Animation Sequence
1. **Frame `delay` to `delay+20`:** Accent line slides in from left (translateX: -200 → 0) using spring (damping: 16, stiffness: 90)
2. **Frame `delay+10` to `delay+30`:** Name fades in and slides right (translateX: -30 → 0, opacity 0 → 1) using spring
3. **Frame `delay+20` to `delay+40`:** Title fades in same way, staggered 10 frames after name
4. **Hold** for `duration` frames
5. **Exit (last 20 frames of duration):** Everything fades out (opacity 1 → 0) with slight translateX shift left (-20px)

### Glow Effect on Accent Line
```css
boxShadow: `0 0 10px ${accentColor}80, 0 0 20px ${accentColor}40`
```

---

## COMPONENT 2: `IntroScene.tsx`

**File:** `remotion-project/src/components/IntroScene.tsx`

### Purpose
MasterClass-style video opening that captures attention in under 3 seconds using kinetic typography, establishes authority via lower third, and uses pattern interrupts to maintain the 20-second retention window. Configurable for any video topic in the series.

### Props Interface
```typescript
interface IntroSceneProps {
  scene: SceneConfig;     // from existing TemplateVideo types
  colors: VideoColors;    // from existing TemplateVideo types
  effects: EffectsConfig; // from existing TemplateVideo types
}
```

### Scene Config Extensions (new fields on SceneConfig for type 'intro')
```typescript
// These fields on SceneConfig are used when type === 'intro':
{
  type: 'intro',
  hookText: string;           // 3-5 word attention hook, e.g., "Your Edge Isn't What You Think"
  hookColor?: string;         // defaults to accent2 (gold) for maximum contrast on dark bg
  topicTitle: string;         // what the video covers, e.g., "3 Attitudes That Define AI Leaders"
  topicSubtitle?: string;     // optional secondary line
  speakerName?: string;       // defaults to "Scott Magnacca"
  speakerTitle?: string;      // defaults to "AI & Leadership Strategist"
  accentColor: string;        // scene accent (usually accent1/cyan)
  kineticText?: string;       // optional punch text late in intro
  kineticColor?: string;
  timing: { startFrame: number; endFrame: number }
}
```

### Visual Layout & Phases

The intro scene is ~10 seconds (300 frames at 30fps). It has 3 distinct phases:

#### Phase 1: THE HOOK (frames 0–90, seconds 0–3)
- **Background:** Dark navy (#0a0e1a) with ParticleField (count: 30, low intensity: 0.6, cyan color) providing subtle ambient movement
- **Spotlight:** A single radial gradient accent light, positioned center-top, pulsing gently. Use the existing Spotlight approach (radial-gradient with animated position):
  ```css
  background: radial-gradient(ellipse 600px 400px at 50% 30%, ${accentColor}15, transparent)
  ```
- **Hook Text:** Large, bold kinetic typography, center-screen
  - Font size: 88px, weight: 900
  - Color: `hookColor` (gold #f5a623 by default) with 3-layer textShadow glow:
    ```css
    textShadow: `0 0 20px ${hookColor}80, 0 0 40px ${hookColor}40, 0 0 60px ${hookColor}20`
    ```
  - Entrance: spring animation (damping: 14, stiffness: 80), scale 0.7→1.0, opacity 0→1, starting at frame 8
  - Text should be ALL CAPS
  - Max width: 1400px, centered, text-align center
- **Continuous slow zoom:** The entire scene content wrapper scales from 1.0 to 1.03 linearly across the full scene duration. This creates subtle forward momentum (MasterClass technique).
  ```typescript
  const zoom = interpolate(frame, [0, sceneDuration], [1, 1.03], { extrapolateRight: 'clamp' });
  ```

#### Phase 2: AUTHORITY ESTABLISHMENT (frames 90–240, seconds 3–8)
- **Hook text remains** on screen (don't remove it — it holds the open loop)
- **Lower Third enters** at frame 150 (5-second mark):
  - Use the `<LowerThird>` component with `name={speakerName}` and `title={speakerTitle}`
  - This runs in parallel with the hook text — no competition because lower third is bottom-left, hook text is center
- **Pattern Interrupt at frame 90 (3-second mark):**
  - Particle field briefly intensifies: `pulseColor` flashes to gold (#f5a623) for ~15 frames
  - This is a subtle visual reset that re-engages attention without feeling chaotic

#### Phase 3: TOPIC REVEAL + TRANSITION (frames 240–300, seconds 8–10)
- **Pattern Interrupt at frame 240 (8-second mark):**
  - Hook text fades out over 20 frames (opacity 1→0, slight scale 1.0→0.95)
- **Topic Title enters** at frame 250:
  - Font size: 64px, weight: 800, color: white (#ffffff) with cyan glow
  - Spring entrance (damping: 16, stiffness: 70), translateY: 40→0, opacity 0→1
  - Centered on screen, replaces hook text position
  - textShadow: `0 0 15px ${accentColor}60, 0 0 30px ${accentColor}30`
- **Topic Subtitle** (if provided) enters at frame 265:
  - Font size: 32px, weight: 400, color: textSecondary (#a0aec0), uppercase, letter-spacing 3px
  - Staggered spring entrance, 15 frames after topic title
- **Scene Transition** in final ~15 frames:
  - If `effects.sceneTransitions === 'liquid'`, render a `<LiquidReveal>` at frame (sceneDuration - 15)
  - If `'crossfade'`, render `<CrossfadeTransition>` at same point
  - This provides a clean handoff to the first content scene (hook/archetype)

### Layer Order (z-index, back to front)
1. Background (dark navy solid)
2. Spotlight radial gradient
3. ParticleField (z-index: 1)
4. Content wrapper (hook text, topic title) with zoom transform
5. LowerThird (z-index: 10, positioned absolute bottom-left)
6. NoiseOverlay if `effects.noiseOverlay` (z-index: 50)
7. Scene transition (z-index: 100)

---

## COMPONENT 3: `OutroScene.tsx`

**File:** `remotion-project/src/components/OutroScene.tsx`

### Purpose
A seamless-CTA outro that NEVER signals "wrapping up." The CTA slides in while visual energy is maintained. Implements the "visual funnel" pattern: everything on screen points toward a single action (the quiz/lead magnet). Based on HubSpot Academy and Ali Abdaal best practices.

### Props Interface
```typescript
interface OutroSceneProps {
  scene: SceneConfig;
  colors: VideoColors;
  effects: EffectsConfig;
  ctaUrl: string;        // from top-level config
  ctaTagline: string;    // from top-level config
}
```

### Scene Config Extensions (new fields for type 'outro')
```typescript
{
  type: 'outro',
  ctaHeadline: string;        // e.g., "Take the 60-Second Quiz"
  ctaDescription?: string;    // e.g., "Discover your AI leadership style"
  ctaButtonText?: string;     // e.g., "START THE QUIZ" (displayed as a styled button graphic)
  accentColor: string;        // usually accent2 (gold) for warmth/action
  kineticText?: string;       // optional final punch text
  kineticColor?: string;
  speakerName?: string;       // for small credit line
  timing: { startFrame: number; endFrame: number }
}
```

### Visual Layout & Phases

The outro is ~8-10 seconds (240-300 frames). THREE phases that flow seamlessly:

#### Phase 1: VALUE CONTINUATION (frames 0–60, seconds 0–2)
- **Background:** Maintains the same animated gradient background as the previous scene — do NOT cut to black or change mood. Use AnimatedBackground with the scene's bgColors or fallback to `[accentColor, colors.bg, '#1a0a2e']`
- **ParticleField:** Active, same as content scenes (count: 40, full intensity)
- **Narration continues** (audio is still playing from the last content scene — the outro starts before the speaker says anything that sounds like a conclusion)
- **Subtle visual cue:** A thin accent line (2px, gold) begins drawing across the bottom of the screen from left to right over 60 frames. This is the "funnel" starting — subconsciously directing the eye.

#### Phase 2: CTA SLIDE-IN (frames 60–150, seconds 2–5)
- **Split composition begins:**
  - Left half: If there's `kineticText`, it appears here as a final reinforcement phrase (using existing KineticText component). If not, a styled quote or the topicTitle from the video.
  - Right half: CTA card slides in from the right edge

- **CTA Card (right side):**
  - Uses GlassmorphismCard component, width: 700px
  - Entrance: spring (damping: 16, stiffness: 70), translateX: 200→0, starting at frame 60
  - Content inside the card (top to bottom):
    1. **CTA Headline:** 42px, weight: 800, white, with gold glow
       ```css
       textShadow: `0 0 15px ${accent2}60, 0 0 30px ${accent2}30`
       ```
    2. **CTA Description** (if provided): 24px, weight: 400, textSecondary, 12px below headline
    3. **CTA Button graphic:** A rounded rectangle (border-radius 12px), 360px × 60px
       - Background: linear gradient from accent2 to accent3 (gold→orange)
       - BUT since we can't use gradient-clip, just use solid accent2 (#f5a623) background
       - Text: `ctaButtonText` or "START NOW", 22px, weight: 800, color: #0a0e1a (dark on gold for contrast)
       - Subtle pulse animation: scale oscillates 1.0→1.03→1.0 on a 60-frame cycle using sine wave
       - Box-shadow glow: `0 0 20px ${accent2}60, 0 0 40px ${accent2}30`
    4. **URL display:** 20px, weight: 400, textSecondary, `ctaUrl` text below button
       - Use TypewriterText component for the URL (speed: 3 frames/char, glowColor: accent1)

- **Animated Arrow:**
  - An SVG arrow (chevron/pointer) positioned to the left of the CTA card
  - Points right → toward the CTA
  - Bounces horizontally: translateX oscillates 0→15→0px on a 40-frame sine cycle
  - Color: accent2 (gold), with glow shadow
  - Enters at frame 90 (staggered after card)
  - SVG path: `M 0 25 L 30 25 L 20 15 M 30 25 L 20 35` (simple arrow head)
  - Size: 50px wide, stroke-width: 3

#### Phase 3: HOLD + GENTLE FADE (frames 150–end)
- **Everything holds in place** — CTA card, arrow, particles all remain
- **Button pulse continues** — keeps visual energy alive
- **Final 30 frames:** Gentle overall opacity fade from 1.0→0.0 on all elements
  - Do NOT fade to black abruptly — use a slow ease
  - Particles can fade slightly faster (last 20 frames) for a cinematic "lights dimming" feel
- **Small credit line** (bottom center, appears at frame 150):
  - `speakerName || "Scott Magnacca"` + " • " + `ctaUrl`
  - 16px, weight: 400, textSecondary at 50% opacity
  - Very subtle — just enough for brand reinforcement

### Layer Order (z-index)
1. Background (animated gradient)
2. Bottom accent line (drawing animation)
3. ParticleField (z-index: 1)
4. Left side content (kinetic text / reinforcement)
5. CTA Card + Arrow (z-index: 10)
6. Credit line (z-index: 10)
7. NoiseOverlay if enabled (z-index: 50)

---

## INTEGRATION: Update TemplateVideo.tsx

### Add to SceneRenderer
In `remotion-project/src/TemplateVideo.tsx`, the `SceneRenderer` component has a switch/if-else on `scene.type`. Add two new cases:

```typescript
case 'intro':
  return <IntroScene scene={scene} colors={colors} effects={effects} />;
case 'outro':
  return <OutroScene scene={scene} colors={colors} effects={effects} ctaUrl={config.ctaUrl} ctaTagline={config.ctaTagline} />;
```

### Add imports at top of TemplateVideo.tsx
```typescript
import { IntroScene } from './components/IntroScene';
import { OutroScene } from './components/OutroScene';
```

### Extend SceneConfig interface
Add these optional fields to the existing SceneConfig interface in TemplateVideo.tsx:
```typescript
// For intro scenes:
hookText?: string;
hookColor?: string;
topicTitle?: string;
topicSubtitle?: string;
speakerName?: string;
speakerTitle?: string;

// For outro scenes:
ctaHeadline?: string;
ctaDescription?: string;
ctaButtonText?: string;
```

---

## UPDATE: Config Schema

Update `templates/video.config.example.json` to include example intro and outro scenes. Add these to the `scenes` array:

**Intro scene example (should be FIRST scene):**
```json
{
  "type": "intro",
  "hookText": "YOUR EDGE ISN'T WHAT YOU THINK",
  "hookColor": "accent2",
  "topicTitle": "3 Attitudes That Define AI Leaders",
  "topicSubtitle": "Curiosity · Learning · Adaptability",
  "speakerName": "Scott Magnacca",
  "speakerTitle": "AI & Leadership Strategist",
  "accentColor": "accent1",
  "timing": { "startFrame": 0, "endFrame": 300 }
}
```

**Outro scene example (should be LAST scene):**
```json
{
  "type": "outro",
  "ctaHeadline": "Take the 60-Second Quiz",
  "ctaDescription": "Discover your AI leadership style",
  "ctaButtonText": "START THE QUIZ",
  "accentColor": "accent2",
  "kineticText": "YOUR CIRCLE IS YOUR CATALYST",
  "kineticColor": "accent1",
  "speakerName": "Scott Magnacca",
  "timing": { "startFrame": 5700, "endFrame": 5953 }
}
```

Also update the top-level config to add:
```json
"ctaUrl": "scottmagnacca.com",
"ctaTagline": "Discover your AI leadership edge"
```

---

## FILE SUMMARY — What to Create/Modify

### NEW FILES:
1. `remotion-project/src/components/LowerThird.tsx`
2. `remotion-project/src/components/IntroScene.tsx`
3. `remotion-project/src/components/OutroScene.tsx`

### MODIFIED FILES:
4. `remotion-project/src/TemplateVideo.tsx` — add `intro` and `outro` cases to SceneRenderer, extend SceneConfig interface, add imports
5. `templates/video.config.example.json` — add intro/outro scene examples and ctaUrl/ctaTagline fields

### DO NOT MODIFY:
- Existing components (KineticText, ParticleField, GlassmorphismCard, etc.) — import and reuse them as-is
- Root.tsx — no changes needed
- ThreeTypesVideo.tsx — leave the hardcoded reference intact

---

## TESTING CHECKLIST
After building, verify:
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit` in remotion-project/)
- [ ] IntroScene renders: hook text visible in first 3 seconds, lower third at 5s, topic reveal at 8s
- [ ] OutroScene renders: CTA card slides in, arrow bounces, button pulses, URL typewriter works
- [ ] LowerThird renders: accent line + name + title, proper stagger timing
- [ ] No WebkitBackgroundClip or gradient-clip anywhere in new code
- [ ] All spring animations use `import { spring } from 'remotion'`
- [ ] New scene types work in TemplateVideo when config JSON includes them
- [ ] Existing scene types (hook, archetype, bridge, cta) still work unchanged

---

## IMPORTANT REMINDERS
- Run all work in a writable directory (copy remotion-project to /sessions/ if needed for rendering)
- Use `--concurrency=2` for any Remotion renders to avoid memory issues
- The components should be fully self-contained — import what they need from other components but don't modify those components
- Match the visual quality and code patterns of existing components exactly
