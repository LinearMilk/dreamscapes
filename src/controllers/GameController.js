import * as THREE from "three";
import { HexGridModel } from "../models/HexGridModel.js";
import { HexGridView } from "../views/HexGridView.js";
import { PlayerModel } from "../models/PlayerModel.js";
import { PlayerView } from "../views/PlayerView.js";
import { cartesianToAxial } from "../models/HexGridModel.js";

export class GameController {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.radius = 1; // Hex radius, shared across models
    const seed = "default-seed";

    // Initialize models
    this.hexGridModel = new HexGridModel(seed, this.radius);
    console.log(`Initializing seed: ${seed}`);
    this.playerModel = new PlayerModel(this.radius, this.hexGridModel);

    // Initialize views
    this.hexGridView = new HexGridView(scene);
    this.playerView = new PlayerView(scene, this.radius);

    // Render initial grid and player
    const initialGrid = this.hexGridModel.initializeGrid(5); // 5-tile radius grid
    this.hexGridView.renderHexGroup(initialGrid);

    const { q, r } = this.playerModel.getPosition();
    this.playerView.updatePosition(q, r);

    // Bind event listeners
    this.bindInputEvents();
  }

  bindInputEvents() {
    window.addEventListener("keydown", (event) => {
      const directionMap = {
        q: { dq: -1, dr: 0 }, // Up-left
        w: { dq: 0, dr: -1 }, // Up-right
        e: { dq: 1, dr: -1 }, // Right
        d: { dq: 1, dr: 0 }, // Down-right
        s: { dq: 0, dr: 1 }, // Down-left
        a: { dq: -1, dr: 1 }, // Left
      };

      const direction = directionMap[event.key];
      if (direction) {
        this.handlePlayerMove(direction);
      }
    });
  }

  calculateMovement(direction) {
    const movementVector = new THREE.Vector3(direction.dq, 0, direction.dr);

    // Rotate the vector based on the camera's orientation
    movementVector.applyQuaternion(this.camera.quaternion);
    movementVector.y = 0; // Ignore vertical rotation
    movementVector.normalize();

    // Snap the adjusted movement vector back to the nearest hex direction
    const hexDirections = [
      { dq: -1, dr: 0 }, // Up-left
      { dq: 0, dr: -1 }, // Up-right
      { dq: 1, dr: -1 }, // Right
      { dq: 1, dr: 0 }, // Down-right
      { dq: 0, dr: 1 }, // Down-left
      { dq: -1, dr: 1 }, // Left
    ];

    const snappedDirection = hexDirections.reduce((closest, current) => {
      const currentVector = new THREE.Vector3(current.dq, 0, current.dr);
      const currentDistance = movementVector.distanceTo(currentVector);
      const closestVector = new THREE.Vector3(closest.dq, 0, closest.dr);
      const closestDistance = movementVector.distanceTo(closestVector);
      return currentDistance < closestDistance ? current : closest;
    });

    return snappedDirection;
  }

  calculateTargetAxial(adjustedDirection) {
    const targetPosition = new THREE.Vector3(
      this.playerView.playerMesh.position.x,
      0,
      this.playerView.playerMesh.position.z
    ).add(new THREE.Vector3(adjustedDirection.dq, 0, adjustedDirection.dr));

    return cartesianToAxial(targetPosition.x, targetPosition.z, this.radius);
  }

  handlePlayerMove(direction) {
    if (this.playerModel.isCurrentlyAnimating()) {
      console.log("Animation in progress. Ignoring input.");
      return;
    }

    const adjustedDirection = this.calculateMovement(direction);
    if (!adjustedDirection) return;

    const { q: newQ, r: newR } = this.calculateTargetAxial(adjustedDirection);

    if (this.playerModel.canMoveTo(newQ, newR)) {
      this.playerView.playMoveSound(); // Play movement sound
      this.playerModel.setAnimating(true);
      this.playerView.animateToPosition(newQ, newR, () => {
        this.playerModel.setPosition(newQ, newR);
        this.playerModel.setAnimating(false);

        this.hexGridModel
          .expandGrid({ q: newQ, r: newR }, 2)
          .forEach((newTile) => {
            this.hexGridView.addTile(newTile);
          });
      });
    } else {
      console.log("Movement blocked: Cannot enter water tiles!");
      this.playerView.playRejectionSound();
    }
  }
}
