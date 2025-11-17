window.addEventListener('DOMContentLoaded', async () => {

  const video = document.getElementById('webcam');
  const zoomDisplay = document.getElementById('zoomLevel');

  // ================== カメラ起動 ==================
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = stream;

  // ================== ズーム管理 ==================
  let zoom = 1;      // 現在の倍率
  let lastZoom = 1;  // ピンチ操作用
  const maxZoom = 40;

  // タップで倍率段階切替（1→2→5→10→20→40→1）
  const zoomSteps = [1, 2, 5, 10, 20, 40];
  video.addEventListener('click', () => {
    const idx = zoomSteps.findIndex(z => z > zoom);
    zoom = idx === -1 ? 1 : zoomSteps[idx];
    video.style.transform = `scale(${zoom})`;
    zoomDisplay.textContent = zoom + 'x';
  });

  // ================== ピンチ操作（Hammer.js使用） ==================
  const hammer = new Hammer(video);
  hammer.get('pinch').set({ enable:true });

  hammer.on('pinchstart', (e) => { lastZoom = zoom; });

  hammer.on('pinchmove', (e) => {
    zoom = Math.min(maxZoom, Math.max(1, lastZoom * e.scale));
    video.style.transform = `scale(${zoom})`;
    zoomDisplay.textContent = Math.round(zoom) + 'x';
  });

});
