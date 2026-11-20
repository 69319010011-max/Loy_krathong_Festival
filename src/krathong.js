import * as THREE from 'three';

// Procedural 3D Krathong Builder with Multiple Thai Styles
export class KrathongManager {
  constructor(scene) {
    this.scene = scene;
    this.krathongMap = new Map(); // id -> { mesh, light, data, initialY, seed, speed }
    this.interactiveMeshes = [];

    // Shared materials and geometries for high performance on Mobile/Tablet
    this.initGeometriesAndMaterials();
  }

  initGeometriesAndMaterials() {
    // Base banana trunk cylinder
    this.baseGeo = new THREE.CylinderGeometry(0.85, 0.8, 0.28, 16);
    this.bananaTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c29,
      roughness: 0.8,
      metalness: 0.1
    });

    // Petal geometry (leaf-like cone / pyramid)
    this.petalGeo = new THREE.ConeGeometry(0.18, 0.55, 4);
    this.petalGeo.rotateX(Math.PI / 2);

    // Candle geometry
    this.candleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.42, 8);
    this.candleMat = new THREE.MeshStandardMaterial({
      color: 0xfff9c4,
      roughness: 0.4
    });

    // Candle flame geometry
    this.flameGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
    this.flameMat = new THREE.MeshBasicMaterial({
      color: 0xffa000
    });

    // Incense sticks
    this.incenseGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5);
    this.incenseMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      roughness: 0.9
    });

    // Materials per style
    this.styleMaterials = {
      lotus_pink: {
        outer: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 }),
        inner: new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.6 }),
        flower: new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.5 }),
        glowColor: 0xff80ab
      },
      traditional_green: {
        outer: new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.7 }),
        inner: new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.6 }),
        flower: new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.4 }), // ดาวเรือง
        glowColor: 0x81c784
      },
      golden_sukhothai: {
        outer: new THREE.MeshStandardMaterial({ color: 0xc89600, roughness: 0.3, metalness: 0.6 }),
        inner: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.7 }),
        flower: new THREE.MeshStandardMaterial({ color: 0xff6f00, roughness: 0.4 }),
        glowColor: 0xffd54f
      },
      purple_orchid: {
        outer: new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.7 }),
        inner: new THREE.MeshStandardMaterial({ color: 0x9c27b0, roughness: 0.5 }),
        flower: new THREE.MeshStandardMaterial({ color: 0xba68c8, roughness: 0.5 }),
        glowColor: 0xce93d8
      }
    };
  }

  createKrathongMesh(contestant) {
    const group = new THREE.Group();
    const style = this.styleMaterials[contestant.style] || this.styleMaterials.lotus_pink;

    // 1. Banana trunk base
    const baseMesh = new THREE.Mesh(this.baseGeo, this.bananaTrunkMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Outer ring of folded banana leaves (14 leaves)
    const numOuter = 14;
    for (let i = 0; i < numOuter; i++) {
      const angle = (i / numOuter) * Math.PI * 2;
      const leaf = new THREE.Mesh(this.petalGeo, style.outer);
      leaf.position.set(Math.cos(angle) * 0.88, 0.08, Math.sin(angle) * 0.88);
      leaf.rotation.y = -angle;
      leaf.rotation.x = 0.32;
      group.add(leaf);
    }

    // 3. Inner ring of floral petals (12 petals)
    const numInner = 12;
    for (let i = 0; i < numInner; i++) {
      const angle = (i / numInner) * Math.PI * 2 + (Math.PI / numInner);
      const petal = new THREE.Mesh(this.petalGeo, style.inner);
      petal.position.set(Math.cos(angle) * 0.65, 0.18, Math.sin(angle) * 0.65);
      petal.rotation.y = -angle;
      petal.rotation.x = 0.45;
      group.add(petal);
    }

    // 4. Center flower bed / marigold / jasmine
    const flowerBed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.08, 12),
      style.flower
    );
    flowerBed.position.y = 0.18;
    group.add(flowerBed);

    // 5. Traditional Candle in center
    const candle = new THREE.Mesh(this.candleGeo, this.candleMat);
    candle.position.set(0, 0.38, -0.05);
    group.add(candle);

    // Candle flame
    const flame = new THREE.Mesh(this.flameGeo, this.flameMat);
    flame.position.set(0, 0.62, -0.05);
    group.add(flame);

    // PointLight for candle glow casting on water
    const candleLight = new THREE.PointLight(0xffaa33, 1.2, 5.0, 1.5);
    candleLight.position.set(0, 0.65, -0.05);
    group.add(candleLight);

    // 6. Three Incense sticks (ธูป 3 ดอก)
    for (let i = -1; i <= 1; i++) {
      const incense = new THREE.Mesh(this.incenseGeo, this.incenseMat);
      incense.position.set(i * 0.04, 0.42, 0.1);
      incense.rotation.z = i * 0.08;
      group.add(incense);
    }

    // 7. Clickable invisible hit sphere for responsive touch/click
    const hitBoxGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    hitBox.position.y = 0.3;
    hitBox.userData = {
      isKrathong: true,
      krathongId: contestant.id,
      contestant: contestant,
      parentGroup: group
    };
    group.add(hitBox);
    this.interactiveMeshes.push(hitBox);

    // Positioning in river
    group.position.set(contestant.x, 0.05, contestant.z);
    group.scale.set(0.9, 0.9, 0.9);

    this.scene.add(group);

    this.krathongMap.set(contestant.id, {
      id: contestant.id,
      group: group,
      hitBox: hitBox,
      candleLight: candleLight,
      data: contestant,
      initialY: 0.05,
      seed: Math.random() * 100,
      driftSpeed: contestant.driftSpeed || 0.075,
      scaleSpeed: contestant.isUserCreated ? 0.0 : 1.0 // user-created can animate scale up
    });

    return group;
  }

  loadAll(contestants) {
    contestants.forEach(c => this.createKrathongMesh(c));
  }

  addNew(contestant) {
    const group = this.createKrathongMesh(contestant);
    // Start with scale 0 and animate popping in
    group.scale.set(0.01, 0.01, 0.01);
    const entry = this.krathongMap.get(contestant.id);
    if (entry) {
      entry.animatingSpawn = true;
      entry.currentScale = 0.01;
    }
    return group;
  }

  update(time, delta) {
    for (const [id, item] of this.krathongMap.entries()) {
      const { group, candleLight, seed, driftSpeed, initialY } = item;

      // Handle spawn scale animation for user-created krathong
      if (item.animatingSpawn) {
        item.currentScale += delta * 1.5;
        if (item.currentScale >= 0.9) {
          item.currentScale = 0.9;
          item.animatingSpawn = false;
        }
        group.scale.set(item.currentScale, item.currentScale, item.currentScale);
      }

      // 1. Natural river water bobbing (Harmonic Sine waves)
      const waveOffset = Math.sin(time * 2.2 + seed) * 0.06 + Math.cos(time * 1.5 + seed * 0.5) * 0.03;
      group.position.y = initialY + waveOffset;

      // 2. Gentle rocking with water currents
      group.rotation.z = Math.sin(time * 1.8 + seed) * 0.05;
      group.rotation.x = Math.cos(time * 1.4 + seed) * 0.04;
      group.rotation.y += 0.003; // very slow spin

      // 3. Gentle river flow drift along X axis
      group.position.x += driftSpeed * delta * 1.2;
      // Loop boundary: if krathong floats past x=32, wrap back to x=-32
      if (group.position.x > 32) {
        group.position.x = -32;
      }

      // 4. Candle flame flicker
      candleLight.intensity = 1.0 + Math.sin(time * 18 + seed) * 0.25 + (Math.random() - 0.5) * 0.15;
    }
  }

  highlight(id) {
    for (const [kId, item] of this.krathongMap.entries()) {
      if (kId === id) {
        item.candleLight.intensity = 2.8;
        item.candleLight.distance = 8.0;
      } else {
        item.candleLight.intensity = 1.2;
        item.candleLight.distance = 5.0;
      }
    }
  }

  resetHighlight() {
    for (const [, item] of this.krathongMap.entries()) {
      item.candleLight.intensity = 1.2;
      item.candleLight.distance = 5.0;
    }
  }
}

