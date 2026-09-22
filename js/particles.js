// particles.js - Particle system
import * as THREE from 'three';

let particles = null;

export function createParticles(scene) {
  const particlesGeo = new THREE.BufferGeometry();
  const particlesCount = 500;
  const positions = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);
  
  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    sizes[i] = Math.random() * 2 + 0.5;
  }
  
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const particlesMat = new THREE.PointsMaterial({
    color: 0x4361ee,
    size: 1,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  });
  
  particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);
  
  return particles;
}

export function getParticles() {
  return particles;
}

export function updateParticles(delta) {
  if (particles) {
    particles.rotation.y += 0.0001;
  }
}

export function disposeParticles() {
  if (particles) {
    particles.geometry.dispose();
    particles.material.dispose();
    particles = null;
  }
}