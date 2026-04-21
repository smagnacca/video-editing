#!/usr/bin/env python3
"""
Generate Scott's voice narration via ElevenLabs TTS.
Voice ID: QCuXtHVym81CrddhYVa8
Output: public/audio/narration.mp3
"""

import os
import sys

try:
    from elevenlabs import ElevenLabs
except ImportError:
    print("Error: elevenlabs package not installed. Run: pip3 install elevenlabs")
    sys.exit(1)

# Check for API key
api_key = os.environ.get("ELEVEN_API_KEY") or os.environ.get("ELEVENLABS_API_KEY")
if not api_key:
    print("Error: Set ELEVEN_API_KEY or ELEVENLABS_API_KEY environment variable")
    print("  export ELEVEN_API_KEY='your-key-here'")
    sys.exit(1)

VOICE_ID = "QCuXtHVym81CrddhYVa8"

SCRIPT = """Now, for the first time in modern history, recent college graduates are more unemployed than high school students.

Today, those jobs are just disappearing because there's so much confusion out there. So many people are overwhelmed because there's a new product every day or week, and they don't even know where to start.

We've got to make sure that all of us are AI-enabled. And if you don't have AI, you're not going to be replaced by AI. You're going to be replaced by someone who's had to use AI. If you wait a year, 18 months, you'll already miss this wave.

AI is so much more than all the gimmicky stuff you see online. When it's used properly, it is the accelerator. It is the amplifier. To take your ideas, to take your business, take your life to a whole other level. And that's exactly what we're going to share with you at the AI Mastery Summit.

We want to take you on a journey, just three days, ninety minutes a day. We're going to show you how things used to be, how you can do it now in seconds, how you can do it more profitably, and show you how to do something right now in your business or in your personal life or career.

So don't miss out. This is your chance to compress decades into days and have a real plan that's simple, actionable, and puts AI as your advantage as opposed to being confused or frustrated or trying to do it all. Join us. Click below, and we look forward to seeing you then. Let's go!"""

OUTPUT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio", "narration.mp3")

def main():
    print(f"Generating narration with ElevenLabs voice {VOICE_ID}...")
    print(f"Script length: {len(SCRIPT)} chars")

    client = ElevenLabs(api_key=api_key)

    audio_generator = client.text_to_speech.convert(
        voice_id=VOICE_ID,
        text=SCRIPT,
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
        voice_settings={
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.3,
            "use_speaker_boost": True,
        },
    )

    # Write audio bytes
    with open(OUTPUT_PATH, "wb") as f:
        for chunk in audio_generator:
            f.write(chunk)

    file_size = os.path.getsize(OUTPUT_PATH)
    print(f"Narration saved to: {OUTPUT_PATH}")
    print(f"File size: {file_size / 1024:.1f} KB")
    print("Done! Next step: use this audio with HeyGen to generate the avatar video.")

if __name__ == "__main__":
    main()
