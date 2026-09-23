// export.js - Export functionality (screenshot, GLTF, JSON)
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function exportPNG(renderer, scene, camera, multiplier = 1, transparent = false) {
  const width = Math.round(window.innerWidth * multiplier);
  const height = Math.round(window.innerHeight * multiplier);

  const originalSize = renderer.getSize(new THREE.Vector2());
  const originalPixelRatio = renderer.getPixelRatio();
  const originalBackground = scene.background;

  if (transparent) scene.background = null;

  // updateStyle=false keeps the on-screen canvas CSS size stable while we
  // render at a larger internal resolution, avoiding a visible flash/resize.
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(1);
  renderer.render(scene, camera);

  const dataURL = renderer.domElement.toDataURL('image/png');

  renderer.setSize(originalSize.x, originalSize.y, false);
  renderer.setPixelRatio(originalPixelRatio);
  scene.background = originalBackground;
  renderer.render(scene, camera);

  const link = document.createElement('a');
  link.download = `vynkor-3d-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
}

export function exportGLTF(scene) {
  const exporter = new GLTFExporter();

  exporter.parse(scene, (gltf) => {
    const blob = new Blob([JSON.stringify(gltf, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `vynkor-3d-${Date.now()}.gltf`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, (err) => console.error('GLTF export failed:', err), { binary: false });
}

// onDone(message) lets the UI show a non-blocking toast instead of alert().
export function exportConfig(config, onDone) {
  const json = JSON.stringify(config, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    if (onDone) onDone('Configuration copiée dans le presse-papiers.');
  }).catch(() => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `vynkor-config-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    if (onDone) onDone('Presse-papiers indisponible : fichier JSON téléchargé à la place.');
  });
}

export function getCurrentConfig(state) {
  return {
    shape: state.currentShape,
    material: state.currentMaterialType,
    materialParams: state.materialParams,
    environment: state.currentEnv,
    scene: {
      backgroundColor: state.backgroundColor,
      groundEnabled: state.groundEnabled,
      groundOpacity: state.groundOpacity,
      gridEnabled: state.gridEnabled,
      fogEnabled: state.fogEnabled,
      fogColor: state.fogColor,
      fogDensity: state.fogDensity,
      particlesEnabled: state.particlesEnabled,
    },
    lights: {
      ambient: state.ambientIntensity,
      directional: {
        intensity: state.dirLightIntensity,
        position: state.dirLightPosition,
        color: state.dirLightColor,
      },
      fill: {
        intensity: state.fillLightIntensity,
        color: state.fillLightColor,
      },
      rim: {
        intensity: state.rimLightIntensity,
        color: state.rimLightColor,
      },
      shadows: state.shadowsEnabled,
    },
    postProcessing: {
      toneMapping: state.toneMapping,
      exposure: state.exposure,
      bloom: {
        enabled: state.bloomEnabled,
        strength: state.bloomStrength,
        threshold: state.bloomThreshold,
        radius: state.bloomRadius,
      },
      vignette: {
        enabled: state.vignetteEnabled,
        intensity: state.vignetteIntensity,
      },
      fxaa: state.fxaaEnabled,
    },
    camera: {
      position: state.camera.position.toArray(),
      target: state.controls.target.toArray(),
      fov: state.camera.fov,
    },
    ui: {
      accentColor: state.accentColor,
    },
  };
}