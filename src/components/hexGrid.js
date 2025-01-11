import * as THREE from "three";
import { createNoise2D } from "simplex-noise"; // Import the noise creation function
import seedrandom from "seedrandom";

// Global variables
let seededRandom;
let biomeNoise; // Noise generator

export const radius = 1; // Radius of each hex tile
const gap = 0.05; // Gap between tiles

function pseudoRandomHash(q, r, seed = 0) {
  const prime1 = 73856094;
  const prime2 = 19349663;
  return Math.abs((q * prime1 + r * prime2 + seed) % 9973); // Use modulo a prime
}

// Initialize the seed and noise generator
export function initializeSeed(seed) {
  // Create the seeded random number generator
  seededRandom = seedrandom(seed);

  // Create a 2D noise function using the seeded random
  biomeNoise = createNoise2D(seededRandom);
  console.log(`Seed initialized: ${seed}`);
}

// Biome definitions
const biomes = {
  grassland: [0x66cc66, 0x55aa55, 0x77dd77],
  water: [0x3399ff, 0x2277cc, 0x66ccff],
  desert: [0xffcc66, 0xffd27f, 0xe6b566],
};

// Get a random biome color
function getDeterministicBiomeColor(biome, q, r) {
  if (!biomes[biome]) {
    console.error(`Invalid biome: ${biome}`);
    return 0xffffff; // Fallback to white
  }

  const colors = biomes[biome];
  const hash = pseudoRandomHash(q, r) % colors.length; // Hash modulo the number of colors

  // Add debugging to confirm no bands
  console.log(
    `Biome: ${biome}, q: ${q}, r: ${r}, hash: ${hash}, color: ${colors[hash]}`
  );

  return colors[hash];
}

// Get biome type based on noise
export function getBiomeFromNoise(q, r) {
  if (!biomeNoise)
    throw new Error("Seed not initialized. Call initializeSeed first.");
  const noiseValue = biomeNoise(q * 0.1, r * 0.1); // Use axial coordinates for noise
  if (noiseValue < -0.3) return "water";
  if (noiseValue < 0.3) return "grassland";
  return "desert";
}

// Create a hex tile
export function createHexTile(x, z, height, biome, q, r) {
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
    color: getDeterministicBiomeColor(biome, q, r), // Use deterministic color
  });

  const hex = new THREE.Mesh(hexGeometry, hexMaterial);
  hex.position.set(x, -height / 2, z);
  hex.castShadow = true;
  hex.receiveShadow = true;

  return hex;
}

// Create a hex grid
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
        const hex = createHexTile(x, z, height, biome, q, r); // Create the tile
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
