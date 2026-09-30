import React, { useState } from 'react';

// CRITICAL: We must destructure { onOpenLogin } here to receive the function from App.jsx
export default function Navbar({ onOpenLogin }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const customSmoothScroll = (targetPosition, duration = 800) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startPosition + distance * ease);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (id === 'top') {
      customSmoothScroll(0, 800);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      // CHANGED: Adjusted scroll offset to match the new 56px (h-14) navbar height
      const navHeight = 56; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navHeight;
      customSmoothScroll(offsetPosition, 800);
    }
  };

  return (
    // CHANGED: h-20 to h-14, and bg-black/40 to bg-black/20 for a slimmer, more transparent look
    <nav className="fixed top-0 inset-x-0 h-14 z-[999] bg-black/20 backdrop-blur-md border-b border-white/10 pointer-events-auto transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-8">
        
        <a href="#top" onClick={(e) => handleNavClick(e, 'top')} className="text-xl font-bold tracking-widest text-white uppercase z-50 text-left focus:outline-none cursor-pointer font-cargo">
          Null Pointers
        </a>
        
        <div className="flex items-center space-x-4 md:space-x-10">
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#overview" onClick={(e) => handleNavClick(e, 'overview')} className="text-gray-300 hover:text-white transition-colors focus:outline-none cursor-pointer">
              Overview
            </a>
            <a href="#dashboard" onClick={(e) => handleNavClick(e, 'dashboard')} className="text-gray-300 hover:text-white transition-colors focus:outline-none cursor-pointer">
              Dashboard
            </a>
          </div>

          {/* LOGIN BUTTON */}
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log("Login button clicked!"); 
              if (onOpenLogin) onOpenLogin();
            }}
            // CHANGED: Made the button slightly smaller (w-9 h-9) to fit the slimmer navbar
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 transition-colors border border-white/20 z-50 focus:outline-none cursor-pointer pointer-events-auto"
            title="Login"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          <button 
            className="md:hidden flex items-center justify-center w-9 h-9 text-white z-50 focus:outline-none cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        // CHANGED: top-20 to top-14 so the mobile menu sits flush against the bottom of the slimmer navbar
        <div className="md:hidden absolute top-14 inset-x-0 bg-black/95 backdrop-blur-xl border-b border-white/10 py-6 px-6 flex flex-col space-y-6 shadow-2xl z-40">
          <a href="#overview" className="text-gray-300 hover:text-white text-left text-lg font-medium tracking-wide focus:outline-none cursor-pointer" onClick={(e) => handleNavClick(e, 'overview')}>
            Overview
          </a>
          <a href="#dashboard" className="text-gray-300 hover:text-white text-left text-lg font-medium tracking-wide focus:outline-none cursor-pointer" onClick={(e) => handleNavClick(e, 'dashboard')}>
            Dashboard
          </a>
        </div>
      )}
    </nav>
  );
}