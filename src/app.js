import * as THREE from "three";
import { WEBGL } from "./utils/webgl.js";
import { setupCamera } from "./scripts/camera.js";
import { setupLighting } from "./scripts/lighting.js";
import {
  radius,
  createHexGrid,
  createHexTile,
  getBiomeFromNoise,
  axialToCartesian,
  cartesianToAxial,
} from "./components/hexGrid.js";

if (!WEBGL.isWebGLAvailable()) {
  const warning = WEBGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb);
document.body.appendChild(renderer.domElement);

const { camera, controls } = setupCamera(renderer, scene);
setupLighting(scene);

const hexGroup = createHexGrid(5, 0.3); // Initial grid
scene.add(hexGroup);

const existingHexes = new Set(); // Track axial coordinates of hexes

// Populate `existingHexes` with initial grid
hexGroup.children.forEach((hex) => {
  const { q, r } = cartesianToAxial(hex.position.x, hex.position.z, radius);
  existingHexes.add(`${q},${r}`);
});

function addHexToGroup(q, r, hex) {
  const key = `${q},${r}`;
  if (!existingHexes.has(key)) {
    existingHexes.add(key); // Track axial position
    hexGroup.add(hex); // Add hex to scene
  }
}

function doesHexExist(q, r) {
  return existingHexes.has(`${q},${r}`);
}

function getNeighborPositions(q, r) {
  const neighbors = [
    { q: q + 1, r: r }, // Right
    { q: q - 1, r: r }, // Left
    { q: q, r: r + 1 }, // Top-right
    { q: q - 1, r: r + 1 }, // Top-left
    { q: q, r: r - 1 }, // Bottom-right
    { q: q + 1, r: r - 1 }, // Bottom-left
  ];
  return neighbors;
}

function onClick() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hexGroup.children);

  if (intersects.length > 0) {
    const clickedTile = intersects[0].object;
    console.log("Tile clicked at:", clickedTile.position);

    const { q, r } = cartesianToAxial(
      clickedTile.position.x,
      clickedTile.position.z,
      radius
    );
    const neighbors = getNeighborPositions(q, r);

    neighbors.forEach(({ q, r }) => {
      if (!doesHexExist(q, r)) {
        const { x, z } = axialToCartesian(q, r, radius);
        const biome = getBiomeFromNoise(x, z);
        const newHex = createHexTile(x, z, 0.3, biome);
        addHexToGroup(q, r, newHex);
      }
    });
  }
}

window.addEventListener("mousemove", onMouseMove);
window.addEventListener("click", onClick);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
