import React, { useState, useEffect, useRef } from 'react';
import introVideo from '../../assets/intro/dockmore-intro.mov';

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-800 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={isFadingOut}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={introVideo} type="video/quicktime" />
        <source src={introVideo} type="video/mp4" />
      </video>
    </div>
  );
}

