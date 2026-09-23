// lights.js - Lighting setup and management
import * as THREE from 'three';

let ambientLight = null;
let dirLight = null;
let fillLight = null;
let rimLight = null;
let ground = null;

export function createLights(scene) {
  // Ambient light
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Main directional light
  dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -8;
  dirLight.shadow.camera.right = 8;
  dirLight.shadow.camera.top = 8;
  dirLight.shadow.camera.bottom = -8;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Fill light
  fillLight = new THREE.DirectionalLight(0x4361ee, 0.5);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Rim light
  rimLight = new THREE.DirectionalLight(0xff6b6b, 0.4);
  rimLight.position.set(0, -5, 0);
  scene.add(rimLight);

  // Ground plane for shadows
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
  ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  return { ambientLight, dirLight, fillLight, rimLight, ground };
}

export function updateAmbientIntensity(intensity) {
  if (ambientLight) ambientLight.intensity = intensity;
}

export function updateDirLight(intensity, x, y, z, color) {
  if (dirLight) {
    dirLight.intensity = intensity;
    dirLight.position.set(x, y, z);
    if (color) dirLight.color.set(color);
  }
}

export function updateFillLight(intensity, color) {
  if (fillLight) {
    fillLight.intensity = intensity;
    if (color) fillLight.color.set(color);
  }
}

export function updateRimLight(intensity, color) {
  if (rimLight) {
    rimLight.intensity = intensity;
    if (color) rimLight.color.set(color);
  }
}

export function setShadowsEnabled(enabled) {
  if (dirLight) dirLight.castShadow = enabled;
  if (ground) ground.visible = enabled ? ground.visible : ground.visible; // shadows off doesn't hide ground
  if (ground) ground.receiveShadow = enabled;
}

export function setGroundVisible(visible) {
  if (ground) ground.visible = visible;
}

export function setGroundOpacity(opacity) {
  if (ground && ground.material) ground.material.opacity = opacity;
}

export function getLights() {
  return { ambientLight, dirLight, fillLight, rimLight, ground };
}

export function disposeLights() {
  if (ambientLight) ambientLight.dispose();
  if (dirLight) dirLight.dispose();
  if (fillLight) fillLight.dispose();
  if (rimLight) rimLight.dispose();
  if (ground) {
    ground.geometry.dispose();
    ground.material.dispose();
  }
}