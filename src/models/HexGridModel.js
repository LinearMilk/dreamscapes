// HexGridModel.js
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import seedrandom from "seedrandom";
import { biomeVariants } from "../constants/biomeVariants.js";

export class HexGridModel {
  constructor(seed, radius = 1, gap = 0.05) {
    this.seed = seed;
    this.radius = radius;
    this.gap = gap;
    this.existingHexes = new Set();
    this.tileMap = new Map(); // Map to reliably store all tiles

    this.seededRandom = seedrandom(seed);
    this.noise = createNoise2D(this.seededRandom);
    this.hexGroup = new THREE.Group();
  }

  initializeGrid(gridRadius, height = 0.3) {
    for (let q = -gridRadius; q <= gridRadius; q++) {
      for (let r = -gridRadius; r <= gridRadius; r++) {
        const s = -q - r;
        if (Math.abs(s) <= gridRadius) {
          const { x, z } = axialToCartesian(q, r, this.radius);
          const hex = this.createHexTile(x, z, height, q, r);
          this.hexGroup.add(hex);
          this.existingHexes.add(`${q},${r}`);
          this.tileMap.set(`${q},${r}`, hex); // Add to tileMap
        }
      }
    }
    return this.hexGroup;
  }

  createHexTile(x, z, height, q, r) {
    const biome = this.getBiomeFromNoise(q, r); // Determine biome
    const variant = Math.ceil(Math.random() * 3); // Randomly pick variant (1-3)

    const { color } = biomeVariants[biome][variant]; // Lookup color by biome and variant

    const shape = new THREE.Shape();
    const radiusWithGap = this.radius - this.gap;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const vertexX = Math.cos(angle) * radiusWithGap;
      const vertexY = Math.sin(angle) * radiusWithGap;
      if (i === 0) shape.moveTo(vertexX, vertexY);
      else shape.lineTo(vertexX, vertexY);
    }
    shape.closePath();

    const hexGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });
    hexGeometry.rotateX(-Math.PI / 2);

    const hexMaterial = new THREE.MeshStandardMaterial({ color });

    const hex = new THREE.Mesh(hexGeometry, hexMaterial);
    hex.position.set(x, -height / 2, z);
    hex.castShadow = true;
    hex.receiveShadow = true;

    hex.userData = { axial: { q, r }, biome, variant }; // Add biome and variant
    return hex;
  }

  getBiomeFromNoise(q, r) {
    const noiseValue = this.noise(q * 0.1, r * 0.1);
    if (noiseValue < -0.3) return "water";
    if (noiseValue < 0.3) return "grassland";
    return "desert";
  }

  expandGrid(playerAxial, range) {
    const { q: playerQ, r: playerR } = playerAxial;
    const newTiles = [];

    for (let dq = -range; dq <= range; dq++) {
      for (
        let dr = Math.max(-range, -dq - range);
        dr <= Math.min(range, -dq + range);
        dr++
      ) {
        const q = playerQ + dq;
        const r = playerR + dr;
        const key = `${q},${r}`;

        if (!this.existingHexes.has(key)) {
          const { x, z } = axialToCartesian(q, r, this.radius);
          const newTile = this.createHexTile(x, z, 0.3, q, r);

          this.hexGroup.add(newTile);
          console.log(`Tile (${q}, ${r}) added to hexGroup`);
          this.existingHexes.add(key);
          this.tileMap.set(key, newTile); // Add to tileMap
          newTiles.push(newTile);
        }
      }
    }

    console.log(
      `hexGroup size after expansion: ${this.hexGroup.children.length}`
    );
    return newTiles;
  }

  isTilePassable(q, r) {
    const key = `${q},${r}`;
    if (!this.existingHexes.has(key)) {
      console.log(`Tile (${q}, ${r}) not in existingHexes`);
      return false;
    }

    const tile = this.tileMap.get(key);
    if (!tile) {
      console.log(`Tile (${q}, ${r}) not found in tileMap`);
      return false;
    }

    console.log(`Tile (${q}, ${r}) biome: ${tile.userData.biome}`);
    return tile.userData.biome !== "water";
  }
}

export function axialToCartesian(q, r, radius) {
  const x = ((radius * 3) / 2) * q;
  const z = radius * Math.sqrt(3) * (r + q / 2);
  return { x, z };
}

export function cartesianToAxial(x, z, radius) {
  const q = ((2 / 3) * x) / radius;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * z) / radius;
  return {
    q: Math.round(q),
    r: Math.round(r),
  };
}
