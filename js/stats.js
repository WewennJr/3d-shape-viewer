// stats.js - Performance monitoring
let lastTime = performance.now();
let frames = 0;
let fps = 60;

export function updateStats(renderer, scene) {
  const now = performance.now();
  frames++;
  
  if (now - lastTime >= 1000) {
    fps = Math.round(frames * 1000 / (now - lastTime));
    frames = 0;
    lastTime = now;
  }
  
  // Update DOM
  const fpsEl = document.getElementById('stat-fps');
  const trisEl = document.getElementById('stat-tris');
  const drawsEl = document.getElementById('stat-draws');
  const memEl = document.getElementById('stat-mem');
  
  if (fpsEl) fpsEl.textContent = fps;
  if (trisEl) trisEl.textContent = renderer.info.render.triangles.toLocaleString();
  if (drawsEl) drawsEl.textContent = renderer.info.render.calls.toLocaleString();
  if (memEl) {
    const memory = renderer.info.memory;
    const geoms = memory.geometries;
    const textures = memory.textures;
    memEl.textContent = `${((geoms + textures) * 64 / 1024 / 1024).toFixed(1)} MB`;
  }
}

export function getFPS() {
  return fps;
}