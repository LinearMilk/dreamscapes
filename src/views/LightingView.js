import * as THREE from "three";

export function setupLighting(scene) {
  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // Directional light to simulate sunlight
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;

  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;

  scene.add(directionalLight);

  // Optional: Helper to visualize the light's direction
  // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
  // scene.add(lightHelper);
}
