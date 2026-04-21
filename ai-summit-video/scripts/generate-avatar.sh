#!/bin/bash
# Generate HeyGen avatar video with lip-sync to narration audio.
# Prerequisites:
#   1. Run generate-voice.py first to create narration.mp3
#   2. heygen auth login (paste API key)
#   3. Upload narration.mp3 to get an audio_asset_id OR host it at a public URL
#
# Avatar ID: eea2aab18af24021a438ea59a2f6cf02

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
NARRATION="$PROJECT_DIR/public/audio/narration.mp3"
OUTPUT="$PROJECT_DIR/public/avatar/scott-avatar.mp4"

if [ ! -f "$NARRATION" ]; then
    echo "Error: narration.mp3 not found. Run generate-voice.py first."
    exit 1
fi

echo "Checking HeyGen auth status..."
heygen auth status || {
    echo "Not authenticated. Run: heygen auth login"
    exit 1
}

echo ""
echo "=== Option A: Using HeyGen API directly (curl) ==="
echo ""
echo "1. First upload the narration audio:"
echo "   curl -X POST 'https://api.heygen.com/v1/asset' \\"
echo "     -H 'X-Api-Key: YOUR_API_KEY' \\"
echo "     -F 'file=@$NARRATION'"
echo ""
echo "2. Then create the video with the returned asset_id:"
echo "   curl -X POST 'https://api.heygen.com/v3/videos' \\"
echo "     -H 'X-Api-Key: YOUR_API_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{"
echo "       \"type\": \"avatar\","
echo "       \"avatar_id\": \"eea2aab18af24021a438ea59a2f6cf02\","
echo "       \"audio_asset_id\": \"ASSET_ID_FROM_STEP_1\","
echo "       \"resolution\": \"1080p\","
echo "       \"aspect_ratio\": \"16:9\","
echo "       \"remove_background\": true"
echo "     }'"
echo ""
echo "3. Poll for completion:"
echo "   curl 'https://api.heygen.com/v3/videos/VIDEO_ID' -H 'X-Api-Key: YOUR_API_KEY'"
echo ""
echo "4. Download and save to: $OUTPUT"
echo ""
echo "=== Option B: Using HeyGen CLI ==="
echo ""
echo "   heygen video create \\"
echo "     --avatar-id eea2aab18af24021a438ea59a2f6cf02 \\"
echo "     --audio-asset-id ASSET_ID \\"
echo "     --remove-background \\"
echo "     --resolution 1080p \\"
echo "     --aspect-ratio 16:9 \\"
echo "     --wait"
echo ""
echo "Once you have the video, save it to:"
echo "   $OUTPUT"
echo ""
echo "Then uncomment the AvatarLayer in MainComposition.tsx and render!"
