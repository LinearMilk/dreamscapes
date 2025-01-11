import * as THREE from "three";

export function createPlayer() {
  // Body
  const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 6); // Low-poly cylinder
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 }); // Gold-ish color
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.5, 8, 8); // Low-poly sphere
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // Orange-ish color
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
