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
        this.handlePlayerMove(direction);
      }
    });
  }

  calculateMovement(direction) {
    const movementMap = {
      forward: new THREE.Vector3(0, 0, -1),
      backward: new THREE.Vector3(0, 0, 1),
      left: new THREE.Vector3(-1, 0, 0),
      right: new THREE.Vector3(1, 0, 0),
    };

    const movementDirection = movementMap[direction];
    if (!movementDirection) {
      console.error(`Invalid direction: ${direction}`);
      return null;
    }

    const adjustedDirection = movementDirection.clone();
    adjustedDirection.applyQuaternion(this.camera.quaternion);
    adjustedDirection.y = 0; // Ignore vertical rotation
    adjustedDirection.normalize(); // Ensure consistent length

    return adjustedDirection;
  }

  calculateTargetAxial(adjustedDirection) {
    const targetPosition = new THREE.Vector3(
      this.playerView.playerMesh.position.x,
      0,
      this.playerView.playerMesh.position.z
    ).add(adjustedDirection);

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
    }
  }
}
