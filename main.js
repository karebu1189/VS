window.addEventListener('DOMContentLoaded', async () => {

  const video = document.getElementById('webcam');

  // ================== カメラ起動 ==================
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = stream;

  // ================== ズーム管理 ==================
  let zoom = 1;      // 現在の倍率
  let lastZoom = 1;  // ピンチ操作用

  // タップで倍率段階切替
  video.addEventListener('click', () => {
    zoom += 0.5;
    if (zoom > 3) zoom = 1;
    video.style.transform = `scale(${zoom})`;
  });

  // ================== ピンチ操作（Hammer.js使用） ==================
  const hammer = new Hammer(video);
  hammer.get('pinch').set({ enable:true });

  hammer.on('pinchstart', (e) => {
    lastZoom = zoom;
  });

  hammer.on('pinchmove', (e) => {
    zoom = Math.min(3, Math.max(1, lastZoom * e.scale));
    video.style.transform = `scale(${zoom})`;
  });

});
