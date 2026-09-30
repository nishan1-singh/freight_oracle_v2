import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginMethod, setLoginMethod] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handleDummyLogin = (e, method) => {
    e.preventDefault();
    setIsProcessing(true);
    setLoginMethod(method);
    
    setTimeout(() => {
      setIsProcessing(false);
      setLoginMethod('');
      onClose(); 
    }, 1500);
  };

  const inputStyles = "w-full bg-[#1c1c1c] hover:bg-[#222222] border border-transparent focus:border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      
      {/* Dimmed backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[420px] bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col items-center">
        
        {/* Close Button (X) */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Geometric Logo */}
        <div className="mb-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 15V7.5C15 5.567 13.433 4 11.5 4C9.567 4 8 5.567 8 7.5C8 9.433 9.567 11 11.5 11H15V15Z" fill="#e5e5e5"/>
            <path d="M17 15V7.5C17 5.567 18.567 4 20.5 4C22.433 4 24 5.567 24 7.5C24 9.433 22.433 11 20.5 11H17V15Z" fill="#e5e5e5"/>
            <path d="M15 17V24.5C15 26.433 13.433 28 11.5 28C9.567 28 8 26.433 8 24.5C8 22.567 9.567 21 11.5 21H15V17Z" fill="#e5e5e5"/>
            <path d="M17 17V24.5C17 26.433 18.567 28 20.5 28C22.433 28 24 26.433 24 24.5C24 22.567 22.433 21 20.5 21H17V17Z" fill="#e5e5e5"/>
          </svg>
        </div>

        {/* Header */}
        <div className="text-center mb-6 w-full">
          <h2 className="text-[17px] font-medium text-white mb-1">Welcome to Cargo Predictor</h2>
          <p className="text-[13px] text-gray-500">Sign in or sign up</p>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col space-y-3 w-full mb-6">
          <button 
            type="button"
            onClick={(e) => handleDummyLogin(e, 'google')}
            disabled={isProcessing}
            className="w-full bg-[#f2f2f2] hover:bg-white text-black text-[14px] font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button 
            type="button"
            onClick={(e) => handleDummyLogin(e, 'microsoft')}
            disabled={isProcessing}
            className="w-full bg-[#f2f2f2] hover:bg-white text-black text-[14px] font-medium py-3 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            <svg className="w-4 h-4" viewBox="0 0 21 21">
              <path fill="#f35325" d="M1 1h9v9H1z"/><path fill="#81bc06" d="M11 1h9v9h-9z"/><path fill="#05a6f0" d="M1 11h9v9H1z"/><path fill="#ffba08" d="M11 11h9v9h-9z"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full mb-6">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="px-3 text-[11px] text-gray-500 uppercase tracking-widest">Or</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={(e) => handleDummyLogin(e, 'email')} className="flex flex-col space-y-3 w-full">
          
          <div className="flex space-x-3">
            <input type="text" placeholder="First name" className={inputStyles} />
            <input type="text" placeholder="Last name" className={inputStyles} />
          </div>

          <input type="email" required placeholder="Email address" className={inputStyles} />

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="Enter your password" 
              className={inputStyles} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              required 
              placeholder="Confirm your password" 
              className={inputStyles} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#1e1e1e] hover:bg-[#252525] text-gray-400 text-sm py-3.5 rounded-xl transition-colors mt-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing && loginMethod === 'email' ? 'Processing...' : 'Sign up'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-[10px] text-gray-600 w-full max-w-xs leading-relaxed">
          By continuing, you agree to our <br/>
          <a href="#" className="underline hover:text-gray-400 transition-colors">Terms of Service</a> & <a href="#" className="underline hover:text-gray-400 transition-colors">Privacy Policy</a>
        </div>

      </div>
    </div>
  );
}