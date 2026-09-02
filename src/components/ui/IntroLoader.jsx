import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import '../../styles/intro-loader.css';

const LETTERS = [
  { char: 'd' },
  { char: 'o' },
  { char: 'c' },
  { char: 'k' },
  { char: 'M', isCapitalM: true },
  { char: 'o' },
  { char: 'r' },
  { char: 'e' },
  { char: '.' },
];

// Pacing
const INITIAL_DELAY = 0.16;
const LETTER_DURATION = 0.8;
const LETTER_STAGGER = 0.12;
const HOLD_AFTER_REVEAL = 0.4;
const EXIT_DURATION = 0.32;
const CONTENT_CROSSFADE_LEAD = 0.14;

/**
 * IntroLoader — GSAP letter reveal + full-overlay exit.
 * Reference: references/intro/dockmore-intro-rev.mov
 */
export default function IntroLoader({ onExitStart, onComplete }) {
  const containerRef = useRef(null);
  const wordRef = useRef(null);
  const letterRefs = useRef([]);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reducedMotion.current) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!reducedMotion.current) return;

    onComplete?.();
  }, [onComplete]);

  useGSAP(
    () => {
      if (reducedMotion.current) return;

      const letters = letterRefs.current.filter(Boolean);
      if (!letters.length || !wordRef.current || !containerRef.current) return;

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          delay: INITIAL_DELAY,
          onComplete: () => {
            onComplete?.();
          },
        });

        const revealEnd = (letters.length - 1) * LETTER_STAGGER + LETTER_DURATION;
        const exitStart = revealEnd + HOLD_AFTER_REVEAL;

        // 1. Subtle camera push-in / zoom during letter reveal and hold
        tl.fromTo(
          wordRef.current,
          {
            scale: 0.95,
            force3D: true,
          },
          {
            scale: 1.04,
            duration: exitStart,
            ease: 'sine.out',
            force3D: true,
          },
          0
        );

        // 2. Letter reveal — soft blur rise, left-to-right stagger
        tl.fromTo(
          letters,
          {
            opacity: 0,
            filter: 'blur(8px)',
            y: 8,
            force3D: true,
          },
          {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: LETTER_DURATION,
            ease: 'power3.out',
            stagger: LETTER_STAGGER,
            onComplete: () => {
              letters.forEach((el) => {
                if (el.dataset.capitalM === 'true') {
                  el.classList.add('is-revealed');
                }
              });
            },
          },
          0
        );

        // Content crossfade begins slightly before loader exit
        tl.call(() => onExitStart?.(), null, exitStart - CONTENT_CROSSFADE_LEAD);

        // 3. Instant zoom-in + fade out effect at the end
        tl.to(
          wordRef.current,
          {
            opacity: 0,
            scale: 1.55,
            filter: 'blur(10px)',
            duration: EXIT_DURATION,
            ease: 'power3.in',
            force3D: true,
          },
          exitStart
        );

        // Full overlay fade
        tl.to(
          containerRef.current,
          {
            opacity: 0,
            duration: EXIT_DURATION,
            ease: 'power2.inOut',
          },
          exitStart
        );
      }, containerRef);

      return () => ctx.revert();
    },
    { scope: containerRef, dependencies: [onExitStart, onComplete] }
  );

  if (reducedMotion.current) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="intro-loader"
      role="presentation"
      aria-hidden="true"
    >
      <div ref={wordRef} className="intro-loader__word">
        {LETTERS.map(({ char, isCapitalM }, index) => (
          <span
            key={`${char}-${index}`}
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            className={
              isCapitalM
                ? 'intro-loader__letter intro-loader__letter--m'
                : 'intro-loader__letter'
            }
            data-capital-m={isCapitalM ? 'true' : 'false'}
            aria-hidden="true"
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

export function shouldSkipIntro() {
  if (typeof window === 'undefined') return true;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
