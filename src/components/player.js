import * as THREE from "three";
import { axialToCartesian } from "./hexGrid";

let playerPosition = { q: 0, r: 0 };

export function createPlayer() {
  // Body
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 6); // Low-poly cylinder
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcc3333 }); // Reddish color
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.5, 8, 8); // Low-poly sphere
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc }); // Gray-ish color
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 1.25, 0); // Place head above body

  // Group the parts together
  const playerGroup = new THREE.Group();
  playerGroup.add(body);
  playerGroup.add(head);

  // Set initial position (on the center tile)
  playerGroup.position.set(0, 0.5, 0); // Adjust based on your board layout

  // Enable shadows
  playerGroup.castShadow = true;
  playerGroup.receiveShadow = true;

  return playerGroup;
}

// Function to move the player
export function movePlayer(player, direction, hexGroup, radius) {
  const movementMap = {
    up: { q: 0, r: -1 },
    down: { q: 0, r: 1 },
    upRight: { q: 1, r: -1 },
    upLeft: { q: -1, r: 0 },
    downRight: { q: 1, r: 0 },
    downLeft: { q: -1, r: 1 },
  };

  const move = movementMap[direction];
  if (!move) return;

  const newQ = playerPosition.q + move.q;
  const newR = playerPosition.r + move.r;

  // Check if the target tile exists
  const { x, z } = axialToCartesian(newQ, newR, radius);
  const validTile = hexGroup.children.some(
    (tile) =>
      Math.abs(tile.position.x - x) < 0.1 && Math.abs(tile.position.z - z) < 0.1
  );

  if (validTile) {
    playerPosition.q = newQ;
    playerPosition.r = newR;
    player.position.set(x, 0.5, z);
  } else {
    console.log("Invalid move");
  }
}
