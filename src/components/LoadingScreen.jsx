import React, { useEffect, useRef } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    const dpr = 1; // Fixed DPR - avoid scaling overhead
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Pre-create stars once
    const stars = [];
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: (i * 97) % width,
        y: (i * 131) % height,
      });
    }

    const animate = () => {
      timeRef.current += 1;
      const progress = Math.min(timeRef.current / 132, 1);

      // Clear once
      ctx.fillStyle = 'rgba(10, 14, 26, 1)';
      ctx.fillRect(0, 0, width, height);

      const scale = 60 + progress * 220;
      const rotation = timeRef.current * 0.2;
      const alpha = 1 - Math.max(0, (progress - 0.85) * 20);

      // Draw stars (very fast - just small arcs)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (1 - progress)})`;
      for (let i = 0; i < stars.length; i++) {
        ctx.beginPath();
        ctx.arc(stars[i].x, stars[i].y, 0.8, 0, 6.28);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation * 0.01745); // Pre-calc PI/180

      // Ocean base - single solid fill
      ctx.fillStyle = `rgba(50, 130, 200, ${0.95 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, scale, 0, 6.28);
      ctx.fill();

      // Continents - minimal shapes
      ctx.fillStyle = `rgba(35, 130, 40, ${0.8 * alpha})`;
      ctx.beginPath();
      ctx.arc(-scale * 0.25, 0, scale * 0.18, 0, 6.28);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(scale * 0.35, scale * 0.1, scale * 0.2, 0, 6.28);
      ctx.fill();

      // Cloud cover - minimal
      ctx.fillStyle = `rgba(180, 210, 255, ${0.2 * alpha})`;
      ctx.beginPath();
      ctx.arc(-scale * 0.05, -scale * 0.22, scale * 0.12, 0, 6.28);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(scale * 0.2, scale * 0.27, scale * 0.1, 0, 6.28);
      ctx.fill();

      // Atmosphere outline - single stroke
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.15 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 1.1, 0, 6.28);
      ctx.stroke();

      ctx.restore();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="loading-screen">
      <canvas ref={canvasRef} className="loading-canvas" />
      <div className="loading-content">
        <div className="loading-text">
          <h1 className="loading-title">Aakash</h1>
          <p className="loading-subtitle">Weather</p>
        </div>
        <div className="loading-progress">
          <div className="loading-bar"></div>
        </div>
        <p className="loading-status">Loading...</p>
      </div>
    </div>
  );
}
