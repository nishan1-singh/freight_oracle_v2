import React, { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      // Scoped to the height of the parent container instead of the window
      canvas.height = canvas.parentElement.clientHeight;
    };
    setCanvasSize();

    // Track mouse position
    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const stars = [];
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: Math.random() * 0.5 + 0.1, 
        alpha: Math.random()
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.y -= star.speedY;
        star.x += star.speedX;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = star.x - mouse.x;
          // Offset Y by window scroll so repulsion works correctly when scrolled down slightly
          const dy = star.y - (mouse.y + window.scrollY); 
          const distance = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 120; 

          if (distance < interactionRadius && distance > 0) {
            const force = (interactionRadius - distance) / interactionRadius;
            const pushStrength = 2.5; 
            
            star.x += (dx / distance) * force * pushStrength;
            star.y += (dy / distance) * force * pushStrength;
          }
        }
        
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        if (star.y > canvas.height) {
            star.y = 0; 
        }
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    window.addEventListener('resize', setCanvasSize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      // CHANGED: From 'fixed' to 'absolute w-full h-full' so it stays in the top container
      className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60" 
    />
  );
}