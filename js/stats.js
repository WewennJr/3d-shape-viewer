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
    let memMB = 0;
    if (renderer.info.memory) {
      // Try different memory properties for different Three.js versions
      const mem = renderer.info.memory;
      if (mem.geometries !== undefined && mem.textures !== undefined) {
        memMB = ((mem.geometries + mem.textures) * 64 / 1024 / 1024);
      } else if (mem.used !== undefined) {
        memMB = mem.used / 1024 / 1024;
      }
    }
    // Fallback: estimate from JS heap
    if (memMB === 0 && performance.memory) {
      memMB = performance.memory.usedJSHeapSize / 1024 / 1024;
    }
    memEl.textContent = `${memMB.toFixed(1)} MB`;
  }
}

export function getFPS() {
  return fps;
}