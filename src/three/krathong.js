import * as THREE from 'three';

export class KrathongManager {
  constructor(scene) {
    this.scene = scene;
    this.krathongMap = new Map();
    this.interactiveMeshes = [];
    this.supportingKrathongs = [];

    this.initGeometriesAndMaterials();
    this.initSupportingKrathongs();
  }

  initGeometriesAndMaterials() {
    this.baseGeo = new THREE.CylinderGeometry(0.85, 0.8, 0.28, 16);
    this.bananaTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c29,
      roughness: 0.8,
      metalness: 0.1
    });

    this.petalGeo = new THREE.ConeGeometry(0.18, 0.55, 4);
    this.petalGeo.rotateX(Math.PI / 2);

    this.candleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.42, 8);
    this.candleMat = new THREE.MeshStandardMaterial({
      color: 0xfff9c4,
      roughness: 0.4
    });

    this.flameGeo = new THREE.ConeGeometry(0.04, 0.12, 6);
    this.flameMat = new THREE.MeshBasicMaterial({ color: 0xffa000 });

    this.incenseGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 5);
    this.incenseMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.9 });

    // Styles for Contestant Krathongs (Vibrant & Radiant)
    this.styleMaterials = {
      lotus_pink: {
        outer: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 }),
        inner: new THREE.MeshStandardMaterial({ color: 0xff4081, roughness: 0.4, emissive: 0x330015 }),
        flower: new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3, emissive: 0x332b00 }),
        glowColor: 0xff80ab
      },
      traditional_green: {
        outer: new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.6 }),
        inner: new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.5, emissive: 0x092b0c }),
        flower: new THREE.MeshStandardMaterial({ color: 0xffd600, roughness: 0.3, emissive: 0x332a00 }),
        glowColor: 0xa5d6a7
      },
      golden_sukhothai: {
        outer: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.7, emissive: 0x261d00 }),
        inner: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.15, metalness: 0.8, emissive: 0x3d3000 }),
        flower: new THREE.MeshStandardMaterial({ color: 0xff9100, roughness: 0.3, emissive: 0x3d1c00 }),
        glowColor: 0xffecb3
      },
      purple_orchid: {
        outer: new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.6 }),
        inner: new THREE.MeshStandardMaterial({ color: 0xab47bc, roughness: 0.4, emissive: 0x24062b }),
        flower: new THREE.MeshStandardMaterial({ color: 0xce93d8, roughness: 0.4, emissive: 0x1f0624 }),
        glowColor: 0xe1bee7
      }
    };

    // Muted materials for Background/Supporting Krathongs (กระทงตัวประกอบ)
    this.bgOuterMat = new THREE.MeshStandardMaterial({ color: 0x244220, roughness: 0.9 });
    this.bgInnerMat = new THREE.MeshStandardMaterial({ color: 0x385c32, roughness: 0.9 });
    this.bgFlowerMat = new THREE.MeshStandardMaterial({ color: 0x8d8236, roughness: 0.8 });
  }

  // 1. Initialize 5 Supporting Krathongs (กระทงตัวประกอบ 5 อัน ขนาดเล็ก สีหม่น ลอยเป็นฉากหลัง)
  initSupportingKrathongs() {
    const bgConfigs = [
      { id: 'bg-1', x: -18, z: 6.8, speed: 0.045, seed: 1.4 },
      { id: 'bg-2', x: -8,  z: 8.5, speed: 0.052, seed: 3.7 },
      { id: 'bg-3', x: 2,   z: 7.4, speed: 0.042, seed: 6.1 },
      { id: 'bg-4', x: 12,  z: 6.2, speed: 0.050, seed: 8.3 },
      { id: 'bg-5', x: 21,  z: 8.0, speed: 0.046, seed: 10.5 }
    ];

    bgConfigs.forEach((cfg) => {
      const group = new THREE.Group();

      // Base (smaller scale 0.58)
      const baseMesh = new THREE.Mesh(this.baseGeo, this.bgOuterMat);
      group.add(baseMesh);

      // Simple outer leaves (only 8 leaves)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const leaf = new THREE.Mesh(this.petalGeo, this.bgOuterMat);
        leaf.position.set(Math.cos(angle) * 0.85, 0.08, Math.sin(angle) * 0.85);
        leaf.rotation.y = -angle;
        leaf.rotation.x = 0.3;
        group.add(leaf);
      }

      // Small flower bed
      const flowerBed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.06, 8),
        this.bgFlowerMat
      );
      flowerBed.position.y = 0.15;
      group.add(flowerBed);

      // Small dim candle
      const candle = new THREE.Mesh(this.candleGeo, this.candleMat);
      candle.position.set(0, 0.32, 0);
      candle.scale.set(0.8, 0.8, 0.8);
      group.add(candle);

      const flame = new THREE.Mesh(this.flameGeo, this.flameMat);
      flame.position.set(0, 0.52, 0);
      flame.scale.set(0.8, 0.8, 0.8);
      group.add(flame);

      // Very dim candle light (dim ambient support)
      const light = new THREE.PointLight(0xff9922, 0.55, 3.5, 2.0);
      light.position.set(0, 0.55, 0);
      group.add(light);

      // Scale down to 0.58 (roughly half size of contestant krathong!)
      group.scale.set(0.58, 0.58, 0.58);
      group.position.set(cfg.x, 0.03, cfg.z);

      this.scene.add(group);

      this.supportingKrathongs.push({
        id: cfg.id,
        group,
        light,
        speed: cfg.speed,
        seed: cfg.seed,
        initialY: 0.03
      });
    });
  }

  // 2. Create the STAR Contestant Krathong (ขนาดใหญ่กว่า มีออร่าสีทอง และแสงเทียนสว่างจ้า!)
  createKrathongMesh(contestant) {
    const group = new THREE.Group();
    const style = this.styleMaterials[contestant.style] || this.styleMaterials.lotus_pink;

    // Golden Halo / Aura ring beneath the contestant krathong on water
    const auraGeo = new THREE.RingGeometry(0.7, 1.4, 32);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.y = -0.1;
    group.add(auraMesh);

    // Grand banana trunk base
    const baseMesh = new THREE.Mesh(this.baseGeo, this.bananaTrunkMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Outer ring of folded banana leaves (16 leaves)
    const numOuter = 16;
    for (let i = 0; i < numOuter; i++) {
      const angle = (i / numOuter) * Math.PI * 2;
      const leaf = new THREE.Mesh(this.petalGeo, style.outer);
      leaf.position.set(Math.cos(angle) * 0.92, 0.1, Math.sin(angle) * 0.92);
      leaf.rotation.y = -angle;
      leaf.rotation.x = 0.34;
      group.add(leaf);
    }

    // Inner ring of glowing vibrant floral petals (14 petals)
    const numInner = 14;
    for (let i = 0; i < numInner; i++) {
      const angle = (i / numInner) * Math.PI * 2 + (Math.PI / numInner);
      const petal = new THREE.Mesh(this.petalGeo, style.inner);
      petal.position.set(Math.cos(angle) * 0.72, 0.22, Math.sin(angle) * 0.72);
      petal.rotation.y = -angle;
      petal.rotation.x = 0.48;
      group.add(petal);
    }

    // Golden trimmed flower bed
    const flowerBed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 0.1, 16),
      style.flower
    );
    flowerBed.position.y = 0.22;
    group.add(flowerBed);

    // Bright Candle with Golden Glow
    const candle = new THREE.Mesh(this.candleGeo, this.candleMat);
    candle.position.set(0, 0.44, -0.05);
    candle.scale.set(1.15, 1.15, 1.15);
    group.add(candle);

    // Radiant Flame
    const flame = new THREE.Mesh(this.flameGeo, new THREE.MeshBasicMaterial({ color: 0xffb300 }));
    flame.position.set(0, 0.72, -0.05);
    flame.scale.set(1.3, 1.4, 1.3);
    group.add(flame);

    // Powerful, radiant PointLight (intense warm glow on river)
    const candleLight = new THREE.PointLight(0xffa726, 3.2, 12.0, 1.2);
    candleLight.position.set(0, 0.75, -0.05);
    candleLight.castShadow = true;
    group.add(candleLight);

    // Incense sticks (3 sticks with gold tips)
    for (let i = -1; i <= 1; i++) {
      const incense = new THREE.Mesh(this.incenseGeo, this.incenseMat);
      incense.position.set(i * 0.05, 0.48, 0.12);
      incense.rotation.z = i * 0.08;
      group.add(incense);
    }

    // Hitbox for raycasting
    const hitBoxGeo = new THREE.SphereGeometry(1.6, 8, 8);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    hitBox.position.y = 0.4;
    hitBox.userData = {
      isKrathong: true,
      krathongId: contestant.id,
      contestant: contestant,
      parentGroup: group
    };
    group.add(hitBox);
    this.interactiveMeshes.push(hitBox);

    // Position contestant prominently in river foreground center
    group.position.set(contestant.x || 0, 0.05, contestant.z || 3.2);

    // Grand Scale: 1.15 (almost 2x larger than supporting krathongs 0.58)
    group.scale.set(1.15, 1.15, 1.15);

    this.scene.add(group);

    this.krathongMap.set(contestant.id, {
      id: contestant.id,
      group: group,
      hitBox: hitBox,
      candleLight: candleLight,
      auraMesh: auraMesh,
      data: contestant,
      initialY: 0.05,
      seed: Math.random() * 100,
      driftSpeed: contestant.driftSpeed || 0.065,
      scaleSpeed: contestant.isUserCreated ? 0.0 : 1.15
    });

    return group;
  }

  // Clear all contestant krathongs (supporting krathongs stay in background)
  removeAll() {
    for (const [, item] of this.krathongMap.entries()) {
      this.scene.remove(item.group);
    }
    this.krathongMap.clear();
    this.interactiveMeshes = [];
  }

  syncWithList(contestants) {
    const list = contestants || [];
    const targetIds = new Set(list.map(c => c.id));

    // Remove old contestant krathongs not in list
    for (const [id, item] of this.krathongMap.entries()) {
      if (!targetIds.has(id)) {
        this.scene.remove(item.group);
        this.krathongMap.delete(id);
      }
    }

    this.interactiveMeshes = [];

    // Add or update contestant krathongs
    for (const c of list) {
      if (!this.krathongMap.has(c.id)) {
        this.createKrathongMesh(c);
      } else {
        const item = this.krathongMap.get(c.id);
        item.data = c;
        item.hitBox.userData.contestant = c;
        this.interactiveMeshes.push(item.hitBox);
      }
    }
  }

  loadAll(contestants) {
    this.removeAll();
    if (contestants && contestants.length > 0) {
      contestants.forEach(c => this.createKrathongMesh(c));
    }
  }

  addNewOnly(contestant) {
    this.removeAll();
    const group = this.createKrathongMesh(contestant);
    group.scale.set(0.01, 0.01, 0.01);
    const entry = this.krathongMap.get(contestant.id);
    if (entry) {
      entry.animatingSpawn = true;
      entry.currentScale = 0.01;
    }
    return group;
  }

  addNew(contestant) {
    return this.addNewOnly(contestant);
  }

  update(time, delta) {
    // 1. Update Contestant Krathong(s) - Bright, Large, Glowing Aura
    for (const [, item] of this.krathongMap.entries()) {
      const { group, candleLight, auraMesh, seed, driftSpeed, initialY } = item;

      if (item.animatingSpawn) {
        item.currentScale += delta * 1.8;
        if (item.currentScale >= 1.15) {
          item.currentScale = 1.15;
          item.animatingSpawn = false;
        }
        group.scale.set(item.currentScale, item.currentScale, item.currentScale);
      }

      // Smooth majestic water bobbing
      const waveOffset = Math.sin(time * 2.2 + seed) * 0.06 + Math.cos(time * 1.5 + seed * 0.5) * 0.03;
      group.position.y = initialY + waveOffset;

      group.rotation.z = Math.sin(time * 1.8 + seed) * 0.04;
      group.rotation.x = Math.cos(time * 1.4 + seed) * 0.03;
      group.rotation.y += 0.002;

      // Aura pulsation
      if (auraMesh) {
        auraMesh.material.opacity = 0.35 + Math.sin(time * 3.0 + seed) * 0.15;
        auraMesh.rotation.z += 0.004;
      }

      group.position.x += driftSpeed * delta * 1.2;
      if (group.position.x > 32) {
        group.position.x = -32;
      }

      // Bright flame flicker
      candleLight.intensity = 2.8 + Math.sin(time * 18 + seed) * 0.4 + (Math.random() - 0.5) * 0.2;
    }

    // 2. Update 5 Supporting Krathongs (กระทงตัวประกอบ) - Subtle, Drifting in Background
    for (const bg of this.supportingKrathongs) {
      const { group, light, speed, seed, initialY } = bg;

      const waveOffset = Math.sin(time * 2.0 + seed) * 0.04;
      group.position.y = initialY + waveOffset;

      group.rotation.z = Math.sin(time * 1.6 + seed) * 0.03;
      group.rotation.x = Math.cos(time * 1.2 + seed) * 0.02;

      group.position.x += speed * delta * 1.0;
      if (group.position.x > 32) {
        group.position.x = -32;
      }

      // Dim candle flicker
      light.intensity = 0.45 + Math.sin(time * 14 + seed) * 0.1;
    }
  }

  highlight(id) {
    for (const [kId, item] of this.krathongMap.entries()) {
      if (kId === id) {
        item.candleLight.intensity = 4.0;
        item.candleLight.distance = 16.0;
      } else {
        item.candleLight.intensity = 2.8;
        item.candleLight.distance = 12.0;
      }
    }
  }

  resetHighlight() {
    for (const [, item] of this.krathongMap.entries()) {
      item.candleLight.intensity = 2.8;
      item.candleLight.distance = 12.0;
    }
  }
}
