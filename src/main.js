import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/libs/stats.module.js';
import { RoomEnvironment } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { TeapotGeometry } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/TeapotGeometry.js';
import * as Nodes from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/nodes/Nodes.js';
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


function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
};


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

const teapotGeometry = new TeapotGeometry( 10, 10 );
const sphereGeometry = new THREE.SphereGeometry( 50, 130, 16 );

const geometry = new THREE.BufferGeometry();

// buffers

const speed = [];
const intensity = [];
const size = [];

const positionAttribute = teapotGeometry.getAttribute( 'position' );
const particleCount = positionAttribute.count;

for ( let i = 0; i < particleCount; i ++ ) {

  speed.push( 20 + Math.random() * 50 );

  intensity.push( Math.random() * .15 );

  size.push( 30 + Math.random() * 230 );

}

geometry.setAttribute( 'position', positionAttribute );
geometry.setAttribute( 'targetPosition', sphereGeometry.getAttribute( 'position' ) );
geometry.setAttribute( 'particleSpeed', new THREE.Float32BufferAttribute( speed, 1 ) );
geometry.setAttribute( 'particleIntensity', new THREE.Float32BufferAttribute( intensity, 1 ) );
geometry.setAttribute( 'particleSize', new THREE.Float32BufferAttribute( size, 1 ) );

// maps

// Forked from: https://answers.unrealengine.com/questions/143267/emergency-need-help-with-fire-fx-weird-loop.html

const fireMap = new THREE.TextureLoader().load( '../image/firetorch_1.jpg' );

// nodes

const targetPosition = new Nodes.AttributeNode( 'targetPosition', 'vec3' );
const particleSpeed = new Nodes.AttributeNode( 'particleSpeed', 'float' );
const particleIntensity = new Nodes.AttributeNode( 'particleIntensity', 'float' );
const particleSize = new Nodes.AttributeNode( 'particleSize', 'float' );

const time = new Nodes.TimerNode();

const spriteSheetCount = new Nodes.Vector2Node( new THREE.Vector2( 6, 6 ) ).setConst( true );

const fireUV = new Nodes.SpriteSheetUVNode( 
  spriteSheetCount, // count
  new Nodes.PointUVNode(), // uv
  new Nodes.OperatorNode( '*', time, particleSpeed ) // current frame
);

const fireSprite = new Nodes.TextureNode( fireMap, fireUV );
const fire = new Nodes.OperatorNode( '*', fireSprite, particleIntensity );

const lerpPosition = new Nodes.FloatNode( 0 );

const positionNode = new Nodes.MathNode( Nodes.MathNode.MIX, new Nodes.PositionNode( Nodes.PositionNode.LOCAL ), targetPosition, lerpPosition );

// material

const material = new Nodes.PointsNodeMaterial( {
  depthWrite: false,
  transparent: true,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending
} );

material.colorNode = fire;
material.sizeNode = particleSize;
material.positionNode = positionNode;

const particles = new THREE.Points( geometry, material );
particles.position.set( -3, 0.9, -0.5 );
particles.scale.set( 0.001, 0.001, 0.001 );
scene.add( particles );

// gui


animate();


