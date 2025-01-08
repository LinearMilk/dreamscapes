import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js"; // Import Simplex Noise for clustering

export const radius = 1; // Radius of each hex tile
const gap = 0.05; // Gap between tiles

// Biome definitions
const biomes = {
  grassland: [0x66cc66, 0x55aa55, 0x77dd77],
  water: [0x3399ff, 0x2277cc, 0x66ccff],
  desert: [0xffcc66, 0xffd27f, 0xe6b566],
};

const biomeNoise = new SimplexNoise(); // Noise generator

// Assign biomes based on noise
export function getBiomeFromNoise(x, z) {
  const noiseValue = biomeNoise.noise(x * 0.1, z * 0.1); // Scale noise frequency
  if (noiseValue < -0.3) return "water";
  if (noiseValue < 0.3) return "grassland";
  return "desert";
}

function getRandomBiomeColor(biome) {
  const colors = biomes[biome];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function createHexTile(x, z, height, biome) {
  const shape = new THREE.Shape();
  const radiusWithGap = radius - gap;
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

  const hexMaterial = new THREE.MeshStandardMaterial({
    color: getRandomBiomeColor(biome),
  });
  const hex = new THREE.Mesh(hexGeometry, hexMaterial);
  hex.position.set(x, -height / 2, z);
  hex.castShadow = true;
  hex.receiveShadow = true;

  return hex;
}

export function createHexGrid(gridRadius, height = 0.3) {
  const hexGroup = new THREE.Group();

  // Iterate over axial coordinates within the given radius
  for (let q = -gridRadius; q <= gridRadius; q++) {
    for (let r = -gridRadius; r <= gridRadius; r++) {
      const s = -q - r; // Axial coordinate rule: q + r + s = 0
      if (Math.abs(s) <= gridRadius) {
        // Convert axial to Cartesian for precise positioning
        const { x, z } = axialToCartesian(q, r, radius);
        const biome = getBiomeFromNoise(q, r); // Generate biome for this tile
        const hex = createHexTile(x, z, height, biome); // Create the tile
        hexGroup.add(hex); // Add to the group
      }
    }
  }

  return hexGroup;
}

// Convert axial coordinates to Cartesian (world) coordinates
export function axialToCartesian(q, r, radius) {
  const x = ((radius * 3) / 2) * q;
  const z = radius * Math.sqrt(3) * (r + q / 2);
  return { x, z };
}

// Convert Cartesian (world) coordinates to axial coordinates
export function cartesianToAxial(x, z, radius) {
  const q = ((2 / 3) * x) / radius;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * z) / radius;
  return {
    q: Math.round(q),
    r: Math.round(r),
  };
}
