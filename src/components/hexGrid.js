import * as THREE from "three";

const radius = 1; // Radius of each hex tile
const gap = 0.05; // Gap between tiles

// Define biome colors
const biomes = {
  grassland: [0x66cc66, 0x55aa55, 0x77dd77], // Shades of green
  water: [0x3399ff, 0x2277cc, 0x66ccff], // Shades of blue
  desert: [0xffcc66, 0xffd27f, 0xe6b566], // Shades of sand
};

// Get a random color from a biome
function getRandomBiomeColor(biome) {
  const colors = biomes[biome];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Create a hex tile with a biome color
function createHexTile(x, z, height, biome) {
  const shape = new THREE.Shape();
  const radiusWithGap = radius - gap;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const vertexX = Math.cos(angle) * radiusWithGap;
    const vertexY = Math.sin(angle) * radiusWithGap;
    if (i === 0) {
      shape.moveTo(vertexX, vertexY);
    } else {
      shape.lineTo(vertexX, vertexY);
    }
  }
  shape.closePath();

  const hexGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: height, // Thickness of the hex tile
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

// Procedurally generate the hex grid
export function createHexGrid(gridRadius, height = 0.3) {
  const hexGroup = new THREE.Group();
  const tileHeight = Math.sqrt(3) * (radius - gap);

  for (let q = -gridRadius; q <= gridRadius; q++) {
    for (let r = -gridRadius; r <= gridRadius; r++) {
      const x = ((radius * 3) / 2) * q;
      const z = tileHeight * (r + q / 2);
      const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);

      if (distance / 2 <= gridRadius) {
        // Assign biomes randomly for now
        const biomesList = Object.keys(biomes);
        const randomBiome =
          biomesList[Math.floor(Math.random() * biomesList.length)];
        const hex = createHexTile(x, z, height, randomBiome);
        hexGroup.add(hex);
      }
    }
  }

  return hexGroup;
}
