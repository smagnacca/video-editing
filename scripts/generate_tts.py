#!/usr/bin/env python3
"""Generate TTS audio for '3 Types of People You Need in Your Corner' using Edge TTS."""

import asyncio
import edge_tts
import shutil
import os

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "+12%"
PITCH = "-2Hz"

# Base directory
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_PRIMARY = os.path.join(BASE, "audio", "3-types-of-people.mp3")
OUTPUT_REMOTION = os.path.join(BASE, "remotion-project", "public", "audio", "3-types-of-people.mp3")

# TTS narration text — phonetic spelling for "Magnacca" (pronounced "Mag-na-ka")
# URL spelled phonetically: "scott mag-nah-kah dot com"
TEXT = """In a world that's changing faster than ever... the most dangerous thing you can do... is stay the same. Curiosity isn't optional anymore. It's your competitive edge. And the people around you? They either sharpen that edge... or dull it. Here are the 3 types of people you need in your corner.

Number one. The Believer. Think of the Believer like my friend Steve. They are the person who sees what's possible for you... before you see it yourself. Most people wait to believe in you until you've proved it. The Believer doesn't work that way. They bet on you early. They invest in you before there's any evidence it'll pay off.

Here's the thing... this relationship isn't found. It's grown. But if you look, you'll find seeds of it in your life already. Who shows up in the front row when you're speaking to an empty room? Who sends the 'how's the project going?' message every few months? Who gets more excited about your goals than you do?

That's your Believer. Share your goals with them. Let them in on the journey. And here's what the best Believers understand... they push you to stay curious. To keep learning. Because they know your potential only compounds when you do.

Number two. The Peer. For me, that's my brother, Mark. We made a pact. Neither of us would let the other give up. On my worst days, Mark was the one who said, keep building. And when he hit a wall, I did the same for him. That's what the right Peer does.

They're not coasting. They're building. The right Peer is someone who's in the game at a similar level to you. The fastest path to finding them? Rooms. Masterminds. Communities built around an ambitious culture.

Proximity is the program. You absorb the standard of the room. Twelve months around a solid Peer will do more for your career than any course or book.

And right now? The Peers who are pulling ahead... are the ones who are building real AI skills. Not watching from the sidelines. Not waiting for permission. They're adapting. They're learning by doing. And that gap? It's widening every single day.

Number three. The Coach. Every entrepreneur needs their Coach. For me, my coach is Vincent. He showed me a completely different way of helping people.

But don't listen to just anyone. Filter for truth. Find someone who's already been where you're going. Made the mistakes. Paid the tuition.

The Coach won't just give you a strategy. They'll give you a mirror. So you start to see the hard truth about why you're stuck. The patterns you keep repeating. The stories you keep telling yourself.

No podcast or AI chatbot is going to show you that. But here's what a great Coach will also tell you... the ones who thrive aren't just coachable. They're endlessly curious. They're lifelong learners. They don't just adapt to change — they lead it.

These three types of people all share three common attributes. They are attributes that virtually all successful people have.

Curiosity. Lifelong learning. Adaptability.

The Believer pushes you to explore. Your Peer keeps you accountable to growth. The Coach shows you the blind spots.

But none of it matters if you're not building practical skills that match the pace of change. Right now, that means AI. Not theory. Not hype. Hands-on skills that directly boost your income and accelerate your career. The people in your corner can open the door. But you have to walk through it.

Your circle is your catalyst. Choose it wisely. And start building the skills that make you impossible to ignore. Visit me at my personal website below to learn how you can master and apply these skills today."""

# ─── Assertions: verify old text is NOT present and new text IS present ───
assert "I kept going" not in TEXT, "OLD TEXT STILL PRESENT"
assert "he kept going" not in TEXT, "OLD TEXT STILL PRESENT"
assert "when he wanted to quit" not in TEXT, "OLD TEXT STILL PRESENT"
assert "We made a pact" in TEXT, "New Peer intro missing"
assert "Neither of us would let the other give up" in TEXT, "New Peer pact text missing"
assert "when he hit a wall, I did the same for him" in TEXT, "New Peer reciprocity text missing"
assert "Visit me at my personal website below" in TEXT, "New CTA closing text missing"
assert "separates" not in TEXT, "OLD 'separates' text still present — should be removed"
assert "all share three common attributes" in TEXT, "New Bridge intro missing"
assert "virtually all successful people have" in TEXT, "New Bridge attributes text missing"
print("✓ All text assertions passed")

async def main():
    print(f"Generating TTS with voice={VOICE}, rate={RATE}, pitch={PITCH}")
    communicate = edge_tts.Communicate(TEXT, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(OUTPUT_PRIMARY)
    print(f"✓ Saved to {OUTPUT_PRIMARY}")

    # Copy to Remotion public dir
    shutil.copy2(OUTPUT_PRIMARY, OUTPUT_REMOTION)
    print(f"✓ Copied to {OUTPUT_REMOTION}")

    # Check duration
    print(f"✓ File size: {os.path.getsize(OUTPUT_PRIMARY) / 1024:.1f} KB")

if __name__ == "__main__":
    asyncio.run(main())
