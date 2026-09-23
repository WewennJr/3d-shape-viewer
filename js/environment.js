// environment.js - Environment map loading
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const environments = {
  studio: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr',
  sunset: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr',
  night: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr',
  warehouse: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/parking_garage_1k.hdr',
  forest: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/woods_1k.hdr',
  apartment: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/wooden_lounge_1k.hdr',
};

let currentEnv = 'studio';
const rgbeLoader = new RGBELoader();

export function loadEnvironment(name, scene) {
  if (name === 'none') {
    scene.environment = null;
    scene.background = new THREE.Color(0x1a1a2e);
    currentEnv = 'none';
    return Promise.resolve();
  }
  
  const url = environments[name];
  if (!url) return Promise.resolve();
  
  return new Promise((resolve) => {
    rgbeLoader.load(url, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.environment = texture;
      scene.background = texture;
      currentEnv = name;
      resolve();
    }, undefined, (err) => {
      console.error('Failed to load environment:', err);
      scene.environment = null;
      scene.background = new THREE.Color(0x1a1a2e);
      resolve();
    });
  });
}

export function getCurrentEnv() {
  return currentEnv;
}

export function getEnvironments() {
  return { ...environments };
}