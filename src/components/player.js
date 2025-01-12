import * as THREE from "three";
import { Howl } from "howler";
import {
  axialToCartesian,
  cartesianToAxial,
  isValidTile,
  checkProximityAndExpand,
} from "./hexGrid";

// Sound effects
const moveSound = new Howl({
  src: ["/assets/sounds/move.mp3"], // Path to movement sound
  volume: 0.75, // Adjust volume as needed
});

const rejectionSound = new Howl({
  src: ["/assets/sounds/rejection.mp3"], // Path to rejection sound
  volume: 0.1, // Adjust volume as needed
});

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
let isAnimating = false; // Prevent multiple movements at once

export function movePlayerRelativeToCamera(
  player,
  direction,
  camera,
  hexGroup,
  radius
) {
  if (isAnimating) return; // Prevent new movements during animation

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

  // Check if the target tile exists
  if (isValidTile(newQ, newR, hexGroup, radius)) {
    const targetTile = hexGroup.children.find(
      (tile) =>
        tile.userData?.axial?.q === newQ && tile.userData?.axial?.r === newR
    );

    if (targetTile?.userData?.biome === "water") {
      rejectionSound.play(); // Play rejection sound
      console.log("Movement blocked: Cannot enter water tiles!");
      return;
    }

    // Call checkProximityAndExpand before starting the animation
    checkProximityAndExpand(
      { userData: { axial: { q: newQ, r: newR } } }, // Pass the target axial coordinates
      hexGroup,
      radius
    );

    const { x, z } = axialToCartesian(newQ, newR, radius);
    // Play movement sound
    moveSound.play();
    animatePlayer(player, { x, y: 0.5, z }, () => {
      player.userData.axial = { q: newQ, r: newR };
    });
  } else {
    console.log("Invalid move: No valid tile at target position");
  }
}

function animatePlayer(player, targetPosition, onComplete) {
  const duration = 0.6; // Animation duration in seconds
  const clock = new THREE.Clock(); // Track animation time
  isAnimating = true;

  const startPosition = player.position.clone();

  // Easing function (cubic easing in-out)
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function animate() {
    const elapsedTime = clock.getElapsedTime();
    const t = Math.min(elapsedTime / duration, 1); // Normalize time (0 to 1)
    const easedT = easeInOutCubic(t); // Apply easing

    // Interpolate position
    player.position.lerpVectors(startPosition, targetPosition, easedT);

    // Bobbing effect (sinusoidal bounce)
    const bobbing = Math.sin(easedT * Math.PI) * 0.5; // Bounce amplitude: 0.1
    player.position.y = targetPosition.y + bobbing;

    // Rotational tilt (lean into movement)
    const movementDirection = new THREE.Vector3()
      .subVectors(targetPosition, startPosition)
      .normalize();
    player.rotation.z = movementDirection.x * bobbing; // Tilt based on movement

    // If animation is complete
    if (t >= 1) {
      player.rotation.z = 0; // Reset tilt
      player.position.y = targetPosition.y; // Reset bounce
      isAnimating = false; // Allow new inputs
      onComplete(); // Callback for completing movement
      return;
    }

    // Continue animation
    requestAnimationFrame(animate);
  }

  clock.start();
  animate();
}
