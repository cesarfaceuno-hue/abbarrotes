import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { THEME_3D, setupStandardLights } from '../../lib/three-theme';

export const Showcase3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(THEME_3D.camera.fov, container.clientWidth / container.clientHeight, THEME_3D.camera.near, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 1. Grid
    const gridHelper = new THREE.GridHelper(20, 40, THEME_3D.colors.emeraldPrimary, THEME_3D.colors.slateDark);
    gridHelper.position.y = -5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.08;
    scene.add(gridHelper);

    // 2. Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.015,
      color: THEME_3D.colors.emeraldPrimary,
      transparent: true,
      opacity: 0.2,
    });
    const particleField = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleField);

    // 3. Floating Geometric Accents
    const floatingObjGeo = new THREE.TorusGeometry(10, 0.02, 16, 100);
    const floatingObjMat = new THREE.MeshBasicMaterial({ color: THEME_3D.colors.emeraldPrimary, transparent: true, opacity: 0.03 });
    const floatingObj = new THREE.Mesh(floatingObjGeo, floatingObjMat);
    floatingObj.rotation.x = Math.PI / 2;
    scene.add(floatingObj);

    setupStandardLights(scene);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particleField.rotation.y += 0.0005;
      floatingObj.rotation.z += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      floatingObjGeo.dispose();
      floatingObjMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-30" />;
};

