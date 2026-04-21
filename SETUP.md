# 🎬 Video Pipeline Setup Guide

ElevenLabs + Remotion local render pipeline.

---

## One-Time Setup (Do This First)

### 1. Install Node.js (if not already installed)
Download from: https://nodejs.org (LTS version)

### 2. Install dotenv in this folder
Open Terminal, navigate to this folder, then run:
```
npm init -y && npm install dotenv
```

### 3. Create your Remotion project
In the same Terminal window, run:
```
npm create video@latest remotion-project
```
- Choose a starter template (e.g. "Hello World")
- When prompted: `cd remotion-project && npm install`
- Then come back: `cd ..`

### 4. Test ElevenLabs connection
```
node elevenlabs.js "Hello, this is a test voiceover." adam test.mp3
```
Check the `audio/` folder for `test.mp3`

### 5. Test Remotion render
```
node render.js MyComp test-render.mp4
```
Check the `output/` folder for the video.

### 6. Run the full pipeline
```
node generate-video.js --text="Your video script goes here" --voice=adam --comp=MyComp
```

---

## Available Voices (ElevenLabs Free Tier)

| Name    | Style                        |
|---------|------------------------------|
| adam    | Deep American male narrator  |
| rachel  | Calm young American female   |
| josh    | Deep American male           |
| arnold  | Crisp American male          |
| bella   | Soft young American female   |
| elli    | Young American female        |
| domi    | Strong American female       |
| sam     | Energetic American male      |
| antoni  | Well-rounded American male   |

---

## Project Structure

```
Cowork-video-editing project/
├── .env                  ← API keys (never commit this)
├── .gitignore
├── elevenlabs.js         ← ElevenLabs voiceover script
├── render.js             ← Remotion local render script
├── generate-video.js     ← Full pipeline (audio + video)
├── SETUP.md              ← This file
├── audio/                ← Generated .mp3 files
├── output/               ← Rendered .mp4 files
└── remotion-project/     ← Your Remotion project (after setup)
```

---

## Passing Audio to Remotion

In your Remotion composition, accept `audioSrc` as a prop:

```jsx
// remotion-project/src/MyComp.tsx
export const MyComp = ({ audioSrc }) => {
  return (
    <AbsoluteFill>
      {audioSrc && <Audio src={audioSrc} />}
      {/* your visual content */}
    </AbsoluteFill>
  );
};
```

---

## Troubleshooting

- **API key error**: Check `.env` file has correct `ELEVENLABS_API_KEY`
- **Remotion not found**: Make sure you ran `npm install` inside `remotion-project/`
- **No audio in video**: Add `<Audio src={audioSrc} />` to your Remotion composition
