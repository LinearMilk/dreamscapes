import * as THREE from "three";
import { WEBGL } from "./utils/webgl.js";
import { setupCamera } from "./scripts/camera.js";
import { setupLighting } from "./scripts/lighting.js";
import {
  createPlayer,
  movePlayerRelativeToCamera,
} from "./components/player.js";
import {
  radius,
  createHexGrid,
  createHexTile,
  getBiomeFromNoise,
  axialToCartesian,
  cartesianToAxial,
  initializeSeed,
} from "./components/hexGrid.js";

if (!WEBGL.isWebGLAvailable()) {
  const warning = WEBGL.getWebGLErrorMessage();
  document.body.appendChild(warning);
}
// Define the seed (can be hardcoded, user-defined, or generated randomly)
const seed = "my-custom-seed"; // Replace with a user-provided string or random generation

// Initialize the seed for procedural generation
initializeSeed(seed);

// Log the seed for debugging or reproducibility
console.log(`Using seed: ${seed}`);
const scene = new THREE.Scene();
let player;
player = createPlayer();
scene.add(player);
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

    // Get neighbors and generate new hexes
    const neighbors = getNeighborPositions(q, r); // Get axial neighbors

    neighbors.forEach(({ q: neighborQ, r: neighborR }) => {
      if (!doesHexExist(neighborQ, neighborR)) {
        // Convert axial coordinates to Cartesian
        const { x, z } = axialToCartesian(neighborQ, neighborR, radius);

        // Determine the biome for the new hex
        const biome = getBiomeFromNoise(neighborQ, neighborR);

        // Create the new hex with axial coordinates
        const newHex = createHexTile(x, z, 0.3, biome, neighborQ, neighborR);

        // Add the new hex to the scene and track it
        hexGroup.add(newHex);
        addHexToGroup(neighborQ, neighborR, newHex); // Track in axial space
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

window.addEventListener("keydown", (event) => {
  const directionMap = {
    w: "forward",
    s: "backward",
    a: "left",
    d: "right",
    ArrowUp: "forward",
    ArrowDown: "backward",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  const direction = directionMap[event.key];
  if (direction) {
    movePlayerRelativeToCamera(player, direction, camera, hexGroup, 1);
  }
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
