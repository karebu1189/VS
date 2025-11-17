// Three.js初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 魔法（簡単なパーティクル球）
function createMagic(color='red') {
  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color });
  const magic = new THREE.Mesh(geometry, material);
  scene.add(magic);
  return magic;
}

// カメラ映像
const videoElement = document.getElementById('webcam');
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { videoElement.srcObject = stream; });

// MediaPipe Hands 初期化
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({maxNumHands:1, minDetectionConfidence:0.7});
hands.onResults(onResults);

// カメラ入力
const cameraUtils = new Camera(videoElement, { onFrame: async () => { await hands.send({image: videoElement}); }, width:640, height:480 });
cameraUtils.start();

// 魔法配列
let magics = [];

// 手のランドマーク検出時
function onResults(results) {
  if (!results.multiHandLandmarks) return;
  const landmarks = results.multiHandLandmarks[0];

  // 指1本（人差し指だけ）を検出して火魔法発動
  const indexFinger = landmarks[8];
  const middleFinger = landmarks[12];
  const thumb = landmarks[4];
  
  const isIndexUp = indexFinger.y < landmarks[6].y; // 人差し指上
  const isMiddleDown = middleFinger.y > landmarks[10].y; // 中指下
  if (isIndexUp && isMiddleDown) {
    // 魔法生成
    const magic = createMagic('red');
    magic.position.set(indexFinger.x*5-2.5, -indexFinger.y*5+2.5, -1);
    magics.push(magic);
  }
}

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);

  // 魔法を手前から奥へ移動
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
