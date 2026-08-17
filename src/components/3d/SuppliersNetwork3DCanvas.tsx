import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial, setupStandardLights } from '../../lib/three-theme';

interface SuppliersNetwork3DCanvasProps {
  className?: string;
}

export const SuppliersNetwork3DCanvas: React.FC<SuppliersNetwork3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, THEME_3D.camera.far);
    camera.position.set(0, 2.5, 6);
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

    // Nodes data
    const nodeCoords = [
      { x: 0, y: 0.2, z: 0, color: THEME_3D.colors.emeraldPrimary, size: 0.45 },
      { x: -2.2, y: 0.8, z: -0.5, color: THEME_3D.colors.cyanAccent, size: 0.35 },
      { x: 2.1, y: 0.6, z: -0.8, color: THEME_3D.colors.emeraldDeep, size: 0.35 },
      { x: -1.5, y: -1.0, z: 1.0, color: THEME_3D.colors.amberWarning, size: 0.32 },
      { x: 1.8, y: -0.9, z: 0.7, color: THEME_3D.colors.purpleAccent, size: 0.3 },
    ];

    const nodeSpheres: THREE.Mesh[] = [];
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);

    nodeCoords.forEach((n) => {
      const mat = createMaterial('softMetal', n.color) as THREE.MeshStandardMaterial;
      mat.emissive = new THREE.Color(n.color);
      mat.emissiveIntensity = 0.2;
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(n.size);
      mesh.position.set(n.x, n.y, n.z);
      group.add(mesh);
      nodeSpheres.push(mesh);
    });

    // Connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: THEME_3D.colors.emeraldPrimary,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 1; i < nodeCoords.length; i++) {
      const center = nodeCoords[0];
      const target = nodeCoords[i];
      const points = [
        new THREE.Vector3(center.x, center.y, center.z),
        new THREE.Vector3(target.x, target.y, target.z),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMaterial);
      group.add(line);
    }

    // Dynamic Data Pulses
    const pulseCount = 4;
    const pulseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: THEME_3D.colors.whitePure });
    const pulses: { mesh: THREE.Mesh; targetIdx: number; progress: number; speed: number }[] = [];

    for (let i = 0; i < pulseCount; i++) {
      const mesh = new THREE.Mesh(pulseGeo, pulseMat);
      group.add(mesh);
      pulses.push({
        mesh,
        targetIdx: 1 + (i % (nodeCoords.length - 1)),
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.006,
      });
    }

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
        group.rotation.y = Math.sin(elapsed * 0.3) * 0.15;
        pulses.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) {
            p.progress = 0;
            p.targetIdx = 1 + Math.floor(Math.random() * (nodeCoords.length - 1));
          }
          const from = nodeCoords[p.targetIdx];
          const to = nodeCoords[0];
          p.mesh.position.lerpVectors(
            new THREE.Vector3(from.x, from.y, from.z),
            new THREE.Vector3(to.x, to.y, to.z),
            p.progress
          );
        });
        nodeSpheres[0].scale.setScalar(0.45 + Math.sin(elapsed * 3) * 0.02);
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
      sphereGeo.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();
      lineMaterial.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-[280px] sm:h-[340px] ${className}`} />
  );
};

