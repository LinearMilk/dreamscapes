import * as THREE from "three"; // Import Three.js core
import { setupCamera } from "./scripts/camera.js";
import { setupLighting } from "./scripts/lighting.js";
import { createHexGrid } from "./components/hexGrid.js";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb); // Set sky-like blue background
document.body.appendChild(renderer.domElement);

// Set up the camera
const { camera, controls } = setupCamera(renderer, scene);

// Set up lighting
setupLighting(scene);

// Create hex grid with thickness
function createThickHexGrid(gridRadius) {
  const hexGroup = createHexGrid(gridRadius, 0.3); // Adds thickness to hexes
  scene.add(hexGroup);
}
createThickHexGrid(5);

// Add the floating, color-changing cube
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 2, 0); // Position above the hex grid
cube.castShadow = true;
scene.add(cube);

let hue = 0; // Color animation variable

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Animate the cube's position and color
  cube.position.x = Math.sin(Date.now() * 0.001) * 2; // Horizontal movement
  cube.position.y = 2 + Math.abs(Math.sin(Date.now() * 0.002)) * 0.5; // Bounce
  hue += 0.01;
  if (hue > 1) hue = 0;
  cube.material.color.setHSL(hue, 1, 0.5); // Smooth color transitions

  controls.update(); // Smooth camera controls
  renderer.render(scene, camera);
}
animate();
