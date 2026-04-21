/**
 * Generate TTS for "3 Types of People" video
 * Uses Josh voice, eleven_turbo_v2_5
 */
require('dotenv').config();
const { generateVoiceover } = require('./elevenlabs');

const FULL_SCRIPT = `In a world that's changing faster than ever... the most dangerous thing you can do... is stay the same. Curiosity isn't optional anymore. It's your competitive edge. And the people around you? They either sharpen that edge... or dull it. Here are the 3 types of people you need in your corner.

Number one. The Believer. Think of the Believer like my friend Steve. They are the person who sees what's possible for you... before you see it yourself. Most people wait to believe in you until you've proved it. The Believer doesn't work that way. They bet on you early. They invest in you before there's any evidence it'll pay off.

Here's the thing... this relationship isn't found. It's grown. But if you look, you'll find seeds of it in your life already. Who shows up in the front row when you're speaking to an empty room? Who sends the how's the project going message every few months? Who gets more excited about your goals than you do?

That's your Believer. Share your goals with them. Let them in on the journey. And here's what the best Believers understand... they push you to stay curious. To keep learning. Because they know your potential only compounds when you do.

Number two. The Peer. For me, that role is filled by my brother, Mark. When I wanted to quit, he kept going. When he wanted to quit, I kept going. That's what the right Peer does.

They're not coasting. They're building. The right Peer is someone who's in the game at a similar level to you. The fastest path to finding them? Rooms. Masterminds. Communities built around an ambitious culture.

Proximity is the program. You absorb the standard of the room. Twelve months around a solid Peer will do more for your career than any course or book.

And right now? The Peers who are pulling ahead... are the ones who are building real AI skills. Not watching from the sidelines. Not waiting for permission. They're adapting. They're learning by doing. And that gap? It's widening every single day.

Number three. The Coach. Every entrepreneur needs their Coach. For me, my coach is Vincent. He showed me a completely different way of helping people.

But don't listen to just anyone. Filter for truth. Find someone who's already been where you're going. Made the mistakes. Paid the tuition.

The Coach won't just give you a strategy. They'll give you a mirror. So you start to see the hard truth about why you're stuck. The patterns you keep repeating. The stories you keep telling yourself.

No podcast or AI chatbot is going to show you that. But here's what a great Coach will also tell you... the ones who thrive aren't just coachable. They're endlessly curious. They're lifelong learners. They don't just adapt to change — they lead it.

These three types of people have one thing in common. A single trait that separates the ones who belong in your corner from the ones quietly holding you back.

Curiosity. Lifelong learning. Adaptability.

The Believer pushes you to explore. Your Peer keeps you accountable to growth. The Coach shows you the blind spots.

But none of it matters if you're not building practical skills that match the pace of change. Right now, that means AI. Not theory. Not hype. Hands-on skills that directly boost your income and accelerate your career. The people in your corner can open the door. But you have to walk through it.

Your circle is your catalyst. Choose it wisely. And start building the skills that make you impossible to ignore. Visit scottmagnacca.com.`;

async function main() {
  console.log('Script length:', FULL_SCRIPT.length, 'characters');
  console.log('Estimated words:', FULL_SCRIPT.split(/\s+/).length);

  try {
    const audioPath = await generateVoiceover(FULL_SCRIPT, 'josh', '3-types-of-people.mp3');
    console.log('\n✅ Audio generated:', audioPath);
  } catch (err) {
    console.error('❌ TTS failed:', err.message);
    process.exit(1);
  }
}

main();
