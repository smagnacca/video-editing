import React from 'react';
import { Composition, AbsoluteFill, Audio, staticFile } from 'remotion';
import { ThreeTypesVideo } from '../src/ThreeTypesVideo';
import { TemplateVideo } from '../src/TemplateVideo';
import { StorysellingVideo, StoryselllingCTAOnlyComp } from '../src/StorysellingVideo';
import { InvisibleSignVideo } from '../src/InvisibleSignVideo';
import { IntroScene } from '../src/components/IntroScene';
import { OutroScene } from '../src/components/OutroScene';
import { SalesSprintVideo } from '../src/SalesSprintVideo';
import { ClaudeCoworkSalesVideo, CLAUDE_COWORK_TOTAL_FRAMES } from '../src/ClaudeCoworkSalesVideo';

// ─── Shared palette + effects ─────────────────────────────────────────────────
const COLORS = {
  bg: '#0a0e1a', accent1: '#00d4ff', accent2: '#f5a623', accent3: '#ff6b35',
  textPrimary: '#ffffff', textSecondary: '#a0aec0',
};
const EFFECTS = {
  particles: true, noiseOverlay: true, sceneTransitions: 'liquid' as const,
  hueShift: true, kineticStyle: 'spring-glow' as const,
};

// ─── Standalone intro wrapper (3 Types) ──────────────────────────────────────
const IntroComposition: React.FC = () => (
  <IntroScene
    scene={{
      type: 'intro',
      avatarSrc: 'avatar/intro-avatar.mp4',
      hookText: "YOUR EDGE ISN'T WHAT YOU THINK",
      hookColor: 'accent2',
      topicTitle: '3 Types of People You Need in Your Corner',
      topicSubtitle: 'Curiosity · Learning · Adaptability',
      speakerName: 'Scott Magnacca',
      speakerTitle: 'AI & Leadership Strategist',
      accentColor: 'accent1',
      timing: { startFrame: 0, endFrame: 690 },
    }}
    colors={COLORS}
    effects={EFFECTS}
  />
);

// ─── Standalone outro wrapper (3 Types) ──────────────────────────────────────
const OutroComposition: React.FC = () => (
  <OutroScene
    scene={{
      type: 'outro',
      avatarSrc: 'avatar/outro-avatar.mp4',
      ctaHeadline: 'Take the 60-Second Quiz',
      ctaDescription: 'Discover your AI leadership style',
      ctaButtonText: 'START THE QUIZ',
      accentColor: 'accent2',
      kineticText: 'YOUR CIRCLE IS YOUR CATALYST',
      kineticColor: 'accent1',
      speakerName: 'Scott Magnacca',
      timing: { startFrame: 0, endFrame: 643 },
    }}
    colors={COLORS}
    effects={EFFECTS}
    ctaUrl="scottmagnacca.com"
    ctaTagline="Discover your AI leadership edge"
  />
);

// ─── Storyselling palette + effects ──────────────────────────────────────────
const SS_COLORS = {
  bg: '#000000', accent1: '#005A3B', accent2: '#FFFFFF', accent3: '#005A3B',
  textPrimary: '#FFFFFF', textSecondary: '#b0b0b0',
};
const SS_EFFECTS = {
  particles: true, noiseOverlay: true, sceneTransitions: 'crossfade' as const,
  hueShift: false, kineticStyle: 'spring-glow' as const,
};

// ─── Storyselling intro wrapper ──────────────────────────────────────────────
const StorysellingIntroComposition: React.FC = () => (
  <IntroScene
    scene={{
      type: 'intro',
      avatarSrc: 'avatar/intro-avatar.mp4',
      hookText: 'STORIES SELL. DATA DOESN\'T.',
      hookColor: 'accent1',
      topicTitle: 'Storyselling in the Age of AI',
      topicSubtitle: 'Connection · Story · Impact',
      speakerName: 'Scott Magnacca',
      speakerTitle: 'AI & Storyselling Strategist',
      accentColor: 'accent1',
      timing: { startFrame: 0, endFrame: 728 },
    }}
    colors={SS_COLORS}
    effects={SS_EFFECTS}
  />
);

// ─── Storyselling outro wrapper ──────────────────────────────────────────────
const StorysellingOutroComposition: React.FC = () => (
  <OutroScene
    scene={{
      type: 'outro',
      avatarSrc: 'avatar/outro-avatar.mp4',
      ctaHeadline: 'Take the 60-Second AI Quiz',
      ctaDescription: 'Discover your AI storyselling edge',
      ctaButtonText: 'START THE QUIZ',
      accentColor: 'accent1',
      kineticText: 'STORIES SELL. DATA DOESN\'T.',
      kineticColor: 'accent1',
      speakerName: 'Scott Magnacca',
      timing: { startFrame: 0, endFrame: 643 },
    }}
    colors={SS_COLORS}
    effects={SS_EFFECTS}
    ctaUrl="60-second-ai-quiz.netlify.app"
    ctaTagline="Discover your AI storyselling edge"
  />
);

// ─── Invisible Sign intro wrapper ───────────────────────────────────────────
const InvisibleSignIntroComposition: React.FC = () => (
  <IntroScene
    scene={{
      type: 'intro',
      avatarSrc: 'avatar/intro-avatar.mp4',
      hookText: 'EVERY CLIENT WEARS AN INVISIBLE SIGN',
      hookColor: 'accent1',
      topicTitle: 'Can You Read It?',
      topicSubtitle: 'Role · Story · Silence',
      speakerName: 'Scott Magnacca',
      speakerTitle: 'AI & Storyselling Strategist',
      accentColor: 'accent1',
      timing: { startFrame: 0, endFrame: 690 },
    }}
    colors={SS_COLORS}
    effects={SS_EFFECTS}
  />
);

// ─── Generic Outro (reusable across all videos) ─────────────────────────────
const GenericOutroComposition: React.FC = () => (
  <OutroScene
    scene={{
      type: 'outro',
      avatarSrc: 'avatar/outro-avatar.mp4',
      ctaHeadline: 'Take the 60-Second AI Quiz',
      ctaDescription: 'Discover how AI will impact your career in the next 12 months',
      ctaButtonText: 'START THE QUIZ →',
      accentColor: 'accent2',
      kineticText: '',
      kineticColor: 'accent1',
      speakerName: 'Scott Magnacca',
      timing: { startFrame: 0, endFrame: 643 },
    }}
    colors={COLORS}
    effects={EFFECTS}
    ctaUrl="scottmagnacca.com"
    ctaTagline="Build the skills that make you impossible to ignore"
  />
);

// ─── Default config — loaded from templates/video.config.example.json ─────────
const defaultTemplateConfig = {
  title: 'Template Video',
  compositionId: 'TemplateVideo',
  audio: { file: '3-types-of-people.mp3' },
  colors: COLORS,
  effects: EFFECTS,
  ctaUrl: 'scottmagnacca.com',
  ctaTagline: 'Build the skills that make you impossible to ignore',
  scenes: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Standalone intro (23.0s = 690 frames — trimmed before topic reveal) */}
      <Composition
        id="IntroSceneComp"
        component={IntroComposition}
        durationInFrames={690}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Standalone outro (21.42s = 643 frames — Scott_outro_4.1.26.mp4) */}
      <Composition
        id="OutroSceneComp"
        component={OutroComposition}
        durationInFrames={643}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Original "3 Types" video — hardcoded composition */}
      <Composition
        id="ThreeTypesVideo"
        component={ThreeTypesVideo}
        durationInFrames={5970}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioSrc: '3-types-of-people.mp3',
        }}
      />

      {/* Config-driven template — orchestrator overwrites defaultProps with real config */}
      <Composition
        id="TemplateVideo"
        component={TemplateVideo}
        durationInFrames={6000}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          config: defaultTemplateConfig,
        }}
      />

      {/* ─── Storyselling CTA scene only (680 frames = 22.67s, audio offset to CTA) ─── */}
      <Composition
        id="StoryselllingCTAOnly"
        component={StoryselllingCTAOnlyComp}
        durationInFrames={680}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ─── Storyselling in the Age of AI ─── */}
      <Composition
        id="StorysellingVideo"
        component={StorysellingVideo}
        durationInFrames={4450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioSrc: 'storyselling-ai.mp3',
        }}
      />

      <Composition
        id="StorysellingIntroComp"
        component={StorysellingIntroComposition}
        durationInFrames={728}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="StorysellingOutroComp"
        component={StorysellingOutroComposition}
        durationInFrames={643}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ─── Every Client Wears an Invisible Sign — Ch2 ─── */}
      <Composition
        id="InvisibleSignVideo"
        component={InvisibleSignVideo}
        durationInFrames={4540}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: 'audio/invisible-sign.mp3' }}
      />

      <Composition
        id="InvisibleSignIntroComp"
        component={InvisibleSignIntroComposition}
        durationInFrames={690}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Generic reusable outro — no topic-specific kinetic text or CTA */}
      <Composition
        id="GenericOutroSceneComp"
        component={GenericOutroComposition}
        durationInFrames={643}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ─── Claude Cowork for Salespeople — 151.23s Scott voice + 5s tail = 4686 frames ─── */}
      <Composition
        id="ClaudeCoworkSalesVideo"
        component={ClaudeCoworkSalesVideo}
        durationInFrames={CLAUDE_COWORK_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: 'audio/claude-cowork-sales.mp3' }}
      />

      {/* ─── 15 Minute Sales Sprint Promo — 113.50s Scott voice + 5s tail = 3555 frames ─── */}
      <Composition
        id="SalesSprintVideo"
        component={SalesSprintVideo}
        durationInFrames={3555}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: 'audio/scott-narration.mp3' }}
      />
    </>
  );
};
