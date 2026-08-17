import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { THEME_3D, createMaterial } from '../../lib/three-theme';

interface Hero3DCanvasProps {
  className?: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      THEME_3D.camera.fov,
      container.clientWidth / container.clientHeight,
      THEME_3D.camera.near,
      THEME_3D.camera.far
    );
    camera.position.set(0, 0, 8.5);

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch (e) {
      setIsWebGlSupported(false);
      return;
    }

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Central Core
    const coreGeometry = new THREE.IcosahedronGeometry(2.0, 1);
    const coreMaterial = createMaterial('translucentCore', THEME_3D.colors.emeraldDeep) as THREE.MeshPhysicalMaterial;
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    masterGroup.add(coreMesh);

    // Inner Glowing Geometric Nucleus
    const innerNucleusGeo = new THREE.OctahedronGeometry(1.0, 0);
    const innerNucleusMat = new THREE.MeshBasicMaterial({
      color: THEME_3D.colors.emeraldPrimary,
      wireframe: true,
    });
    const innerNucleus = new THREE.Mesh(innerNucleusGeo, innerNucleusMat);
    masterGroup.add(innerNucleus);

    // Outer Wireframe
    const wireframeGeo = new THREE.IcosahedronGeometry(2.05, 1);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: THEME_3D.colors.emeraldPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    masterGroup.add(wireframeMesh);

    // 2. Orbital Gyroscopic Rings
    const ringMat = createMaterial('softMetal') as THREE.MeshStandardMaterial;
    
    const ring1Geo = new THREE.TorusGeometry(3.0, 0.04, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    masterGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.4, 0.03, 16, 100);
    const ring2Mat = createMaterial('softMetal', THEME_3D.colors.emeraldPrimary) as THREE.MeshStandardMaterial;
    ring2Mat.emissive = new THREE.Color(THEME_3D.colors.emeraldDeep);
    ring2Mat.emissiveIntensity = 0.2;
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    masterGroup.add(ring2);

    // 3. Floating Orbital Data Satellites
    const satelliteGroup = new THREE.Group();
    const satelliteGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const satelliteMat = createMaterial('softMetal', THEME_3D.colors.whitePure) as THREE.MeshStandardMaterial;
    satelliteMat.emissive = new THREE.Color(THEME_3D.colors.emeraldPrimary);
    satelliteMat.emissiveIntensity = 0.4;

    const satellites: THREE.Mesh[] = [];
    const satelliteCount = 6;
    for (let i = 0; i < satelliteCount; i++) {
      const sat = new THREE.Mesh(satelliteGeo, satelliteMat);
      const angle = (i / satelliteCount) * Math.PI * 2;
      const radius = 2.8 + (i % 2) * 0.4;
      sat.position.set(
        Math.cos(angle) * radius,
        (Math.sin(angle * 2) * 0.5),
        Math.sin(angle) * radius
      );
      satelliteGroup.add(sat);
      satellites.push(sat);
    }
    masterGroup.add(satelliteGroup);

    // 4. Precision Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, THEME_3D.colors.emeraldPrimary, THEME_3D.colors.bgNeutral);
    gridHelper.position.y = -4;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.1;
    masterGroup.add(gridHelper);

    // 5. Data Particle Field
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: THEME_3D.colors.emeraldPrimary,
      transparent: true,
      opacity: 0.3,
    });
    const particleField = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleField);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(THEME_3D.lights.ambient.color, THEME_3D.lights.ambient.intensity);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(THEME_3D.lights.key.color, THEME_3D.lights.key.intensity, THEME_3D.lights.key.distance);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(THEME_3D.lights.fill.color, THEME_3D.lights.fill.intensity, THEME_3D.lights.fill.distance);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(THEME_3D.lights.rim.color, THEME_3D.lights.rim.intensity);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();
      mouseX += (targetX - mouseX) * THEME_3D.motion.lerpSpeed;
      mouseY += (targetY - mouseY) * THEME_3D.motion.lerpSpeed;

      if (!prefersReducedMotion) {
        coreMesh.rotation.y += THEME_3D.motion.slowRotation;
        coreMesh.rotation.x += THEME_3D.motion.slowRotation * 0.5;
        innerNucleus.rotation.y -= THEME_3D.motion.slowRotation * 2;
        wireframeMesh.rotation.y += THEME_3D.motion.slowRotation * 0.8;
        ring1.rotation.z += THEME_3D.motion.slowRotation * 1.25;
        ring2.rotation.z -= THEME_3D.motion.slowRotation;
        satelliteGroup.rotation.y += THEME_3D.motion.slowRotation * 1.5;
        masterGroup.position.y = Math.sin(elapsedTime * THEME_3D.motion.gentleFloat) * THEME_3D.motion.floatIntensity;
      }

      masterGroup.rotation.y = mouseX * 0.8;
      masterGroup.rotation.x = -mouseY * 0.8;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerNucleusGeo.dispose();
      innerNucleusMat.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      ring1Geo.dispose();
      ringMat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      satelliteGeo.dispose();
      satelliteMat.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[420px] sm:min-h-[520px] lg:min-h-[600px] flex items-center justify-center ${className}`}
    >
      {!isWebGlSupported && (
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 opacity-30 blur-2xl animate-pulse" />
      )}
    </div>
  );
};

