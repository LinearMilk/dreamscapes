import * as THREE from "three";

const radius = 1; // Radius of each hex tile
const gap = 0.05; // Gap between tiles

function getRandomColor(baseColor, variance = 0.1) {
  const color = new THREE.Color(baseColor);
  color.offsetHSL(
    Math.random() * variance,
    Math.random() * variance,
    Math.random() * variance
  );
  return color;
}

function createHexTile(x, z, height) {
  // Define the hexagon shape
  const shape = new THREE.Shape();
  const radiusWithGap = radius - gap; // Adjust for the gap
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const vertexX = Math.cos(angle) * radiusWithGap;
    const vertexY = Math.sin(angle) * radiusWithGap;

    // Add the points to the shape
    if (i === 0) {
      shape.moveTo(vertexX, vertexY); // Move to the first point
    } else {
      shape.lineTo(vertexX, vertexY); // Draw lines to subsequent points
    }
  }
  shape.closePath(); // Close the shape to form a complete hexagon

  // Extrude geometry for thickness
  const hexGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: height, // Thickness of the hex tile
    bevelEnabled: false, // No bevel for a clean look
  });

  // Rotate the geometry to lay flat
  hexGeometry.rotateX(-Math.PI / 2); // Rotate 90 degrees along the X-axis

  const hexMaterial = new THREE.MeshStandardMaterial({
    color: getRandomColor(0x66cc66, 0.2),
  });

  const hex = new THREE.Mesh(hexGeometry, hexMaterial);
  hex.position.set(x, -height / 2, z); // Center the hex vertically
  hex.castShadow = true;
  hex.receiveShadow = true;

  return hex;
}

export function createHexGrid(gridRadius, height = 0.3) {
  const hexGroup = new THREE.Group();
  const tileHeight = Math.sqrt(3) * (radius - gap);
  for (let q = -gridRadius; q <= gridRadius; q++) {
    for (let r = -gridRadius; r <= gridRadius; r++) {
      const x = ((radius * 3) / 2) * q;
      const z = tileHeight * (r + q / 2);
      const distance = Math.abs(q) + Math.abs(r) + Math.abs(-q - r);
      if (distance / 2 <= gridRadius) {
        const hex = createHexTile(x, z, height);
        hexGroup.add(hex);
      }
    }
  }
  return hexGroup;
}
