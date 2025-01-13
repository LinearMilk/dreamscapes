import * as THREE from "three";
import { axialToCartesian } from "../models/HexGridModel";

export class PlayerView {
  constructor(scene, radius = 1) {
    this.scene = scene;
    this.radius = radius;
    this.playerMesh = this.createPlayerMesh();
    this.scene.add(this.playerMesh);
    // Load sounds
    this.moveSound = new Audio("/assets/sounds/move.mp3");
    this.rejectionSound = new Audio("/assets/sounds/rejection.mp3");
  }

  playMoveSound() {
    this.moveSound.play();
  }

  playRejectionSound() {
    this.rejectionSound.play();
  }

  createPlayerMesh() {
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcc3333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.25, 0);

    const playerGroup = new THREE.Group();
    playerGroup.add(body);
    playerGroup.add(head);

    playerGroup.position.set(0, 0.5, 0);
    playerGroup.castShadow = true;
    playerGroup.receiveShadow = true;

    return playerGroup;
  }

  updatePosition(q, r) {
    const { x, z } = axialToCartesian(q, r, this.radius);
    this.playerMesh.position.set(x, 0.5, z);
  }

  animateToPosition(q, r, onComplete) {
    const { x, z } = axialToCartesian(q, r, this.radius);
    const startX = this.playerMesh.position.x;
    const startZ = this.playerMesh.position.z;
    const duration = 0.6;
    const clock = new THREE.Clock();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const t = Math.min(elapsedTime / duration, 1);
      const easedT = easeInOutCubic(t);

      this.playerMesh.position.x = startX + (x - startX) * easedT;
      this.playerMesh.position.z = startZ + (z - startZ) * easedT;

      const bobbing = Math.sin(easedT * Math.PI) * 0.5;
      this.playerMesh.position.y = 0.5 + bobbing;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.playerMesh.position.y = 0.5; // Snap to final position
        onComplete();
      }
    };

    clock.start();
    animate();
  }
}
