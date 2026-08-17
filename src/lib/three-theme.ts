import * as THREE from 'three';

/**
 * ABARROTES IA - 3D Visual Language & Material System
 * Standards for Shape, Material, Light, and Motion.
 */

export const THEME_3D = {
  // Color Palette
  colors: {
    bgNeutral: 0x07090e,
    emeraldPrimary: 0x10b981,
    emeraldDeep: 0x064e3b,
    cyanAccent: 0x38bdf8,
    silverNeutral: 0xe2e8f0,
    whitePure: 0xffffff,
    slateDark: 0x0f172a,
    amberWarning: 0xf59e0b,
    roseCritical: 0xef4444,
    purpleAccent: 0xa855f7,
  },

  // Camera Defaults
  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
  },

  // Material System Configurations
  materials: {
    // MATERIAL 01: MATTE - Structural elements
    matte: {
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.1,
    },
    
    // MATERIAL 02: FROSTED GLASS - UI cards, floating elements
    frostedGlass: {
      transmission: 0.9,
      thickness: 1.5,
      roughness: 0.15,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.9,
    },

    // MATERIAL 03: SOFT METAL - Primary structures
    softMetal: {
      metalness: 0.9,
      roughness: 0.25,
      color: 0xe2e8f0,
    },

    // MATERIAL 04: TRANSLUCENT CORE - Intelligence elements
    translucentCore: {
      transmission: 0.65,
      thickness: 1.0,
      roughness: 0.1,
      ior: 1.5,
      emissive: 0x10b981,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.85,
    }
  },

  // Lighting System Constants
  lights: {
    ambient: {
      color: 0x0f172a,
      intensity: 1.4,
    },
    key: {
      color: 0x10b981,
      intensity: 4.5,
      distance: 25,
    },
    fill: {
      color: 0x38bdf8,
      intensity: 2.5,
      distance: 25,
    },
    rim: {
      color: 0xffffff,
      intensity: 1.8,
    }
  },

  // Motion Language
  motion: {
    slowRotation: 0.004,
    gentleFloat: 0.8,
    floatIntensity: 0.18,
    lerpSpeed: 0.05,
  }
};

/**
 * Standard Lighting Setup for Abarrotes IA
 */
export const setupStandardLights = (scene: THREE.Scene) => {
  const ambientLight = new THREE.AmbientLight(THEME_3D.lights.ambient.color, THEME_3D.lights.ambient.intensity);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(THEME_3D.lights.key.color, THEME_3D.lights.key.intensity, THEME_3D.lights.key.distance);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(THEME_3D.lights.fill.color, THEME_3D.lights.fill.intensity, THEME_3D.lights.fill.distance);
  fillLight.position.set(-5, -5, 5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(THEME_3D.lights.rim.color, THEME_3D.lights.rim.intensity);
  rimLight.position.set(0, 5, -5);
  scene.add(rimLight);

  return { ambientLight, keyLight, fillLight, rimLight };
};

/**
 * Factory for consistent materials
 */
export const createMaterial = (type: keyof typeof THEME_3D.materials, color?: number): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial => {
  const baseConfig = THEME_3D.materials[type];
  const config: any = { ...baseConfig };
  if (color !== undefined) config.color = color;

  switch (type) {
    case 'matte':
      return new THREE.MeshStandardMaterial(config);
    case 'frostedGlass':
    case 'translucentCore':
      return new THREE.MeshPhysicalMaterial(config);
    case 'softMetal':
      return new THREE.MeshStandardMaterial(config);
    default:
      return new THREE.MeshStandardMaterial(config);
  }
};
