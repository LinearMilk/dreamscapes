import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function setupCamera(renderer, scene) {
  const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.target.set(0, 0, 0); // Focus on origin
  controls.update();

  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);

  // Restrict vertical movement
  controls.addEventListener("change", () => {
    camera.position.y = Math.max(10, camera.position.y); // Minimum height
    camera.position.y = Math.min(100, camera.position.y); // Maximum height
  });

  controls.maxPolarAngle = Math.PI / 2; // Prevent tilting below ground

  return { camera, controls };
}
