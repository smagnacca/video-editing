#!/usr/bin/env python3
"""Run faster-whisper on the TTS audio to get word-level timestamps for scene boundaries."""

from faster_whisper import WhisperModel
import os

AUDIO = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                     "audio", "3-types-of-people.mp3")
FPS = 30

# Key phrases marking scene transitions
MARKERS = {
    "Number one": "Start of Believer (Scene 2)",
    "Number two": "Start of Peer (Scene 3)",
    "Number three": "Start of Coach (Scene 4)",
    "These three types": "Start of Bridge (Scene 5)",
    "Your circle is your catalyst": "Start of CTA (Scene 6)",
}

print(f"Loading model (base)...")
model = WhisperModel("base", device="cpu", compute_type="int8")

print(f"Transcribing {AUDIO}...")
segments, info = model.transcribe(AUDIO, word_timestamps=True, language="en")

print(f"\nDetected language: {info.language} (prob={info.language_probability:.2f})")
print(f"Audio duration: {info.duration:.2f}s ({int(info.duration * FPS)} frames)\n")

# Collect all words with timestamps
all_words = []
for segment in segments:
    if segment.words:
        for word in segment.words:
            all_words.append((word.start, word.end, word.word.strip()))

print(f"Total words transcribed: {len(all_words)}\n")

# Search for marker phrases
print("=" * 70)
print("SCENE BOUNDARY TIMESTAMPS")
print("=" * 70)

found_markers = {}
for marker_phrase, description in MARKERS.items():
    marker_words = marker_phrase.lower().split()
    for i in range(len(all_words) - len(marker_words) + 1):
        candidate = [all_words[i + j][2].lower().strip(".,!?;:'\"") for j in range(len(marker_words))]
        if candidate == marker_words:
            start_time = all_words[i][0]
            frame = int(start_time * FPS)
            print(f"  {description}")
            print(f"    Phrase: \"{marker_phrase}\"")
            print(f"    Time:   {start_time:.2f}s")
            print(f"    Frame:  {frame}")
            print()
            found_markers[marker_phrase] = (start_time, frame)
            break
    else:
        print(f"  WARNING: Could not find \"{marker_phrase}\"!")
        # Show nearby words for debugging
        for i, (t, te, w) in enumerate(all_words):
            if any(mw in w.lower() for mw in marker_words[:2]):
                context = " ".join([all_words[max(0,i-2)+j][2] for j in range(min(6, len(all_words) - max(0,i-2)))])
                print(f"    Near match at {t:.2f}s: ...{context}...")
        print()

# Also run silence detection with ffmpeg
print("=" * 70)
print("SILENCE GAPS (for cross-reference)")
print("=" * 70)
import subprocess
result = subprocess.run(
    ["ffmpeg", "-i", AUDIO, "-af", "silencedetect=noise=-30dB:d=0.4", "-f", "null", "-"],
    capture_output=True, text=True
)
for line in result.stderr.split("\n"):
    if "silence_start" in line or "silence_end" in line:
        print(f"  {line.strip()}")

print("\n" + "=" * 70)
print("SUGGESTED SCENE CONSTANTS (copy to ThreeTypesVideo.tsx)")
print("=" * 70)

audio_frames = int(info.duration * FPS)

if len(found_markers) == len(MARKERS):
    markers_list = list(found_markers.values())
    s1_end = markers_list[0][1]   # "Number one"
    s2_end = markers_list[1][1]   # "Number two"
    s3_end = markers_list[2][1]   # "Number three"
    s4_end = markers_list[3][1]   # "These three types"
    s5_end = markers_list[4][1]   # "Your circle..."
    s6_end = s5_end + 150 + (audio_frames - s5_end)  # CTA holds 5s past audio end

    print(f"""
const SCENE_1_START = 0;
const SCENE_1_END = {s1_end};       // {markers_list[0][0]:.2f}s — "Number one" starts
const SCENE_2_START = {s1_end};
const SCENE_2_END = {s2_end};      // {markers_list[1][0]:.2f}s — "Number two" starts
const SCENE_3_START = {s2_end};
const SCENE_3_END = {s3_end};      // {markers_list[2][0]:.2f}s — "Number three" starts
const SCENE_4_START = {s3_end};
const SCENE_4_END = {s4_end};      // {markers_list[3][0]:.2f}s — "These three types" starts
const SCENE_5_START = {s4_end};
const SCENE_5_END = {s5_end};      // {markers_list[4][0]:.2f}s — "Your circle..." starts
const SCENE_6_START = {s5_end};
const SCENE_6_END = {s6_end};      // CTA holds 5s past audio end ({info.duration:.2f}s = {audio_frames} frames)
""")
    print(f"Root.tsx durationInFrames = {s6_end}")
else:
    print("  ERROR: Not all markers found. Check the word-level output above.")
    print("\nFull word list for debugging:")
    for t, te, w in all_words:
        print(f"  {t:7.2f}s  {w}")
