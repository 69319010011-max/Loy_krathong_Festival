import {
  db,
  collection,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from '../services/firebase.js';
import { compressImageUnder500KB } from '../utils/imageCompressor.js';

const STORAGE_KEY_USER_VOTES = 'loy_krathong_user_voted_ids_v1';
const FIRESTORE_COLLECTION = 'krathongs';

// Helper to check if an ID is a default mock placeholder (k-1 to k-20)
export const isDefaultMock = (id) => {
  return typeof id === 'string' && /^k-[0-9]{1,2}$/.test(id);
};

export class AppState {
  constructor() {
    this.contestants = [];
    this.userVotedIds = this.loadUserVotedIds();
    this.unsubscribeFirestore = null;
    this.hasUserAddedData = false;
  }

  loadUserVotedIds() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_VOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveUserVotedIds() {
    try {
      localStorage.setItem(STORAGE_KEY_USER_VOTES, JSON.stringify(this.userVotedIds));
    } catch (e) {
      console.error('Error saving user votes', e);
    }
  }

  hasVoted(id) {
    return this.userVotedIds.includes(id);
  }

  // Subscribe to real-time updates from Firestore
  subscribeToFirestore(onUpdateCallback) {
    try {
      const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('createdAt', 'desc'));

      this.unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            // Filter out any default mock placeholders (k-1 to k-20)
            const realList = [];
            const mockDocIdsToDelete = [];

            snapshot.docs.forEach(docSnap => {
              if (isDefaultMock(docSnap.id)) {
                mockDocIdsToDelete.push(docSnap.id);
              } else {
                const data = docSnap.data();
                realList.push({
                  id: docSnap.id,
                  ...data,
                  avatar: data.photoUrl || data.avatar
                });
              }
            });

            // Asynchronously clean up any old mock documents in Firestore
            mockDocIdsToDelete.forEach(mockId => {
              try {
                deleteDoc(doc(db, FIRESTORE_COLLECTION, mockId));
              } catch (e) {
                // Ignore cleanup errors
              }
            });

            if (realList.length > 0) {
              this.hasUserAddedData = true;
              this.contestants = realList;
              if (onUpdateCallback) onUpdateCallback(realList);
              return;
            }
          }

          // If no user entries exist yet and user hasn't added one
          if (!this.hasUserAddedData && this.contestants.length === 0) {
            if (onUpdateCallback) onUpdateCallback([]);
          }
        },
        (error) => {
          console.warn('Firestore snapshot error, continuing with local data:', error);
          if (onUpdateCallback) onUpdateCallback(this.contestants);
        }
      );
    } catch (err) {
      console.warn('Error setting up Firestore listener:', err);
      if (onUpdateCallback) onUpdateCallback(this.contestants);
    }

    return () => {
      if (this.unsubscribeFirestore) {
        this.unsubscribeFirestore();
      }
    };
  }

  // Vote for a Krathong in Firestore
  async voteFor(id) {
    const item = this.contestants.find(c => c.id === id);
    if (item) {
      item.votes = (item.votes || 0) + 1;
    }
    if (!this.userVotedIds.includes(id)) {
      this.userVotedIds.push(id);
      this.saveUserVotedIds();
    }

    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await updateDoc(docRef, {
        votes: increment(1)
      });
    } catch (err) {
      console.warn('Firestore vote update error (saved locally):', err);
    }

    return item ? item.votes : 1;
  }

  // Add new contestant: Compresses image <= 500 KB and saves to Firestore
  // When a new Krathong is added, ALL mock/dummy krathongs are removed!
  async addContestant({ name, wish, style, photoDataUrl }) {
    const newId = 'k-' + Date.now();
    const styleColors = {
      lotus_pink: '#ff69b4',
      traditional_green: '#4caf50',
      golden_sukhothai: '#ffd700',
      purple_orchid: '#ba55d3'
    };

    let compressedPhotoUrl = photoDataUrl;
    if (photoDataUrl) {
      try {
        const compressed = await compressImageUnder500KB(photoDataUrl, 500 * 1024);
        compressedPhotoUrl = compressed.dataUrl;
        console.log(`Image compressed for Firestore: ${compressed.sizeKB} KB`);
      } catch (err) {
        console.warn('Compression fallback:', err);
      }
    } else {
      compressedPhotoUrl = this.createFallbackAvatar(name);
    }

    const newContestant = {
      id: newId,
      name: name || 'ผู้ร่วมลอยกระทง',
      wish: wish || 'ขอให้ชีวิตรุ่งเรือง มีความสุขสมหวังตลอดไป',
      style: style || 'lotus_pink',
      votes: 1,
      avatar: compressedPhotoUrl,
      photoUrl: compressedPhotoUrl,
      color: styleColors[style] || '#ff80ab',
      x: (Math.random() - 0.5) * 4,
      z: 2 + Math.random() * 3,
      driftSpeed: 0.075 + Math.random() * 0.02,
      isUserCreated: true
    };

    this.hasUserAddedData = true;

    // Filter out all mock contestants so ONLY user-submitted krathong(s) exist
    const onlyRealContestants = this.contestants.filter(c => !isDefaultMock(c.id) && c.id !== newId);
    this.contestants = [newContestant, ...onlyRealContestants];

    // Save directly to Firestore
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, newId);
      await setDoc(docRef, {
        name: newContestant.name,
        wish: newContestant.wish,
        style: newContestant.style,
        votes: newContestant.votes,
        photoUrl: compressedPhotoUrl,
        color: newContestant.color,
        x: newContestant.x,
        z: newContestant.z,
        driftSpeed: newContestant.driftSpeed,
        createdAt: serverTimestamp()
      });
      console.log('Successfully saved user Krathong to Firestore!');
    } catch (err) {
      console.warn('Firestore addDoc error (fallback to local):', err);
    }

    return newContestant;
  }

  createFallbackAvatar(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(60, 60, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a237e';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((name && name[0]) ? name[0] : '🌸', 60, 64);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  getLeaderboard(limit = 10) {
    return [...this.contestants]
      .filter(c => !isDefaultMock(c.id))
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, limit);
  }
}

export const appState = new AppState();
