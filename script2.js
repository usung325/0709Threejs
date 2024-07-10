import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";


// Vertex shader remains the same
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 3.0);
  }
`;

// Updated fragment shader
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform float uSpeed;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    vec2 center = vec2(0.5, 0.5);
    float distanceFromCenter = length(uv - center);
    
    float ripple1 = sin(uFrequency * distanceFromCenter - uTime * uSpeed);
    float ripple2 = sin(uFrequency * 1.5 * distanceFromCenter - uTime * uSpeed * 1.2);
    
    float ripple = (ripple1 + ripple2) * 0.5;
    
    vec2 rippleOffset = normalize(uv - center) * ripple * uAmplitude;
    
    vec2 rippleUV = uv + rippleOffset;
    
    rippleUV = clamp(rippleUV, 0.0, 1.0);
    
    vec4 color = texture2D(uTexture, rippleUV);
    
    gl_FragColor = color;
  }
`;

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
// const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const camera = new THREE.PerspectiveCamera(45, 1/4, 0.1, 100); // fov angle, aspect ratio, min view dist, max view dist
camera.position.z = 3;
scene.add(camera);

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer( {canvas, alpha: true } );


//controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;

//renderer
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a plane geometry that fills the view
const geometry = new THREE.PlaneGeometry(2, 4);


// Load texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./static/im2.png');


// Create shader material with new uniforms
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: texture },
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uFrequency: { value: 10.0 },
    uAmplitude: { value: 0.05 },
    uSpeed: { value: 2.0 }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});

// Create mesh and add to scene
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Set up GUI
const gui = new GUI();
gui.add(material.uniforms.uFrequency, 'value', -10, 20).name('Frequency');
gui.add(material.uniforms.uAmplitude, 'value', -0.9, 0.1).name('Amplitude');
gui.add(material.uniforms.uSpeed, 'value', 0, 20).name('Speed');

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  
  // Update time uniform
  material.uniforms.uTime.value = time * 0.001; // Convert to seconds
  renderer.render(scene, camera);
}

const loop = () => {
    controls.update(0.01);
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
}
loop();
animate(0);

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

const tl = gsap.timeline({defaults: {duration: 1}});
tl.fromTo(mesh.scale, {z:0, x:0, y:0}, {z:1, x:1, y:1});
tl.fromTo('nav', {y:"500%"}, { y:"0%" });

