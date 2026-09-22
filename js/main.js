// main.js - Main entry point
import * as THREE from 'three';
import { createScene, setupResize, resetCamera } from './scene.js';
import { geometries, shapeNames, createShapeButtons, getGeometry, getTriangleCount } from './shapes.js';
import { createMaterial, updateMaterialParams, applyMaterialParams, setCurrentMaterial, getCurrentMaterialType, getMaterialParams, disposeMaterial } from './materials.js';
import { createLights, updateAmbientIntensity, updateDirLight, updateFillLight, updateRimLight, setShadowsEnabled } from './lights.js';
import { createComposer, getComposer, setToneMapping, setExposure, setBloomEnabled, setBloomStrength, setBloomThreshold, setBloomRadius, setVignetteEnabled, setVignetteIntensity, setFXAAEnabled, resizeComposer, disposeComposer } from './postprocessing.js';
import { loadEnvironment, getCurrentEnv } from './environment.js';
import { createParticles, updateParticles, disposeParticles } from './particles.js';
import { updateStats } from './stats.js';
import { exportPNG, exportGLTF, exportConfig, getCurrentConfig } from './export.js';
import { setupTabs, setupMaterialUI, updateMaterialUIVisibility, updateMaterialUIValues, setupLightingUI, setupPostProcessingUI, setupExportUI, setupEnvironmentUI, setupAnimationUI, setupKeyboard } from './ui.js';

// State
const state = {
  currentShape: 'torusKnot',
  currentMaterialType: 'standard',
  materialParams: getMaterialParams(),
  currentEnv: 'studio',
  ambientIntensity: 0.5,
  dirLightIntensity: 1.5,
  dirLightPosition: { x: 5, y: 10, z: 7 },
  dirLightColor: '#ffffff',
  fillLightIntensity: 0.5,
  fillLightColor: '#4361ee',
  rimLightIntensity: 0.4,
  rimLightColor: '#ff6b6b',
  shadowsEnabled: true,
  toneMapping: 'aces',
  exposure: 1.2,
  bloomEnabled: false,
  bloomStrength: 0.5,
  bloomThreshold: 0.8,
  bloomRadius: 0.4,
  vignetteEnabled: false,
  vignetteIntensity: 0.3,
  fxaaEnabled: false,
  rotationSpeed: 1,
  isAnimating: true,
};

// Initialize scene
const { renderer, scene, camera, controls, canvas } = createScene();
setupResize(renderer, camera);

// Initialize components
createLights(scene);
const particles = createParticles(scene);
const composer = createComposer(renderer, scene, camera);

// Load environment
loadEnvironment('studio', scene);

// Create initial mesh
function createMesh(shapeName, materialType) {
  const oldMesh = scene.getObjectByName('mainMesh');
  if (oldMesh) {
    scene.remove(oldMesh);
    oldMesh.geometry.dispose();
    if (oldMesh.material) {
      if (Array.isArray(oldMesh.material)) {
        oldMesh.material.forEach(m => m.dispose());
      } else {
        oldMesh.material.dispose();
      }
    }
  }
  
  const geometry = getGeometry(shapeName);
  const material = createMaterial(materialType);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'mainMesh';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  
  setCurrentMaterial(material);
  state.currentShape = shapeName;
  state.currentMaterialType = materialType;
  
  return mesh;
}

let currentMesh = createMesh('torusKnot', 'standard');
updateMaterialUIVisibility('standard');

// Setup UI
setupTabs();
setupEnvironmentUI((env) => {
  loadEnvironment(env, scene);
  state.currentEnv = env;
});

setupMaterialUI(
  (type) => {
    createMesh(state.currentShape, type);
    updateMaterialUIVisibility(type);
    state.currentMaterialType = type;
    state.materialParams = getMaterialParams();
    updateMaterialUIValues(state.materialParams);
  },
  (params) => {
    updateMaterialParams(params);
    applyMaterialParams(getCurrentMaterial());
    state.materialParams = getMaterialParams();
  }
);

setupLightingUI(state, {
  onAmbientChange: (val) => {
    updateAmbientIntensity(val);
    state.ambientIntensity = val;
  },
  onDirLightChange: (params) => {
    if (params.intensity !== undefined) state.dirLightIntensity = params.intensity;
    if (params.x !== undefined) state.dirLightPosition.x = params.x;
    if (params.y !== undefined) state.dirLightPosition.y = params.y;
    if (params.z !== undefined) state.dirLightPosition.z = params.z;
    if (params.color !== undefined) state.dirLightColor = params.color;
    updateDirLight(state.dirLightIntensity, state.dirLightPosition.x, state.dirLightPosition.y, state.dirLightPosition.z, state.dirLightColor);
  },
  onFillLightChange: (params) => {
    if (params.intensity !== undefined) state.fillLightIntensity = params.intensity;
    if (params.color !== undefined) state.fillLightColor = params.color;
    updateFillLight(state.fillLightIntensity, state.fillLightColor);
  },
  onRimLightChange: (params) => {
    if (params.intensity !== undefined) state.rimLightIntensity = params.intensity;
    if (params.color !== undefined) state.rimLightColor = params.color;
    updateRimLight(state.rimLightIntensity, state.rimLightColor);
  },
  onShadowsChange: (enabled) => {
    setShadowsEnabled(enabled);
    state.shadowsEnabled = enabled;
  },
});

setupPostProcessingUI({
  onToneMappingChange: (type) => {
    setToneMapping(type, state.exposure);
    state.toneMapping = type;
  },
  onExposureChange: (val) => {
    setExposure(val);
    state.exposure = val;
  },
  onBloomEnabledChange: (enabled) => {
    setBloomEnabled(enabled);
    state.bloomEnabled = enabled;
  },
  onBloomStrengthChange: (val) => {
    setBloomStrength(val);
    state.bloomStrength = val;
  },
  onBloomThresholdChange: (val) => {
    setBloomThreshold(val);
    state.bloomThreshold = val;
  },
  onBloomRadiusChange: (val) => {
    setBloomRadius(val);
    state.bloomRadius = val;
  },
  onVignetteEnabledChange: (enabled) => {
    setVignetteEnabled(enabled);
    state.vignetteEnabled = enabled;
  },
  onVignetteIntensityChange: (val) => {
    setVignetteIntensity(val);
    state.vignetteIntensity = val;
  },
  onFXAAChange: (enabled) => {
    setFXAAEnabled(enabled);
    state.fxaaEnabled = enabled;
  },
});

setupExportUI({
  onExportPNG: (multiplier) => {
    exportPNG(renderer, scene, camera, multiplier);
  },
  onExportGLTF: () => {
    exportGLTF(scene);
  },
  onExportJSON: () => {
    const config = getCurrentConfig({
      ...state,
      camera,
      controls,
    });
    exportConfig(config);
  },
});

setupAnimationUI(state, {
  onResetCamera: () => resetCamera(controls, camera),
  onToggleAnimation: () => { state.isAnimating = !state.isAnimating; },
  onSpeedChange: (val) => { state.rotationSpeed = val; },
});

setupKeyboard({
  onToggleAnimation: () => { state.isAnimating = !state.isAnimating; },
  onResetCamera: () => resetCamera(controls, camera),
});

// Shape buttons
const shapeButtonsContainer = document.getElementById('shape-buttons');
createShapeButtons(shapeButtonsContainer, (shapeName) => {
  createMesh(shapeName, state.currentMaterialType);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (state.isAnimating && currentMesh) {
    currentMesh.rotation.x += 0.003 * state.rotationSpeed;
    currentMesh.rotation.y += 0.005 * state.rotationSpeed;
  }
  
  updateParticles();
  controls.update();
  
  const composerInstance = getComposer();
  composerInstance ? composerInstance.render() : renderer.render(scene, camera);
  
  updateStats(renderer, scene);
}

animate();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  disposeMaterial();
  disposeParticles();
  disposeComposer();
});