#!/bin/bash
# assemble-video.sh — automate video assembly from templates + narration
# Usage: bash assemble-video.sh narration.mp3 [template-variant]
# Example: bash assemble-video.sh /path/to/narration.mp3 intro-template-v1,middle-template-v1,outro-template-v1

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NARRATION="${1:?Error: Missing narration.mp3 as argument 1}"
TEMPLATE_VARIANT="${2:-intro-template-v1,middle-template-v1,outro-template-v1}"
MUSIC="${SCRIPT_DIR}/assets/background-music-heygen-royalty-free.mp3"
OUTPUT="${HOME}/Desktop/video-FINAL.mp4"

echo "🎬 Assembling video..."
echo "  Narration: $NARRATION"
echo "  Templates: $TEMPLATE_VARIANT"
echo "  Music: $(basename $MUSIC)"
echo "  Output: $OUTPUT"
echo ""

# Verify narration exists
if [ ! -f "$NARRATION" ]; then
  echo "❌ Error: Narration file not found: $NARRATION"
  exit 1
fi

# Verify music exists
if [ ! -f "$MUSIC" ]; then
  echo "❌ Error: Background music not found: $MUSIC"
  exit 1
fi

# Parse template variant (e.g., "intro-v1,middle-v1,outro-v1")
IFS=',' read -r INTRO_TEMPLATE MIDDLE_TEMPLATE OUTRO_TEMPLATE <<< "$TEMPLATE_VARIANT"
INTRO="${SCRIPT_DIR}/templates/${INTRO_TEMPLATE}.mp4"
MIDDLE="${SCRIPT_DIR}/templates/${MIDDLE_TEMPLATE}.mp4"
OUTRO="${SCRIPT_DIR}/templates/${OUTRO_TEMPLATE}.mp4"

# Verify templates exist
for template in "$INTRO" "$MIDDLE" "$OUTRO"; do
  if [ ! -f "$template" ]; then
    echo "❌ Error: Template not found: $template"
    exit 1
  fi
done

echo "✓ All inputs verified"
echo ""

# Step 1: Normalize narration + mix music in ONE pass
echo "📊 Normalizing narration + mixing music..."
ffmpeg -y \
  -i "$NARRATION" -i "$MUSIC" \
  -filter_complex "
    [0:a]loudnorm=I=-14:TP=-1.5:LRA=11[narration];
    [1:a]volume=0.03[music];
    [narration][music]amix=inputs=2:duration=first[audio]
  " \
  -map "[audio]" -c:a libmp3lame -q:a 4 -ar 44100 \
  /tmp/mixed-audio.mp3

echo "✓ Audio mixed"
echo ""

# Step 2: Concatenate all 3 segments + apply mixed audio in ONE mega-filter
# (No intermediate video files; stream everything in real-time)
echo "🎞️  Splicing segments (INTRO + MIDDLE + OUTRO) + applying audio..."
ffmpeg -y \
  -i "$INTRO" \
  -i "$MIDDLE" \
  -i "$OUTRO" \
  -i /tmp/mixed-audio.mp3 \
  -filter_complex "
    [0:v]scale=1920:1080[v0];
    [1:v]scale=1920:1080[v1];
    [2:v]scale=1920:1080[v2];
    [v0][v1][v2]concat=n=3:v=1:a=0[vout];
    [3:a]aformat=sample_rates=44100:channel_layouts=stereo[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset fast -crf 18 -c:a aac -ar 44100 \
  "$OUTPUT" 2>/dev/null

# Cleanup temp audio
rm -f /tmp/mixed-audio.mp3

echo "✓ Video spliced"
echo ""

# Verify output
if [ -f "$OUTPUT" ]; then
  DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT" 2>/dev/null || echo "unknown")
  SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
  echo "✅ SUCCESS: $OUTPUT"
  echo "   Duration: ${DURATION}s"
  echo "   Size: $SIZE"
else
  echo "❌ Error: Output file not created"
  exit 1
fi
