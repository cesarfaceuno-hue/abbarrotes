import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial } from '../../lib/three-theme';

interface AiAdvisor3DCanvasProps {
  className?: string;
  progress?: number;
}

export const AiAdvisor3DCanvas: React.FC<AiAdvisor3DCanvasProps> = ({ 
  className = '',
  progress = 0 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, THEME_3D.camera.far);
    camera.position.set(0, 0, 7);

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

    // 1. Central Intelligence Core
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 12);
    const coreMat = createMaterial('translucentCore', THEME_3D.colors.emeraldDeep) as THREE.MeshPhysicalMaterial;
    coreMat.emissiveIntensity = 0.8;
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Internal Nucleus (The Spark)
    const nucleusGeo = new THREE.IcosahedronGeometry(0.8, 2);
    const nucleusMat = createMaterial('softMetal', THEME_3D.colors.emeraldPrimary) as THREE.MeshStandardMaterial;
    nucleusMat.emissive = new THREE.Color(THEME_3D.colors.emeraldPrimary);
    nucleusMat.emissiveIntensity = 2.0;
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    group.add(nucleus);

    // 2. Data Structures
    const dataGroup = new THREE.Group();
    group.add(dataGroup);

    const fragmentCount = 12;
    const fragmentGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const fragmentMat = createMaterial('softMetal', THEME_3D.colors.emeraldPrimary) as THREE.MeshStandardMaterial;
    fragmentMat.emissiveIntensity = 0.5;

    const fragments: { mesh: THREE.Mesh; orbit: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < fragmentCount; i++) {
      const mesh = new THREE.Mesh(fragmentGeo, fragmentMat);
      const orbit = 2.5 + Math.random() * 1.5;
      const speed = 0.2 + Math.random() * 0.5;
      const phase = Math.random() * Math.PI * 2;
      
      dataGroup.add(mesh);
      fragments.push({ mesh, orbit, speed, phase });
    }

    // 3. Floating Geometric Accents
    const wireGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const wireMat = new THREE.MeshBasicMaterial({ 
      color: THEME_3D.colors.emeraldPrimary, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireframe);

    // Lights
    const ambientLight = new THREE.AmbientLight(THEME_3D.lights.ambient.color, THEME_3D.lights.ambient.intensity);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(THEME_3D.lights.key.color, THEME_3D.lights.key.intensity, THEME_3D.lights.key.distance);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(THEME_3D.lights.fill.color, THEME_3D.lights.fill.intensity, THEME_3D.lights.fill.distance);
    fillLight.position.set(-5, -5, 5);
    scene.add(fillLight);

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
      const currentProgress = progressRef.current;

      if (!prefersReducedMotion) {
        coreMesh.rotation.y = elapsed * 0.15;
        coreMesh.rotation.z = Math.sin(elapsed * 0.2) * 0.1;
        
        const coreScale = 1 + Math.sin(elapsed * 1.5) * 0.03 + (currentProgress * 0.15);
        coreMesh.scale.setScalar(coreScale);

        nucleus.rotation.y = -elapsed * 0.4;
        const nucScale = 1 + Math.sin(elapsed * 3) * 0.08;
        nucleus.scale.setScalar(nucScale);

        wireframe.rotation.y = -elapsed * 0.1;
        wireframe.scale.setScalar(1 + (currentProgress * 0.2));
        if (wireframe.material instanceof THREE.Material) {
          wireframe.material.opacity = 0.1 + (currentProgress * 0.2);
        }

        fragments.forEach((frag) => {
          const t = elapsed * frag.speed + frag.phase;
          const currentOrbit = THREE.MathUtils.lerp(frag.orbit, 1.0, currentProgress);
          
          frag.mesh.position.set(
            Math.cos(t) * currentOrbit,
            Math.sin(t * 1.5) * (currentOrbit * 0.5),
            Math.sin(t) * currentOrbit
          );
          frag.mesh.rotation.x = t;
          frag.mesh.rotation.y = t * 1.2;
          
          if (frag.mesh.material instanceof THREE.Material) {
            frag.mesh.material.transparent = true;
            frag.mesh.material.opacity = 1 - (currentProgress * 0.8);
          }
          frag.mesh.scale.setScalar(1 - (currentProgress * 0.5));
        });

        coreMat.emissiveIntensity = 0.8 + (currentProgress * 1.2);
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
      coreGeo.dispose();
      coreMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      fragmentGeo.dispose();
      fragmentMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} />
  );
};

