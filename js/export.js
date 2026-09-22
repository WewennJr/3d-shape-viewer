// export.js - Export functionality (screenshot, GLTF, JSON)
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function exportPNG(renderer, scene, camera, multiplier = 1) {
  const width = window.innerWidth * multiplier;
  const height = window.innerHeight * multiplier;
  
  const originalSize = renderer.getSize(new THREE.Vector2());
  const originalPixelRatio = renderer.getPixelRatio();
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(1);
  renderer.render(scene, camera);
  
  const dataURL = renderer.domElement.toDataURL('image/png');
  
  renderer.setSize(originalSize.width, originalSize.height);
  renderer.setPixelRatio(originalPixelRatio);
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
  }, { binary: false });
}

export function exportConfig(config) {
  const json = JSON.stringify(config, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert('Configuration copiée dans le presse-papiers !');
  }).catch(() => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `vynkor-config-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });
}

export function getCurrentConfig(state) {
  return {
    shape: state.currentShape,
    material: state.currentMaterialType,
    materialParams: state.materialParams,
    environment: state.currentEnv,
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
    },
  };
}