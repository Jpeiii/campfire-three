import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/libs/stats.module.js';
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

let mixer;

const clock = new THREE.Clock();
const container = document.getElementById( 'container' );

const stats = new Stats();
container.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild( renderer.domElement );

const pmremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 100 );
camera.position.set( 2, 1, 5 );


const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'gltf/' );
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );
loader.load( 'models/fire-candle.glb', function ( gltf ) {

  const model = gltf.scene;
  model.position.set( 1.5,0.5, -1 );
  model.scale.set( 0.3, 0.3, 0.3 );
  scene.add( model );



  animate();

}, undefined, function ( e ) {

  console.error( e );

} );


function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
};

