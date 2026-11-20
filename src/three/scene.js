import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(canvasContainer, onSelectKrathong) {
    this.container = canvasContainer;
    this.onSelectKrathong = onSelectKrathong;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.initCamera();
    this.initRenderer();
    this.initControls();
    this.initRaycaster();

    this.resizeHandler = () => this.onWindowResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  initCamera() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.5, 300);
    this.camera.position.set(0, 7.5, 18);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.container.appendChild(this.renderer.domElement);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;

    this.controls.target.set(0, 1.5, 0);
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 50.0;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.minPolarAngle = 0.15;

    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.pointerDownPos = { x: 0, y: 0 };
    this.isDragging = false;

    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.isDragging = false;
    });

    dom.addEventListener('pointermove', (e) => {
      const dx = Math.abs(e.clientX - this.pointerDownPos.x);
      const dy = Math.abs(e.clientY - this.pointerDownPos.y);
      if (dx > 6 || dy > 6) {
        this.isDragging = true;
      }
    });

    dom.addEventListener('pointerup', (e) => {
      if (!this.isDragging) {
        this.handlePointerTap(e.clientX, e.clientY);
      }
    });
  }

  handlePointerTap(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    if (this.interactiveObjects && this.interactiveObjects.length > 0) {
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        let target = null;
        for (const hit of intersects) {
          let curr = hit.object;
          while (curr) {
            if (curr.userData && curr.userData.isKrathong) {
              target = curr.userData.contestant;
              break;
            }
            curr = curr.parent;
          }
          if (target) break;
        }

        if (target && this.onSelectKrathong) {
          this.onSelectKrathong(target);
        }
      }
    }
  }

  setInteractiveObjects(objects) {
    this.interactiveObjects = objects;
  }

  focusOnKrathong(pos) {
    const targetTarget = new THREE.Vector3(pos.x, pos.y + 0.5, pos.z);
    const startTarget = this.controls.target.clone();

    const startTime = performance.now();
    const duration = 800;

    const animateFocus = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      this.controls.target.lerpVectors(startTarget, targetTarget, ease);

      if (progress < 1.0) {
        requestAnimationFrame(animateFocus);
      }
    };
    requestAnimationFrame(animateFocus);
  }

  resetCamera() {
    this.camera.position.set(0, 7.5, 18);
    this.controls.target.set(0, 1.5, 0);
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render(customUpdate) {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      this.controls.update();

      if (customUpdate) {
        customUpdate(time, delta);
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.resizeHandler);
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

