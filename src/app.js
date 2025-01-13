// app.js
import * as THREE from "three";
import { WEBGL } from "./utils/webgl.js";
import { setupCamera } from "./views/CameraView.js";
import { setupLighting } from "./views/LightingView.js";
import { GameController } from "./controllers/GameController.js";

if (!WEBGL.isWebGLAvailable()) {
  const warning = WEBGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}

// Create the main scene and renderer
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb);
document.body.appendChild(renderer.domElement);

// Setup camera and controls
const { camera, controls } = setupCamera(renderer, scene);

// Setup lighting
setupLighting(scene);

// Initialize GameController
const gameController = new GameController(scene, camera);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Update camera controls
  renderer.render(scene, camera);
}
animate();
