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

  function syncColor(colorInput, hexInput, paramName) {
    colorInput.addEventListener('input', (e) => {
      hexInput.value = e.target.value;
      onParamChange({ [paramName]: e.target.value });
    });

    hexInput.addEventListener('change', (e) => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        colorInput.value = e.target.value;
        onParamChange({ [paramName]: e.target.value });
      }
    });
  }

  syncColor(colorBase, colorBaseHex, 'color');
  syncColor(emissiveColor, emissiveColorHex, 'emissive');

  // Sliders
  const sliderConfigs = [
    { id: 'roughness', valId: 'rough-val', param: 'roughness' },
    { id: 'metalness', valId: 'metal-val', param: 'metalness' },
    { id: 'clearcoat', valId: 'clear-val', param: 'clearcoat' },
    { id: 'clearcoatRoughness', valId: 'clearR-val', param: 'clearcoatRoughness' },
    { id: 'transmission', valId: 'trans-val', param: 'transmission' },
    { id: 'thickness', valId: 'thick-val', param: 'thickness' },
    { id: 'ior', valId: 'ior-val', param: 'ior' },
    { id: 'emissiveIntensity', valId: 'emi-val', param: 'emissiveIntensity' },
  ];

  sliderConfigs.forEach(({ id, valId, param }) => {
    const slider = document.getElementById(id);
    const val = document.getElementById(valId);
    if (slider && val) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        val.textContent = value.toFixed(2);
        onParamChange({ [param]: value });
      });
    }
  });

  // Randomize material color
  const randomBtn = document.getElementById('randomize-color');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const hex = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
      colorBase.value = hex;
      colorBaseHex.value = hex;
      onParamChange({ color: hex });
    });
  }
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
    colorBase.value = params.color;
    colorBaseHex.value = params.color;
  }

  if (params.emissive) {
    emissiveColor.value = params.emissive;
    emissiveColorHex.value = params.emissive;
  }

  const sliderConfigs = [
    { id: 'roughness', valId: 'rough-val', param: 'roughness' },
    { id: 'metalness', valId: 'metal-val', param: 'metalness' },
    { id: 'clearcoat', valId: 'clear-val', param: 'clearcoat' },
    { id: 'clearcoatRoughness', valId: 'clearR-val', param: 'clearcoatRoughness' },
    { id: 'transmission', valId: 'trans-val', param: 'transmission' },
    { id: 'thickness', valId: 'thick-val', param: 'thickness' },
    { id: 'ior', valId: 'ior-val', param: 'ior' },
    { id: 'emissiveIntensity', valId: 'emi-val', param: 'emissiveIntensity' },
  ];

  sliderConfigs.forEach(({ id, valId, param }) => {
    const slider = document.getElementById(id);
    const val = document.getElementById(valId);
    if (slider && params[param] !== undefined) {
      slider.value = params[param];
      val.textContent = params[param].toFixed(2);
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
  const dirIntVal = document.getElementById('dir-int-val');
  const dirX = document.getElementById('dir-x');
  const dirXVal = document.getElementById('dir-x-val');
  const dirY = document.getElementById('dir-y');
  const dirYVal = document.getElementById('dir-y-val');
  const dirZ = document.getElementById('dir-z');
  const dirZVal = document.getElementById('dir-z-val');
  const dirColor = document.getElementById('dir-color');

  dirIntensity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    dirIntVal.textContent = val.toFixed(2);
    callbacks.onDirLightChange({ intensity: val });
  });
  dirX.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    dirXVal.textContent = val.toFixed(1);
    callbacks.onDirLightChange({ x: val });
  });
  dirY.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    dirYVal.textContent = val.toFixed(1);
    callbacks.onDirLightChange({ y: val });
  });
  dirZ.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    dirZVal.textContent = val.toFixed(1);
    callbacks.onDirLightChange({ z: val });
  });
  dirColor.addEventListener('input', (e) => callbacks.onDirLightChange({ color: e.target.value }));

  // Fill
  const fillIntensity = document.getElementById('fill-intensity');
  const fillIntVal = document.getElementById('fill-int-val');
  const fillColor = document.getElementById('fill-color');
  fillIntensity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    fillIntVal.textContent = val.toFixed(2);
    callbacks.onFillLightChange({ intensity: val });
  });
  fillColor.addEventListener('input', (e) => callbacks.onFillLightChange({ color: e.target.value }));

  // Rim
  const rimIntensity = document.getElementById('rim-intensity');
  const rimIntVal = document.getElementById('rim-int-val');
  const rimColor = document.getElementById('rim-color');
  rimIntensity.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    rimIntVal.textContent = val.toFixed(2);
    callbacks.onRimLightChange({ intensity: val });
  });
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
    bloomRows.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = enabled ? 'flex' : 'none';
    });
    callbacks.onBloomEnabledChange(enabled);
  });

  const bloomStrength = document.getElementById('bloom-strength');
  const bloomStrengthVal = document.getElementById('bloom-str-val');
  if (bloomStrength && bloomStrengthVal) {
    bloomStrength.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      bloomStrengthVal.textContent = val.toFixed(2);
      callbacks.onBloomStrengthChange(val);
    });
  }

  const bloomThreshold = document.getElementById('bloom-threshold');
  const bloomThresholdVal = document.getElementById('bloom-thresh-val');
  if (bloomThreshold && bloomThresholdVal) {
    bloomThreshold.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      bloomThresholdVal.textContent = val.toFixed(2);
      callbacks.onBloomThresholdChange(val);
    });
  }

  const bloomRadius = document.getElementById('bloom-radius');
  const bloomRadiusVal = document.getElementById('bloom-rad-val');
  if (bloomRadius && bloomRadiusVal) {
    bloomRadius.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      bloomRadiusVal.textContent = val.toFixed(2);
      callbacks.onBloomRadiusChange(val);
    });
  }

  // Vignette
  const vignetteCheckbox = document.getElementById('vignette-enabled');
  const vignetteRow = document.getElementById('vignette-row');

  vignetteCheckbox.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    if (vignetteRow) vignetteRow.style.display = enabled ? 'flex' : 'none';
    callbacks.onVignetteEnabledChange(enabled);
  });

  const vignetteSlider = document.getElementById('vignette');
  const vignetteVal = document.getElementById('vig-val');
  if (vignetteSlider && vignetteVal) {
    vignetteSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      vignetteVal.textContent = val.toFixed(2);
      callbacks.onVignetteIntensityChange(val);
    });
  }

  // FXAA
  document.getElementById('fxaa-enabled').addEventListener('change', (e) => {
    callbacks.onFXAAChange(e.target.checked);
  });
}

export function setupExportUI(callbacks) {
  document.getElementById('export-png').addEventListener('click', () => {
    const multiplier = parseInt(document.getElementById('screenshot-resolution').value);
    const transparent = document.getElementById('export-transparent')?.checked || false;
    callbacks.onExportPNG(multiplier, transparent);
  });

  document.getElementById('export-gltf').addEventListener('click', () => {
    callbacks.onExportGLTF();
  });

  document.getElementById('export-json').addEventListener('click', () => {
    callbacks.onExportJSON();
  });
}

export function setupEnvironmentUI(onEnvChange, onCustomEnv) {
  document.getElementById('env-select').addEventListener('change', (e) => {
    onEnvChange(e.target.value);
  });

  const fileInput = document.getElementById('custom-hdri');
  if (fileInput && onCustomEnv) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) onCustomEnv(file);
    });
  }
}

export function setupAnimationUI(state, callbacks) {
  document.getElementById('reset-cam').addEventListener('click', () => {
    callbacks.onResetCamera();
  });

  const toggleBtn = document.getElementById('toggle-anim');
  toggleBtn.addEventListener('click', () => {
    callbacks.onToggleAnimation();
    toggleBtn.textContent = state.isAnimating ? '⏸️ Pause' : '▶️ Reprendre';
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
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      callbacks.onToggleAnimation();
    }
    if (e.key === 'r' || e.key === 'R') {
      callbacks.onResetCamera();
    }
    if (e.key === 'f' || e.key === 'F') {
      callbacks.onToggleFullscreen?.();
    }
    if (e.key === 'h' || e.key === 'H') {
      callbacks.onToggleUI?.();
    }
  });
}

// ===== NEW: Customization tab (scene, theme, presets) =====
export function setupCustomizeUI(state, callbacks) {
  // Accent / theme color
  const accentInput = document.getElementById('accent-color');
  if (accentInput) {
    accentInput.value = state.accentColor;
    accentInput.addEventListener('input', (e) => callbacks.onAccentChange(e.target.value));
  }

  // Background color (used when environment = none)
  const bgInput = document.getElementById('bg-color');
  if (bgInput) {
    bgInput.addEventListener('input', (e) => callbacks.onBackgroundChange(e.target.value));
  }

  // Ground
  const groundEnabled = document.getElementById('ground-enabled');
  const groundOpacityRow = document.getElementById('ground-opacity-row');
  const groundOpacity = document.getElementById('ground-opacity');
  const groundOpacityVal = document.getElementById('ground-op-val');
  if (groundEnabled) {
    groundEnabled.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      if (groundOpacityRow) groundOpacityRow.style.display = enabled ? 'flex' : 'none';
      callbacks.onGroundEnabledChange(enabled);
    });
  }
  if (groundOpacity && groundOpacityVal) {
    groundOpacity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      groundOpacityVal.textContent = val.toFixed(2);
      callbacks.onGroundOpacityChange(val);
    });
  }

  // Grid
  const gridEnabled = document.getElementById('grid-enabled');
  if (gridEnabled) {
    gridEnabled.addEventListener('change', (e) => callbacks.onGridChange(e.target.checked));
  }

  // Fog
  const fogEnabled = document.getElementById('fog-enabled');
  const fogRow = document.getElementById('fog-controls-row');
  const fogColor = document.getElementById('fog-color');
  const fogDensity = document.getElementById('fog-density');
  const fogDensityVal = document.getElementById('fog-density-val');
  if (fogEnabled) {
    fogEnabled.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      if (fogRow) fogRow.style.display = enabled ? 'flex' : 'none';
      callbacks.onFogChange({ enabled });
    });
  }
  if (fogColor) fogColor.addEventListener('input', (e) => callbacks.onFogChange({ color: e.target.value }));
  if (fogDensity && fogDensityVal) {
    fogDensity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      fogDensityVal.textContent = val.toFixed(3);
      callbacks.onFogChange({ density: val });
    });
  }

  // Particles
  const particlesEnabled = document.getElementById('particles-enabled');
  if (particlesEnabled) {
    particlesEnabled.addEventListener('change', (e) => callbacks.onParticlesChange(e.target.checked));
  }

  // Camera FOV
  const fovSlider = document.getElementById('camera-fov');
  const fovVal = document.getElementById('fov-val');
  if (fovSlider && fovVal) {
    fovSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      fovVal.textContent = val;
      callbacks.onFOVChange(val);
    });
  }

  // Fullscreen
  const fullscreenBtn = document.getElementById('toggle-fullscreen');
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => callbacks.onToggleFullscreen());

  // Stats visibility
  const statsToggle = document.getElementById('stats-visible');
  if (statsToggle) {
    statsToggle.addEventListener('change', (e) => {
      const statsPanel = document.getElementById('stats');
      if (statsPanel) statsPanel.style.display = e.target.checked ? 'block' : 'none';
    });
  }

  // Presets
  document.getElementById('preset-save')?.addEventListener('click', () => callbacks.onPresetSave());
  document.getElementById('preset-load')?.addEventListener('click', () => callbacks.onPresetLoad());
  document.getElementById('preset-reset')?.addEventListener('click', () => callbacks.onPresetReset());
}

// Applies loaded/default customize values to the DOM (used on init and after preset load)
export function updateCustomizeUIValues(state) {
  const map = {
    'accent-color': state.accentColor,
    'bg-color': state.backgroundColor,
    'ground-enabled': state.groundEnabled,
    'ground-opacity': state.groundOpacity,
    'grid-enabled': state.gridEnabled,
    'fog-enabled': state.fogEnabled,
    'fog-color': state.fogColor,
    'fog-density': state.fogDensity,
    'particles-enabled': state.particlesEnabled,
    'camera-fov': state.cameraFOV,
  };
  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el || value === undefined) return;
    if (el.type === 'checkbox') el.checked = value;
    else el.value = value;
  });

  const groundOpacityVal = document.getElementById('ground-op-val');
  if (groundOpacityVal) groundOpacityVal.textContent = state.groundOpacity.toFixed(2);
  const fogDensityVal = document.getElementById('fog-density-val');
  if (fogDensityVal) fogDensityVal.textContent = state.fogDensity.toFixed(3);
  const fovVal = document.getElementById('fov-val');
  if (fovVal) fovVal.textContent = state.cameraFOV;

  const groundOpacityRow = document.getElementById('ground-opacity-row');
  if (groundOpacityRow) groundOpacityRow.style.display = state.groundEnabled ? 'flex' : 'none';
  const fogRow = document.getElementById('fog-controls-row');
  if (fogRow) fogRow.style.display = state.fogEnabled ? 'flex' : 'none';
}

// ===== Toast notifications (replaces blocking alert()) =====
let toastContainer = null;
export function showToast(message, type = 'info', duration = 3200) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ===== Loading indicator (for HDRI loads) =====
export function setLoading(active, label = 'Chargement…') {
  let el = document.getElementById('loading-indicator');
  if (active) {
    if (!el) {
      el = document.createElement('div');
      el.id = 'loading-indicator';
      el.innerHTML = `<div class="spinner"></div><span></span>`;
      document.body.appendChild(el);
    }
    el.querySelector('span').textContent = label;
    el.classList.add('visible');
  } else if (el) {
    el.classList.remove('visible');
  }
}