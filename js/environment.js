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
let currentObjectUrl = null;
const rgbeLoader = new RGBELoader();

function applyTexture(texture, scene) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.environment = texture;
  scene.background = texture;
}

// callbacks: { onStart, onEnd, onError } - all optional, used to drive a
// loading indicator and error toast in the UI layer.
export function loadEnvironment(name, scene, callbacks = {}) {
  const { onStart, onEnd, onError } = callbacks;

  if (name === 'none') {
    scene.environment = null;
    scene.background = new THREE.Color(0x1a1a2e);
    currentEnv = 'none';
    return Promise.resolve();
  }

  const url = environments[name];
  if (!url) return Promise.resolve();

  if (onStart) onStart();

  return new Promise((resolve) => {
    rgbeLoader.load(url, (texture) => {
      applyTexture(texture, scene);
      currentEnv = name;
      if (onEnd) onEnd();
      resolve();
    }, undefined, (err) => {
      console.error('Failed to load environment:', err);
      scene.environment = null;
      scene.background = new THREE.Color(0x1a1a2e);
      if (onEnd) onEnd();
      if (onError) onError('Impossible de charger cet environnement HDR (réseau ou CORS).');
      resolve();
    });
  });
}

// Loads a user-provided .hdr file as a custom environment map.
export function loadCustomEnvironment(file, scene, callbacks = {}) {
  const { onStart, onEnd, onError } = callbacks;

  if (onStart) onStart();

  return new Promise((resolve) => {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
    const url = URL.createObjectURL(file);
    currentObjectUrl = url;

    rgbeLoader.load(url, (texture) => {
      applyTexture(texture, scene);
      currentEnv = 'custom';
      if (onEnd) onEnd();
      resolve();
    }, undefined, (err) => {
      console.error('Failed to load custom environment:', err);
      if (onEnd) onEnd();
      if (onError) onError('Fichier HDR invalide ou non pris en charge.');
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