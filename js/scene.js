// scene.js - Scene, renderer, camera, controls setup
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let gridHelper = null;

export function createScene() {
  const canvas = document.getElementById('canvas');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(4, 3, 5);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.5;
  controls.maxDistance = 30;
  controls.target.set(0, 0, 0);

  return { renderer, scene, camera, controls, canvas };
}

// onResize is optional and runs after the renderer/camera are updated, so
// callers (e.g. the post-processing composer) can resize themselves too.
export function setupResize(renderer, camera, onResize) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (typeof onResize === 'function') onResize(window.innerWidth, window.innerHeight);
  });
}

export function resetCamera(controls, camera) {
  controls.reset();
  camera.position.set(4, 3, 5);
  camera.fov = 60;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0);
}

export function setCameraFOV(camera, fov) {
  camera.fov = fov;
  camera.updateProjectionMatrix();
}

export function setGridEnabled(scene, enabled) {
  if (enabled) {
    if (!gridHelper) {
      gridHelper = new THREE.GridHelper(20, 20, 0x4361ee, 0x2a2a45);
      gridHelper.position.y = -1.499;
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.5;
    }
    scene.add(gridHelper);
  } else if (gridHelper) {
    scene.remove(gridHelper);
  }
}

export function setFog(scene, enabled, color = '#0d0d1a', density = 0.05) {
  scene.fog = enabled ? new THREE.FogExp2(new THREE.Color(color), density) : null;
}

export function setBackgroundColor(scene, color) {
  scene.background = new THREE.Color(color);
}