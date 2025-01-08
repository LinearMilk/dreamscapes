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
    const { x, z } = axialToCartesian(q, r, radius); // Snap to exact Cartesian position
    hex.position.set(x, -0.15, z); // Adjust Y position as necessary
    existingHexes.add(key); // Track the axial coordinate
    hexGroup.add(hex);
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

    // Get the axial coordinates of the clicked tile
    const { q, r } = cartesianToAxial(
      clickedTile.position.x,
      clickedTile.position.z,
      radius
    );

    // Get neighbors and place new tiles
    const neighbors = getNeighborPositions(q, r);
    neighbors.forEach(({ q: neighborQ, r: neighborR }) => {
      if (!doesHexExist(neighborQ, neighborR)) {
        const biome = getBiomeFromNoise(neighborQ, neighborR); // Adjust biome logic as needed
        const newHex = createHexTile(0, 0, 0.3, biome); // Create the hex (position set later)
        addHexToGroup(neighborQ, neighborR, newHex); // Add and snap to correct position
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
