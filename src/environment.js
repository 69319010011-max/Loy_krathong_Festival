import * as THREE from 'three';

// 3D Scene Environment: River, Full Moon, Thai Temple, Pagoda, Thai House, Fireworks & Sky Lanterns
export class Environment {
  constructor(scene) {
    this.scene = scene;
    this.skyLanterns = [];
    this.fireworks = [];
    this.waterMesh = null;
    this.waterPlaneGeo = null;
    this.nextFireworkTime = 1.5;

    this.initLighting();
    this.initMoon();
    this.initRiver();
    this.initTerrainAndPier();
    this.initThaiTemple();
    this.initGoldenPagoda();
    this.initThaiTraditionalHouse();
    this.initSkyLanterns();
    this.initStars();
  }

  // 1. Night Scene Lighting
  initLighting() {
    // Ambient moonlight: soft deep navy blue
    const ambientLight = new THREE.AmbientLight(0x1a2b4c, 1.4);
    this.scene.add(ambientLight);

    // Moonlight DirectionalLight casting soft shadows
    this.moonLight = new THREE.DirectionalLight(0xddeeff, 2.0);
    this.moonLight.position.set(15, 35, -25);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 5;
    this.moonLight.shadow.camera.far = 80;
    this.moonLight.shadow.camera.left = -30;
    this.moonLight.shadow.camera.right = 30;
    this.moonLight.shadow.camera.top = 30;
    this.moonLight.shadow.camera.bottom = -30;
    this.scene.add(this.moonLight);

    // Warm festive fill light from the festival grounds
    const festGlow = new THREE.PointLight(0xffaa44, 2.2, 45, 1.2);
    festGlow.position.set(0, 8, -12);
    this.scene.add(festGlow);

    // Subtle atmospheric fog
    this.scene.fog = new THREE.FogExp2(0x061124, 0.016);
  }

  // 2. Full Moon with Glow
  initMoon() {
    const moonGroup = new THREE.Group();

    // 3D Moon Sphere
    const moonGeo = new THREE.SphereGeometry(3.8, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    // Halo Glow Sprite
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 250, 220, 0.9)');
    grad.addColorStop(0.3, 'rgba(255, 230, 150, 0.35)');
    grad.addColorStop(1, 'rgba(10, 20, 60, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      color: 0xfff3c4
    });
    const glowSprite = new THREE.Sprite(spriteMat);
    glowSprite.scale.set(22, 22, 1);
    moonGroup.add(glowSprite);

    moonGroup.position.set(18, 28, -42);
    this.scene.add(moonGroup);
  }

  // 3. Flowing River with animated wave simulation
  initRiver() {
    this.waterPlaneGeo = new THREE.PlaneGeometry(80, 40, 64, 48);
    this.waterPlaneGeo.rotateX(-Math.PI / 2);

    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x07223b,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
      flatShading: true
    });

    this.waterMesh = new THREE.Mesh(this.waterPlaneGeo, this.waterMat);
    this.waterMesh.position.set(0, 0, 8);
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    // River bed / depth bottom plane
    const bedGeo = new THREE.PlaneGeometry(80, 40);
    bedGeo.rotateX(-Math.PI / 2);
    const bedMat = new THREE.MeshBasicMaterial({ color: 0x020712 });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.set(0, -1.2, 8);
    this.scene.add(bedMesh);
  }

  // 4. Riverbank, Steps & Festival Pier
  initTerrainAndPier() {
    // Riverbank ground (where temple & houses stand)
    const groundGeo = new THREE.BoxGeometry(80, 4, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f2e1e, // dark grass / stone
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -1.5, -20);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Stone embankment promenade along river edge (Z: -5 to -8)
    const promenadeGeo = new THREE.BoxGeometry(80, 1.2, 5);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3e3a34,
      roughness: 0.85
    });
    const promenade = new THREE.Mesh(promenadeGeo, stoneMat);
    promenade.position.set(0, 0.1, -7.5);
    promenade.receiveShadow = true;
    this.scene.add(promenade);

    // Pier / Floating dock stairs (ท่าน้ำลอยกระทง)
    for (let s = 0; s < 4; s++) {
      const stepGeo = new THREE.BoxGeometry(10, 0.25, 1.2);
      const step = new THREE.Mesh(stepGeo, stoneMat);
      step.position.set(0, 0.4 - s * 0.2, -5.0 + s * 0.9);
      step.receiveShadow = true;
      this.scene.add(step);
    }

    // Festive Wooden Posts with Hanging Lanterns along the riverbank
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
    const lanternGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 8);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffb74d });

    const postXs = [-24, -16, -8, 8, 16, 24];
    postXs.forEach(px => {
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(px, 1.6, -5.2);
      post.castShadow = true;
      this.scene.add(post);

      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(px, 2.7, -4.9);
      this.scene.add(lantern);

      const light = new THREE.PointLight(0xffa726, 1.0, 7.0);
      light.position.set(px, 2.6, -4.9);
      this.scene.add(light);
    });
  }

  // 5. Thai Temple (อุโบสถวัดไทย)
  initThaiTemple() {
    const templeGroup = new THREE.Group();

    // Base podium / chofah platform
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.6 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(14, 1.5, 18), baseMat);
    base.position.y = 0.75;
    templeGroup.add(base);

    // Temple Walls (White stucco / ปูนขาว)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 14), wallMat);
    mainHall.position.y = 4.25;
    templeGroup.add(mainHall);

    // Golden Pillars in front portico
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.6 });
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 5.5, 12);
    const pillarXs = [-4, -1.5, 1.5, 4];
    pillarXs.forEach(px => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 4.25, 7.5);
      templeGroup.add(pillar);
    });

    // Multi-tiered Thai Roof (หลังคาซ้อนชั้น 3 ชั้น สีแดงชาดและทอง)
    const roofRedMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.4 });
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 });

    const tiers = [
      { w: 12.5, d: 16.5, y: 7.0, h: 2.2 },
      { w: 9.5, d: 13.5, y: 8.6, h: 2.0 },
      { w: 6.5, d: 10.5, y: 10.1, h: 1.8 }
    ];

    tiers.forEach((tier, idx) => {
      // Gable triangular prism roof
      const roofGeo = new THREE.ConeGeometry(tier.w * 0.65, tier.h * 1.4, 4);
      roofGeo.rotateY(Math.PI / 4);
      const roofMesh = new THREE.Mesh(roofGeo, roofRedMat);
      roofMesh.position.set(0, tier.y, 0);
      roofMesh.scale.set(1.0, 1.0, tier.d / tier.w);
      templeGroup.add(roofMesh);

      // Golden eaves / ridge trim
      const trimGeo = new THREE.BoxGeometry(tier.w * 1.05, 0.25, tier.d * 1.05);
      const trim = new THREE.Mesh(trimGeo, goldTrimMat);
      trim.position.set(0, tier.y - (tier.h * 0.5), 0);
      templeGroup.add(trim);
    });

    // Chofah (ช่อฟ้า - curved top ornament at ridge ends)
    const chofahGeo = new THREE.ConeGeometry(0.2, 1.4, 6);
    const frontChofah = new THREE.Mesh(chofahGeo, goldTrimMat);
    frontChofah.position.set(0, 11.5, 5.2);
    frontChofah.rotation.x = -0.4;
    templeGroup.add(frontChofah);

    const backChofah = new THREE.Mesh(chofahGeo, goldTrimMat);
    backChofah.position.set(0, 11.5, -5.2);
    backChofah.rotation.x = 0.4;
    templeGroup.add(backChofah);

    // Front Golden Doors & Entrance
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.6, 0.2),
      goldTrimMat
    );
    door.position.set(0, 3.3, 7.1);
    templeGroup.add(door);

    templeGroup.position.set(-14, 0, -22);
    this.scene.add(templeGroup);
  }

  // 6. Golden Pagoda / Chedi (พระเจดีย์สีทอง)
  initGoldenPagoda() {
    const pagodaGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffc107,
      metalness: 0.85,
      roughness: 0.25
    });

    // 1. Tiered octagonal bases
    const baseTiers = [
      { rTop: 5.5, rBot: 6.2, h: 1.2, y: 0.6 },
      { rTop: 4.6, rBot: 5.3, h: 1.2, y: 1.8 },
      { rTop: 3.8, rBot: 4.4, h: 1.1, y: 2.9 },
      { rTop: 3.1, rBot: 3.6, h: 1.0, y: 3.9 }
    ];

    baseTiers.forEach(t => {
      const baseGeo = new THREE.CylinderGeometry(t.rTop, t.rBot, t.h, 12);
      const mesh = new THREE.Mesh(baseGeo, goldMat);
      mesh.position.y = t.y;
      pagodaGroup.add(mesh);
    });

    // 2. Bell-shaped middle body (องค์ระฆังคว่ำ)
    const bellGeo = new THREE.SphereGeometry(2.7, 16, 16);
    bellGeo.scale(1.0, 1.35, 1.0);
    const bell = new THREE.Mesh(bellGeo, goldMat);
    bell.position.y = 6.4;
    pagodaGroup.add(bell);

    // 3. Spire rings & tapered needle cone (บัลลังก์ ปล้องไฉน และยอดบัวกลุ่ม)
    const throneGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.7, 8);
    const throne = new THREE.Mesh(throneGeo, goldMat);
    throne.position.y = 8.5;
    pagodaGroup.add(throne);

    // Graduated spire rings
    for (let r = 0; r < 7; r++) {
      const ringRadius = 1.4 - r * 0.16;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(ringRadius, ringRadius + 0.08, 0.3, 10), goldMat);
      ring.position.y = 9.0 + r * 0.35;
      pagodaGroup.add(ring);
    }

    // Pointed top needle (ยอดกรวยแหลม)
    const needle = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.8, 8), goldMat);
    needle.position.y = 13.0;
    pagodaGroup.add(needle);

    // Warm uplight at base of Pagoda
    const pagodaLight = new THREE.PointLight(0xffca28, 2.5, 20);
    pagodaLight.position.set(0, 3, 2);
    pagodaGroup.add(pagodaLight);

    pagodaGroup.position.set(0, 0, -26);
    this.scene.add(pagodaGroup);
  }

  // 7. Thai Traditional Wooden House (เรือนไทยไม้สักริมน้ำ)
  initThaiTraditionalHouse() {
    const houseGroup = new THREE.Group();
    const teakMat = new THREE.MeshStandardMaterial({ color: 0x4e2d1d, roughness: 0.85 });
    const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.75 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 });

    // Raised stilts (เสาใต้ถุนเรือนไทย)
    const stiltGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.8, 8);
    for (let x = -3.5; x <= 3.5; x += 2.3) {
      for (let z = -4; z <= 4; z += 2.6) {
        const stilt = new THREE.Mesh(stiltGeo, teakMat);
        stilt.position.set(x, 1.4, z);
        houseGroup.add(stilt);
      }
    }

    // Raised wooden floor platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.35, 9.5), woodFloorMat);
    platform.position.y = 2.8;
    houseGroup.add(platform);

    // Main House Body (ฝาปะกนไม้)
    const room = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 5.5), teakMat);
    room.position.set(-0.8, 4.6, -1.2);
    houseGroup.add(room);

    // Veranda / Terrace railing (ชานระเบียงหน้าบ้านหันสู่แม่น้ำ)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.8, 0.12), railMat);
    railFront.position.set(0, 3.4, 4.3);
    houseGroup.add(railFront);

    // Curved High Gable Thai Roof (จั่วหลังคาเรือนไทยทรงสูง)
    const roofGeo = new THREE.ConeGeometry(5.2, 3.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-0.8, 7.2, -1.2);
    roof.scale.set(1.0, 1.0, 1.3);
    houseGroup.add(roof);

    // Wooden Staircase leading to ground
    for (let step = 0; step < 7; step++) {
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.45), teakMat);
      stepMesh.position.set(2.8, 2.6 - step * 0.36, 4.5 + step * 0.4);
      houseGroup.add(stepMesh);
    }

    // Warm indoor lamp glow from window
    const houseGlow = new THREE.PointLight(0xffb74d, 1.8, 12);
    houseGlow.position.set(-0.8, 4.5, 0);
    houseGroup.add(houseGlow);

    houseGroup.position.set(16, 0, -18);
    this.scene.add(houseGroup);
  }

  // 8. Floating Sky Lanterns (โคมลอยลอยขึ้นสู่ฟ้า)
  initSkyLanterns() {
    const lanternGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.7, 8);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });

    for (let i = 0; i < 35; i++) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(
        (Math.random() - 0.5) * 60,
        6 + Math.random() * 24,
        -15 - Math.random() * 35
      );
      this.scene.add(lantern);

      this.skyLanterns.push({
        mesh: lantern,
        floatSpeed: 0.35 + Math.random() * 0.4,
        driftSpeedX: (Math.random() - 0.5) * 0.2,
        seed: Math.random() * 100
      });
    }
  }

  // 9. Twinkling Stars in Night Sky
  initStars() {
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 160;
      positions[i + 1] = 12 + Math.random() * 70;
      positions[i + 2] = -10 - Math.random() * 120;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.85
    });

    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);
  }

  // Spawn celebratory firework burst in night sky
  spawnFirework() {
    const colorChoices = [0xff1744, 0xffea00, 0x00e676, 0x00e5ff, 0xd500f9, 0xff9100];
    const burstColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];

    const particleCount = 45;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const originX = (Math.random() - 0.5) * 45;
    const originY = 18 + Math.random() * 14;
    const originZ = -20 - Math.random() * 25;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = originX;
      positions[i * 3 + 1] = originY;
      positions[i * 3 + 2] = originZ;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 2.5 + Math.random() * 3.5;

      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: burstColor,
      size: 0.5,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.fireworks.push({
      points,
      velocities,
      positions,
      life: 1.8,
      maxLife: 1.8
    });
  }

  update(time, delta) {
    // 1. Water waves vertex oscillation
    if (this.waterPlaneGeo) {
      const pos = this.waterPlaneGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        // wave math
        const z = Math.sin(u * 0.35 + time * 1.8) * 0.12 + Math.cos(v * 0.45 + time * 1.4) * 0.08;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      this.waterPlaneGeo.computeVertexNormals();
    }

    // 2. Sky Lanterns gentle drifting upwards
    for (const l of this.skyLanterns) {
      l.mesh.position.y += l.floatSpeed * delta;
      l.mesh.position.x += Math.sin(time * 0.8 + l.seed) * 0.03 + l.driftSpeedX * delta;
      // Wrap around when too high
      if (l.mesh.position.y > 38) {
        l.mesh.position.y = 5.0;
        l.mesh.position.x = (Math.random() - 0.5) * 55;
      }
    }

    // 3. Fireworks bursts update & trigger
    this.nextFireworkTime -= delta;
    if (this.nextFireworkTime <= 0) {
      this.spawnFirework();
      this.nextFireworkTime = 1.8 + Math.random() * 2.2;
    }

    for (let f = this.fireworks.length - 1; f >= 0; f--) {
      const fw = this.fireworks[f];
      fw.life -= delta;
      const factor = fw.life / fw.maxLife;

      if (fw.life <= 0) {
        this.scene.remove(fw.points);
        fw.points.geometry.dispose();
        fw.points.material.dispose();
        this.fireworks.splice(f, 1);
        continue;
      }

      const posArr = fw.positions;
      for (let i = 0; i < fw.velocities.length; i++) {
        const vel = fw.velocities[i];
        posArr[i * 3] += vel.x * delta;
        posArr[i * 3 + 1] += (vel.y - 1.2 * delta) * delta; // gravity
        posArr[i * 3 + 2] += vel.z * delta;
      }
      fw.points.geometry.attributes.position.needsUpdate = true;
      fw.points.material.opacity = Math.max(0, factor);
    }
  }
}

