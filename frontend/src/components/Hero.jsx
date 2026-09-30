import React, { useState, useEffect, useRef } from 'react';
import GlobeComponent from './GlobeComponent';

// The phrases that will loop in the typewriter effect
const phrases = [
  "Forecasting intelligent cargo routes in real-time.",
  "Minimizing turnaround delays at global ports.",
  "Predicting freight rates with 98.5% accuracy.",
  "Optimizing vessel chartering constraints."
];

// 1. ISOLATED TYPEWRITER COMPONENT
const TypewriterEffect = () => {
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 30 : 80;
    const delay = text === currentPhrase && !isDeleting ? 2000 : typingSpeed;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        setIsDeleting(true);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setText(
          isDeleting
            ? currentPhrase.substring(0, text.length - 1)
            : currentPhrase.substring(0, text.length + 1)
        );
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <div className="mt-6 text-base sm:text-lg text-gray-400 max-w-sm md:max-w-md h-20 flex items-start justify-center md:justify-end text-center md:text-right">
      <p className="inline-block">
        {text}
        <span className="inline-block w-1.5 h-5 ml-1 bg-[#ffd369] align-middle animate-pulse"></span>
      </p>
    </div>
  );
};

// 2. MAIN HERO COMPONENT
export default function Hero() {
  const textContainerRef = useRef(null);
  const revealTextRef = useRef(null);

  // High-performance mouse tracking: Bypasses React state completely
  const handleMouseMove = (e) => {
    if (!textContainerRef.current || !revealTextRef.current) return;
    
    const rect = textContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Directly inject CSS variables into the DOM node to prevent lag
    revealTextRef.current.style.setProperty('--x', `${x}px`);
    revealTextRef.current.style.setProperty('--y', `${y}px`);
  };

  return (
    <section className="min-h-screen w-full bg-transparent flex flex-col md:flex-row items-center justify-between pt-20 relative z-10 overflow-x-hidden">
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&display=swap');
          .font-cargo { font-family: 'Chakra Petch', sans-serif; }
        `}
      </style>

      {/* Left Side: Rotating Globe */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-0 md:h-full flex items-center justify-center relative cursor-move z-10">
        <GlobeComponent />
      </div>

      {/* Right Side: Typography */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-end text-center md:text-right px-4 sm:px-8 md:pr-12 lg:pr-24 pb-20 md:pb-0 z-10">
        
        {/* TEXTURE HOVER REVEAL CONTAINER */}
        <div
          ref={textContainerRef}
          onMouseMove={handleMouseMove}
          className="relative inline-block group mb-2 cursor-crosshair"
        >
          {/* Layer 1: Base Text (Normal) */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-wide font-cargo flex flex-row justify-center md:justify-end gap-3 md:gap-4 leading-tight">
            <span className="text-white">Freight</span>
            <span className="text-gray-400">Oracle</span>
          </h1>

          {/* Layer 2: Golden Flash Reveal Text (Masked) */}
          <h1
            ref={revealTextRef}
            className="absolute inset-0 text-5xl sm:text-6xl md:text-7xl font-bold uppercase tracking-wide font-cargo flex flex-row justify-center md:justify-end gap-3 md:gap-4 leading-tight pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              // The Golden Flash Color
              backgroundImage: 'linear-gradient(135deg, #fff 0%, #ffd369 40%, #e6b800 100%)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              
              // The radial gradient creates the "flashlight" masking effect centered exactly on the cursor
              WebkitMaskImage: 'radial-gradient(circle 120px at var(--x, 50%) var(--y, 50%), black 20%, transparent 100%)',
              maskImage: 'radial-gradient(circle 120px at var(--x, 50%) var(--y, 50%), black 20%, transparent 100%)',
            }}
          >
            <span>Freight</span>
            <span>Oracle</span>
          </h1>
        </div>
        {/* END TEXTURE REVEAL */}

        <TypewriterEffect />

      </div>
      
    </section>
  );
}