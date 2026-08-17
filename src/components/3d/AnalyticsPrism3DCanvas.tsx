import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial, setupStandardLights } from '../../lib/three-theme';

interface AnalyticsPrism3DCanvasProps {
  className?: string;
}

export const AnalyticsPrism3DCanvas: React.FC<AnalyticsPrism3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, THEME_3D.camera.far);
    camera.position.set(3.5, 3.0, 4.5);
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

    // 3D Extruded Data Columns
    const columns: { mesh: THREE.Mesh; targetHeight: number; baseHeight: number }[] = [];
    const colCount = 5;
    const colGeo = new THREE.CylinderGeometry(0.35, 0.35, 1, 6);

    const colors = [THEME_3D.colors.emeraldDeep, THEME_3D.colors.emeraldPrimary, THEME_3D.colors.cyanAccent, 0x10b981, 0x059669];
    const heights = [1.8, 2.6, 1.4, 3.2, 2.2];

    for (let i = 0; i < colCount; i++) {
      const mat = createMaterial('translucentCore', colors[i]) as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = 0.2;

      const col = new THREE.Mesh(colGeo, mat);
      const angle = (i / colCount) * Math.PI * 2;
      const radius = 1.3;
      col.position.set(Math.cos(angle) * radius, heights[i] / 2 - 1.2, Math.sin(angle) * radius);
      col.scale.set(1, heights[i], 1);
      group.add(col);
      columns.push({ mesh: col, targetHeight: heights[i], baseHeight: heights[i] });
    }

    // Reflective ring
    const ringGeo = new THREE.RingGeometry(1.6, 2.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: THEME_3D.colors.emeraldPrimary, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.2;
    group.add(ringMesh);

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
        columns.forEach((c, idx) => {
          const factor = 1 + Math.sin(elapsed * 1.5 + idx * 0.8) * 0.15;
          const currentHeight = c.baseHeight * factor;
          c.mesh.scale.set(1, currentHeight, 1);
          c.mesh.position.y = currentHeight / 2 - 1.2;
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
      colGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-[280px] sm:h-[340px] ${className}`} />
  );
};

