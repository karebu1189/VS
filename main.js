window.addEventListener('DOMContentLoaded', async () => {

  // ================== Three.js 初期化 ==================
  const scene = new THREE.Scene();
  const camera3D = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera3D.position.z = 5;
  const renderer = new THREE.WebGLRenderer({ alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // ================== カメラ設定 ==================
  const videoElement = document.getElementById('webcam');
  let currentFacing = 'user';

  async function startCamera(facing){
    if(videoElement.srcObject){
      videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:facing } });
    videoElement.srcObject = stream;
  }

  document.getElementById('switchCamera').addEventListener('click', ()=>{
    currentFacing = currentFacing === 'user' ? 'environment' : 'user';
    startCamera(currentFacing);
  });

  startCamera(currentFacing);

  // ================== 魔法配列 ==================
  let magics = [];
  let magicCircles = [];

  // ================== 魔法作成関数 ==================
  function createMagic(){
    console.log("魔法生成"); // デバッグ

    // 魔法球
    const geometry = new THREE.SphereGeometry(0.3,32,32); // 大きくした
    const material = new THREE.MeshBasicMaterial({ color:0xff0000 });
    const magic = new THREE.Mesh(geometry, material);
    magic.position.set(0,0,-1); // カメラ前方に表示
    scene.add(magic);
    magics.push(magic);

    // 魔法陣
    const textureLoader = new THREE.TextureLoader();
    const circleTexture = textureLoader.load('https://i.imgur.com/TQd2E9n.png'); // 仮画像
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7,0.7),
      new THREE.MeshBasicMaterial({ map:circleTexture, transparent:true })
    );
    plane.position.set(0,-0.25,-1); // 魔法球の下
    plane.rotation.x = -Math.PI/2;
    plane.scale.set(0.1,0.1,0.1);
    scene.add(plane);
    magicCircles.push({mesh:plane, scale:0.1});
  }

  document.getElementById('fireMagic').addEventListener('click', createMagic);

  // ================== アニメーションループ ==================
  function animate(){
    requestAnimationFrame(animate);

    // 魔法球移動
    magics.forEach((m,i)=>{
      m.position.z -= 0.1;
      if(m.position.z < -5){
        scene.remove(m);
        magics.splice(i,1);
      }
    });

    // 魔法陣アニメーション
    magicCircles.forEach((mc,i)=>{
      mc.scale += 0.05;
      mc.mesh.scale.set(mc.scale,mc.scale,mc.scale);
      mc.mesh.material.opacity = 1 - mc.scale;
      if(mc.scale>=1){
        scene.remove(mc.mesh);
        magicCircles.splice(i,1);
      }
    });

    renderer.render(scene,camera3D);
  }
  animate();

  window.addEventListener('resize',()=>{
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

});
