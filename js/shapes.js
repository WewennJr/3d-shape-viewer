// shapes.js - Geometry definitions and shape management
import * as THREE from 'three';

export const geometries = {
  cube: new THREE.BoxGeometry(1.5, 1.5, 1.5, 4, 4, 4),
  sphere: new THREE.SphereGeometry(1, 64, 64),
  torus: new THREE.TorusGeometry(0.8, 0.35, 32, 64),
  cone: new THREE.ConeGeometry(1, 1.8, 32),
  cylinder: new THREE.CylinderGeometry(0.8, 0.8, 1.8, 32),
  dodecahedron: new THREE.DodecahedronGeometry(1.1, 1),
  icosahedron: new THREE.IcosahedronGeometry(1.1, 1),
  torusKnot: new THREE.TorusKnotGeometry(0.7, 0.25, 128, 32),
  octahedron: new THREE.OctahedronGeometry(1.2, 1),
  tetrahedron: new THREE.TetrahedronGeometry(1.3, 1),
  ring: new THREE.RingGeometry(0.5, 1, 32),
  plane: new THREE.PlaneGeometry(2, 2, 10, 10),
  capsule: new THREE.CapsuleGeometry(0.5, 1.5, 16, 32),
  lathe: (() => {
    const points = [];
    for (let i = 0; i <= 16; i++) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.8, (i - 8) * 0.15));
    }
    return new THREE.LatheGeometry(points, 32);
  })(),
  extrude: (() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.5);
    shape.lineTo(0.5, -0.5);
    shape.lineTo(0.5, 0.5);
    shape.lineTo(-0.5, 0.5);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.1, bevelThickness: 0.1 });
  })(),
};

export const shapeNames = Object.keys(geometries);

export function createShapeButtons(container, onShapeSelect) {
  shapeNames.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.className = 'shape-btn' + (i === shapeNames.length - 1 ? ' active' : '');
    btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    btn.onclick = () => {
      document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onShapeSelect(name);
    };
    container.appendChild(btn);
  });
}

export function getGeometry(name) {
  return geometries[name]?.clone();
}

export function getTriangleCount(geometry) {
  if (!geometry) return 0;
  const index = geometry.getIndex();
  const position = geometry.getAttribute('position');
  if (index) return index.count / 3;
  return position.count / 3;
}