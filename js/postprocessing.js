// postprocessing.js - Post-processing effects (bloom, tone mapping, etc.)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

let composer = null;
let bloomPass = null;
let fxaaPass = null;
let vignettePass = null;

const vignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.3 },
    smoothness: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float smoothness;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 center = vUv - 0.5;
      float dist = length(center) * 2.0;
      float vignette = smoothstep(1.0, smoothness, dist) * intensity;
      color.rgb = mix(color.rgb, color.rgb * (1.0 - vignette), vignette);
      gl_FragColor = color;
    }
  `,
};

export function createComposer(renderer, scene, camera) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // Bloom pass
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  bloomPass.enabled = false;
  composer.addPass(bloomPass);

  // FXAA pass
  fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  fxaaPass.enabled = false;
  composer.addPass(fxaaPass);

  // Vignette pass
  vignettePass = new ShaderPass(vignetteShader);
  vignettePass.enabled = false;
  composer.addPass(vignettePass);

  return composer;
}

export function getComposer() {
  return composer;
}

export function setToneMapping(type, exposure) {
  const toneMappingMap = {
    none: THREE.NoToneMapping,
    linear: THREE.LinearToneMapping,
    reinhard: THREE.ReinhardToneMapping,
    cineon: THREE.CineonToneMapping,
    aces: THREE.ACESFilmicToneMapping,
  };
  
  if (composer) {
    composer.renderTarget1.texture.toneMapping = toneMappingMap[type] || THREE.ACESFilmicToneMapping;
    composer.renderTarget2.texture.toneMapping = toneMappingMap[type] || THREE.ACESFilmicToneMapping;
  }
}

export function setExposure(value) {
  if (composer) {
    composer.renderTarget1.texture.toneMappingExposure = value;
    composer.renderTarget2.texture.toneMappingExposure = value;
  }
}

export function setBloomEnabled(enabled) {
  if (bloomPass) bloomPass.enabled = enabled;
}

export function setBloomStrength(value) {
  if (bloomPass) bloomPass.strength = value;
}

export function setBloomThreshold(value) {
  if (bloomPass) bloomPass.threshold = value;
}

export function setBloomRadius(value) {
  if (bloomPass) bloomPass.radius = value;
}

export function setVignetteEnabled(enabled) {
  if (vignettePass) vignettePass.enabled = enabled;
}

export function setVignetteIntensity(value) {
  if (vignettePass) vignettePass.uniforms.intensity.value = value;
}

export function setFXAAEnabled(enabled) {
  if (fxaaPass) fxaaPass.enabled = enabled;
}

export function resizeComposer(width, height) {
  if (composer) {
    composer.setSize(width, height);
    if (bloomPass) {
      bloomPass.renderTargetX.setSize(width, height);
      bloomPass.renderTargetY.setSize(width, height);
    }
    if (fxaaPass) {
      fxaaPass.material.uniforms['resolution'].value.set(1 / width, 1 / height);
    }
  }
}

export function disposeComposer() {
  if (composer) {
    composer.dispose();
    composer = null;
  }
}