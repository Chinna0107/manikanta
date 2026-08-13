import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import logoImg from '../assets/logo.png';
import splashBg from '../assets/splash_bg.png';

export function SplashScreen({ onComplete }) {
  const container = useRef(null);
  const logoGroup = useRef(null);
  const taglineRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Logo pops in
    tl.from(logoGroup.current, {
      scale: 0.7,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.7)'
    });

    // Tagline fades up
    tl.from(taglineRef.current, {
      y: 16,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.3');

    // Hold for a moment
    tl.to({}, { duration: 1.5 });

    // Fade everything out
    tl.to(container.current, {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut'
    });

  }, { scope: container });

  return (
    <div
      ref={container}
      className="fixed inset-0 z-[100] flex flex-col items-center w-full h-full overflow-hidden"
    >
      {/* Full-screen background image — basket is baked in, no seams */}
      <img
        src={splashBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 w-full" style={{ paddingBottom: '40vh' }}>
        <div ref={logoGroup} className="flex flex-col items-center">
          {/* Logo */}
          <img
            src={logoImg}
            alt="Manikanta Super Market Logo"
            className="object-contain mb-3"
            style={{
              width: '140px',
              height: '140px',
              mixBlendMode: 'multiply',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
            }}
          />

          {/* Brand Name */}
          <span
            style={{
              color: '#C8102E',
              fontFamily: "'Georgia', serif",
              fontSize: 'clamp(28px, 9vw, 44px)',
              fontWeight: '900',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              textShadow: '0 2px 8px rgba(0,0,0,0.10)'
            }}
          >
            MANIKANTA
          </span>
          <span
            style={{
              color: '#C8102E',
              fontFamily: "'Georgia', serif",
              fontSize: 'clamp(16px, 5vw, 22px)',
              fontWeight: '700',
              letterSpacing: '0.20em',
              textShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            SUPER MARKET
          </span>
        </div>

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{
            color: '#5C2A00',
            fontFamily: "'Georgia', serif",
            fontSize: 'clamp(16px, 5vw, 22px)',
            fontWeight: '700',
            marginTop: '24px'
          }}
        >
          Freshness Delivered Daily
        </p>
      </div>
    </div>
  );
}
