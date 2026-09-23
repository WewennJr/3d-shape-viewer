// particles.js - Ambient particle system (subtle dust/sparkle in the scene)
import * as THREE from 'three';

let points = null;
let material = null;
let geometry = null;

function buildGeometry(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 4 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function createParticles(scene, count = 400, color = '#8892ff') {
  geometry = buildGeometry(count);
  material = new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size: 0.02,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    depthWrite: false,
  });
  points = new THREE.Points(geometry, material);
  points.name = 'ambientParticles';
  points.visible = false;
  scene.add(points);
  return points;
}

export function setParticlesEnabled(enabled) {
  if (points) points.visible = enabled;
}

export function setParticlesColor(color) {
  if (material) material.color.set(color);
}

export function updateParticles(delta) {
  if (points && points.visible) {
    points.rotation.y += delta * 0.02;
  }
}

export function disposeParticles() {
  if (geometry) geometry.dispose();
  if (material) material.dispose();
  points = null;
  geometry = null;
  material = null;
}