import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial, setupStandardLights } from '../../lib/three-theme';

interface CtaSphere3DCanvasProps {
  className?: string;
}

export const CtaSphere3DCanvas: React.FC<CtaSphere3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, THEME_3D.camera.far);
    camera.position.set(0, 0, 4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    const group = new THREE.Group();
    scene.add(group);

    // Core Sphere
    const sphereGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const sphereMat = createMaterial('translucentCore', THEME_3D.colors.emeraldPrimary) as THREE.MeshPhysicalMaterial;
    sphereMat.emissiveIntensity = 0.4;
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // Outer Frosted Ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.05, 16, 100);
    const ringMat = createMaterial('frostedGlass', THEME_3D.colors.cyanAccent);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    group.add(ring);

    // Floating Particles
    const particlesCount = 40;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: THEME_3D.colors.emeraldPrimary,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    group.add(particles);

    setupStandardLights(scene);

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      
      sphere.rotation.y = elapsed * 0.15;
      ring.rotation.z = elapsed * 0.2;
      ring.rotation.y = Math.sin(elapsed * 0.5) * 0.3;
      particles.rotation.y = elapsed * 0.05;
      
      group.position.y = Math.sin(elapsed * 0.8) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
};
