import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

/**
 * SlideUpModal
 * Wraps any modal with a continuous upward kinetic flow:
 * - Opening: Slides UP from bottom of viewport to center with ease-in-out + motion blur (no opacity fade on modal).
 * - Closing: Slides UP out of top of viewport with ease-in-out + motion blur (no opacity fade on modal).
 */
export default function SlideUpModal({
  isOpen,
  onClose,
  children,
  panelClassName = 'bg-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col gap-5 relative shadow-2xl',
  closeOnBackdrop = true,
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // Mount immediately when isOpen becomes true
  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  // Run GSAP animations synchronously before paint
  useLayoutEffect(() => {
    if (!isMounted) return;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const bottomDistance = typeof window !== 'undefined' ? window.innerHeight + 150 : 1000;
    const topDistance = typeof window !== 'undefined' ? -(window.innerHeight + 150) : -1000;

    if (isOpen) {
      // ── Entry animation: Slide UP from bottom to center ──
      gsap.killTweensOf([overlay, panel]);

      // Backdrop overlay fades in
      gsap.fromTo(
        overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.inOut' }
      );

      // Panel slides UP from below viewport with motion blur, no opacity fade on panel
      gsap.fromTo(
        panel,
        { y: bottomDistance, filter: 'blur(16px)', opacity: 1, scale: 1 },
        {
          y: 0,
          filter: 'blur(0px)',
          opacity: 1,
          scale: 1,
          duration: 0.55,
          ease: 'power3.inOut',
          clearProps: 'filter', // Remove filter after animation for crisp text
        }
      );
    } else {
      // ── Exit animation: Slide UP out of top ──
      gsap.killTweensOf([overlay, panel]);

      const tl = gsap.timeline({
        onComplete: () => {
          setIsMounted(false);
        },
      });

      // Panel slides UP past top of viewport with motion blur, no opacity fade on panel
      tl.to(panel, {
        y: topDistance,
        filter: 'blur(14px)',
        opacity: 1,
        duration: 0.45,
        ease: 'power3.inOut',
      });

      // Backdrop fades out near the end of the slide
      tl.to(
        overlay,
        { opacity: 0, duration: 0.25, ease: 'power2.inOut' },
        '-=0.2'
      );
    }
  }, [isOpen, isMounted]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (closeOnBackdrop && e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose, closeOnBackdrop]
  );

  if (!isMounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-hidden"
      onClick={handleOverlayClick}
      style={{ opacity: 0 }}
    >
      <div
        ref={panelRef}
        className={panelClassName}
        style={{
          transform: 'translateY(120vh)',
          willChange: 'transform, filter',
        }}
      >
        {children}
      </div>
    </div>
  );
}
