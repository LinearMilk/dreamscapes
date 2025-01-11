import * as THREE from "three";
import {
  axialToCartesian,
  cartesianToAxial,
  isValidTile,
  checkProximityAndExpand,
} from "./hexGrid";

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

  // Initial axial coordinates
  playerGroup.position.q = 0; // Axial q
  playerGroup.position.r = 0; // Axial r

  playerGroup.position.set(0, 0.5, 0); // Cartesian position
  playerGroup.castShadow = true;
  playerGroup.receiveShadow = true;

  return playerGroup;
}
// Move the player relative to the camera
export function movePlayerRelativeToCamera(
  player,
  direction,
  camera,
  hexGroup,
  radius
) {
  const movementMap = {
    forward: new THREE.Vector3(0, 0, -1),
    backward: new THREE.Vector3(0, 0, 1),
    left: new THREE.Vector3(-1, 0, 0),
    right: new THREE.Vector3(1, 0, 0),
  };

  const movementDirection = movementMap[direction];
  if (!movementDirection) {
    console.error(`Invalid direction: ${direction}`);
    return;
  }

  const adjustedDirection = movementDirection.clone();
  adjustedDirection.applyQuaternion(camera.quaternion);
  adjustedDirection.y = 0; // Ignore vertical rotation
  adjustedDirection.normalize();

  const targetPosition = new THREE.Vector3(
    player.position.x,
    0,
    player.position.z
  ).add(adjustedDirection);

  const { q: newQ, r: newR } = cartesianToAxial(
    targetPosition.x,
    targetPosition.z,
    radius
  );

  if (isValidTile(newQ, newR, hexGroup, radius)) {
    const { x, z } = axialToCartesian(newQ, newR, radius);
    player.position.set(x, 0.5, z);
    player.userData.axial = { q: newQ, r: newR };

    // Check if expansion is needed
    checkProximityAndExpand(player, hexGroup, radius);
  } else {
    console.log("Invalid move: No valid tile at target position");
  }
}
