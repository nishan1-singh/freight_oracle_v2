import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Overview from './components/Overview';
import DashboardInteractive from './components/DashboardInteractive';
import DashboardForm from './components/DashboardForm';
import Footer from './components/Footer';
import Starfield from './components/Starfield';
import DashboardGrid from './components/DashboardGrid';
import LoginModal from './components/LoginModal';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0); 
  
  // This state controls whether the modal is visible or hidden
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); 
  
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 30}px, ${e.clientY - 30}px)`;
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const radius = 24; 
  const circleCircumference = 2 * Math.PI * radius; 

  return (
    <div className="bg-black min-h-screen font-sans text-white relative">
      
      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ transform: `translate(-100px, -100px)` }} 
      >
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4 8" />
          <circle 
            cx="30" cy="30" r={radius} fill="none" stroke="#ffd369" strokeWidth="2"
            strokeDasharray={circleCircumference}
            strokeDashoffset={circleCircumference - (scrollProgress * circleCircumference)}
            strokeLinecap="round" transform="rotate(-90 30 30)" className="transition-stroke duration-200 ease-out"
          />
          <circle cx="30" cy="30" r="3" fill="#ffd369" />
        </svg>
      </div>

      {/* Top Section */}
      <div className="relative w-full min-h-screen">
        <Starfield />
        
        {/* Pass the function into the Navbar */}
        <Navbar onOpenLogin={() => setIsLoginModalOpen(true)} />
        
        <Hero />
      </div>

      <section id="overview" className="scroll-mt-20 relative z-20">
        <Overview />
      </section>

      <div id="dashboard" className="relative w-full overflow-hidden scroll-mt-20 pt-12 pb-12 z-20">
        
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center mt-12 pointer-events-none">
          <DashboardGrid />
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-blue-900/10 to-transparent blur-3xl pointer-events-none" />
        </div>

        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none z-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }} />

        <div className="relative z-10">
          <DashboardInteractive />
          <DashboardForm />
        </div>
      </div>

      <Footer />

      {/* ================= GLOBAL MODAL ROOT ================= */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
    </div>
  );
}