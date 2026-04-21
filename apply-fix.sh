#!/bin/bash
# apply-fix.sh — fixes audio serving bug and runs the pipeline test
# Run from: ~/Documents/Claude/Projects/Cowork-video-editing\ project/
# Usage:    bash apply-fix.sh

set -e

COWORK="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VIDEO_PROJECT="$HOME/video-project"
REMOTION_DIR="$VIDEO_PROJECT/remotion-project/remotion"
PUBLIC_AUDIO="$VIDEO_PROJECT/remotion-project/public/audio"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Applying audio-serving fix..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Copy fixed render.js
cp "$COWORK/render.js" "$VIDEO_PROJECT/render.js"
echo "✅ render.js updated (audio copy + staticFile filename)"

# 2. Copy fixed VideoComposition.tsx
cp "$COWORK/remotion-src/VideoComposition.tsx" "$REMOTION_DIR/VideoComposition.tsx"
echo "✅ VideoComposition.tsx updated (uses staticFile)"

# 3. Ensure public/audio directory exists
mkdir -p "$PUBLIC_AUDIO"
echo "✅ public/audio/ directory ready"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Running full pipeline test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$VIDEO_PROJECT"
node run-test.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ PIPELINE FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
