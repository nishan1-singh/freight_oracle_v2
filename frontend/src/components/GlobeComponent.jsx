import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

// 1. Trade Routes Data
const tradeRoutes = [
  { startLat: 18.95, startLng: 72.95, endLat: 40.71, endLng: -74.00, color: '#3b82f6', endName: 'USA', order: 1 },
  { startLat: 23.03, startLng: 70.21, endLat: 25.20, endLng: 55.27, color: '#10b981', endName: 'UAE', order: 2 },
  { startLat: 22.57, startLng: 88.36, endLat: 31.23, endLng: 121.47, color: '#ef4444', endName: 'China', order: 3 },
  { startLat: 22.73, startLng: 69.73, endLat: 51.92, endLng: 4.47, color: '#f59e0b', endName: 'Netherlands', order: 4 },
  { startLat: 9.93, startLng: 76.26, endLat: 21.48, endLng: 39.18, color: '#8b5cf6', endName: 'Saudi Arabia', order: 5 },
  { startLat: 13.08, startLng: 80.27, endLat: 1.35, endLng: 103.81, color: '#ec4899', endName: 'Singapore', order: 6 },
  { startLat: 20.26, startLng: 86.67, endLat: -33.86, endLng: 151.20, color: '#06b6d4', endName: 'Australia', order: 7 },
];

// 2. Combine Destination and Origin Cities for 3D Labels
const allLabels = [
  ...tradeRoutes.map(r => ({ lat: r.endLat, lng: r.endLng, name: r.endName, isOrigin: false })),
  { lat: 18.95, lng: 72.95, name: 'Mumbai', isOrigin: true },
  { lat: 22.57, lng: 88.36, name: 'Kolkata', isOrigin: true },
  { lat: 22.73, lng: 69.73, name: 'Mundra', isOrigin: true },
  { lat: 9.93, lng: 76.26, name: 'Kochi', isOrigin: true },
  { lat: 13.08, lng: 80.27, name: 'Chennai', isOrigin: true },
  { lat: 20.26, lng: 86.67, name: 'Paradip', isOrigin: true },
];

export default function GlobeComponent() {
  const globeEl = useRef();
  const isInteracting = useRef(false);
  const [globeSize, setGlobeSize] = useState({ width: 900, height: 900 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // CHANGED: Dialed down mobile canvas scale to 1.1x width
        const mobileSize = Math.floor(window.innerWidth * 1.1);
        setGlobeSize({ width: mobileSize, height: mobileSize });
      } else {
        setGlobeSize({ width: 900, height: 900 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let rotationInterval;

    const initTimer = setTimeout(() => {
      if (!globeEl.current) return;

      const controls = globeEl.current.controls ? globeEl.current.controls() : null;
      
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = -1.5; 
        controls.enableZoom = false; 
        controls.enableRotate = true; 
        controls.enablePan = false;

        const onInteractionStart = () => { 
          isInteracting.current = true; 
          controls.autoRotate = false;
        };
        
        const onInteractionEnd = () => { 
          isInteracting.current = false; 
          controls.autoRotate = true;
        };

        controls.addEventListener('start', onInteractionStart);
        controls.addEventListener('end', onInteractionEnd);

        rotationInterval = setInterval(() => {
          if (isInteracting.current) return;
          
          const pov = globeEl.current.pointOfView();
          if (pov && typeof pov.lng === 'number') {
            let distanceLng = Math.abs((pov.lng - 80 + 540) % 360 - 180);

            if (distanceLng > 70) {
              controls.autoRotateSpeed = -20.0;
            } else {
              controls.autoRotateSpeed = -1.5;
            }
          }
        }, 100);
      }

      if (globeEl.current.pointOfView) {
        const isMobile = window.innerWidth < 768;
        // CHANGED: Increased mobile camera altitude to 1.9 to pull back slightly
        globeEl.current.pointOfView({ lat: 20, lng: 80, altitude: isMobile ? 1.9 : 2.2 }, 1000);
      }
    }, 200);

    return () => {
      clearTimeout(initTimer);
      if (rotationInterval) clearInterval(rotationInterval);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing overflow-hidden z-10">
      <Globe
        ref={globeEl}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        
        width={globeSize.width} 
        height={globeSize.height}
        
        arcsData={tradeRoutes}
        arcColor={() => ['rgba(0, 191, 255, 0)', 'rgba(0, 191, 255, 1)']}
        arcStroke={0.35} 
        arcAltitudeAutoScale={0.2}
        arcDashLength={0.6}
        arcDashGap={1.5}
        arcDashAnimateTime={4000}
        arcDashInitialGap={(d) => d.order * 0.3}

        pointsData={allLabels}
        pointLat="lat"
        pointLng="lng"
        pointColor={(d) => d.isOrigin ? '#ffffff' : tradeRoutes.find(r => r.endName === d.name)?.color || '#ffffff'}
        pointAltitude={0.01}
        pointRadius={0.25}
        pointTransitionDuration={0} 

        labelsData={allLabels}
        labelLat="lat"
        labelLng="lng"
        labelText="name"
        labelSize={1.2} 
        labelDotRadius={0} 
        labelColor={(d) => d.isOrigin ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)'}
        labelResolution={2}
        labelTransitionDuration={0} 
      />
    </div>
  );
}