import * as THREE from 'three';
import './app.css';
//scene
const scene = new THREE.Scene();

const geometry = new THREE.SphereGeometry(3,64, 64);
const material = new THREE.MeshStandardMaterial({
    color: '#00ff83',
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);


//Sizes
const sizes = {
    width:window.innerWidth,
    height: window.innerHeight,
}

//light
const light = new THREE.PointLight(0xffffff, 200, 100);
light.position.set(0, 8, 10);
scene.add(light);

//camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100); // fov angle, aspect ratio, min view dist, max view dist
camera.position.z = 30;
scene.add(camera);


//renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({canvas});

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);




//resize
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    renderer.setSize(sizes.width, sizes.height);
});

const loop = () => {
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
}
loop();