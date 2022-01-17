import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/DRACOLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/libs/lil-gui.module.min.js';
import { TeapotGeometry } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/TeapotGeometry.js';
import { nodeFrame } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/webgl/nodes/WebGLNodes.js';
import * as Nodes from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/nodes/Nodes.js';
import {GLTFExporter} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/exporters/GLTFExporter.js'
let camera, scene, renderer, stats;

init();
animate();
function init() {

	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 2, 2000 );
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = - 300;

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

	// geometries

	const teapotGeometry = new TeapotGeometry( 50, 7 );
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

	const fireMap = new THREE.TextureLoader().load( 'models/firetorch.jpg' );

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
	scene.add( particles );



	// renderer

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// stats

	stats = new Stats();
	document.body.appendChild( stats.dom );

	// gui

	const gui = new GUI();
	const guiNode = { lerpPosition: 0 };

	gui.add( material, 'sizeAttenuation' ).onChange( function () {

		material.needsUpdate = true;

	} );

	gui.add( guiNode, 'lerpPosition', 0, 1 ).onChange( function () {

		lerpPosition.value = guiNode.lerpPosition;

	} );

	gui.open();

	// controls

	const controls = new OrbitControls( camera, renderer.domElement );
	controls.maxDistance = 1000;
	controls.update();

	// events

	window.addEventListener( 'resize', onWindowResize );

	

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	nodeFrame.update();

	renderer.render( scene, camera );

}