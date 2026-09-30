import React, { useEffect, useRef } from 'react';

export default function DashboardGrid() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    setSize();
    window.addEventListener('resize', setSize);

    // Track mouse position
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- RIPPLE ANIMATION STATE ---
    let isRippling = false;
    let rippleRadius = 0;
    let rippleOrigin = { x: 0, y: 0 };
    let rippleTimeout = null; // Used to delay the ripple
    
    const rippleSpeed = 18; 
    const rippleThickness = 200; 

    // Intersection Observer to detect when the dashboard is scrolled into view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Add a 600ms delay to allow the window scroll to finish arriving here
        rippleTimeout = setTimeout(() => {
          isRippling = true;
          rippleRadius = 0;
          rippleOrigin = { x: canvas.width / 2, y: canvas.height / 2 };
        }, 100);
      } else {
        // If the user scrolls away before the delay finishes, cancel the pending ripple
        if (rippleTimeout) clearTimeout(rippleTimeout);
      }
    }, { 
      threshold: 0.3 // Trigger when 30% of the dashboard is visible
    });

    observer.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const spacing = 35; // Space between dots
      const baseRadius = 1.2;
      const glowDistance = 250; // Cursor glow distance

      // Expand the ripple if it is active
      if (isRippling) {
        rippleRadius += rippleSpeed;
        if (rippleRadius > Math.max(canvas.width, canvas.height) * 1.5) {
          isRippling = false;
        }
      }

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          
          let intensity = 0; 

          // 1. Calculate Cursor Glow Intensity
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);
          if (distToMouse < glowDistance) {
            intensity = Math.max(intensity, 1 - (distToMouse / glowDistance));
          }

          // 2. Calculate Intro Ripple Intensity
          if (isRippling) {
            const rx = x - rippleOrigin.x;
            const ry = y - rippleOrigin.y;
            const distToCenter = Math.sqrt(rx * rx + ry * ry);
            
            const distToRing = Math.abs(distToCenter - rippleRadius);

            if (distToRing < rippleThickness) {
              const rippleIntensity = 1 - (distToRing / rippleThickness);
              intensity = Math.max(intensity, rippleIntensity);
            }
          }

          // Default dot styles
          let opacity = 0.15;
          let color = `rgba(255, 255, 255, ${opacity})`;
          let dotRadius = baseRadius;

          // Apply glow if intensity is above 0
          if (intensity > 0) {
            color = `rgba(59, 130, 246, ${opacity + intensity * 0.85})`; // Blue glow
            dotRadius = baseRadius + intensity * 1.5;
            ctx.shadowBlur = 15 * intensity;
            ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
      
      ctx.shadowBlur = 0; 
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rippleTimeout) clearTimeout(rippleTimeout);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none" 
    />
  );
}