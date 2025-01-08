import * as THREE from "three";
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
const hexGroup = createHexGrid(5, 0.3); // Adds thickness to hexes
scene.add(hexGroup);

// Raycaster and mouse for interactivity
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null; // Tile currently hovered over
let SELECTED = null; // Tile currently selected

// Add event listeners for mouse movement and clicks
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("click", onClick);

function onMouseMove(event) {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
  if (INTERSECTED) {
    if (SELECTED === INTERSECTED) {
      // Deselect the tile if it's already selected
      SELECTED.material.emissive.set(0x000000); // Reset color
      SELECTED = null;
      console.log("Tile deselected");
    } else {
      // Deselect the currently selected tile (if any)
      if (SELECTED) {
        SELECTED.material.emissive.set(0x000000); // Reset color
      }
      // Select the new tile
      SELECTED = INTERSECTED;
      SELECTED.material.emissive.set(0xff8800); // Highlight selected tile
      console.log(`Tile selected at:`, SELECTED.position);
    }
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with hex tiles
  const intersects = raycaster.intersectObjects(hexGroup.children);

  if (intersects.length > 0) {
    const hoveredTile = intersects[0].object;

    // Handle hover state
    if (hoveredTile !== INTERSECTED) {
      if (INTERSECTED && INTERSECTED !== SELECTED) {
        INTERSECTED.material.emissive.set(0x000000); // Reset hover highlight
      }
      INTERSECTED = hoveredTile;
      if (INTERSECTED !== SELECTED) {
        INTERSECTED.material.emissive.set(0x333333); // Highlight hovered tile
      }
    }
  } else {
    // Reset hover highlight if nothing is hovered
    if (INTERSECTED && INTERSECTED !== SELECTED) {
      INTERSECTED.material.emissive.set(0x000000);
    }
    INTERSECTED = null;
  }

  controls.update(); // Smooth camera controls
  renderer.render(scene, camera);
}
animate();
