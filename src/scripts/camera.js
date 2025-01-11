import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function setupCamera(renderer, scene) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.target.set(0, 0, 0);
  controls.update();

  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);
  // Restrict camera height
  controls.addEventListener("change", () => {
    camera.position.y = Math.max(10, camera.position.y); // Minimum height is 10
    camera.position.y = Math.min(100, camera.position.y); // Maximum height is 100
  });
  controls.maxPolarAngle = Math.PI / 2; // Prevent camera from tilting below the ground
  // controls.minPolarAngle = Math.PI / 4; // Prevent camera from tilting too high
  return { camera, controls };
}
