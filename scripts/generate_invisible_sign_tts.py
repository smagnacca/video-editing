#!/usr/bin/env python3
"""
TTS generation for "Every Client Wears an Invisible Sign"
Ch2 of Storyselling in the Age of AI — 3-minute TED-Ed style video
Voice: en-US-AndrewMultilingualNeural, rate=+12%, pitch=-2Hz
"""

import asyncio
import edge_tts
import os

# ─── Script ──────────────────────────────────────────────────────────────────
TEXT = """An advisor spent six months with a client. Every proposal, every meeting — the same answer. I need to think about it. Better data. Better numbers. Better returns. Still losing.

In 1977, George Lucas sold the Star Wars film rights to Fox for one hundred and fifty thousand dollars. But he kept the merchandise rights. Nobody thought toys mattered. Lucas did. Because he understood something about human nature that nobody else saw.

He read the invisible sign.

Role theory says every person walks into a room already playing a role. A role they have been rehearsing for years. Your client is wearing a sign that tells you exactly what they need to feel safe, valued, and ready to say yes.

There are three primary signs.

The Builder. Their sign reads: Help me grow this. They talk about vision. Legacy. The next chapter.

The Protector. Their sign reads: Don't let me lose what I built. Stability above everything.

The Achiever. Their sign reads: Recognize what I have accomplished. Earned success — not luck.

Most advisors pitch the same product to all three. That's why they keep hearing: I need to think about it.

Here's the question that unlocks every invisible sign.

What are you most proud of?

Four words. That's it.

When someone tells you what they're proud of, they're not giving you data. They're handing you their identity. A Builder tells you what they created. A Protector tells you what they preserved. An Achiever tells you a milestone that proved something.

Listen for the first thing they say. That's the real answer.

The third secret is the hardest. Silence is truth serum.

After you ask the question — stop talking. Most advisors fill that silence with more data. More slides. More information. That's the mistake.

Here's the technique. Ask the question. Count to ten in your head. Don't speak. Let them reach for the words. Because the words they search for — those are the ones that matter most.

Maya was a junior advisor competing against three Wall Street firms for a thirty million dollar account. She didn't have the biggest name. She didn't have the longest track record.

She asked what he was most proud of.

He said: That my kids never had to worry.

A Protector.

Her entire proposal centered on one idea. That his kids would never have to worry. Not returns. Not numbers. Just that.

She won the account. The Wall Street firms never knew what sign he was wearing.

Every client you will ever meet is already telling you who they are. The question is whether you are listening for it.

These two signs say: Make me feel important. And treat me like a friend.

Take the sixty-second quiz and discover which signals you are already catching — and which ones you are missing."""

# ─── Banned word check (MANDATORY — see memory/feedback_first_draft_excellence.md)
BANNED_TTS_WORDS = [
    'charts', 'Charts', 'flawless', 'Flawless',
    'jargon', 'Jargon', 'buzzwords', 'Buzzwords',
    'Sharp graphs', 'sharp graphs',
]
for w in BANNED_TTS_WORDS:
    assert w not in TEXT, f"BANNED TTS word '{w}' — causes mispronunciation. Check feedback_remotion_rules.md"

# ─── Required phrase checks
assert "invisible sign" in TEXT, "Missing key phrase: 'invisible sign'"
assert "most proud of" in TEXT, "Missing key phrase: 'most proud of'"
assert "Silence is truth serum" in TEXT, "Missing key phrase: 'Silence is truth serum'"
assert "Maya" in TEXT, "Missing key phrase: 'Maya'"
assert "Protector" in TEXT, "Missing key phrase: 'Protector'"
assert "sixty-second quiz" in TEXT, "Missing CTA phrase"

print("✅ All phrase checks passed. No banned words found.")

# ─── Generate TTS ─────────────────────────────────────────────────────────────
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__),
    '../remotion-project/public/audio/invisible-sign.mp3'
)

async def generate():
    communicate = edge_tts.Communicate(
        TEXT,
        voice="en-US-AndrewMultilingualNeural",
        rate="+12%",
        pitch="-2Hz",
    )
    await communicate.save(OUTPUT_PATH)
    print(f"✅ TTS saved to: {OUTPUT_PATH}")

asyncio.run(generate())
