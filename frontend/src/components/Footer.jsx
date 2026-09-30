import React from 'react';

export default function Footer() {
  return (
    <footer className="relative w-full h-[90vh] min-h-[500px] flex flex-col items-center justify-center overflow-hidden bg-black text-white mt-12">
      
      {/* Injecting a sleek, futuristic font just for this component */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
          .font-cool { font-family: 'Orbitron', sans-serif; }
        `}
      </style>

      {/* Video Background (Looping, Muted, Autoplay) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://res.cloudinary.com/k4u0k3qo/video/upload/v1789131224/264433.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay to make the white text readable against the video */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      
      {/* Top Gradient Fade to blend it into the section above */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        
        {/* Year */}
        <p className="text-xs md:text-sm tracking-[0.6em] text-gray-400">2026</p>
        
        {/* Cool Font Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-cool tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 pb-2">
          FREIGHT ORACLE
        </h1>
        
        {/* Contact Section */}
        <div className="flex flex-col items-center space-y-5 pt-8">
          <p className="text-xs md:text-sm tracking-[0.4em] text-gray-400 uppercase font-light">
            Contact Us
          </p>
          
          {/* Social Icons */}
          <div className="flex space-x-8">
            {/* Instagram */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Mail */}
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Absolute Copyright and Legal Links at the very bottom */}
      <div className="absolute bottom-8 w-full z-10 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-[10px] md:text-xs text-gray-500 tracking-widest font-light">
        <p>Copyright © 2026 | All rights reserved</p>
        
        {/* Divider dot visible only on medium screens and larger */}
        <span className="hidden md:inline-block w-1 h-1 bg-gray-600 rounded-full"></span>
        
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
            Terms & Conditions
          </a>
        </div>
      </div>
      
    </footer>
  );
}