import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useWeather } from '../WeatherContext';

const PARTICLE_CONFIGS = {
  Rain: { count: 800, color: 0x88bbff, size: 0.015, speed: 0.08, shape: 'line' },
  Drizzle: { count: 300, color: 0xaaccff, size: 0.01, speed: 0.04, shape: 'line' },
  Snow: { count: 500, color: 0xffffff, size: 0.025, speed: 0.015, shape: 'dot' },
  Thunderstorm: { count: 1200, color: 0x9999ff, size: 0.02, speed: 0.12, shape: 'line' },
  Clouds: { count: 150, color: 0xcccccc, size: 0.04, speed: 0.005, shape: 'dot' },
  Clear: { count: 60, color: 0xffeebb, size: 0.02, speed: 0.003, shape: 'dot' },
  Mist: { count: 200, color: 0xdddddd, size: 0.06, speed: 0.002, shape: 'dot' },
  Haze: { count: 200, color: 0xddccaa, size: 0.06, speed: 0.002, shape: 'dot' },
};

export default function WebGLWeatherEffects() {
  const canvasRef = useRef(null);
  const { current } = useWeather();

  const weatherMain = current?.weather?.[0]?.main || 'Clear';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = PARTICLE_CONFIGS[weatherMain] || PARTICLE_CONFIGS.Clear;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.count * 3);
    const velocities = new Float32Array(config.count);

    for (let i = 0; i < config.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      velocities[i] = 0.5 + Math.random() * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lightning flash for thunderstorms
    let flashIntensity = 0;

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const pos = geometry.attributes.position.array;

      for (let i = 0; i < config.count; i++) {
        // Move particles downward (rain/snow) or drift (clear/mist)
        if (config.shape === 'line') {
          pos[i * 3 + 1] -= config.speed * velocities[i];
          pos[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.001;
        } else {
          pos[i * 3 + 1] -= config.speed * velocities[i] * 0.5;
          pos[i * 3] += Math.sin(Date.now() * 0.0005 + i) * 0.003;
        }

        // Reset particle when it falls below
        if (pos[i * 3 + 1] < -6) {
          pos[i * 3 + 1] = 6;
          pos[i * 3] = (Math.random() - 0.5) * 12;
        }
      }

      geometry.attributes.position.needsUpdate = true;

      // Thunderstorm lightning
      if (weatherMain === 'Thunderstorm') {
        if (Math.random() < 0.003) flashIntensity = 1.0;
        flashIntensity *= 0.92;
        material.opacity = 0.7 + flashIntensity * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [weatherMain]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    />
  );
}
