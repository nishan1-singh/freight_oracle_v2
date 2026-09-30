import React from 'react';

export default function DashboardInteractive() {
  return (
    <div className="relative w-full py-16 flex items-center justify-center pointer-events-none px-4">
      
      {/* Injecting the futuristic Orbitron font matching the Freight Oracle text */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
          .font-cool { font-family: 'Orbitron', sans-serif; }
        `}
      </style>

      <h2
        /* 
          CHANGED: 
          - Replaced the previous font classes with 'font-cool'
          - Kept the font-bold and reflection styles intact
        */
        className="text-3xl sm:text-5xl md:text-8xl font-cool font-bold tracking-[0.15em] sm:tracking-[0.3em] md:tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase text-center"
        style={{ 
          textShadow: '0px 10px 30px rgba(255,255,255,0.4)',
          WebkitBoxReflect: 'below 0px linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))'
        }}
      >
        Dashboard
      </h2>
    </div>
  );
}