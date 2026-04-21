#!/usr/bin/env python3
"""Generate TTS audio for 'Storyselling in the Age of AI' using Edge TTS."""

import asyncio
import edge_tts
import shutil
import os

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+12%"
PITCH = "-2Hz"

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PRIMARY = os.path.join(BASE, "audio", "storyselling-ai.mp3")
OUTPUT_REMOTION = os.path.join(BASE, "remotion-project", "public", "audio", "storyselling-ai.mp3")

TEXT = """Let's be honest... our industry is addicted to numbers. Graphs. Spreadsheets. Technical precision. But here's the uncomfortable truth. AI can now process more data in a second than you can in a month. If your only value is being the smartest person in the room with the best spreadsheet... your career is on borrowed time. The question isn't whether AI will change financial services. It already has. The real question is... will you lead with connection, or compete with computation?

Let me tell you about two advisors. David had everything on paper. A fifty-page deck. Perfect projections. Polished slides. He walked into a meeting with a twenty million dollar prospect... and pitched technical perfection. The client nodded politely... and chose someone else.

Then there was Sarah. She walked into that same room with a single story. She told the client about a family she'd helped. How they went from worrying about their legacy... to watching their grandchildren's education fully funded. No spreadsheets. No fluff. Just a story that made the client see their own future.

David earned a handshake. Sarah earned a hug. And the account. Here's what Sarah understood that David didn't. Facts inform... but stories transform. People don't buy what you know. They buy how you make them feel. And in the age of AI... that's the one thing a machine will never replicate.

So how do you actually do this? Here's a framework I call Winter to Spring. Your clients come to you in Winter. They're afraid. Uncertain. Overwhelmed by market volatility and scary headlines. Your job isn't to throw more data at them. Your job is to build a bridge of stories... that carries them from Winter to Spring. From fear to confidence. From uncertainty to freedom.

So what does that look like in practice? This is where AI becomes your co-pilot. Not your replacement. Use AI to generate metaphors that match your client's world. Use it to rehearse difficult conversations. Use it to find the story inside the data.

Because here's the thing... AI is tireless. It doesn't get writer's block. It doesn't forget what worked last quarter. It's the most powerful storyselling partner you've ever had... if you know how to use it.

AI is not here to replace your humanity. It's here to amplify it. It's a force multiplier for your intent. But only if you lead with story... not just spreadsheets. So here's my challenge to you. Test your sales process. Are you leading with data... or with connection? Take the sixty second AI quiz. It takes one minute. And it might just change how you sell forever. The link is right here on your screen."""

# ─── Assertions: verify fixes are present and old bad words are GONE ───
assert "connection, or compete with computation" in TEXT, "Hook closing missing"
assert "David had everything on paper" in TEXT, "David story missing"
assert "Sarah earned a hug" in TEXT, "Sarah climax missing"
assert "Winter to Spring" in TEXT, "Framework name missing"
assert "sixty second AI quiz" in TEXT, "CTA missing"
assert "force multiplier" in TEXT, "CTA amplify line missing"
# ── Phonetic safety: banned words that Edge TTS mispronounces ──
assert "Charts" not in TEXT,   "BANNED: 'Charts' → TTS says 'shots'. Use 'Graphs' instead."
assert "charts" not in TEXT,   "BANNED: 'charts' → TTS says 'shots'. Use 'graphs' instead."
assert "Flawless" not in TEXT, "BANNED: 'Flawless' → TTS says 'Flownos'. Use 'Crisp/Sharp' instead."
assert "jargon" not in TEXT,   "BANNED: 'jargon' → TTS says 'cargo'. Use 'buzzwords' instead."
assert "Jargon" not in TEXT,   "BANNED: 'Jargon' → TTS says 'cargo'. Use 'Buzzwords' instead."
# ── Verify replacements are in place ──
assert "Graphs" in TEXT,      "Should say 'Graphs' in hook (replaced 'Charts')"
assert "Polished slides" in TEXT, "Should say 'Polished slides' in David story (replaced 'Sharp graphs')"
assert "No fluff" in TEXT,        "Should say 'No fluff' (replaced 'buzzwords')"
assert "Sharp" not in TEXT,       "BANNED: 'Sharp' → TTS says 'chart'. Use 'Polished/Clean' instead."
assert "buzzwords" not in TEXT,   "BANNED: 'buzzwords' → TTS garbles it. Use 'fluff' instead."
print("✓ All text assertions passed — no banned mispronunciation words present")

async def main():
    print(f"Generating TTS with voice={VOICE}, rate={RATE}, pitch={PITCH}")
    communicate = edge_tts.Communicate(TEXT, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(OUTPUT_PRIMARY)
    print(f"✓ Saved to {OUTPUT_PRIMARY}")

    # Copy to Remotion public dir
    os.makedirs(os.path.dirname(OUTPUT_REMOTION), exist_ok=True)
    shutil.copy2(OUTPUT_PRIMARY, OUTPUT_REMOTION)
    print(f"✓ Copied to {OUTPUT_REMOTION}")

    # Check size
    print(f"✓ File size: {os.path.getsize(OUTPUT_PRIMARY) / 1024:.1f} KB")

if __name__ == "__main__":
    asyncio.run(main())
