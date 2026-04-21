#!/usr/bin/env python3
"""
Video Pipeline Orchestrator
============================
Single script that chains: script markdown → TTS audio → Whisper timestamps → video config → Remotion render.

Usage:
    python3 scripts/orchestrate.py scripts/my-video-script.md [--render] [--preview]

Steps:
    1. Parse the script markdown (frontmatter + scenes + narration)
    2. Generate TTS audio with Edge TTS (with phonetic replacements)
    3. Run Whisper for word-level timestamps at scene marker phrases
    4. Generate video config JSON with exact frame timings
    5. (Optional) Render the video with Remotion
"""

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
import yaml

# ─── Paths ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(BASE_DIR, "audio")
REMOTION_DIR = os.path.join(BASE_DIR, "remotion-project")
REMOTION_AUDIO = os.path.join(REMOTION_DIR, "public", "audio")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")


# ═══════════════════════════════════════════════════════════════════
# STEP 1: Parse Script Markdown
# ═══════════════════════════════════════════════════════════════════

def parse_script(script_path: str) -> dict:
    """Parse a standardized script markdown into structured data."""
    with open(script_path, 'r') as f:
        content = f.read()

    # Extract YAML frontmatter
    frontmatter = {}
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter = yaml.safe_load(parts[1]) or {}
            content = parts[2]

    # Extract title
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Untitled Video"

    # Extract scenes
    scene_blocks = re.split(r'^##\s+SCENE\s+(\d+)\s*[—–-]\s*', content, flags=re.MULTILINE)
    scenes = []

    for i in range(1, len(scene_blocks), 2):
        scene_num = int(scene_blocks[i])
        block = scene_blocks[i + 1] if i + 1 < len(scene_blocks) else ""

        scene = parse_scene_block(scene_num, block)
        scenes.append(scene)

    return {
        'title': title,
        'frontmatter': frontmatter,
        'scenes': scenes,
    }


def parse_scene_block(num: int, block: str) -> dict:
    """Parse a single scene block into structured data."""
    # Parse scene header: HOOK (title: "Foo" color=cyan)
    header_match = re.match(r'(\w+)\s*(?:\((.+?)\))?\s*\n', block)
    scene_type = header_match.group(1).lower() if header_match else 'hook'
    header_params = header_match.group(2) or '' if header_match else ''

    # Parse header parameters
    params = {}
    for match in re.finditer(r'(\w+)\s*[:=]\s*"?([^")\s]+)"?', header_params):
        params[match.group(1)] = match.group(2)

    # Extract narration (blockquote lines)
    narration_lines = re.findall(r'^>\s*(.+)$', block, re.MULTILINE)
    narration = ' '.join(narration_lines)

    # Extract visual directions
    visuals = re.findall(r'\*\*\[Visual:\s*(.+?)\]\*\*', block)

    # Extract kinetic text
    kinetic_match = re.search(r'\*\*\[Kinetic:\s*"([^"]+)"\s*(.*?)\]\*\*', block)
    kinetic_text = kinetic_match.group(1) if kinetic_match else None
    kinetic_params = kinetic_match.group(2) if kinetic_match else ''

    # Parse kinetic color
    kinetic_color = 'accent1'
    color_match = re.search(r'color=(\w+)', kinetic_params)
    if color_match:
        kinetic_color = color_match.group(1)

    # Parse kinetic effects
    kinetic_effects = []
    if 'shimmer' in kinetic_params: kinetic_effects.append('shimmer')
    if 'glow' in kinetic_params: kinetic_effects.append('glow')
    if not kinetic_effects: kinetic_effects.append('glow')  # default

    # Extract B-roll
    broll_match = re.search(r'\*\*\[B-roll:\s*(.+?)\]\*\*', block)
    broll_src = broll_match.group(1).strip() if broll_match else None

    # Extract kinetic sequence (for bridge scenes)
    kinetic_seq = None
    seq_match = re.search(r'\*\*\[Kinetic:\s*(.+?)\]\*\*', block)
    if seq_match and '→' in seq_match.group(1):
        items = seq_match.group(1).split('→')
        kinetic_seq = []
        for item in items:
            text_match = re.search(r'"([^"]+)"', item)
            col_match = re.search(r'color=(\w+)', item)
            if text_match:
                kinetic_seq.append({
                    'text': text_match.group(1),
                    'color': col_match.group(1) if col_match else 'accent1',
                })

    # Detect marker phrase (first few words of narration for scene detection)
    marker_phrase = None
    if narration:
        # Use "Number X" pattern for archetype scenes
        num_match = re.match(r'(Number \w+)', narration)
        if num_match:
            marker_phrase = num_match.group(1)
        elif scene_type == 'bridge':
            # First 3-4 words
            words = narration.split()[:4]
            marker_phrase = ' '.join(words)
        elif scene_type == 'cta':
            words = narration.split()[:5]
            marker_phrase = ' '.join(words)

    return {
        'number': num,
        'type': scene_type,
        'title': params.get('title', ''),
        'titleLine2': params.get('titleLine2', ''),
        'color': params.get('color', 'accent1'),
        'icon': params.get('icon', ''),
        'subtitle': params.get('subtitle', ''),
        'narration': narration,
        'visuals': visuals,
        'kineticText': kinetic_text,
        'kineticColor': kinetic_color,
        'kineticEffects': kinetic_effects,
        'kineticSequence': kinetic_seq,
        'brollSrc': broll_src,
        'markerPhrase': marker_phrase,
    }


# ═══════════════════════════════════════════════════════════════════
# STEP 2: Generate TTS Audio
# ═══════════════════════════════════════════════════════════════════

async def generate_tts(parsed: dict, output_name: str) -> str:
    """Generate TTS audio from parsed script narration."""
    import edge_tts

    fm = parsed['frontmatter']
    voice = fm.get('voice', 'en-US-AndrewMultilingualNeural')
    rate = fm.get('rate', '+12%')
    pitch = fm.get('pitch', '-2Hz')
    phonetic = fm.get('phonetic', {})

    # Concatenate all narration with pauses between scenes
    narration_parts = []
    for scene in parsed['scenes']:
        if scene['narration']:
            narration_parts.append(scene['narration'])

    full_text = '\n\n'.join(narration_parts)

    # Apply phonetic replacements (only in TTS text, not display text)
    for word, pronunciation in phonetic.items():
        # Replace in URL contexts: "word.com" → "pronunciation dot com"
        full_text = re.sub(
            rf'{re.escape(word)}\.com',
            f'{pronunciation} dot com',
            full_text,
            flags=re.IGNORECASE,
        )
        # Replace standalone
        full_text = re.sub(
            rf'\b{re.escape(word)}\b',
            pronunciation,
            full_text,
        )

    print(f"  Voice: {voice}, Rate: {rate}, Pitch: {pitch}")
    print(f"  Narration length: {len(full_text)} chars, {len(full_text.split())} words")

    # Generate audio
    audio_path = os.path.join(AUDIO_DIR, f"{output_name}.mp3")
    os.makedirs(AUDIO_DIR, exist_ok=True)

    communicate = edge_tts.Communicate(full_text, voice, rate=rate, pitch=pitch)
    await communicate.save(audio_path)

    # Copy to Remotion public dir
    os.makedirs(REMOTION_AUDIO, exist_ok=True)
    shutil.copy2(audio_path, os.path.join(REMOTION_AUDIO, f"{output_name}.mp3"))

    print(f"  Audio saved: {audio_path} ({os.path.getsize(audio_path) / 1024:.1f} KB)")
    return audio_path


# ═══════════════════════════════════════════════════════════════════
# STEP 3: Get Whisper Timestamps
# ═══════════════════════════════════════════════════════════════════

def get_whisper_timestamps(audio_path: str, scenes: list, fps: int = 30) -> dict:
    """Run faster-whisper to get word-level timestamps for scene markers."""
    from faster_whisper import WhisperModel

    print("  Loading Whisper model (base)...")
    model = WhisperModel("base", device="cpu", compute_type="int8")

    print(f"  Transcribing {audio_path}...")
    segments, info = model.transcribe(audio_path, word_timestamps=True, language="en")

    audio_duration = info.duration
    audio_frames = int(audio_duration * fps)
    print(f"  Audio duration: {audio_duration:.2f}s ({audio_frames} frames)")

    # Collect all words
    all_words = []
    for segment in segments:
        if segment.words:
            for word in segment.words:
                all_words.append((word.start, word.end, word.word.strip()))

    print(f"  Total words: {len(all_words)}")

    # Find marker phrases
    markers = {}
    for scene in scenes:
        phrase = scene.get('markerPhrase')
        if not phrase:
            continue

        phrase_words = phrase.lower().split()
        for i in range(len(all_words) - len(phrase_words) + 1):
            candidate = [all_words[i + j][2].lower().strip(".,!?;:'\"") for j in range(len(phrase_words))]
            if candidate == phrase_words:
                start_time = all_words[i][0]
                frame = int(start_time * fps)
                markers[phrase] = {'time': start_time, 'frame': frame}
                print(f"    Found \"{phrase}\" at {start_time:.2f}s (frame {frame})")
                break
        else:
            print(f"    WARNING: Could not find marker \"{phrase}\"")

    return {
        'markers': markers,
        'audioDuration': audio_duration,
        'audioFrames': audio_frames,
        'wordCount': len(all_words),
    }


# ═══════════════════════════════════════════════════════════════════
# STEP 4: Generate Video Config
# ═══════════════════════════════════════════════════════════════════

def generate_config(parsed: dict, timestamps: dict, output_name: str) -> dict:
    """Generate a complete video config JSON from parsed script + timestamps."""
    fm = parsed['frontmatter']
    fps = fm.get('fps', 30)
    colors_fm = fm.get('colors', {})

    colors = {
        'bg': colors_fm.get('bg', '#0a0e1a'),
        'accent1': colors_fm.get('accent1', '#00d4ff'),
        'accent2': colors_fm.get('accent2', '#f5a623'),
        'accent3': colors_fm.get('accent3', '#ff6b35'),
        'textPrimary': '#ffffff',
        'textSecondary': '#a0aec0',
    }

    audio_frames = timestamps['audioFrames']
    markers = timestamps['markers']

    # Build scene configs with timing
    scene_configs = []
    scenes = parsed['scenes']

    for i, scene in enumerate(scenes):
        # Determine start frame
        if i == 0:
            start_frame = 0
        else:
            phrase = scene.get('markerPhrase')
            if phrase and phrase in markers:
                start_frame = markers[phrase]['frame']
            else:
                # Estimate proportionally
                start_frame = int(audio_frames * (i / len(scenes)))

        # Determine end frame
        if i < len(scenes) - 1:
            next_scene = scenes[i + 1]
            next_phrase = next_scene.get('markerPhrase')
            if next_phrase and next_phrase in markers:
                end_frame = markers[next_phrase]['frame']
            else:
                end_frame = int(audio_frames * ((i + 1) / len(scenes)))
        else:
            # Last scene: hold 5s past audio end
            hold = scene.get('holdFrames', 150) if scene['type'] == 'cta' else 0
            end_frame = audio_frames + hold

        # Build scene config
        scene_cfg = {
            'type': scene['type'],
            'accentColor': scene.get('color', 'accent1'),
            'timing': {
                'startFrame': start_frame,
                'endFrame': end_frame,
            },
        }

        if scene.get('title'):
            scene_cfg['title'] = scene['title']
        if scene.get('titleLine2'):
            scene_cfg['titleLine2'] = scene['titleLine2']
        if scene.get('subtitle'):
            scene_cfg['subtitle'] = scene['subtitle']
        if scene.get('icon'):
            scene_cfg['icon'] = scene['icon']
        if scene['type'] == 'archetype':
            scene_cfg['number'] = scene.get('number', i)
        if scene.get('kineticText'):
            scene_cfg['kineticText'] = scene['kineticText']
            scene_cfg['kineticColor'] = scene.get('kineticColor', 'accent1')
            scene_cfg['kineticEffects'] = scene.get('kineticEffects', ['glow'])
        if scene.get('kineticSequence'):
            scene_cfg['kineticSequence'] = scene['kineticSequence']
        if scene.get('brollSrc'):
            # Estimate max duration from common clip lengths
            scene_cfg['broll'] = {
                'src': scene['brollSrc'],
                'maxDuration': 420,  # 14s default, override in script if needed
            }
        if scene.get('markerPhrase'):
            scene_cfg['markerPhrase'] = scene['markerPhrase']
        if scene['type'] == 'cta':
            scene_cfg['holdFrames'] = 150

        scene_configs.append(scene_cfg)

    total_frames = scene_configs[-1]['timing']['endFrame'] if scene_configs else audio_frames

    config = {
        'title': parsed['title'],
        'compositionId': 'TemplateVideo',
        'audio': {
            'voice': fm.get('voice', 'en-US-AndrewMultilingualNeural'),
            'rate': fm.get('rate', '+12%'),
            'pitch': fm.get('pitch', '-2Hz'),
            'file': f'{output_name}.mp3',
            'phonetic': fm.get('phonetic', {}),
        },
        'render': {
            'fps': fps,
            'width': fm.get('width', 1920),
            'height': fm.get('height', 1080),
            'concurrency': 2,
        },
        'colors': colors,
        'effects': {
            'particles': True,
            'noiseOverlay': True,
            'sceneTransitions': fm.get('style', 'cinematic-dark') == 'cinematic-dark' and 'liquid' or 'crossfade',
            'hueShift': True,
            'kineticStyle': 'spring-glow',
        },
        'ctaUrl': fm.get('cta_url', 'scottmagnacca.com'),
        'ctaTagline': fm.get('cta_tagline', 'Build the skills that make you impossible to ignore'),
        'totalFrames': total_frames,
        'scenes': scene_configs,
    }

    # Save config
    config_path = os.path.join(TEMPLATES_DIR, f"{output_name}.config.json")
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"  Config saved: {config_path}")

    return config


# ═══════════════════════════════════════════════════════════════════
# STEP 5: Render (optional)
# ═══════════════════════════════════════════════════════════════════

def render_video(config: dict, output_name: str):
    """Render the video using Remotion with the generated config."""
    fps = config['render']['fps']
    total_frames = config['totalFrames']
    concurrency = config['render']['concurrency']

    output_path = os.path.join(OUTPUT_DIR, f"{output_name}.mp4")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Write config to Remotion public dir so it can be loaded
    config_dest = os.path.join(REMOTION_DIR, "public", f"{output_name}.config.json")
    with open(config_dest, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"  Rendering {total_frames} frames at {fps}fps...")
    print(f"  Output: {output_path}")

    cmd = [
        "npx", "remotion", "render",
        "remotion/index.ts", "TemplateVideo", output_path,
        f"--concurrency={concurrency}",
        f"--props", json.dumps({"config": config}),
    ]

    result = subprocess.run(cmd, cwd=REMOTION_DIR, capture_output=False)

    if result.returncode == 0:
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"  Render complete: {output_path} ({size_mb:.1f} MB)")
    else:
        print(f"  Render FAILED with exit code {result.returncode}")
        sys.exit(1)


# ═══════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Video Pipeline Orchestrator")
    parser.add_argument("script", help="Path to script markdown file")
    parser.add_argument("--render", action="store_true", help="Render the video after generating config")
    parser.add_argument("--preview", action="store_true", help="Open Remotion Studio for preview")
    parser.add_argument("--name", help="Output name (default: derived from script filename)")
    parser.add_argument("--skip-tts", action="store_true", help="Skip TTS generation (use existing audio)")
    parser.add_argument("--skip-whisper", action="store_true", help="Skip Whisper (use existing config timings)")
    args = parser.parse_args()

    # Derive output name
    output_name = args.name or os.path.splitext(os.path.basename(args.script))[0]

    print(f"{'='*60}")
    print(f"VIDEO PIPELINE ORCHESTRATOR")
    print(f"{'='*60}")
    print(f"Script: {args.script}")
    print(f"Output name: {output_name}")
    print()

    # Step 1: Parse
    print("[1/5] Parsing script...")
    parsed = parse_script(args.script)
    print(f"  Title: {parsed['title']}")
    print(f"  Scenes: {len(parsed['scenes'])}")
    for s in parsed['scenes']:
        marker = f" (marker: \"{s['markerPhrase']}\")" if s.get('markerPhrase') else ""
        print(f"    Scene {s['number']}: {s['type'].upper()} — {s.get('title', 'untitled')}{marker}")
    print()

    # Step 2: TTS
    audio_path = os.path.join(AUDIO_DIR, f"{output_name}.mp3")
    if args.skip_tts:
        print("[2/5] Skipping TTS (--skip-tts)")
        if not os.path.exists(audio_path):
            print(f"  ERROR: Audio not found at {audio_path}")
            sys.exit(1)
    else:
        print("[2/5] Generating TTS audio...")
        asyncio.run(generate_tts(parsed, output_name))
    print()

    # Step 3: Whisper
    if args.skip_whisper:
        print("[3/5] Skipping Whisper (--skip-whisper)")
        # Load existing config for timings
        existing_config = os.path.join(TEMPLATES_DIR, f"{output_name}.config.json")
        if os.path.exists(existing_config):
            with open(existing_config) as f:
                timestamps = json.load(f)
        else:
            print("  ERROR: No existing config found. Remove --skip-whisper.")
            sys.exit(1)
        timestamps_data = None
    else:
        print("[3/5] Getting Whisper timestamps...")
        timestamps_data = get_whisper_timestamps(audio_path, parsed['scenes'])
    print()

    # Step 4: Config
    print("[4/5] Generating video config...")
    if timestamps_data:
        config = generate_config(parsed, timestamps_data, output_name)
    else:
        print("  Using existing config timings")
        config_path = os.path.join(TEMPLATES_DIR, f"{output_name}.config.json")
        with open(config_path) as f:
            config = json.load(f)
    print()

    # Step 5: Render
    if args.render:
        print("[5/5] Rendering video...")
        render_video(config, output_name)
    elif args.preview:
        print("[5/5] Starting Remotion Studio...")
        subprocess.Popen(
            ["npx", "remotion", "studio", "remotion/index.ts"],
            cwd=REMOTION_DIR,
        )
        print("  Studio started. Open the URL in your browser.")
    else:
        print("[5/5] Skipping render (use --render to render, --preview for studio)")
    print()

    print(f"{'='*60}")
    print("DONE")
    print(f"  Config: templates/{output_name}.config.json")
    print(f"  Audio:  audio/{output_name}.mp3")
    if args.render:
        print(f"  Video:  output/{output_name}.mp4")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
