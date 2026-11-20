// Web Audio API Synthesizer for Loy Krathong Festival
// Pure procedural audio - No external MP3 downloads required!

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = true;
    this.melodyTimer = null;
    this.waterNoiseNode = null;
    this.gainMaster = null;

    // Iconic Loy Krathong melody notes in Thai pentatonic / diatonic frequencies
    // "วันเพ็ญเดือนสิบสอง... น้ำก็นองเต็มตลิ่ง... เราทั้งหลายชายหญิง... สนุกกันจริงวันลอยกระทง"
    // Musical notes (C4, D4, E4, G4, A4, C5, D5...)
    this.notes = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
    };

    // Note sequence: [Note, duration in beats]
    this.melodySequence = [
      ['G4', 0.5], ['A4', 0.5], ['C5', 1.0], ['C5', 0.5], ['D5', 0.5], ['C5', 1.0],
      ['A4', 0.5], ['G4', 0.5], ['A4', 0.5], ['C5', 0.5], ['G4', 2.0],
      ['G4', 0.5], ['A4', 0.5], ['C5', 1.0], ['C5', 0.5], ['D5', 0.5], ['C5', 1.0],
      ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 2.0],
      ['C5', 0.5], ['D5', 0.5], ['E5', 1.0], ['E5', 0.5], ['D5', 0.5], ['C5', 1.0],
      ['A4', 0.5], ['G4', 0.5], ['A4', 0.5], ['C5', 0.5], ['G4', 1.5], ['_rest', 0.5],
      ['G4', 0.5], ['A4', 0.5], ['C5', 1.0], ['D5', 1.0], ['C5', 2.0]
    ];
    this.currentNoteIndex = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.gainMaster = this.ctx.createGain();
    this.gainMaster.gain.setValueAtTime(0.25, this.ctx.currentTime);
    this.gainMaster.connect(this.ctx.destination);
    this.setupWaterAmbience();
  }

  toggleMusic() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.gainMaster.gain.setTargetAtTime(0.25, this.ctx.currentTime, 0.1);
      this.startMelodyLoop();
    } else {
      this.gainMaster.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      if (this.melodyTimer) {
        clearTimeout(this.melodyTimer);
        this.melodyTimer = null;
      }
    }
    return !this.isMuted;
  }

  setupWaterAmbience() {
    if (!this.ctx) return;
    // Pink/Brown noise generator for gentle river water flow
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 1.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make it sound like gentle river flow
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const waterGain = this.ctx.createGain();
    waterGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(waterGain);
    waterGain.connect(this.gainMaster);
    noise.start();
  }

  playRanadNote(freq, duration = 0.8) {
    if (!this.ctx || this.isMuted || !freq) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Traditional Thai Xylophone (Ranad-ek) timbre simulation
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    // Subtle 2nd harmonic strike
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2.76, t);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.2, t);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    // Percussive strike envelope
    noteGain.gain.setValueAtTime(0.4, t);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(noteGain);
    oscHarmonic.connect(harmonicGain);
    harmonicGain.connect(noteGain);
    noteGain.connect(this.gainMaster);

    osc.start(t);
    oscHarmonic.start(t);
    osc.stop(t + duration);
    oscHarmonic.stop(t + duration);
  }

  startMelodyLoop() {
    if (this.melodyTimer) clearTimeout(this.melodyTimer);
    const beatDurationMs = 450; // tempo

    const tick = () => {
      if (this.isMuted) return;

      const item = this.melodySequence[this.currentNoteIndex];
      const noteName = item[0];
      const beats = item[1];

      if (noteName !== '_rest') {
        const freq = this.notes[noteName];
        this.playRanadNote(freq, beats * 0.45);
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melodySequence.length;
      this.melodyTimer = setTimeout(tick, beats * beatDurationMs);
    };

    tick();
  }

  // Sound Effect when voting (chime + heart sparkle)
  playVoteSound() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.3, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.gainMaster);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.5);
    });
  }

  // Sound Effect when user launches their new Krathong
  playLaunchSound() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Gong / Deep bell + water splash
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 1.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.gainMaster);

    osc.start(t);
    osc.stop(t + 1.5);
  }
}

export const soundSystem = new SoundSystem();

