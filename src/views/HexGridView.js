import * as THREE from "three";

export class HexGridView {
  constructor(scene) {
    this.scene = scene;
    this.tileMeshes = new Map(); // Map axial coordinates to THREE.Mesh objects
  }

  renderHexGroup(hexGroup) {
    // Add the initial group of hexes to the scene
    this.scene.add(hexGroup);
    hexGroup.children.forEach((tile) => {
      const { q, r } = tile.userData.axial;
      this.tileMeshes.set(`${q},${r}`, tile);
    });
  }

  addTile(tile) {
    // Add a single tile to the scene and track it
    this.scene.add(tile);
    const { q, r } = tile.userData.axial;
    this.tileMeshes.set(`${q},${r}`, tile);
  }

  removeTile(q, r) {
    // Remove a tile by its axial coordinates
    const key = `${q},${r}`;
    const tile = this.tileMeshes.get(key);
    if (tile) {
      this.scene.remove(tile);
      this.tileMeshes.delete(key);
    } else {
      console.warn(`No tile found at axial coordinates (${q}, ${r}).`);
    }
  }

  animateTileColor(q, r, newColor) {
    // Animate the color of a specific tile
    const key = `${q},${r}`;
    const tile = this.tileMeshes.get(key);

    if (!tile) {
      console.warn(`No tile found at axial coordinates (${q}, ${r}).`);
      return;
    }

    const startColor = tile.material.color.clone();
    const endColor = new THREE.Color(newColor);
    const duration = 0.5; // Animation duration in seconds

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const t = Math.min(elapsedTime / duration, 1); // Normalize time (0 to 1)
      tile.material.color.lerpColors(startColor, endColor, t);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    clock.start();
    animate();
  }

  animateTileHeight(q, r, newHeight) {
    // Animate the height of a specific tile
    const key = `${q},${r}`;
    const tile = this.tileMeshes.get(key);

    if (!tile) {
      console.warn(`No tile found at axial coordinates (${q}, ${r}).`);
      return;
    }

    const startHeight = tile.position.y;
    const duration = 0.5; // Animation duration in seconds

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const t = Math.min(elapsedTime / duration, 1); // Normalize time (0 to 1)
      const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // Ease-in-out cubic

      tile.position.y = startHeight + easedT * (newHeight - startHeight);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    clock.start();
    animate();
  }
}
