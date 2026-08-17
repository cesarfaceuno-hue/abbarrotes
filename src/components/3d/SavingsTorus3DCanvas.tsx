import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial, setupStandardLights } from '../../lib/three-theme';

interface SavingsTorus3DCanvasProps {
  className?: string;
}

export const SavingsTorus3DCanvas: React.FC<SavingsTorus3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, THEME_3D.camera.far);
    camera.position.set(0, 0, 5.5);

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

    // Torus Knot geometry
    const torusGeo = new THREE.TorusKnotGeometry(1.4, 0.38, 128, 32, 2, 3);
    const torusMat = createMaterial('translucentCore', THEME_3D.colors.emeraldDeep) as THREE.MeshPhysicalMaterial;
    torusMat.emissiveIntensity = 0.3;
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    group.add(torusMesh);

    // Subtle wireframe perimeter
    const wireGeo = new THREE.TorusKnotGeometry(1.42, 0.39, 64, 16, 2, 3);
    const wireMat = new THREE.MeshBasicMaterial({
      color: THEME_3D.colors.emeraldPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // Orbiting particles
    const particlesCount = 24;
    const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: THEME_3D.colors.emeraldPrimary });
    const particleGroup = new THREE.Group();

    for (let i = 0; i < particlesCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      const angle = (i / particlesCount) * Math.PI * 2;
      p.position.set(
        Math.cos(angle) * 2.2,
        Math.sin(angle) * 1.5,
        Math.sin(angle * 2) * 0.8
      );
      particleGroup.add(p);
    }
    group.add(particleGroup);

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
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        torusMesh.rotation.x = elapsed * 0.25;
        torusMesh.rotation.y = elapsed * 0.3;
        wireMesh.rotation.x = elapsed * 0.25;
        wireMesh.rotation.y = elapsed * 0.3;
        particleGroup.rotation.z = -elapsed * 0.35;
        particleGroup.rotation.y = elapsed * 0.2;
        group.position.y = Math.sin(elapsed * 0.8) * 0.08;
      }

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
      torusGeo.dispose();
      torusMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-[280px] sm:h-[340px] ${className}`} />
  );
};

