export class PlayerModel {
  constructor(radius = 1, hexGridModel) {
    this.radius = radius;
    this.hexGridModel = hexGridModel;
    this.axial = { q: 0, r: 0 }; // Initial axial coordinates
    this.isAnimating = false; // Prevent multiple movements
  }

  getPosition() {
    return this.axial;
  }

  setPosition(q, r) {
    this.axial = { q, r };
  }

  setAnimating(state) {
    this.isAnimating = state;
  }

  isCurrentlyAnimating() {
    return this.isAnimating;
  }

  canMoveTo(q, r) {
    return this.hexGridModel.isTilePassable(q, r); // Check if the tile is passable
  }
}
