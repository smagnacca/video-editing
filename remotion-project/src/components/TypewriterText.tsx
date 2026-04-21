import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

/**
 * TypewriterText — Characters appear one by one with blinking cursor.
 * From the Persuasion & Conversion Toolkit (Text effects).
 *
 * Purpose: Creates anticipation and keeps viewer attention during narration.
 * Use for URLs, key phrases, or scene titles that need emphasis.
 */
export const TypewriterText: React.FC<{
  text: string;
  /** Frame delay before typing starts */
  delay?: number;
  /** Frames per character */
  speed?: number;
  color?: string;
  fontSize?: number;
  /** Show blinking cursor */
  cursor?: boolean;
  /** Glow color for text-shadow (Remotion-safe, no WebkitBackgroundClip) */
  glowColor?: string;
  fontWeight?: number;
}> = ({
  text,
  delay = 0,
  speed = 2,
  color = '#ffffff',
  fontSize = 48,
  cursor = true,
  glowColor,
  fontWeight = 700,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const charsToShow = Math.min(text.length, Math.floor(localFrame / speed));
  const displayText = text.slice(0, charsToShow);
  const isTyping = charsToShow < text.length;
  const cursorVisible = cursor && (isTyping ? localFrame % 16 < 10 : localFrame % 30 < 20);

  if (localFrame < 0) return null;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", monospace',
        fontSize,
        fontWeight,
        color,
        textShadow: glowColor
          ? `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}40, 0 0 80px ${glowColor}20`
          : undefined,
        letterSpacing: -0.5,
        whiteSpace: 'pre',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {displayText}
      {cursor && (
        <span
          style={{
            display: 'inline-block',
            width: fontSize * 0.05,
            height: fontSize * 0.85,
            backgroundColor: color,
            marginLeft: 2,
            opacity: cursorVisible ? 0.9 : 0,
            boxShadow: glowColor ? `0 0 10px ${glowColor}60` : undefined,
          }}
        />
      )}
    </div>
  );
};
