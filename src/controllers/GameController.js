import { HexGridModel } from "../models/HexGridModel.js";
import { HexGridView } from "../views/HexGridView.js";
import { PlayerModel } from "../models/PlayerModel.js";
import { PlayerView } from "../views/PlayerView.js";

export class GameController {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.radius = 1; // Hex radius, shared across models

    // Initialize models
    this.hexGridModel = new HexGridModel("default-seed", this.radius);
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

  handlePlayerMove(direction) {
    if (this.playerModel.isCurrentlyAnimating()) return; // Block multiple animations

    const movementMap = {
      forward: { dq: 0, dr: -1 },
      backward: { dq: 0, dr: 1 },
      left: { dq: -1, dr: 0 },
      right: { dq: 1, dr: 0 },
    };

    const { dq, dr } = movementMap[direction];
    const { q, r } = this.playerModel.getPosition();
    const newQ = q + dq;
    const newR = r + dr;

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
