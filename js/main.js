// main.js - Main entry point
import * as THREE from 'three';
import { createScene, setupResize, resetCamera, setCameraFOV, setGridEnabled, setFog, setBackgroundColor } from './scene.js';
import { geometries, shapeNames, createShapeButtons, getGeometry, getTriangleCount } from './shapes.js';
import { createMaterial, updateMaterialParams, applyMaterialParams, setCurrentMaterial, getCurrentMaterial, getCurrentMaterialType, getMaterialParams, disposeMaterial } from './materials.js';
import { createLights, updateAmbientIntensity, updateDirLight, updateFillLight, updateRimLight, setShadowsEnabled, setGroundVisible, setGroundOpacity } from './lights.js';
import { createComposer, getComposer, setToneMapping, setExposure, setBloomEnabled, setBloomStrength, setBloomThreshold, setBloomRadius, setVignetteEnabled, setVignetteIntensity, setFXAAEnabled, resizeComposer, disposeComposer } from './postprocessing.js';
import { loadEnvironment, loadCustomEnvironment, getCurrentEnv } from './environment.js';
import { createParticles, setParticlesEnabled, updateParticles, disposeParticles } from './particles.js';
import { updateStats } from './stats.js';
import { exportPNG, exportGLTF, exportConfig, getCurrentConfig } from './export.js';
import {
  setupTabs, setupMaterialUI, updateMaterialUIVisibility, updateMaterialUIValues,
  setupLightingUI, setupPostProcessingUI, setupExportUI, setupEnvironmentUI, setupAnimationUI,
  setupKeyboard, setupCustomizeUI, updateCustomizeUIValues, showToast, setLoading,
} from './ui.js';

const STORAGE_KEY = 'vynkor3d:autosave';
const PRESET_KEY = 'vynkor3d:preset';

function defaultState() {
  return {
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
    // Scene customization
    backgroundColor: '#1a1a2e',
    groundEnabled: true,
    groundOpacity: 0.15,
    gridEnabled: false,
    fogEnabled: false,
    fogColor: '#0d0d1a',
    fogDensity: 0.05,
    particlesEnabled: false,
    cameraFOV: 60,
    accentColor: '#4361ee',
    autoSaveEnabled: true,
  };
}

function loadAutosave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Autosave corrompu, ignoré:', e);
    return null;
  }
}

// State (merged with any autosaved values from a previous session)
const saved = loadAutosave();
const state = Object.assign(defaultState(), saved || {});

let autosaveTimer = null;
function scheduleAutosave() {
  if (!state.autoSaveEnabled) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Impossible de sauvegarder automatiquement:', e);
    }
  }, 400);
}

// Initialize scene
const { renderer, scene, camera, controls, canvas } = createScene();
setupResize(renderer, camera, (w, h) => resizeComposer(w, h));

// Initialize components
createLights(scene);
createParticles(scene);
const composer = createComposer(renderer, scene, camera);

function applyAccentColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  // Derive a slightly lighter hover shade and a soft glow from the accent.
  document.documentElement.style.setProperty('--accent-hover', color);
  document.documentElement.style.setProperty('--accent-glow', hexToRgba(color, 0.4));
}

function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

// ----- Apply full state to scene + UI (used on init and on preset load) -----
function applySceneExtras() {
  if (state.currentEnv === 'none' || state.currentEnv === 'custom') {
    if (state.currentEnv === 'none') setBackgroundColor(scene, state.backgroundColor);
  }
  setGroundVisible(state.groundEnabled);
  setGroundOpacity(state.groundOpacity);
  setGridEnabled(scene, state.gridEnabled);
  setFog(scene, state.fogEnabled, state.fogColor, state.fogDensity);
  setParticlesEnabled(state.particlesEnabled);
  setCameraFOV(camera, state.cameraFOV);
  applyAccentColor(state.accentColor);
}

function applyLightsFromState() {
  updateAmbientIntensity(state.ambientIntensity);
  updateDirLight(state.dirLightIntensity, state.dirLightPosition.x, state.dirLightPosition.y, state.dirLightPosition.z, state.dirLightColor);
  updateFillLight(state.fillLightIntensity, state.fillLightColor);
  updateRimLight(state.rimLightIntensity, state.rimLightColor);
  setShadowsEnabled(state.shadowsEnabled);
}

function applyPostFromState() {
  setToneMapping(state.toneMapping);
  setExposure(state.exposure);
  setBloomEnabled(state.bloomEnabled);
  setBloomStrength(state.bloomStrength);
  setBloomThreshold(state.bloomThreshold);
  setBloomRadius(state.bloomRadius);
  setVignetteEnabled(state.vignetteEnabled);
  setVignetteIntensity(state.vignetteIntensity);
  setFXAAEnabled(state.fxaaEnabled);
}

function setSliderUI(id, valId, value, decimals = 2) {
  const slider = document.getElementById(id);
  const val = document.getElementById(valId);
  if (slider) slider.value = value;
  if (val) val.textContent = Number(value).toFixed(decimals);
}

function syncAllUIFromState() {
  // Shapes
  setActiveShapeButton(state.currentShape);
  document.getElementById('speed-range').value = state.rotationSpeed;
  document.getElementById('speed-val').textContent = state.rotationSpeed.toFixed(1);
  document.getElementById('toggle-anim').textContent = state.isAnimating ? '⏸️ Pause' : '▶️ Reprendre';
  document.getElementById('env-select').value = ['studio', 'sunset', 'night', 'warehouse', 'forest', 'apartment', 'none'].includes(state.currentEnv) ? state.currentEnv : 'studio';

  // Material
  document.getElementById('material-select').value = state.currentMaterialType;
  updateMaterialUIVisibility(state.currentMaterialType);
  updateMaterialUIValues(state.materialParams);

  // Lighting
  setSliderUI('ambient-intensity', 'amb-val', state.ambientIntensity);
  setSliderUI('dir-intensity', 'dir-int-val', state.dirLightIntensity);
  setSliderUI('dir-x', 'dir-x-val', state.dirLightPosition.x, 1);
  setSliderUI('dir-y', 'dir-y-val', state.dirLightPosition.y, 1);
  setSliderUI('dir-z', 'dir-z-val', state.dirLightPosition.z, 1);
  document.getElementById('dir-color').value = state.dirLightColor;
  setSliderUI('fill-intensity', 'fill-int-val', state.fillLightIntensity);
  document.getElementById('fill-color').value = state.fillLightColor;
  setSliderUI('rim-intensity', 'rim-int-val', state.rimLightIntensity);
  document.getElementById('rim-color').value = state.rimLightColor;
  document.getElementById('shadows-enabled').checked = state.shadowsEnabled;

  // Post-processing
  document.getElementById('tone-mapping').value = state.toneMapping;
  setSliderUI('exposure', 'exp-val', state.exposure);
  document.getElementById('bloom-enabled').checked = state.bloomEnabled;
  ['bloom-strength-row', 'bloom-threshold-row', 'bloom-radius-row'].forEach(id => {
    document.getElementById(id).style.display = state.bloomEnabled ? 'flex' : 'none';
  });
  setSliderUI('bloom-strength', 'bloom-str-val', state.bloomStrength);
  setSliderUI('bloom-threshold', 'bloom-thresh-val', state.bloomThreshold);
  setSliderUI('bloom-radius', 'bloom-rad-val', state.bloomRadius);
  document.getElementById('vignette-enabled').checked = state.vignetteEnabled;
  document.getElementById('vignette-row').style.display = state.vignetteEnabled ? 'flex' : 'none';
  setSliderUI('vignette', 'vig-val', state.vignetteIntensity, 2);
  document.getElementById('fxaa-enabled').checked = state.fxaaEnabled;

  // Customize
  updateCustomizeUIValues(state);
}

// Build initial mesh + apply restored/default state
let currentMesh = createMesh(state.currentShape, state.currentMaterialType);
updateMaterialParams(state.materialParams);
applyMaterialParams(getCurrentMaterial());
applyLightsFromState();
applyPostFromState();
applySceneExtras();

setLoading(true, 'Chargement de l\'environnement…');
loadEnvironment(state.currentEnv === 'custom' ? 'studio' : state.currentEnv, scene, {
  onEnd: () => setLoading(false),
  onError: (msg) => showToast(msg, 'error'),
}).then(() => {
  if (state.currentEnv === 'custom') state.currentEnv = 'studio'; // custom HDRIs aren't persisted (file handles can't be)
});

syncAllUIFromState();

// Setup UI
setupTabs();
setupEnvironmentUI(
  (env) => {
    setLoading(true, 'Chargement de l\'environnement…');
    loadEnvironment(env, scene, {
      onEnd: () => setLoading(false),
      onError: (msg) => showToast(msg, 'error'),
    });
    state.currentEnv = env;
    scheduleAutosave();
  },
  (file) => {
    setLoading(true, 'Chargement du HDRI…');
    loadCustomEnvironment(file, scene, {
      onEnd: () => setLoading(false),
      onError: (msg) => showToast(msg, 'error'),
    }).then(() => {
      state.currentEnv = 'custom';
      showToast('Environnement personnalisé chargé.', 'success');
    });
  }
);

setupMaterialUI(
  (type) => {
    currentMesh = createMesh(state.currentShape, type);
    updateMaterialParams(state.materialParams);
    applyMaterialParams(getCurrentMaterial());
    updateMaterialUIVisibility(type);
    state.currentMaterialType = type;
    scheduleAutosave();
  },
  (params) => {
    updateMaterialParams(params);
    applyMaterialParams(getCurrentMaterial());
    state.materialParams = getMaterialParams();
    scheduleAutosave();
  }
);

setupLightingUI(state, {
  onAmbientChange: (val) => {
    updateAmbientIntensity(val);
    state.ambientIntensity = val;
    scheduleAutosave();
  },
  onDirLightChange: (params) => {
    if (params.intensity !== undefined) state.dirLightIntensity = params.intensity;
    if (params.x !== undefined) state.dirLightPosition.x = params.x;
    if (params.y !== undefined) state.dirLightPosition.y = params.y;
    if (params.z !== undefined) state.dirLightPosition.z = params.z;
    if (params.color !== undefined) state.dirLightColor = params.color;
    updateDirLight(state.dirLightIntensity, state.dirLightPosition.x, state.dirLightPosition.y, state.dirLightPosition.z, state.dirLightColor);
    scheduleAutosave();
  },
  onFillLightChange: (params) => {
    if (params.intensity !== undefined) state.fillLightIntensity = params.intensity;
    if (params.color !== undefined) state.fillLightColor = params.color;
    updateFillLight(state.fillLightIntensity, state.fillLightColor);
    scheduleAutosave();
  },
  onRimLightChange: (params) => {
    if (params.intensity !== undefined) state.rimLightIntensity = params.intensity;
    if (params.color !== undefined) state.rimLightColor = params.color;
    updateRimLight(state.rimLightIntensity, state.rimLightColor);
    scheduleAutosave();
  },
  onShadowsChange: (enabled) => {
    setShadowsEnabled(enabled);
    state.shadowsEnabled = enabled;
    scheduleAutosave();
  },
});

setupPostProcessingUI({
  onToneMappingChange: (type) => {
    setToneMapping(type);
    state.toneMapping = type;
    scheduleAutosave();
  },
  onExposureChange: (val) => {
    setExposure(val);
    state.exposure = val;
    scheduleAutosave();
  },
  onBloomEnabledChange: (enabled) => {
    setBloomEnabled(enabled);
    state.bloomEnabled = enabled;
    scheduleAutosave();
  },
  onBloomStrengthChange: (val) => {
    setBloomStrength(val);
    state.bloomStrength = val;
    scheduleAutosave();
  },
  onBloomThresholdChange: (val) => {
    setBloomThreshold(val);
    state.bloomThreshold = val;
    scheduleAutosave();
  },
  onBloomRadiusChange: (val) => {
    setBloomRadius(val);
    state.bloomRadius = val;
    scheduleAutosave();
  },
  onVignetteEnabledChange: (enabled) => {
    setVignetteEnabled(enabled);
    state.vignetteEnabled = enabled;
    scheduleAutosave();
  },
  onVignetteIntensityChange: (val) => {
    setVignetteIntensity(val);
    state.vignetteIntensity = val;
    scheduleAutosave();
  },
  onFXAAChange: (enabled) => {
    setFXAAEnabled(enabled);
    state.fxaaEnabled = enabled;
    scheduleAutosave();
  },
});

setupExportUI({
  onExportPNG: (multiplier, transparent) => {
    exportPNG(renderer, scene, camera, multiplier, transparent);
    showToast('Capture d\'écran téléchargée.', 'success');
  },
  onExportGLTF: () => {
    exportGLTF(scene);
    showToast('Export GLTF téléchargé.', 'success');
  },
  onExportJSON: () => {
    const config = getCurrentConfig({ ...state, camera, controls });
    exportConfig(config, (msg) => showToast(msg, 'success'));
  },
});

setupAnimationUI(state, {
  onResetCamera: () => resetCamera(controls, camera),
  onToggleAnimation: () => {
    state.isAnimating = !state.isAnimating;
    scheduleAutosave();
  },
  onSpeedChange: (val) => {
    state.rotationSpeed = val;
    scheduleAutosave();
  },
});

setupCustomizeUI(state, {
  onAccentChange: (color) => {
    applyAccentColor(color);
    state.accentColor = color;
    scheduleAutosave();
  },
  onBackgroundChange: (color) => {
    state.backgroundColor = color;
    if (state.currentEnv === 'none') setBackgroundColor(scene, color);
    scheduleAutosave();
  },
  onGroundEnabledChange: (enabled) => {
    setGroundVisible(enabled);
    state.groundEnabled = enabled;
    scheduleAutosave();
  },
  onGroundOpacityChange: (val) => {
    setGroundOpacity(val);
    state.groundOpacity = val;
    scheduleAutosave();
  },
  onGridChange: (enabled) => {
    setGridEnabled(scene, enabled);
    state.gridEnabled = enabled;
    scheduleAutosave();
  },
  onFogChange: ({ enabled, color, density }) => {
    if (enabled !== undefined) state.fogEnabled = enabled;
    if (color !== undefined) state.fogColor = color;
    if (density !== undefined) state.fogDensity = density;
    setFog(scene, state.fogEnabled, state.fogColor, state.fogDensity);
    scheduleAutosave();
  },
  onParticlesChange: (enabled) => {
    setParticlesEnabled(enabled);
    state.particlesEnabled = enabled;
    scheduleAutosave();
  },
  onFOVChange: (val) => {
    setCameraFOV(camera, val);
    state.cameraFOV = val;
    scheduleAutosave();
  },
  onToggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  },
  onPresetSave: () => {
    try {
      localStorage.setItem(PRESET_KEY, JSON.stringify(state));
      showToast('Préréglage enregistré.', 'success');
    } catch (e) {
      showToast('Échec de l\'enregistrement du préréglage.', 'error');
    }
  },
  onPresetLoad: () => {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (!raw) { showToast('Aucun préréglage enregistré.', 'error'); return; }
      const cfg = JSON.parse(raw);
      Object.assign(state, cfg);
      currentMesh = createMesh(state.currentShape, state.currentMaterialType);
      updateMaterialParams(state.materialParams);
      applyMaterialParams(getCurrentMaterial());
      applyLightsFromState();
      applyPostFromState();
      applySceneExtras();
      loadEnvironment(state.currentEnv === 'custom' ? 'studio' : state.currentEnv, scene);
      syncAllUIFromState();
      showToast('Préréglage chargé.', 'success');
      scheduleAutosave();
    } catch (e) {
      showToast('Préréglage invalide.', 'error');
    }
  },
  onPresetReset: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PRESET_KEY);
    location.reload();
  },
});

setupKeyboard({
  onToggleAnimation: () => {
    state.isAnimating = !state.isAnimating;
    document.getElementById('toggle-anim').textContent = state.isAnimating ? '⏸️ Pause' : '▶️ Reprendre';
    scheduleAutosave();
  },
  onResetCamera: () => resetCamera(controls, camera),
  onToggleFullscreen: () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  },
  onToggleUI: () => {
    document.getElementById('ui').classList.toggle('hidden');
    document.getElementById('stats').classList.toggle('hidden');
  },
});

// Shape buttons
const shapeButtonsContainer = document.getElementById('shape-buttons');
createShapeButtons(shapeButtonsContainer, (shapeName) => {
  currentMesh = createMesh(shapeName, state.currentMaterialType);
  updateMaterialParams(state.materialParams);
  applyMaterialParams(getCurrentMaterial());
  setActiveShapeButton(shapeName);
  scheduleAutosave();
});

function setActiveShapeButton(shapeName) {
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.shape-btn[data-shape="${shapeName}"]`);
  if (btn) btn.classList.add('active');
}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (state.isAnimating && currentMesh) {
    currentMesh.rotation.x += 0.003 * state.rotationSpeed;
    currentMesh.rotation.y += 0.005 * state.rotationSpeed;
  }

  updateParticles(delta);
  controls.update();

  const composerInstance = getComposer();
  composerInstance ? composerInstance.render() : renderer.render(scene, camera);

  updateStats(renderer, scene);
}

animate();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  disposeMaterial();
  disposeComposer();
  disposeParticles();
});