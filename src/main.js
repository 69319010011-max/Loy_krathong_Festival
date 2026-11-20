import { appState } from './state.js';
import { SceneManager } from './scene.js';
import { Environment } from './environment.js';
import { CrowdManager } from './crowd.js';
import { KrathongManager } from './krathong.js';
import { soundSystem } from './audio.js';

class LoyKrathongApp {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.currentSelectedContestant = null;
    this.selectedKrathongStyle = 'lotus_pink';
    this.currentCapturedPhoto = null;
    this.mediaStream = null;

    this.init3D();
    this.initUI();
    this.initCameraCapture();
  }

  init3D() {
    // 1. Initialize 3D Scene & Controls
    this.sceneManager = new SceneManager(this.container, (contestant) => {
      this.openVoteModal(contestant);
    });

    // 2. Initialize Environment: River, Moon, Temple, Pagoda, Thai House, Fireworks
    this.environment = new Environment(this.sceneManager.scene);

    // 3. Initialize Crowd: 20 animated Thai visitors
    this.crowd = new CrowdManager(this.sceneManager.scene);

    // 4. Initialize Krathongs in river: 20 default floating krathongs
    this.krathongManager = new KrathongManager(this.sceneManager.scene);
    this.krathongManager.loadAll(appState.contestants);

    // Provide interactive hitbox meshes to Scene Raycaster
    this.sceneManager.setInteractiveObjects(this.krathongManager.interactiveMeshes);

    // 5. Start Render Animation Loop
    this.sceneManager.render((time, delta) => {
      this.environment.update(time, delta);
      this.crowd.update(time, delta);
      this.krathongManager.update(time, delta);
    });
  }

  initUI() {
    // Badges & Counters
    this.updateContestantBadge();

    // Sound toggle
    const btnAudio = document.getElementById('btn-audio');
    const audioIcon = document.getElementById('audio-icon');
    btnAudio.addEventListener('click', () => {
      const active = soundSystem.toggleMusic();
      btnAudio.classList.toggle('active', active);
      audioIcon.textContent = active ? '🔊' : '🎵';
    });

    // Reset Camera
    const btnResetCam = document.getElementById('btn-reset-cam');
    btnResetCam.addEventListener('click', () => {
      this.sceneManager.camera.position.set(0, 7.5, 18);
      this.sceneManager.controls.target.set(0, 1.5, 0);
      this.krathongManager.resetHighlight();
    });

    // Leaderboard Modal
    const btnLeaderboard = document.getElementById('btn-leaderboard');
    const modalLeaderboard = document.getElementById('modal-leaderboard');
    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');

    btnLeaderboard.addEventListener('click', () => {
      this.renderLeaderboard();
      modalLeaderboard.classList.add('open');
    });
    btnCloseLeaderboard.addEventListener('click', () => {
      modalLeaderboard.classList.remove('open');
    });

    // Create Krathong Modal
    const btnOpenCreate = document.getElementById('btn-open-create');
    const modalCreate = document.getElementById('modal-create');
    const btnCloseCreate = document.getElementById('btn-close-create');

    btnOpenCreate.addEventListener('click', () => {
      modalCreate.classList.add('open');
      this.startCameraStream();
    });
    btnCloseCreate.addEventListener('click', () => {
      modalCreate.classList.remove('open');
      this.stopCameraStream();
    });

    // Vote Modal Close
    const modalVote = document.getElementById('modal-vote');
    const btnCloseVote = document.getElementById('btn-close-vote');
    btnCloseVote.addEventListener('click', () => {
      modalVote.classList.remove('open');
      this.krathongManager.resetHighlight();
    });

    // Cast Vote Button
    const btnCastVote = document.getElementById('btn-cast-vote');
    btnCastVote.addEventListener('click', (e) => {
      if (!this.currentSelectedContestant) return;
      const id = this.currentSelectedContestant.id;

      const newVotes = appState.voteFor(id);
      document.getElementById('detail-votes').textContent = newVotes;
      btnCastVote.innerHTML = '<span>💖</span><span>โหวตแล้ว ขอบคุณครับ!</span>';
      btnCastVote.classList.add('voted');

      soundSystem.playVoteSound();
      this.triggerHeartBurst(e.clientX, e.clientY);
      this.renderLeaderboard();
    });

    // Krathong Style Selector
    const styleOptions = document.querySelectorAll('.style-option');
    styleOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        styleOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.selectedKrathongStyle = opt.getAttribute('data-style');
      });
    });

    // Submit New Krathong
    const btnSubmit = document.getElementById('btn-submit-krathong');
    btnSubmit.addEventListener('click', () => this.handleKrathongSubmit());
  }

  // Camera & Photo Handling
  initCameraCapture() {
    const tabCamera = document.getElementById('tab-camera');
    const tabUpload = document.getElementById('tab-upload');
    const fileInput = document.getElementById('file-input');
    const btnCapture = document.getElementById('btn-capture-photo');
    const btnRetake = document.getElementById('btn-retake-photo');
    const video = document.getElementById('video-stream');
    const photoCanvas = document.getElementById('photo-canvas');
    const photoPreview = document.getElementById('photo-preview');

    tabCamera.addEventListener('click', () => {
      tabCamera.classList.add('active');
      tabUpload.classList.remove('active');
      this.startCameraStream();
    });

    tabUpload.addEventListener('click', () => {
      tabUpload.classList.add('active');
      tabCamera.classList.remove('active');
      this.stopCameraStream();
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.resizeImage(evt.target.result, (resizedDataUrl) => {
            this.currentCapturedPhoto = resizedDataUrl;
            photoPreview.src = resizedDataUrl;
            photoPreview.style.display = 'block';
            video.style.display = 'none';
            btnCapture.style.display = 'none';
            btnRetake.style.display = 'inline-block';
          });
        };
        reader.readAsDataURL(file);
      }
    });

    btnCapture.addEventListener('click', () => {
      if (!this.mediaStream) return;
      photoCanvas.width = 300;
      photoCanvas.height = 300;
      const ctx = photoCanvas.getContext('2d');
      // Crop center square
      const minDim = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - minDim) / 2;
      const startY = (video.videoHeight - minDim) / 2;
      ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 300, 300);

      const dataUrl = photoCanvas.toDataURL('image/jpeg', 0.85);
      this.currentCapturedPhoto = dataUrl;
      photoPreview.src = dataUrl;
      photoPreview.style.display = 'block';
      video.style.display = 'none';
      btnCapture.style.display = 'none';
      btnRetake.style.display = 'inline-block';
      this.stopCameraStream();
    });

    btnRetake.addEventListener('click', () => {
      this.currentCapturedPhoto = null;
      photoPreview.style.display = 'none';
      video.style.display = 'block';
      btnCapture.style.display = 'inline-block';
      btnRetake.style.display = 'none';
      this.startCameraStream();
    });
  }

  resizeImage(dataUrl, callback) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 300, 300);
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  }

  async startCameraStream() {
    const video = document.getElementById('video-stream');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 } },
          audio: false
        });
        video.srcObject = this.mediaStream;
        video.style.display = 'block';
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      // Fallback: prompt user to upload image instead
      document.getElementById('tab-upload').click();
    }
  }

  stopCameraStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  // Handle Krathong Submission
  handleKrathongSubmit() {
    const nameInput = document.getElementById('input-name');
    const wishInput = document.getElementById('input-wish');

    const name = nameInput.value.trim();
    const wish = wishInput.value.trim();

    if (!name || !wish) {
      alert('กรุณากรอกชื่อและคำอธิษฐานให้ครบถ้วนครับ 🌸');
      return;
    }

    const newContestant = appState.addContestant({
      name,
      wish,
      style: this.selectedKrathongStyle,
      photoDataUrl: this.currentCapturedPhoto
    });

    // Spawn Krathong into 3D river
    const newMeshGroup = this.krathongManager.addNew(newContestant);
    this.sceneManager.setInteractiveObjects(this.krathongManager.interactiveMeshes);

    // Audio effect for water launch
    soundSystem.playLaunchSound();

    // Close Modal & Reset Form
    document.getElementById('modal-create').classList.remove('open');
    this.stopCameraStream();
    nameInput.value = '';
    wishInput.value = '';
    this.currentCapturedPhoto = null;
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('video-stream').style.display = 'block';
    document.getElementById('btn-capture-photo').style.display = 'inline-block';
    document.getElementById('btn-retake-photo').style.display = 'none';

    // Update Counter
    this.updateContestantBadge();

    // Fly camera towards newly floated Krathong
    setTimeout(() => {
      this.sceneManager.focusOnKrathong(newMeshGroup.position);
      this.krathongManager.highlight(newContestant.id);
    }, 200);
  }

  // Open Krathong Detail & Vote Modal
  openVoteModal(contestant) {
    this.currentSelectedContestant = contestant;

    // Highlight selected krathong candle light in river
    this.krathongManager.highlight(contestant.id);

    // Populate modal fields
    document.getElementById('detail-avatar').src = contestant.avatar;
    document.getElementById('detail-name').textContent = contestant.name;
    document.getElementById('detail-wish').textContent = `"${contestant.wish}"`;
    document.getElementById('detail-votes').textContent = contestant.votes || 0;

    const styleNames = {
      lotus_pink: '🪷 ดอกบัวสีชมพู',
      traditional_green: '🌿 ใบตองดั้งเดิม',
      golden_sukhothai: '✨ สุโขทัยสีทอง',
      purple_orchid: '💜 กล้วยไม้สีม่วง'
    };
    document.getElementById('detail-style').textContent = styleNames[contestant.style] || 'กระทงไทย';

    const btnVote = document.getElementById('btn-cast-vote');
    if (appState.hasVoted(contestant.id)) {
      btnVote.innerHTML = '<span>💖</span><span>โหวตแล้ว ขอบคุณครับ!</span>';
      btnVote.classList.add('voted');
    } else {
      btnVote.innerHTML = '<span>💖</span><span>กดโหวตให้คะแนน (Vote)</span>';
      btnVote.classList.remove('voted');
    }

    document.getElementById('modal-vote').classList.add('open');
  }

  renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    const topList = appState.getLeaderboard(15);

    container.innerHTML = topList.map((item, idx) => {
      const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : '';
      const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;

      return `
        <div class="leaderboard-item" data-id="${item.id}">
          <div class="rank-badge ${rankClass}">${rankIcon}</div>
          <img class="lb-avatar" src="${item.avatar}" alt="${item.name}" />
          <div class="lb-info">
            <div class="lb-name">${item.name}</div>
            <div class="lb-wish">${item.wish}</div>
          </div>
          <div class="lb-votes">
            <span>❤️</span> ${item.votes || 0}
          </div>
        </div>
      `;
    }).join('');

    // Clicking an item in leaderboard glides camera to that Krathong!
    container.querySelectorAll('.leaderboard-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const kEntry = this.krathongManager.krathongMap.get(id);
        if (kEntry) {
          document.getElementById('modal-leaderboard').classList.remove('open');
          this.sceneManager.focusOnKrathong(kEntry.group.position);
          this.krathongManager.highlight(id);
          setTimeout(() => {
            this.openVoteModal(kEntry.data);
          }, 700);
        }
      });
    });
  }

  updateContestantBadge() {
    const badge = document.getElementById('badge-count');
    const count = appState.contestants.length;
    badge.textContent = `${count} กระทงในสายน้ำ`;
  }

  triggerHeartBurst(clientX, clientY) {
    const x = clientX || window.innerWidth / 2;
    const y = clientY || window.innerHeight / 2;
    const hearts = ['💖', '❤️', '✨', '🌸', '💫'];

    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      el.className = 'burst-heart';
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const angle = (i / 8) * Math.PI * 2 + (Math.random() * 0.4);
      const dist = 60 + Math.random() * 80;
      el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--dy', `${Math.sin(angle) * dist - 30}px`);

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }
}

// Start app once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new LoyKrathongApp();
});

