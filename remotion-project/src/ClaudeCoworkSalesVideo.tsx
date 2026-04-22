import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
} from 'remotion';
import { ParticleField } from './components/ParticleField';
import { FrameworkCard } from './components/FrameworkCard';
import { WordReveal } from './components/WordReveal';

// ─── Whisper timestamps (30fps) — Scott's voice @ 151.23s ────────────────────
// f191   (6.38s)   "35%"              → count-up begins
// f322   (10.76s)  "65%"              → 65% reveal
// f430   (14.33s)  silence after "else"  → PROBLEM scene start
// f1046  (34.88s)  "Claude Cowork"    → SOLUTION scene start
// f1410  (47.02s)  "Number one"       → INBOX scene
// f2076  (69.20s)  "Number two"       → PIPELINE scene
// f2700  (90.02s)  "Number three"     → PLUGINS scene
// f3369  (112.32s) "Number four"      → SKILL scene
// f4054  (135.16s) "Less admin"       → BRIDGE scene
// f4279  (142.66s) "If you want"      → CTA scene
// f4536  (151.23s) audio end
// f4686            5s tail hold

export const CLAUDE_COWORK_TOTAL_FRAMES = 4686;

// ─── Spring helper ────────────────────────────────────────────────────────────
function spr(frame: number, fps: number, damping = 18, stiffness = 90) {
  return spring({ frame: Math.max(0, frame), fps, config: { damping, stiffness } });
}

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────
const FadeIn: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0, children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(frame - delay, fps);
  return (
    <div style={{ opacity: en, transform: `translateY(${interpolate(en, [0, 1], [28, 0])}px)`, ...style }}>
      {children}
    </div>
  );
};

// ─── SlideIn wrapper ──────────────────────────────────────────────────────────
const SlideIn: React.FC<{ delay?: number; from?: 'left' | 'right' | 'bottom'; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0, from = 'left', children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(frame - delay, fps, 20, 80);
  const tx = from === 'left' ? interpolate(en, [0, 1], [-360, 0]) : from === 'right' ? interpolate(en, [0, 1], [360, 0]) : 0;
  const ty = from === 'bottom' ? interpolate(en, [0, 1], [60, 0]) : 0;
  return (
    <div style={{ opacity: interpolate(en, [0, 1], [0, 1]), transform: `translate(${tx}px, ${ty}px)`, ...style }}>
      {children}
    </div>
  );
};

// ─── PopupPhrase — full-screen impact moment ──────────────────────────────────
const PopupPhrase: React.FC<{ text: string; startAt: number; duration?: number; color?: string; size?: number }> = ({
  text, startAt, duration = 58, color = '#00d4ff', size = 84,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame - startAt;
  if (lf < 0 || lf >= duration) return null;
  const en = spring({ frame: Math.max(0, lf), fps, config: { damping: 10, stiffness: 140 } });
  const fadeOut = interpolate(lf, [duration - 14, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
      <div style={{
        opacity: interpolate(en, [0, 1], [0, 1]) * fadeOut,
        transform: `scale(${interpolate(en, [0, 1], [0.55, 1])})`,
        fontSize: size,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 900,
        color,
        textTransform: 'uppercase' as const,
        letterSpacing: 6,
        textShadow: `0 0 50px ${color}80, 0 0 100px ${color}40`,
        textAlign: 'center' as const,
        padding: '0 120px',
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ─── SceneLabel — "NUMBER ONE" / "NUMBER TWO" etc. badge ─────────────────────
const SceneLabel: React.FC<{ number: string; title: string; color?: string; delay?: number }> = ({
  number, title, color = '#00d4ff', delay = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(frame - delay, fps, 14, 100);
  return (
    <div style={{
      opacity: interpolate(en, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(en, [0, 1], [-30, 0])}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 4,
    }}>
      <div style={{ fontSize: 14, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color, letterSpacing: 6, textTransform: 'uppercase' as const }}>
        {number}
      </div>
      <div style={{ fontSize: 58, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontWeight: 900, color: '#ffffff', letterSpacing: 2 }}>
        {title}
      </div>
      <div style={{ width: 60, height: 3, background: color, borderRadius: 2, boxShadow: `0 0 12px ${color}80` }} />
    </div>
  );
};

// ─── CountUp number (no Sequence wrapper — uses useCurrentFrame) ──────────────
const CountUp: React.FC<{ to: number; suffix?: string; fontSize?: number; color?: string; delay?: number }> = ({
  to, suffix = '%', fontSize = 144, color = '#f5a623', delay = 0,
}) => {
  const frame = useCurrentFrame();
  const easing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const localF = Math.max(0, frame - delay);
  const progress = interpolate(localF, [0, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
  const glow = 40 + Math.sin(localF * 0.08) * 10;
  return (
    <div style={{
      fontSize, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 900, color,
      textShadow: `0 0 ${glow}px ${color}90, 0 0 ${glow * 2}px ${color}40`,
      lineHeight: 1,
    }}>
      {Math.round(to * progress)}{suffix}
    </div>
  );
};

// ─── ProgressBar animation ────────────────────────────────────────────────────
const ProgressBar: React.FC<{ label: string; percent: number; delay?: number; color?: string }> = ({
  label, percent, delay = 0, color = '#00d4ff',
}) => {
  const frame = useCurrentFrame();
  const localF = Math.max(0, frame - delay);
  const width = interpolate(localF, [0, 60], [0, percent], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const en = spr(localF, 30, 18, 90);
  return (
    <div style={{ opacity: interpolate(en, [0, 1], [0, 1]), transform: `translateX(${interpolate(en, [0, 1], [-40, 0])}px)`, width: '100%' }}>
      <div style={{ fontSize: 18, fontFamily: '-apple-system, sans-serif', fontWeight: 600, color: '#ccc', marginBottom: 8, letterSpacing: 1 }}>{label}</div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${width}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 5, boxShadow: `0 0 12px ${color}80`,
          transition: 'none',
        }} />
      </div>
    </div>
  );
};

// ─── GlassCard — inline glassmorphism container ───────────────────────────────
const GlassCard: React.FC<{ children: React.ReactNode; accentColor?: string; delay?: number; style?: React.CSSProperties }> = ({
  children, accentColor = '#00d4ff', delay = 0, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const en = spr(frame - delay, fps, 16, 80);
  return (
    <div style={{
      opacity: interpolate(en, [0, 1], [0, 1]),
      transform: `scale(${interpolate(en, [0, 1], [0.92, 1])}) translateY(${interpolate(en, [0, 1], [30, 0])}px)`,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${accentColor}40`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: 16,
      padding: '32px 48px',
      backdropFilter: 'blur(12px)',
      boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 30px ${accentColor}20`,
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─── Claude Cowork Mock UI Window ─────────────────────────────────────────────
// Right-side panel showing Claude Cowork UI in sync with narration
const MockUIWindow: React.FC<{ scene: 4 | 5 | 6 | 7; localFrame: number }> = ({ scene, localFrame }) => {
  const lf = localFrame;
  // Which tab is active per scene: Chat=0, Cowork=1, Skills=2
  const tabIndex = scene === 7 ? 2 : scene === 6 ? 1 : 0;

  const renderContent = () => {
    // ── Scene 4: Connect Your Inbox ─────────────────────────────────────────
    if (scene === 4) {
      const resultsVisible = lf > 60;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,212,255,0.08)', borderRadius: 8, border: '1px solid rgba(0,212,255,0.25)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff', flexShrink: 0 }} />
            <span style={{ fontSize: 18, color: '#00d4ff', fontFamily: '-apple-system, sans-serif' }}>Outlook connected</span>
          </div>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 17, color: '#ccc', fontFamily: '-apple-system, sans-serif', lineHeight: 1.5, border: '1px solid rgba(255,255,255,0.06)' }}>
            Find my recent prospect emails and flag any I haven&apos;t replied to
          </div>
          {resultsVisible && (
            <div style={{ opacity: interpolate(lf, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontFamily: '-apple-system, sans-serif', letterSpacing: 2, textTransform: 'uppercase' as const }}>Claude</div>
              {[
                { name: 'Sarah Chen — Acme Corp', tag: 'Follow-up needed', tagColor: '#f5a623' },
                { name: 'Mike Torres — TechFlow',  tag: 'No reply',         tagColor: '#e53e3e' },
                { name: 'Lisa Wang — Nexus Inc',   tag: 'Proposal sent',    tagColor: '#00d4ff' },
              ].map(({ name, tag, tagColor }, i) => (
                <div key={i} style={{
                  opacity: interpolate(lf, [65 + i * 22, 95 + i * 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${tagColor}`,
                }}>
                  <span style={{ fontSize: 16, color: '#eee', fontFamily: '-apple-system, sans-serif' }}>{name}</span>
                  <span style={{ fontSize: 14, color: tagColor, fontFamily: '-apple-system, sans-serif', fontWeight: 700 }}>{tag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── Scene 5: Automate Pipeline ───────────────────────────────────────────
    if (scene === 5) {
      const scanVisible = lf > 40;
      const reportVisible = lf > 120;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(245,166,35,0.08)', borderRadius: 8, border: '1px solid rgba(245,166,35,0.25)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f5a623', boxShadow: '0 0 8px #f5a623', flexShrink: 0 }} />
            <span style={{ fontSize: 18, color: '#f5a623', fontFamily: '-apple-system, sans-serif' }}>proposals/ folder connected</span>
          </div>
          <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 17, color: '#ccc', fontFamily: '-apple-system, sans-serif', lineHeight: 1.5, border: '1px solid rgba(255,255,255,0.06)' }}>
            Summarize all open deals and what needs to happen next
          </div>
          {scanVisible && (
            <div style={{ opacity: interpolate(lf, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), fontSize: 15, color: '#666', fontFamily: '"SF Mono", monospace', padding: '4px 0' }}>
              Scanning 12 files... {lf < 120 ? `${Math.min(100, Math.floor((lf - 40) * 1.5))}%` : 'done ✓'}
            </div>
          )}
          {reportVisible && (
            <div style={{ opacity: interpolate(lf, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontFamily: '-apple-system, sans-serif', letterSpacing: 2, textTransform: 'uppercase' as const }}>Pipeline Report</div>
              {[
                { deal: 'ACE Corp',     value: '$42,000', status: 'Follow up Fri', statusColor: '#f5a623' },
                { deal: 'Johnson & Co', value: '$28,500', status: 'Proposal sent', statusColor: '#00d4ff' },
                { deal: 'Metro Health', value: '$67,000', status: 'Call scheduled', statusColor: '#00d4ff' },
              ].map(({ deal, value, status, statusColor }, i) => (
                <div key={i} style={{
                  opacity: interpolate(lf, [125 + i * 18, 155 + i * 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                  padding: '10px 14px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                  display: 'flex', gap: 10, alignItems: 'center',
                }}>
                  <span style={{ fontSize: 16, color: '#eee', fontFamily: '-apple-system, sans-serif', fontWeight: 600, flex: 1 }}>{deal}</span>
                  <span style={{ fontSize: 15, color: '#888', fontFamily: '-apple-system, sans-serif' }}>{value}</span>
                  <span style={{ fontSize: 13, color: statusColor, fontFamily: '-apple-system, sans-serif', fontWeight: 700 }}>{status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── Scene 6: Sales Plugins ───────────────────────────────────────────────
    if (scene === 6) {
      const menuVisible = lf > 30;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, color: '#555', fontFamily: '-apple-system, sans-serif', letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 2 }}>Plugin Library</div>
          <div style={{
            padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8,
            fontSize: 18, color: '#f5a623', fontFamily: '"SF Mono", monospace',
            display: 'flex', alignItems: 'center', border: '1px solid rgba(245,166,35,0.15)',
          }}>
            /
            {lf < 30 && <span style={{ opacity: Math.round(lf * 0.2) % 2 === 0 ? 1 : 0 }}>|</span>}
            {lf >= 30 && ' follow-up-sequence'}
          </div>
          {menuVisible && (
            <div>
              {[
                { cmd: '/ follow-up-sequence', label: 'Build multi-touch sequence', color: '#00d4ff', showAt: 30  },
                { cmd: '/ draft-proposal',     label: 'Personalized in 30 sec',    color: '#f5a623', showAt: 180 },
                { cmd: '/ prep-call-brief',    label: 'Pre-call intel in seconds', color: '#ff6b35', showAt: 320 },
              ].map(({ cmd, label, color, showAt }, i) => (
                <div key={i} style={{
                  opacity: interpolate(lf, [showAt, showAt + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                  padding: '11px 14px', marginBottom: 7, borderRadius: 8,
                  background: `${color}10`,
                  border: `1px solid ${color}35`,
                  display: 'flex', flexDirection: 'column' as const, gap: 3,
                }}>
                  <span style={{ fontSize: 16, color, fontFamily: '"SF Mono", monospace', fontWeight: 700 }}>{cmd}</span>
                  <span style={{ fontSize: 14, color: '#888', fontFamily: '-apple-system, sans-serif' }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── Scene 7: Build a Skill ───────────────────────────────────────────────
    const progressPct = Math.min(100, Math.max(0, Math.floor((lf - 80) * 0.3)));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 13, color: '#555', fontFamily: '-apple-system, sans-serif', letterSpacing: 2, textTransform: 'uppercase' as const }}>Skill Builder</div>
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 17, color: '#ccc', fontFamily: '-apple-system, sans-serif', fontStyle: 'italic', lineHeight: 1.5, border: '1px solid rgba(255,255,255,0.06)' }}>
          &ldquo;Create a skill to generate my daily sales brief&rdquo;
        </div>
        {lf > 60 && (
          <div style={{ opacity: interpolate(lf, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            {[
              { q: 'Which accounts to prioritize?', a: 'Enterprise tier, last 30 days', doneAt: 120 },
              { q: 'Preferred format?',              a: 'Bullet list by urgency',        doneAt: 200 },
              { q: 'What data to pull?',             a: 'Emails + CRM + proposals',     doneAt: 290 },
            ].map(({ q, a, doneAt }, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 14, color: '#555', fontFamily: '-apple-system, sans-serif' }}>{q}</div>
                {lf > doneAt && (
                  <div style={{ opacity: interpolate(lf, [doneAt, doneAt + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), fontSize: 16, color: '#00d4ff', fontFamily: '-apple-system, sans-serif', marginTop: 3 }}>{a}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {lf > 160 && (
          <div style={{ opacity: interpolate(lf, [160, 190], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 7, fontFamily: '-apple-system, sans-serif' }}>Building skill...</div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #00d4ff, #00d4ffcc)', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 14, color: '#00d4ff', marginTop: 4, fontFamily: '"SF Mono", monospace' }}>{progressPct}%</div>
          </div>
        )}
        {lf > 440 && (
          <div style={{
            opacity: interpolate(lf, [440, 470], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            padding: '12px 16px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 8, fontSize: 16, color: '#00d4ff', fontFamily: '-apple-system, sans-serif', textAlign: 'center' as const,
          }}>
            ✓ Skill packaged — run with one click
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      background: '#13161f',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.09)',
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      {/* macOS-style title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#0e1018', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center' as const, fontSize: 15, color: '#4a4a5a', fontFamily: '-apple-system, sans-serif' }}>
          Claude Cowork
        </div>
      </div>
      {/* Navigation tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 16px', background: '#0f121a' }}>
        {['Chat', 'Cowork', 'Skills'].map((tab, i) => (
          <div key={i} style={{
            padding: '10px 18px', fontSize: 15,
            fontFamily: '-apple-system, sans-serif', fontWeight: i === tabIndex ? 600 : 400,
            color: i === tabIndex ? '#ffffff' : '#3a3a4a',
            borderBottom: i === tabIndex ? '2px solid #00d4ff' : '2px solid transparent',
          }}>
            {tab}
          </div>
        ))}
      </div>
      {/* Content area */}
      {renderContent()}
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const ClaudeCoworkSalesVideo: React.FC<{ audioSrc?: string }> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#0a0e1a' }}>
      {/* Narrator 0.85 — normalized source at -14 LUFS; music 0.08 (subtle) */}
      {audioSrc && <Audio src={staticFile(audioSrc)} volume={0.85} />}
      <Audio src={staticFile('audio/background-music.mp3')} volume={0.08} />

      {/* Persistent particle field */}
      <ParticleField color="#ffffff" count={50} seed={42} intensity={0.3} />

      {/* ══════════════════════════════════════════════════
          SCENE 1 — HOOK  f0 → f430
          "Here's the number..." → 35% counts up → "65% IS EVERYTHING ELSE"
          ══════════════════════════════════════════════════ */}
      <Sequence from={0} durationInFrames={430}>
        <AbsoluteFill>
          {(() => {
            const lf = frame;
            const fadeOut = interpolate(lf, [400, 430], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
                <FadeIn delay={2}>
                  <div style={{ fontSize: 18, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#888', letterSpacing: 6, textTransform: 'uppercase' as const, marginBottom: 20 }}>
                    The number that should make every salesperson angry
                  </div>
                </FadeIn>

                {/* 35% huge count-up — starts when "35" is spoken at f191 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 12 }}>
                  <CountUp to={35} suffix="%" fontSize={160} color="#f5a623" delay={191} />
                </div>

                <FadeIn delay={191}>
                  <div style={{ fontSize: 36, fontFamily: '-apple-system, sans-serif', fontWeight: 600, color: '#ffffff', letterSpacing: 2, textAlign: 'center' as const, marginBottom: 32 }}>
                    of your day is actually spent selling
                  </div>
                </FadeIn>

                {/* 65% line fades in when spoken at f322 */}
                {lf >= 322 && (
                  <div style={{
                    opacity: interpolate(lf, [322, 360], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    transform: `translateY(${interpolate(spr(lf - 322, fps, 14, 100), [0, 1], [30, 0])}px)`,
                    fontSize: 52,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 900,
                    color: '#00d4ff',
                    letterSpacing: 4,
                    textTransform: 'uppercase' as const,
                    textShadow: '0 0 30px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.3)',
                    textAlign: 'center' as const,
                  }}>
                    65% IS EVERYTHING ELSE.
                  </div>
                )}
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 2 — THE PROBLEM  f430 → f1046
          Animated list of time-wasters, each with strikethrough
          ══════════════════════════════════════════════════ */}
      <Sequence from={430} durationInFrames={616}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 430;
            const items = [
              { text: 'Researching prospects',      startAt: 110 },
              { text: 'Sorting through emails',     startAt: 150 },
              { text: 'Writing follow-ups',         startAt: 190 },
              { text: 'Updating your CRM',          startAt: 230 },
              { text: 'Building pipeline reports',  startAt: 270 },
            ];
            const fadeOut = interpolate(lf, [580, 616], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <FadeIn delay={2}>
                  <div style={{ fontSize: 22, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#888', letterSpacing: 4, textTransform: 'uppercase' as const, marginBottom: 8 }}>
                    Before and after every sales call...
                  </div>
                </FadeIn>

                {items.map(({ text, startAt }, i) => {
                  const itemEn = spr(lf - startAt, fps, 16, 90);
                  const strikeDelay = startAt + 40;
                  const strikeW = interpolate(lf, [strikeDelay, strikeDelay + 20], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                  return (
                    <div key={i} style={{
                      opacity: interpolate(itemEn, [0, 1], [0, 1]),
                      transform: `translateX(${interpolate(itemEn, [0, 1], [-60, 0])}px)`,
                      position: 'relative', display: 'inline-block',
                    }}>
                      <div style={{ fontSize: 48, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#ffffff' }}>
                        {text}
                      </div>
                      <div style={{
                        position: 'absolute', top: '52%', left: 0,
                        height: 6,
                        width: `${strikeW}%`,
                        background: 'linear-gradient(90deg, #e53e3e, #ff6b6b)',
                        borderRadius: 3,
                        boxShadow: '0 0 14px rgba(229,62,62,0.9)',
                        transform: 'translateY(-50%)',
                      }} />
                    </div>
                  );
                })}

                {lf >= 310 && (
                  <div style={{
                    opacity: interpolate(lf, [310, 350], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    transform: `scale(${interpolate(spr(lf - 310, fps, 12, 120), [0, 1], [0.9, 1])})`,
                    fontSize: 38,
                    fontFamily: '-apple-system, sans-serif',
                    fontWeight: 900,
                    color: '#f5a623',
                    textAlign: 'center' as const,
                    letterSpacing: 2,
                    textShadow: '0 0 30px rgba(245,166,35,0.6)',
                    maxWidth: 900,
                    marginTop: 12,
                  }}>
                    EVERY MINUTE ON ADMIN IS A MINUTE NOT CLOSING.
                  </div>
                )}
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 3 — SOLUTION  f1046 → f1410
          "Claude Cowork changes that." — centered reveal
          ══════════════════════════════════════════════════ */}
      <Sequence from={1046} durationInFrames={364}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 1046;
            const fadeOut = interpolate(lf, [334, 364], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const punchEn = spr(lf - 160, fps, 12, 130);
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '0 120px' }}>
                <FadeIn delay={4}>
                  <div style={{ fontSize: 68, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#ffffff', textAlign: 'center' as const, lineHeight: 1.3 }}>
                    Claude Cowork changes that.
                  </div>
                </FadeIn>
                <FadeIn delay={40}>
                  <div style={{ fontSize: 42, fontFamily: '-apple-system, sans-serif', fontWeight: 400, color: '#aaaaaa', textAlign: 'center' as const, lineHeight: 1.5 }}>
                    It&apos;s an AI that doesn&apos;t just answer questions —<br />it actually gets the work done.
                  </div>
                </FadeIn>
                <FadeIn delay={80}>
                  <div style={{ fontSize: 38, fontFamily: '-apple-system, sans-serif', fontWeight: 400, color: '#888', textAlign: 'center' as const }}>
                    Connect it to your inbox, your files, your tools.
                  </div>
                </FadeIn>

                {lf >= 160 && (
                  <div style={{
                    opacity: interpolate(punchEn, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(punchEn, [0, 1], [0.8, 1])})`,
                    fontSize: 72,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    fontWeight: 900,
                    color: '#00d4ff',
                    letterSpacing: 4,
                    textTransform: 'uppercase' as const,
                    textShadow: '0 0 40px rgba(0,212,255,0.7), 0 0 80px rgba(0,212,255,0.35)',
                    textAlign: 'center' as const,
                    marginTop: 8,
                  }}>
                    YOUR DIGITAL CO-WORKER.
                  </div>
                )}
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 4 — CONNECT INBOX  f1410 → f2076
          Split: left = feature bullets, right = MockUIWindow (Outlook scan)
          ══════════════════════════════════════════════════ */}
      <Sequence from={1410} durationInFrames={666}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 1410;
            const fadeOut = interpolate(lf, [636, 666], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0 }}>
                {/* Left column — text */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 80, gap: 24 }}>
                  <SceneLabel number="Number One" title="Connect Your Inbox" color="#00d4ff" delay={4} />

                  {[
                    { text: 'Find your recent prospect emails', delay: 80  },
                    { text: 'Flag unanswered follow-ups',       delay: 130 },
                    { text: 'Surface cold proposals instantly', delay: 190 },
                  ].map(({ text, delay }, i) => {
                    const en = spr(lf - delay, fps, 18, 80);
                    return (
                      <div key={i} style={{
                        opacity: interpolate(en, [0, 1], [0, 1]),
                        transform: `translateX(${interpolate(en, [0, 1], [-40, 0])}px)`,
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px rgba(0,212,255,0.8)', flexShrink: 0 }} />
                        <span style={{ fontSize: 32, fontFamily: '-apple-system, sans-serif', fontWeight: 600, color: '#ffffff' }}>{text}</span>
                      </div>
                    );
                  })}

                  {/* "30 MIN → 30 SEC" punch */}
                  {lf >= 480 && lf < 620 && (
                    <div style={{
                      opacity: interpolate(lf, [480, 510], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) *
                               interpolate(lf, [600, 620], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                      transform: `scale(${interpolate(spr(lf - 480, fps, 10, 130), [0, 1], [0.85, 1])})`,
                      display: 'flex', alignItems: 'center', gap: 16, marginTop: 8,
                    }}>
                      <span style={{ fontSize: 44, fontFamily: '-apple-system, sans-serif', fontWeight: 900, color: '#aaa', textDecoration: 'line-through', textDecorationColor: '#e53e3e', textDecorationThickness: '4px' }}>30 MIN</span>
                      <span style={{ fontSize: 36, color: '#888' }}>→</span>
                      <span style={{ fontSize: 44, fontFamily: '-apple-system, sans-serif', fontWeight: 900, color: '#00d4ff', textShadow: '0 0 30px rgba(0,212,255,0.7)' }}>30 SEC</span>
                    </div>
                  )}
                </div>

                {/* Right column — Claude Cowork mock UI */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '48%', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                  <SlideIn delay={20} from="right" style={{ width: '100%' }}>
                    <MockUIWindow scene={4} localFrame={lf} />
                  </SlideIn>
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 5 — AUTOMATE PIPELINE  f2076 → f2700
          Split: left = prompt/result cards, right = MockUIWindow (pipeline report)
          ══════════════════════════════════════════════════ */}
      <Sequence from={2076} durationInFrames={624}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 2076;
            const fadeOut = interpolate(lf, [594, 624], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0 }}>
                {/* Left column */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 80, gap: 28 }}>
                  <SceneLabel number="Number Two" title="Automate Your Pipeline" color="#f5a623" delay={4} />

                  <SlideIn delay={60} from="left">
                    <GlassCard accentColor="#f5a623" delay={0} style={{ maxWidth: 560 }}>
                      <div style={{ fontSize: 18, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#f5a623', letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 10 }}>Your prompt →</div>
                      <div style={{ fontSize: 24, fontFamily: '"SF Mono", monospace', color: '#ffffff', lineHeight: 1.5, fontStyle: 'italic' }}>
                        &ldquo;Summarize all open deals and what needs to happen next.&rdquo;
                      </div>
                    </GlassCard>
                  </SlideIn>

                  {lf >= 160 && (
                    <SlideIn delay={160} from="left">
                      <GlassCard accentColor="#00d4ff" delay={0} style={{ maxWidth: 560 }}>
                        <div style={{ fontSize: 18, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#00d4ff', letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 10 }}>Claude delivers →</div>
                        <div style={{ fontSize: 22, fontFamily: '-apple-system, sans-serif', color: '#cccccc', lineHeight: 1.6 }}>
                          Pipeline report. Formatted. Organized. Ready to send.
                        </div>
                      </GlassCard>
                    </SlideIn>
                  )}

                  {lf >= 350 && (
                    <div style={{
                      opacity: interpolate(lf, [350, 390], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                      fontSize: 32, fontFamily: '-apple-system, sans-serif', fontWeight: 900,
                      color: '#f5a623', letterSpacing: 2,
                      textShadow: '0 0 24px rgba(245,166,35,0.6)',
                    }}>
                      No more Sunday night spreadsheet hell.
                    </div>
                  )}
                </div>

                {/* Right column — Claude Cowork mock UI */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '48%', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                  <SlideIn delay={20} from="right" style={{ width: '100%' }}>
                    <MockUIWindow scene={5} localFrame={lf} />
                  </SlideIn>
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 6 — SALES PLUGINS  f2700 → f3369
          Split: left = slash commands, right = MockUIWindow (plugin library)
          ══════════════════════════════════════════════════ */}
      <Sequence from={2700} durationInFrames={669}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 2700;
            const fadeOut = interpolate(lf, [639, 669], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const commands = [
              { slash: '/ follow-up-sequence', label: 'Generate a follow-up sequence', color: '#00d4ff', delay: 80  },
              { slash: '/ draft-proposal',     label: 'Draft a personalized proposal', color: '#f5a623', delay: 200 },
              { slash: '/ prep-call-brief',    label: 'Prep your call brief',          color: '#ff6b35', delay: 340 },
            ];
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0 }}>
                {/* Left column */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 80, gap: 24 }}>
                  <SceneLabel number="Number Three" title="Sales Plugins" color="#f5a623" delay={4} />

                  <FadeIn delay={30}>
                    <div style={{ fontSize: 26, fontFamily: '-apple-system, sans-serif', fontWeight: 400, color: '#aaa' }}>
                      Type <span style={{ fontFamily: '"SF Mono", monospace', color: '#f5a623', background: 'rgba(245,166,35,0.12)', padding: '2px 10px', borderRadius: 6 }}>/</span> and choose your move
                    </div>
                  </FadeIn>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {commands.map(({ slash, label, color, delay }, i) => {
                      const en = spr(lf - delay, fps, 16, 90);
                      const charN = Math.min(slash.length, Math.floor(Math.max(0, lf - delay - 10) * 0.35));
                      return (
                        <div key={i} style={{
                          opacity: interpolate(en, [0, 1], [0, 1]),
                          transform: `translateX(${interpolate(en, [0, 1], [-50, 0])}px)`,
                          display: 'flex', alignItems: 'center', gap: 16,
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${color}30`,
                          borderLeft: `4px solid ${color}`,
                          borderRadius: 10, padding: '14px 20px',
                        }}>
                          <div style={{ fontSize: 22, fontFamily: '"SF Mono", monospace', fontWeight: 700, color, minWidth: 260, textShadow: `0 0 12px ${color}60` }}>
                            {slash.slice(0, charN)}{charN < slash.length && <span style={{ opacity: Math.round(lf * 0.12) % 2 === 0 ? 1 : 0 }}>|</span>}
                          </div>
                          <div style={{ fontSize: 20, fontFamily: '-apple-system, sans-serif', color: '#ffffff', fontWeight: 500 }}>{label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {lf >= 480 && (
                    <div style={{
                      opacity: interpolate(lf, [480, 520], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                      fontSize: 30, fontFamily: '-apple-system, sans-serif', fontWeight: 900,
                      color: '#ffffff', letterSpacing: 3, textTransform: 'uppercase' as const,
                      textShadow: '0 0 20px rgba(255,255,255,0.3)',
                    }}>
                      No prompting. Just results.
                    </div>
                  )}
                </div>

                {/* Right column — Claude Cowork mock UI */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '48%', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                  <SlideIn delay={20} from="right" style={{ width: '100%' }}>
                    <MockUIWindow scene={6} localFrame={lf} />
                  </SlideIn>
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 7 — BUILD A SKILL  f3369 → f4054
          Split: left = progress bars + skill reveal, right = MockUIWindow (skill builder)
          ══════════════════════════════════════════════════ */}
      <Sequence from={3369} durationInFrames={685}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 3369;
            const fadeOut = interpolate(lf, [655, 685], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const steps = [
              { label: 'Asking questions about your workflow',   delay: 80,  pct: 100 },
              { label: 'Building your skill.md file',           delay: 180, pct: 100 },
              { label: 'Packaging your plugin directory',       delay: 290, pct: 100 },
              { label: 'Validating final output',               delay: 390, pct: 100 },
            ];
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0 }}>
                {/* Left column */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 80, gap: 24 }}>
                  <SceneLabel number="Number Four" title="Build Your Own Skill" color="#00d4ff" delay={4} />

                  <FadeIn delay={30}>
                    <div style={{
                      fontSize: 24, fontFamily: '"SF Mono", monospace', color: '#ccc',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: 10, padding: '14px 24px',
                    }}>
                      &ldquo;Create a skill to generate my daily sales brief&rdquo;
                    </div>
                  </FadeIn>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
                    {steps.map(({ label, delay, pct }, i) => (
                      <ProgressBar key={i} label={label} percent={pct} delay={delay} color="#00d4ff" />
                    ))}
                  </div>

                  {lf >= 480 && (
                    <SlideIn delay={480} from="bottom">
                      <GlassCard accentColor="#00d4ff" delay={0} style={{ maxWidth: 520 }}>
                        <div style={{ fontSize: 18, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#00d4ff', letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 8 }}>
                          Skill packaged ✓
                        </div>
                        <div style={{ fontSize: 24, fontFamily: '-apple-system, sans-serif', color: '#ffffff', lineHeight: 1.6 }}>
                          Reusable every morning. One click.
                        </div>
                      </GlassCard>
                    </SlideIn>
                  )}

                  {lf >= 580 && (
                    <div style={{
                      opacity: interpolate(lf, [580, 620], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                      fontSize: 38, fontFamily: '-apple-system, sans-serif', fontWeight: 900,
                      color: '#00d4ff', letterSpacing: 4, textTransform: 'uppercase' as const,
                      textShadow: '0 0 30px rgba(0,212,255,0.7)',
                    }}>
                      YOUR WORKFLOW. AUTOMATED.
                    </div>
                  )}
                </div>

                {/* Right column — Claude Cowork mock UI */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '48%', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                  <SlideIn delay={20} from="right" style={{ width: '100%' }}>
                    <MockUIWindow scene={7} localFrame={lf} />
                  </SlideIn>
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 8 — BRIDGE  f4054 → f4279
          3 glassmorphism cards: LESS ADMIN / MORE PIPELINE / BETTER RESULTS
          ══════════════════════════════════════════════════ */}
      <Sequence from={4054} durationInFrames={225}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 4054;
            const fadeOut = interpolate(lf, [195, 225], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const cards = [
              { label: 'Less Admin',      sub: 'More time in front of buyers',    color: '#00d4ff', delay: 10 },
              { label: 'More Pipeline',   sub: 'More deals, more momentum',       color: '#f5a623', delay: 50 },
              { label: 'Better Results',  sub: 'Higher close rates, every week',  color: '#ff6b35', delay: 90 },
            ];
            return (
              <div style={{ opacity: fadeOut, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, padding: '0 80px' }}>
                <FadeIn delay={4}>
                  <div style={{ fontSize: 22, fontFamily: '-apple-system, sans-serif', fontWeight: 700, color: '#888', letterSpacing: 4, textTransform: 'uppercase' as const, marginBottom: 8 }}>
                    That&apos;s what selling looks like in 2025
                  </div>
                </FadeIn>

                <div style={{ display: 'flex', gap: 28, width: '100%', justifyContent: 'center' }}>
                  {cards.map(({ label, sub, color, delay }, i) => {
                    const en = spr(lf - delay, fps, 14, 100);
                    return (
                      <div key={i} style={{
                        flex: 1, maxWidth: 320,
                        opacity: interpolate(en, [0, 1], [0, 1]),
                        transform: `translateY(${interpolate(en, [0, 1], [60, 0])}px) scale(${interpolate(en, [0, 1], [0.88, 1])})`,
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${color}40`,
                        borderTop: `4px solid ${color}`,
                        borderRadius: 16, padding: '32px 28px', textAlign: 'center' as const,
                        boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 30px ${color}15`,
                      }}>
                        <div style={{ fontSize: 36, fontFamily: '-apple-system, sans-serif', fontWeight: 900, color, letterSpacing: 2, textTransform: 'uppercase' as const, textShadow: `0 0 20px ${color}60`, marginBottom: 12 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 20, fontFamily: '-apple-system, sans-serif', color: '#aaa', lineHeight: 1.5 }}>
                          {sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ══════════════════════════════════════════════════
          SCENE 9 — CTA  f4279 → f4686
          Typewriter URL reveal, pulsing CTA button, 5s hold
          ══════════════════════════════════════════════════ */}
      <Sequence from={4279} durationInFrames={407}>
        <AbsoluteFill>
          {(() => {
            const lf = frame - 4279;
            const charsPerFrame = 0.28;
            const urlText = 'scottmagnacca.com';
            const charN = Math.min(urlText.length, Math.floor(Math.max(0, lf - 20) * charsPerFrame));
            const pulseGlow = 20 + Math.sin(lf * 0.08) * 8;
            return (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 36 }}>
                <FadeIn delay={4}>
                  <div style={{ fontSize: 36, fontFamily: '-apple-system, sans-serif', fontWeight: 400, color: '#aaa', letterSpacing: 2, textAlign: 'center' as const }}>
                    The full playbook on selling with AI
                  </div>
                </FadeIn>

                <FadeIn delay={20}>
                  <div style={{ fontSize: 72, fontFamily: '"SF Mono", "Fira Code", monospace', fontWeight: 700, color: '#00d4ff', letterSpacing: 3, textShadow: `0 0 30px rgba(0,212,255,0.7), 0 0 60px rgba(0,212,255,0.3)` }}>
                    {urlText.slice(0, charN)}{charN < urlText.length && <span style={{ opacity: Math.round(lf * 0.12) % 2 === 0 ? 1 : 0 }}>|</span>}
                  </div>
                </FadeIn>

                {lf >= 120 && (
                  <div style={{
                    opacity: interpolate(lf, [120, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    transform: `scale(${interpolate(spr(lf - 120, fps, 14, 100), [0, 1], [0.85, 1])})`,
                    padding: '22px 70px',
                    background: 'rgba(0,212,255,0.10)',
                    border: '2px solid #00d4ff',
                    borderRadius: 50,
                    boxShadow: `0 0 ${pulseGlow}px rgba(0,212,255,0.5)`,
                  }}>
                    <span style={{ fontSize: 30, fontFamily: '-apple-system, sans-serif', fontWeight: 800, color: '#00d4ff', letterSpacing: 4, textTransform: 'uppercase' as const }}>
                      Visit Now →
                    </span>
                  </div>
                )}

                <WordReveal text="Sell more. In less time." color="#f5a623" fontSize={50} delay={200} wordStagger={6} textAlign="center" maxWidth={800} />
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
