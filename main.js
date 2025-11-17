window.addEventListener('DOMContentLoaded', async () => {

  // ================== Three.js 初期化 ==================
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 1;
  const renderer = new THREE.WebGLRenderer({ alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // ================== ビデオストリーム ==================
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;

  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = stream;

  // ================== ビデオテクスチャ ==================
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter; // 滑らか補間
  videoTexture.magFilter = THREE.LinearFilter;

  const geometry = new THREE.PlaneGeometry(2, 2 * (window.innerHeight/window.innerWidth));
  const material = new THREE.MeshBasicMaterial({ map: videoTexture });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // ================== ズーム管理 ==================
  let zoom = 1;
  let lastZoom = 1;
  const maxZoom = 20;
  const zoomDisplay = document.getElementById('zoomLevel');

  // タップで段階ズーム
  const zoomSteps = [1, 2, 5, 10, 20];
  renderer.domElement.addEventListener('click', () => {
    const idx = zoomSteps.findIndex(z => z > zoom);
    zoom = idx === -1 ? 1 : zoomSteps[idx];
    plane.scale.set(zoom, zoom, 1);
    zoomDisplay.textContent = zoom + 'x';
  });

  // ピンチ操作
  const hammer = new Hammer(renderer.domElement);
  hammer.get('pinch').set({ enable:true });
  hammer.on('pinchstart', () => { lastZoom = zoom; });
  hammer.on('pinchmove', (e) => {
    zoom = Math.min(maxZoom, Math.max(1, lastZoom * e.scale));
    plane.scale.set(zoom, zoom, 1);
    zoomDisplay.textContent = Math.round(zoom) + 'x';
  });

  // ================== アニメーション ==================
  function animate(){
    requestAnimationFrame(animate);
    if(video.readyState >= video.HAVE_CURRENT_DATA){
      videoTexture.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

});
