// ui.js - UI controls and event handlers
import * as THREE from 'three';
import { shapeNames } from './shapes.js';
import { getMaterialParams } from './materials.js';

export function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
    });
  });
}

export function setupMaterialUI(onMaterialChange, onParamChange) {
  const materialSelect = document.getElementById('material-select');
  const pbrControls = document.getElementById('pbr-controls');
  
  materialSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    updateMaterialUIVisibility(type);
    onMaterialChange(type);
  });
  
  // Color inputs
  const colorBase = document.getElementById('color-base');
  const colorBaseHex = document.getElementById('color-base-hex');
  const emissiveColor = document.getElementById('emissiveColor');
  const emissiveColorHex = document.getElementById('emissiveColor-hex');
  
  colorBase.addEventListener('input', (e) => {
    colorBaseHex.value = e.target.value;
    onParamChange({ color: e.target.value });
  });
  
  colorBaseHex.addEventListener('change', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      colorBase.value = e.target.value;
      onParamChange({ color: e.target.value });
    }
  });
  
  emissiveColor.addEventListener('input', (e) => {
    emissiveColorHex.value = e.target.value;
    onParamChange({ emissive: e.target.value });
  });
  
  // Sliders
  const sliders = [
    { id: 'roughness', valId: 'rough-val', param: 'roughness', factor: 1 },
    { id: 'metalness', valId: 'metal-val', param: 'metalness', factor: 1 },
    { id: 'clearcoat', valId: 'clear-val', param: 'clearcoat', factor: 1 },
    { id: 'clearcoatRoughness', valId: 'clearR-val', param: 'clearcoatRoughness', factor: 1 },
    { id: 'transmission', valId: 'trans-val', param: 'transmission', factor: 1 },
    { id: 'thickness', valId: 'thick-val', param: 'thickness', factor: 1 },
    { id: 'ior', valId: 'ior-val', param: 'ior', factor: 1 },
    { id: 'emissiveIntensity', valId: 'emi-val', param: 'emissiveIntensity', factor: 1 },
  ];
  
  sliders.forEach(({ id, valId, param, factor }) => {
    const slider = document.getElementById(id);
    const val = document.getElementById(valId);
    if (slider && val) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) * factor;
        val.textContent = value.toFixed(2);
        onParamChange({ [param]: value });
      });
    }
  });
}

export function updateMaterialUIVisibility(type) {
  const pbrControls = document.getElementById('pbr-controls');
  const showPBR = ['standard', 'physical'].includes(type);
  pbrControls.style.display = showPBR ? 'block' : 'none';
}

export function updateMaterialUIValues(params) {
  const colorBase = document.getElementById('color-base');
  const colorBaseHex = document.getElementById('color-base-hex');
  const emissiveColor = document.getElementById('emissiveColor');
  const emissiveColorHex = document.getElementById('emissiveColor-hex');
  
  if (params.color) {
    const hex = '#' + params.color.toString(16).padStart(6, '0');
    colorBase.value = hex;
    colorBaseHex.value = hex;
  }
  
  if (params.emissive) {
    const hex = '#' + params.emissive.toString(16).padStart(6, '0');
    emissiveColor.value = hex;
    emissiveColorHex.value = hex;
  }
  
  const sliderMap = {
    roughness: 'roughness',
    metalness: 'metalness',
    clearcoat: 'clearcoat',
    clearcoatRoughness: 'clearcoatRoughness',
    transmission: 'transmission',
    thickness: 'thickness',
    ior: 'ior',
    emissiveIntensity: 'emissiveIntensity',
  };
  
  Object.entries(sliderMap).forEach(([id, param]) => {
    const slider = document.getElementById(id);
    const val = document.getElementById(id.replace(/([A-Z])/g, '-$1').toLowerCase() + '-val');
    if (slider && params[param] !== undefined) {
      slider.value = params[param];
      if (val) val.textContent = params[param].toFixed(2);
    }
  });
}

export function setupLightingUI(state, callbacks) {
  // Ambient
  const ambSlider = document.getElementById('ambient-intensity');
  const ambVal = document.getElementById('amb-val');
  ambSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    ambVal.textContent = val.toFixed(2);
    callbacks.onAmbientChange(val);
  });
  
  // Directional
  const dirIntensity = document.getElementById('dir-intensity');
  const dirX = document.getElementById('dir-x');
  const dirY = document.getElementById('dir-y');
  const dirZ = document.getElementById('dir-z');
  const dirColor = document.getElementById('dir-color');
  
  dirIntensity.addEventListener('input', (e) => callbacks.onDirLightChange({ intensity: parseFloat(e.target.value) }));
  dirX.addEventListener('input', (e) => callbacks.onDirLightChange({ x: parseFloat(e.target.value) }));
  dirY.addEventListener('input', (e) => callbacks.onDirLightChange({ y: parseFloat(e.target.value) }));
  dirZ.addEventListener('input', (e) => callbacks.onDirLightChange({ z: parseFloat(e.target.value) }));
  dirColor.addEventListener('input', (e) => callbacks.onDirLightChange({ color: e.target.value }));
  
  // Fill
  const fillIntensity = document.getElementById('fill-intensity');
  const fillColor = document.getElementById('fill-color');
  fillIntensity.addEventListener('input', (e) => callbacks.onFillLightChange({ intensity: parseFloat(e.target.value) }));
  fillColor.addEventListener('input', (e) => callbacks.onFillLightChange({ color: e.target.value }));
  
  // Rim
  const rimIntensity = document.getElementById('rim-intensity');
  const rimColor = document.getElementById('rim-color');
  rimIntensity.addEventListener('input', (e) => callbacks.onRimLightChange({ intensity: parseFloat(e.target.value) }));
  rimColor.addEventListener('input', (e) => callbacks.onRimLightChange({ color: e.target.value }));
  
  // Shadows
  document.getElementById('shadows-enabled').addEventListener('change', (e) => {
    callbacks.onShadowsChange(e.target.checked);
  });
}

export function setupPostProcessingUI(callbacks) {
  // Tone mapping
  document.getElementById('tone-mapping').addEventListener('change', (e) => {
    callbacks.onToneMappingChange(e.target.value);
  });
  
  // Exposure
  const expSlider = document.getElementById('exposure');
  const expVal = document.getElementById('exp-val');
  expSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    expVal.textContent = val.toFixed(2);
    callbacks.onExposureChange(val);
  });
  
  // Bloom
  const bloomCheckbox = document.getElementById('bloom-enabled');
  const bloomRows = ['bloom-strength-row', 'bloom-threshold-row', 'bloom-radius-row'];
  
  bloomCheckbox.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    bloomRows.forEach(id => document.getElementById(id).style.display = enabled ? 'flex' : 'none');
    callbacks.onBloomEnabledChange(enabled);
  });
  
  const bloomStrength = document.getElementById('bloom-strength');
  const bloomStrengthVal = document.getElementById('bloom-str-val');
  bloomStrength.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bloomStrengthVal.textContent = val.toFixed(2);
    callbacks.onBloomStrengthChange(val);
  });
  
  const bloomThreshold = document.getElementById('bloom-threshold');
  const bloomThresholdVal = document.getElementById('bloom-thresh-val');
  bloomThreshold.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bloomThresholdVal.textContent = val.toFixed(2);
    callbacks.onBloomThresholdChange(val);
  });
  
  const bloomRadius = document.getElementById('bloom-radius');
  const bloomRadiusVal = document.getElementById('bloom-rad-val');
  bloomRadius.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bloomRadiusVal.textContent = val.toFixed(2);
    callbacks.onBloomRadiusChange(val);
  });
  
  // Vignette
  const vignetteCheckbox = document.getElementById('vignette-enabled');
  const vignetteRow = document.getElementById('vignette-row');
  
  vignetteCheckbox.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    vignetteRow.style.display = enabled ? 'flex' : 'none';
    callbacks.onVignetteEnabledChange(enabled);
  });
  
  const vignetteSlider = document.getElementById('vignette');
  const vignetteVal = document.getElementById('vig-val');
  vignetteSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    vignetteVal.textContent = val.toFixed(2);
    callbacks.onVignetteIntensityChange(val);
  });
  
  // FXAA
  document.getElementById('fxaa-enabled').addEventListener('change', (e) => {
    callbacks.onFXAAChange(e.target.checked);
  });
}

export function setupExportUI(callbacks) {
  document.getElementById('export-png').addEventListener('click', () => {
    const multiplier = parseInt(document.getElementById('screenshot-resolution').value);
    callbacks.onExportPNG(multiplier);
  });
  
  document.getElementById('export-gltf').addEventListener('click', () => {
    callbacks.onExportGLTF();
  });
  
  document.getElementById('export-json').addEventListener('click', () => {
    callbacks.onExportJSON();
  });
}

export function setupEnvironmentUI(onEnvChange) {
  document.getElementById('env-select').addEventListener('change', (e) => {
    onEnvChange(e.target.value);
  });
}

export function setupAnimationUI(state, callbacks) {
  document.getElementById('reset-cam').addEventListener('click', () => {
    callbacks.onResetCamera();
  });
  
  document.getElementById('toggle-anim').addEventListener('click', () => {
    callbacks.onToggleAnimation();
  });
  
  const speedSlider = document.getElementById('speed-range');
  const speedVal = document.getElementById('speed-val');
  speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    speedVal.textContent = val.toFixed(1);
    callbacks.onSpeedChange(val);
  });
}

export function setupKeyboard(callbacks) {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      callbacks.onToggleAnimation();
    }
    if (e.key === 'r' || e.key === 'R') {
      callbacks.onResetCamera();
    }
  });
}