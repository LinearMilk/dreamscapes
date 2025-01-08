import * as THREE from "three";

// Scene, camera, renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb); // Light blue background
document.body.appendChild(renderer.domElement);

// Cube setup
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
scene.add(cube);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2;
plane.receiveShadow = true;
scene.add(plane);

camera.position.z = 5;

// Animation variables
let hue = 0;

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0005; // Time in seconds for smooth animation

  // Animate the cube's position
  cube.position.x = Math.sin(time) * 2; // Side-to-side motion
  cube.position.y = Math.abs(Math.sin(time * 2)) * 0.5 - 0.5; // Bounce effect

  // Animate the cube's rotation
  cube.rotation.x += 0.005;
  cube.rotation.y += 0.005;

  // Animate the cube's color
  hue += 0.001;
  if (hue > 1) hue = 0;
  const color = new THREE.Color(`hsl(${hue * 360}, 100%, 50%)`);
  cube.material.color = color;

  renderer.render(scene, camera);
}

animate();
