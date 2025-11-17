// ================== Three.js 初期化 ==================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 魔法作成関数
function createMagic(color='red') {
  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  const magic = new THREE.Mesh(geometry, material);
  scene.add(magic);
  return magic;
}

// ================== カメラ設定 ==================
const videoElement = document.getElementById('webcam');
let currentFacing = 'user'; // 前面カメラ

async function startCamera(facing) {
  if(videoElement.srcObject){
    videoElement.srcObject.getTracks().forEach(track => track.stop());
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
  videoElement.srcObject = stream;
}

// ボタンでカメラ切替
document.getElementById('switchCamera').addEventListener('click', () => {
  currentFacing = currentFacing === 'user' ? 'environment' : 'user';
  startCamera(currentFacing);
});

// 初期カメラ起動
startCamera(currentFacing);

// ================== MediaPipe Hands ==================
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({maxNumHands:1, minDetectionConfidence:0.7});
hands.onResults(onResults);

// MediaPipe カメラ入力
const cameraUtils = new Camera(videoElement, { onFrame: async () => { await hands.send({image: videoElement}); }, width:640, height:480 });
cameraUtils.start();

// ================== 魔法配列 ==================
let magics = [];

// 手検出時
function onResults(results) {
  if (!results.multiHandLandmarks) return;
  const landmarks = results.multiHandLandmarks[0];

  const indexFinger = landmarks[8];
  const middleFinger = landmarks[12];

  const isIndexUp = indexFinger.y < landmarks[6].y;
  const isMiddleDown = middleFinger.y > landmarks[10].y;

  if (isIndexUp && isMiddleDown) {
    const magic = createMagic('red');
    magic.position.set(indexFinger.x*5-2.5, -indexFinger.y*5+2.5, -1);
    magics.push(magic);
  }
}

// ================== アニメーションループ ==================
function animate() {
  requestAnimationFrame(animate);

  // 魔法を前方に移動
  magics.forEach((m, i) => {
    m.position.z -= 0.1;
    if (m.position.z < -5) {
      scene.remove(m);
      magics.splice(i, 1);
    }
  });

  renderer.render(scene, camera);
}
animate();
