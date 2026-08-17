import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial, setupStandardLights } from '../../lib/three-theme';

interface Inventory3DCanvasProps {
  className?: string;
  activeTier?: 'normal' | 'reorder' | 'critical';
}

export const Inventory3DCanvas: React.FC<Inventory3DCanvasProps> = ({ className = '', activeTier = 'normal' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, THEME_3D.camera.far);
    camera.position.set(4, 3.5, 5);
    camera.lookAt(0, 0, 0);

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

    // 3D Stacked Volumetric Inventory Matrix
    const blocks: (THREE.Mesh & { userData: { initialY?: number } })[] = [];
    const blockGeo = new THREE.BoxGeometry(0.85, 0.55, 0.85);

    // Standardized Materials from THEME
    const matOptimal = createMaterial('translucentCore', THEME_3D.colors.emeraldPrimary) as THREE.MeshPhysicalMaterial;
    const matNormal = createMaterial('translucentCore', THEME_3D.colors.emeraldDeep) as THREE.MeshPhysicalMaterial;
    const matWarning = createMaterial('softMetal', THEME_3D.colors.amberWarning) as THREE.MeshStandardMaterial;
    const matCritical = createMaterial('softMetal', THEME_3D.colors.roseCritical) as THREE.MeshStandardMaterial;

    const materials = [matOptimal, matNormal, matWarning, matCritical];

    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        for (let y = 0; y <= 2; y++) {
          if ((x === 1 && z === 1 && y === 2) || (x === -1 && z === 0 && y === 2)) continue;

          let mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial = matNormal;
          if (y === 0) mat = matOptimal;
          if (x === 0 && z === 0 && y === 1) mat = matWarning;
          if (x === 1 && z === -1 && y === 1) mat = matCritical;

          const block = new THREE.Mesh(blockGeo, mat) as (THREE.Mesh & { userData: { initialY?: number } });
          block.position.set(x * 1.05, y * 0.65 - 0.7, z * 1.05);
          group.add(block);
          blocks.push(block);
        }
      }
    }

    // Grid Floor consistent with Hero
    const gridHelper = new THREE.GridHelper(5, 10, THEME_3D.colors.emeraldPrimary, THEME_3D.colors.bgNeutral);
    gridHelper.position.y = -1.1;
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.1;
    }
    scene.add(gridHelper);

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
        group.rotation.y = elapsed * 0.15;
        blocks.forEach((block, idx) => {
          const offset = Math.sin(elapsed * 2 + idx * 0.4) * 0.04;
          if (block.userData.initialY === undefined) block.userData.initialY = block.position.y;
          block.position.y = block.userData.initialY + offset;
        });
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
      blockGeo.dispose();
      materials.forEach((m) => m.dispose());
      renderer?.dispose();
    };
  }, [activeTier]);

  return (
    <div ref={containerRef} className={`relative w-full h-[280px] sm:h-[340px] ${className}`} />
  );
};

