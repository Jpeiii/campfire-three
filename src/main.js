import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js";
import Stats from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/libs/stats.module.js";
import { RoomEnvironment } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";
import VERTEX from "../material/vertex.glsl";
import FRAGMENT from "../material/fragment.glsl";

let mixer;

const container = document.getElementById("container");

const stats = new Stats();
container.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3dd);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  1,
  100
);
camera.position.set(0, 1, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("gltf/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load(
  "models/fire-candle.glb",
  function (gltf) {
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(0.3, 0.3, 0.3);
    model.rotation.set(0, 180, 0);

    scene.add(model);
  },
  undefined,
  function (e) {
    console.error(e);
  }
);

var flameMaterials = [];
let flameGeo = new THREE.SphereBufferGeometry(0.5, 32, 32);
flameGeo.translate(0, 0.5, 0);
let flameMat = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
  },
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT,
  transparent: true,
});
flameMaterials.push(flameMat);
for (let i = 0; i < 100; i++) {
  let object = `flame_${i}`;
  object = new THREE.Mesh(flameGeo, flameMat);

  object.rotation.y = THREE.Math.degToRad(-45);
  let x_position = i / 4;
  object.position.set(x_position, 0.625, 0.12);
  object.scale.set(0.03, 0.03, 0.03);

  scene.add(object);
}
// flame.position.set(0.06, 1.2, 0.06);

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}
const clock = new THREE.Clock();
var time = 0;
function render() {
  time += clock.getDelta();
  for (let i = 0; i < 100; i++) {
    const object = scene.children[i];
    object.material.uniforms["time"].value = time;
  }
  renderer.render(scene, camera);
}
animate();
