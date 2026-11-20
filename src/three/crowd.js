import * as THREE from 'three';

export class CrowdManager {
  constructor(scene) {
    this.scene = scene;
    this.people = [];
    this.initPeople();
  }

  initPeople() {
    const clothColors = [
      0xec407a, 0xab47bc, 0x26a69a, 0xffa726, 0x42a5f5,
      0xff7043, 0x78909c, 0xffd54f, 0xef5350, 0x8d6e63
    ];
    const skinColor = 0xffdfba;
    const hairColor = 0x1a1a1a;

    const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.25, 0.65, 8);
    const limbGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6);
    limbGeo.translate(0, -0.25, 0);

    const hairGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });

    for (let i = 0; i < 20; i++) {
      const personGroup = new THREE.Group();
      const color = clothColors[i % clothColors.length];
      const clothMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });

      const body = new THREE.Mesh(bodyGeo, clothMat);
      body.position.y = 0.8;
      body.castShadow = true;
      personGroup.add(body);

      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.35;
      personGroup.add(head);

      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.4, -0.04);
      hair.scale.set(1.0, 0.9, 1.0);
      personGroup.add(hair);

      if (i % 2 === 0) {
        const sabaiGeo = new THREE.BoxGeometry(0.32, 0.7, 0.08);
        const sabaiMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5, metalness: 0.3 });
        const sabai = new THREE.Mesh(sabaiGeo, sabaiMat);
        sabai.position.set(0.05, 0.82, 0.12);
        sabai.rotation.z = -0.3;
        personGroup.add(sabai);
      }

      const leftArm = new THREE.Mesh(limbGeo, skinMat);
      leftArm.position.set(-0.25, 1.05, 0);
      personGroup.add(leftArm);

      const rightArm = new THREE.Mesh(limbGeo, skinMat);
      rightArm.position.set(0.25, 1.05, 0);
      personGroup.add(rightArm);

      const pantsMat = new THREE.MeshStandardMaterial({
        color: (i % 3 === 0) ? 0x212121 : 0x4e342e,
        roughness: 0.8
      });
      const leftLeg = new THREE.Mesh(limbGeo, pantsMat);
      leftLeg.position.set(-0.12, 0.55, 0);
      personGroup.add(leftLeg);

      const rightLeg = new THREE.Mesh(limbGeo, pantsMat);
      rightLeg.position.set(0.12, 0.55, 0);
      personGroup.add(rightLeg);

      if (i % 3 === 0) {
        const lanternGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 6);
        const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffecb3 });
        const lantern = new THREE.Mesh(lanternGeo, lanternMat);
        lantern.position.set(0.28, 0.55, 0.2);
        personGroup.add(lantern);

        const glow = new THREE.PointLight(0xffa726, 0.6, 2.5);
        glow.position.copy(lantern.position);
        personGroup.add(glow);
      }

      const startX = -25 + (i * 2.6) + (Math.random() - 0.5) * 1.5;
      const startZ = -5.8 - (Math.random() * 4.5);
      const walkDir = (i % 2 === 0) ? 1 : -1;

      personGroup.position.set(startX, 0.45, startZ);
      personGroup.rotation.y = walkDir > 0 ? Math.PI / 2 : -Math.PI / 2;

      this.scene.add(personGroup);

      this.people.push({
        group: personGroup,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        dir: walkDir,
        speed: 0.8 + Math.random() * 0.4,
        animSeed: Math.random() * 100,
        minX: -26,
        maxX: 26,
        baseZ: startZ
      });
    }
  }

  update(time, delta) {
    for (const p of this.people) {
      p.group.position.x += p.dir * p.speed * delta;

      if (p.group.position.x > p.maxX) {
        p.dir = -1;
        p.group.rotation.y = -Math.PI / 2;
      } else if (p.group.position.x < p.minX) {
        p.dir = 1;
        p.group.rotation.y = Math.PI / 2;
      }

      const cycle = Math.sin(time * 5.0 * p.speed + p.animSeed);
      p.leftLeg.rotation.x = cycle * 0.55;
      p.rightLeg.rotation.x = -cycle * 0.55;
      p.leftArm.rotation.x = -cycle * 0.4;
      p.rightArm.rotation.x = cycle * 0.4;
      p.group.position.y = 0.45 + Math.abs(Math.sin(time * 5.0 * p.speed + p.animSeed)) * 0.04;
    }
  }
}

