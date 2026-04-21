// AI Mastery Summit — Design Tokens
// Matches the-ai-mastery-summit.netlify.app exactly

export const colors = {
  darkBg: "#0A0A0A",
  deepGreen: "#006644",
  courtyardGreen: "#597C31",
  sherwoodGreen: "#9EB28F",
  brightGold: "#DDD055",
  mangoPunch: "#EEAF00",
  alfrescoBlue: "#567B8A",
  white: "#FFFFFF",
  textMuted: "#A0A0A0",
  darkGradientEnd: "#0F1A14",
  redStrike: "#CC3333",
} as const;

export const fonts = {
  heading: "'Playfair Display', serif",
  body: "'Inter', sans-serif",
} as const;

export const VIDEO = {
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 30,
  DURATION_FRAMES: Math.ceil(85 * 30), // 85s = ~82s narration + 3s fade-out
} as const;

// Helper: convert seconds to frames
const sec = (s: number) => Math.round(s * 30);

// Segment timing — v5 narration (82s, shorter pause after "every day") via Whisper
export const SEGMENTS = {
  S1_PROBLEM: { start: sec(0),     end: sec(17.0) },  // → "...where to start"
  S2_URGENCY: { start: sec(17.0),  end: sec(30.4) },  // → "...miss this wave"
  S3_REFRAME: { start: sec(30.6),  end: sec(46.3) },  // → "...AI Mastery Summit"
  S4_OFFER:   { start: sec(46.5),  end: sec(62.9) },  // → "...or career"
  S5_CTA:     { start: sec(63.1),  end: sec(85.0) },  // → "Let's go!" + fade
} as const;

// Key narration cue points — Whisper word-level timestamps from v5 narration
export const CUES = {
  // Segment 1 (0–17.0)
  "first_time_history": 0.0,
  "college_grads_unemployed": 2.5,
  "high_school_students": 4.2,
  "jobs_disappearing": 5.4,
  "confusion_out_there": 7.8,
  "overwhelmed": 9.6,
  "new_product_every_day": 11.8,
  "every_week": 13.5,
  "dont_know_where_to_start": 15.5,
  // Segment 2 (17.0–30.4)
  "ai_enabled": 17.0,
  "not_replaced_by_ai": 20.6,
  "replaced_by_someone_using_ai": 23.9,
  "wait_a_year": 27.4,
  "miss_this_wave": 29.4,
  // Segment 3 (30.6–46.3)
  "more_than_gimmicky": 30.6,
  "accelerator": 34.5,
  "amplifier": 36.3,
  "your_ideas_business_life": 37.8,
  "whole_other_level": 41.5,
  "ai_mastery_summit": 43.0,
  // Segment 4 (46.5–62.9)
  "three_days_90_min": 46.6,
  "how_things_used_to_be": 50.6,
  "do_it_now_in_seconds": 52.8,
  "more_profitably": 55.0,
  "do_something_right_now": 56.5,
  "in_your_business": 59.3,
  "personal_life": 60.5,
  "or_career": 62.0,
  // Segment 5 (63.1–85.0)
  "dont_miss_out": 63.1,
  "compress_decades_into_days": 65.2,
  "simple": 70.5,
  "actionable": 71.0,
  "ai_as_your_advantage": 72.0,
  "frustrated": 76.5,
  "trying_to_do_it_all": 77.5,
  "join_us": 78.5,
  "click_below": 79.5,
  "lets_go": 81.5,
} as const;

// Easing presets
export const easing = {
  springConfig: { damping: 12, stiffness: 100, mass: 1 },
  smoothSpring: { damping: 15, stiffness: 80, mass: 0.8 },
  snappySpring: { damping: 10, stiffness: 150, mass: 0.5 },
} as const;
