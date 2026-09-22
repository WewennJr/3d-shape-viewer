// materials.js - Material creation and management
import * as THREE from 'three';

let currentMaterial = null;
let currentMaterialType = 'standard';
let materialParams = {
  color: 0x4361ee,
  roughness: 0.3,
  metalness: 0.6,
  clearcoat: 0.2,
  clearcoatRoughness: 0.1,
  transmission: 0,
  thickness: 0,
  ior: 1.5,
  emissive: 0x000000,
  emissiveIntensity: 0,
};

export function createMaterial(type) {
  currentMaterialType = type;
  
  switch (type) {
    case 'standard':
      return new THREE.MeshStandardMaterial({
        color: materialParams.color,
        roughness: materialParams.roughness,
        metalness: materialParams.metalness,
        clearcoat: materialParams.clearcoat,
        clearcoatRoughness: materialParams.clearcoatRoughness,
      });
      
    case 'physical':
      return new THREE.MeshPhysicalMaterial({
        color: materialParams.color,
        roughness: materialParams.roughness,
        metalness: materialParams.metalness,
        clearcoat: materialParams.clearcoat,
        clearcoatRoughness: materialParams.clearcoatRoughness,
        transmission: materialParams.transmission,
        thickness: materialParams.thickness,
        ior: materialParams.ior,
        emissive: materialParams.emissive,
        emissiveIntensity: materialParams.emissiveIntensity,
      });
      
    case 'phong':
      return new THREE.MeshPhongMaterial({
        color: materialParams.color,
        shininess: 80,
        specular: 0x444444,
        flatShading: false,
      });
      
    case 'toon':
      return new THREE.MeshToonMaterial({
        color: materialParams.color,
        gradientMap: createToonGradient(),
      });
      
    case 'basic':
      return new THREE.MeshBasicMaterial({ color: materialParams.color, wireframe: false });
      
    case 'wireframe':
      return new THREE.MeshBasicMaterial({ color: materialParams.color, wireframe: true });
      
    case 'normal':
      return new THREE.MeshNormalMaterial({ flatShading: false });
      
    case 'matcap':
      return new THREE.MeshMatcapMaterial({
        color: materialParams.color,
        matcap: createMatcapTexture(),
      });
      
    default:
      return new THREE.MeshStandardMaterial({
        color: materialParams.color,
        roughness: materialParams.roughness,
        metalness: materialParams.metalness,
      });
  }
}

function createToonGradient() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#4361ee');
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

function createMatcapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#4361ee');
  gradient.addColorStop(0.7, '#1a1a2e');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(canvas);
}

export function updateMaterialParams(params) {
  materialParams = { ...materialParams, ...params };
  if (currentMaterial) {
    applyMaterialParams(currentMaterial);
  }
}

export function applyMaterialParams(material) {
  if (material.color) material.color.setHex(materialParams.color);
  if (material.roughness !== undefined) material.roughness = materialParams.roughness;
  if (material.metalness !== undefined) material.metalness = materialParams.metalness;
  if (material.clearcoat !== undefined) material.clearcoat = materialParams.clearcoat;
  if (material.clearcoatRoughness !== undefined) material.clearcoatRoughness = materialParams.clearcoatRoughness;
  if (material.transmission !== undefined) material.transmission = materialParams.transmission;
  if (material.thickness !== undefined) material.thickness = materialParams.thickness;
  if (material.ior !== undefined) material.ior = materialParams.ior;
  if (material.emissive) material.emissive.setHex(materialParams.emissive);
  if (material.emissiveIntensity !== undefined) material.emissiveIntensity = materialParams.emissiveIntensity;
  material.needsUpdate = true;
}

export function setCurrentMaterial(material) {
  currentMaterial = material;
}

export function getCurrentMaterial() {
  return currentMaterial;
}

export function getCurrentMaterialType() {
  return currentMaterialType;
}

export function getMaterialParams() {
  return { ...materialParams };
}

export function disposeMaterial() {
  if (currentMaterial) {
    currentMaterial.dispose();
    currentMaterial = null;
  }
}