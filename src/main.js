import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/libs/stats.module.js';
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import VERTEX from '../material/vertex.glsl'
import FRAGMENT from '../material/fragment.glsl'
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
  model.position.set( 0,0,0 );
  model.scale.set( 0.3, 0.3, 0.3 );
  scene.add( model );

}, undefined, function ( e ) {

  console.error( e );

} );


// function animate() {
//   requestAnimationFrame( animate );
//   renderer.render( scene, camera );
// };


var ambientlight = new THREE.AmbientLight( 0x666655 );
scene.add( ambientlight );

var pointlight = new THREE.PointLight( 0xff9933, 1, 1.5 );
pointlight.position.set( 0, 1, 0 );
scene.add( pointlight );

var textureLoader = new THREE.TextureLoader();
var groundColor = textureLoader.load( '../image/groundcolor.jpg' );
groundColor.wrapS = groundColor.wrapT = THREE.RepeatWrapping;
groundColor.repeat.set( 6, 6 );
var groundNormal = textureLoader.load( '../image/groundnormal.jpg' );
groundColor.wrapS = groundColor.wrapT = THREE.RepeatWrapping;
groundColor.repeat.set( 6, 6 );


var ground = new THREE.Mesh(
  new THREE.PlaneBufferGeometry( 10, 10 ),
  new THREE.MeshPhongMaterial( {
    map: groundColor,
    normalMap: groundNormal,
    normalScale: new THREE.Vector2( 0.8, 0.8 ),
  } )
);

ground.rotation.x = Math.PI / -2;
ground.position.set( -3, 0.9, -0.5 );
ground.scale.set( 0.15, 0.15, 0.15 );

scene.add( ground );

// Load a glTF resource
loader.load(
	// resource URL
	'../models/fireplace/model2.gltf',
	// called when the resource is loaded
	function ( gltf ) {
    const fireplace = gltf.scene
    fireplace.position.set( -3, 0.9, -0.5 );
    fireplace.scale.set( 1, 1, 1 );

		scene.add( fireplace );

	

	},
	// called when loading has errors
	function ( error ) {

		console.log( `Fireplace load error:${error}` );

	}
);


const createSparks = (count) => {
  const vector = new THREE.Vector4();

  const positions = [];
  const directions = [];
  const offsets = [];
  const colors = [];
  const orientationsStart = [];
	const orientationsEnd = [];
  const verticesCount = count * 3;

  for (let i = 0; i < count; i += 1) {
      const direction = [
          Math.random() - 0.5,
          (Math.random() + 0.3),
          Math.random() - 0.5];
      const offset = Math.random() * Math.PI;

      const xFactor = 1;
      const zFactor = 1;

      for (let j = 0; j < 3; j += 1) {
          const x = Math.random() - 0.5;
          const y = Math.random() - 0.2;
          const z = Math.random() - 0.5;

          positions.push(x, y, z);
          directions.push(...direction);
          offsets.push(offset);
          
      }
      colors.push( Math.random(), Math.random(), Math.random(), Math.random() );
      

  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('direction', new THREE.Float32BufferAttribute(directions, 3));
  geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 1));
  geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( colors ), 4 ) );

  return geometry;
};
const size = 0.5
const material = new THREE.RawShaderMaterial({
  uniforms: {
      time: { value: 0.0 },
      size: { value: 0.5 },
      yMax: { value: 0.3 + Math.PI * size },
  },
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT,
  side: THREE.DoubleSide,
  transparent: true,
});



const geometry = createSparks(500);
const mesh = new THREE.Mesh(geometry, material);


mesh.position.set( -3.0, 0.9, -0.5 );
mesh.rotation.set(0,180,0)
console.log(mesh)
scene.add( mesh );
// animate();


function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  const time = performance.now();

  const object = scene.children[ 3 ];

  object.rotation.y = time * 0.0005;
  object.material.uniforms[ "time" ].value = time * 0.0005;

  renderer.render( scene, camera );

}
animate();

//84CB76D4-A98C-4F92-8257-21E77F907E4A
