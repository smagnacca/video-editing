# Email Sequences — Funnel-Aligned

> Send via Gmail (manual paste), or batch via SendGrid/Mailgun if volume goes >50/day.
> **Variables:** `{first_name}`, `{company}`, `{role}`, `{quiz_tier}`, `{specific_pain}`

---

## SEQUENCE A — Cold Outreach (Tue + Thu)

### A1 — First Touch (Tue 9:30am)
**Subject:** Quick question, {first_name}

```
{first_name},

Saw {company} on the {industry} growth list and wanted to ask one direct question:

Is your team measuring AI-skill premium yet? (The market is paying 56% more for hybrid sellers
who blend AI + relationship work — most teams have no idea where they stand.)

Built a free 60-second benchmark that tells you in plain English:
60-second-ai-quiz.netlify.app

If it's useful, great. If not, no follow-up. Promise.

Scott Magnacca
Harvard ALM | Babson MBA | Author, Storyselling in the Age of AI
```

**Why:** Specific stat (56%), direct ask, credentials block, explicit no-spam promise.

---

### A2 — Follow-Up (Thu 7:45am, only if no reply)
**Subject:** Re: Quick question, {first_name}

```
{first_name} — bumping this once. Took a quick look at {company}'s recent {hire_or_post}, and the
gap between what your team is doing and what the top 10% are doing with AI is exactly what the
benchmark surfaces.

Here it is again: 60-second-ai-quiz.netlify.app

If now isn't the time, just hit reply with "later" and I'll circle back next quarter.

Scott
```

**Why:** Personalization (their hire/post), gives an opt-out, low-effort reply path.

---

### A3 — Final Touch (Following Tue 9:30am, only if no reply)
**Subject:** Closing the loop, {first_name}

```
{first_name},

Last note from me. If AI-fluency in sales is a priority this quarter, the resources below are the
fastest paths to know where you stand:

- 60-sec benchmark: 60-second-ai-quiz.netlify.app
- Free 15-min Sprint: 15-minute-sales-sprint.netlify.app
- Self-paced 4-day course: 4daycourse.netlify.app

If not, no problem — I'll stop emailing.

Scott
```

**Why:** Three clear options, escape valve, respectful close.

---

## SEQUENCE B — Quiz Taken → Sprint Push (Triggered)

### B1 — Same-day, within 1 hour of quiz completion
**Subject:** Your AI Skills IQ result + what to do with it

```
{first_name},

You scored {quiz_tier} — putting you in the top {percentile}% of professionals who've taken the
benchmark. That's a real signal.

Here's the catch: scoring is the EASY part. Closing the gap between "I know AI" and "I'm earning
the wage premium" is where most people stall.

The 15-Minute Sprint walks through the exact playbook for that gap. Free. Zero fluff.
Next live session: {next_sprint_date}.

15-minute-sales-sprint.netlify.app

Scott
```

**Why:** Immediate (1 hour), reframes their score as starting line, urgency on next sprint.

---

### B2 — Day 3 if no sprint signup
**Subject:** The 3 things {quiz_tier} scorers usually miss

```
{first_name},

Pattern from 5,000+ pros: people in the {quiz_tier} tier almost always have these 3 gaps:

1. They use AI to write — not to think
2. They prompt for output — not for judgment
3. They optimize the tool — not the conversation

The Sprint covers all three in 15 min. Reserve a seat: 15-minute-sales-sprint.netlify.app

Scott
```

**Why:** Specific 3-item insight, social proof (5K+), single clear CTA.

---

### B3 — Day 7 if no sprint signup → escalate to course
**Subject:** Skip the sprint, jump straight in?

```
{first_name},

If the Sprint feels too small for where you're at, the 4-Day AI Sales Catalyst is the next step.

$249, self-paced, you'll be done by Friday with the full Hybrid Advisor framework.

4daycourse.netlify.app

Or take the Sprint first — your call.

Scott
```

**Why:** Acknowledges they may be advanced, offers escalation path, reduces friction.

---

## SEQUENCE C — Sprint Attended → Workshop/Course (Triggered)

### C1 — Day after Sprint
**Subject:** Your Sprint playbook + next step

```
{first_name},

Thanks for joining the Sprint. As promised, here's the one-page playbook: [link]

If you want to go deeper, the AI Mastery Summit is the next step — 3 days, free, June 18.
$49 VIP if you want recordings + Q&A.

the-ai-mastery-summit.netlify.app

Scott
```

---

### C2 — Day 5 if no Summit signup
**Subject:** {first_name} — the one part of the Sprint people remember

```
{first_name},

Quick reflection from the Sprint: the part where I showed how a 56-word AI prompt lifted a rep's
reply rate by 3x — that's *one* of about 40 frameworks we go through in the 4-Day Catalyst.

$249, self-paced. Most reps recoup the cost on their first prospecting block.

4daycourse.netlify.app

Scott
```

---

## SEQUENCE D — Workshop Attended → Course/Masterclass (Triggered)

### D1 — Day after Summit
**Subject:** What you saw at the Summit was the iceberg tip

```
{first_name},

The Hybrid Advisor framework you saw is the foundation. The 4-Day Catalyst goes 10x deeper into
the daily execution — prompts, templates, decision trees.

If you're already past that, the Storyselling Masterclass ($1,499, 6-week cohort with live
coaching) is for you.

Course: 4daycourse.netlify.app
Masterclass: salesforlife.ai

Reply if you want my honest take on which is right for you.

Scott
```

**Why:** Two-tier offer, invites consultative reply.

---

## SEQUENCE E — Re-Engagement (Dormant 60+ days)

### E1 — Soft re-open
**Subject:** {first_name} — circling back with something new

```
{first_name},

Been a couple months. Just shipped a piece that I think is actually relevant to where you are now:
[latest TOFU video link]

If you've moved on from this, no problem. If not, hit reply and I'll send the latest playbook.

Scott
```

---

## Send Cadence Rules

- **Cold (Sequence A):** Tue + Thu mornings only. Never Mon (overflow inbox) or Fri (weekend dump).
- **Triggered (B/C/D):** Send immediately on event, then space by 3-5 days.
- **Re-engagement (E):** Wednesdays only, max 1 per dormant lead per quarter.
- **Daily volume cap:** 50 cold sends/day to protect deliverability.
- **Reply rate target:** 8%+ on Sequence A. Below 4% = swap subject line, not body.
