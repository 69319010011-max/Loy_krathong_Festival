// State Management & LocalStorage Persistence for Loy Krathong Voting App

const STORAGE_KEY_KRATHONGS = 'loy_krathong_contestants_v1';
const STORAGE_KEY_USER_VOTES = 'loy_krathong_user_voted_ids_v1';

// Preset default 20 contestants with Thai cultural atmosphere
const DEFAULT_CONTESTANTS = [
  {
    id: 'k-1',
    name: 'น้องพิมพ์ใจ สุขสวัสดิ์',
    wish: 'ขอให้ครอบครัวมีความสุข ปราศจากโรคภัยไข้เจ็บ การงานราบรื่นตลอดปี',
    style: 'lotus_pink',
    votes: 142,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    color: '#ff69b4',
    x: -8, z: 2, driftSpeed: 0.08
  },
  {
    id: 'k-2',
    name: 'คุณวรเมธ & น้องนลิน',
    wish: 'ขอให้ความรักมั่นคงยืนยาว สอบติดคณะในฝันทั้งคู่ด้วยเทอญ',
    style: 'traditional_green',
    votes: 98,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    color: '#4caf50',
    x: 4, z: -3, driftSpeed: 0.07
  },
  {
    id: 'k-3',
    name: 'น้องฟ้าใส มช.',
    wish: 'ขอขมาพระแม่คงคาที่เคยทิ้งขยะลงน้ำ ขอให้ปีหน้าได้เกรด 4.00',
    style: 'golden_sukhothai',
    votes: 215,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    color: '#ffd700',
    x: -12, z: 6, driftSpeed: 0.09
  },
  {
    id: 'k-4',
    name: 'พี่ก้อง สายไอที',
    wish: 'ขอให้โค้ดไม่มี Bug เซิร์ฟเวอร์ไม่ล่ม Deploy งานฉลุยทุก Sprint!',
    style: 'purple_orchid',
    votes: 87,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    color: '#ba55d3',
    x: 10, z: 5, driftSpeed: 0.06
  },
  {
    id: 'k-5',
    name: 'คุณยายสมพร วัย 72 ปี',
    wish: 'ขอให้ลูกหลานเจริญก้าวหน้า สุขภาพแข็งแรง เป็นคนดีของสังคม',
    style: 'traditional_green',
    votes: 164,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    color: '#81c784',
    x: -18, z: -1, driftSpeed: 0.075
  },
  {
    id: 'k-6',
    name: 'น้องแก้มใส สายมู',
    wish: 'ขอให้ปีนี้ถูกหวยรางวัลที่หนึ่ง มีเงินปลดหนี้ให้พ่อแม่ ร่ำรวยเฮงๆ',
    style: 'golden_sukhothai',
    votes: 310,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    color: '#ffc107',
    x: 15, z: 1, driftSpeed: 0.085
  },
  {
    id: 'k-7',
    name: 'ครูมานะ โรงเรียนบ้านสวน',
    wish: 'ขอให้เด็กนักเรียนทุกคนมีอนาคตที่สดใส ประเทศชาติสงบสุขร่มเย็น',
    style: 'traditional_green',
    votes: 79,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    color: '#2e7d32',
    x: -3, z: -5, driftSpeed: 0.065
  },
  {
    id: 'k-8',
    name: 'น้องพลอย & กลุ่มเพื่อน ม.ปลาย',
    wish: 'มิตรภาพของพวกเราจะคงอยู่ตลอดไป สัญญาว่าจะไม่ทิ้งกันนะ',
    style: 'lotus_pink',
    votes: 122,
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80',
    color: '#f06292',
    x: 8, z: 8, driftSpeed: 0.07
  },
  {
    id: 'k-9',
    name: 'เชฟต้น ร้านริมน้ำ',
    wish: 'ขอให้ร้านอาหารขายดี ลูกค้าแน่นทุกวัน วัตถุดิบสดใหม่ รสชาติถูกปาก',
    style: 'traditional_green',
    votes: 56,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    color: '#66bb6a',
    x: -22, z: 4, driftSpeed: 0.08
  },
  {
    id: 'k-10',
    name: 'น้องเบนซ์ นักวิ่งมาราธอน',
    wish: 'ขอให้พิชิตระยะ Full Marathon ต่ำกว่า Sub-4 โดยไร้อาการบาดเจ็บ',
    style: 'purple_orchid',
    votes: 93,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    color: '#9c27b0',
    x: 1, z: 9, driftSpeed: 0.072
  },
  {
    id: 'k-11',
    name: 'คุณมณฑา ศิลปินผ้าไทย',
    wish: 'ขอสืบสานงานทอผ้าไหมไทยให้เลื่องลือไกลสู่ระดับสากล',
    style: 'golden_sukhothai',
    votes: 188,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    color: '#e6a100',
    x: -6, z: 12, driftSpeed: 0.078
  },
  {
    id: 'k-12',
    name: 'น้องมาร์ค ช่างภาพอิสระ',
    wish: 'ขอให้ได้ภาพถ่ายแสงจันทร์ที่งดงามที่สุด และสร้างแรงบันดาลใจให้ผู้คน',
    style: 'lotus_pink',
    votes: 68,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    color: '#e91e63',
    x: 12, z: -2, driftSpeed: 0.068
  },
  {
    id: 'k-13',
    name: 'ป้าทองดี ขนมไทยโบราณ',
    wish: 'ขอให้ทองหยิบ ทองหยอด ฝอยทอง หอมหวานชื่นใจ ค้าขายร่ำรวย',
    style: 'golden_sukhothai',
    votes: 145,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    color: '#ffb300',
    x: -15, z: 10, driftSpeed: 0.082
  },
  {
    id: 'k-14',
    name: 'หมอณัฐ จิตอาสา',
    wish: 'ขอให้คนไข้ทุกคนหายป่วย มีรอยยิ้ม และมีสุขภาพจิตที่แข็งแรง',
    style: 'traditional_green',
    votes: 240,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    color: '#43a047',
    x: 18, z: 7, driftSpeed: 0.077
  },
  {
    id: 'k-15',
    name: 'น้องจอย เต้นคัฟเวอร์',
    wish: 'ขอให้การออดิชั่นผ่านฉลุย ได้เดบิวต์เป็นศิลปินสร้างชื่อเสียงให้ไทย',
    style: 'purple_orchid',
    votes: 110,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    color: '#ab47bc',
    x: -1, z: -7, driftSpeed: 0.069
  },
  {
    id: 'k-16',
    name: 'ลุงสมหมาย คนขับเรือหางยาว',
    wish: 'ขอให้น้ำในแม่น้ำเจ้าพระยาใสสะอาด นักท่องเที่ยวปลอดภัยทุกเที่ยวเดินทาง',
    style: 'traditional_green',
    votes: 82,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    color: '#388e3c',
    x: 6, z: 14, driftSpeed: 0.083
  },
  {
    id: 'k-17',
    name: 'น้องแอน ดีไซเนอร์รักษ์โลก',
    wish: 'ขอให้ทุกคนหันมาใช้วัสดุธรรมชาติในการลอยกระทง เพื่อรักษาแม่น้ำให้ยั่งยืน',
    style: 'lotus_pink',
    votes: 175,
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd25217?w=300&auto=format&fit=crop&q=80',
    color: '#ec407a',
    x: -10, z: -4, driftSpeed: 0.073
  },
  {
    id: 'k-18',
    name: 'พี่วินัย เกษตรกรอินทรีย์',
    wish: 'ขอให้ฝนฟ้าตกต้องตามฤดูกาล พืชผลการเกษตรงอกงาม ได้ราคาดีเป็นธรรม',
    style: 'golden_sukhothai',
    votes: 95,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    color: '#fbc02d',
    x: 22, z: 3, driftSpeed: 0.079
  },
  {
    id: 'k-19',
    name: 'ครอบครัวชุณหะวัณ',
    wish: 'ขอให้ความรักในครอบครัวอบอุ่น ลูกๆ หลานๆ รักใคร่กลมเกลียวกันตลอดไป',
    style: 'traditional_green',
    votes: 130,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
    color: '#4caf50',
    x: -25, z: 8, driftSpeed: 0.081
  },
  {
    id: 'k-20',
    name: 'น้องมายด์ ดาราศาสตร์เยาวชน',
    wish: 'ขอให้ท้องฟ้าคืนนี้เปิด เห็นดวงจันทร์และดวงดาวเต็มฟ้างดงามประทับใจ',
    style: 'purple_orchid',
    votes: 153,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    color: '#7b1fa2',
    x: 3, z: -1, driftSpeed: 0.074
  }
];

export class AppState {
  constructor() {
    this.contestants = this.loadContestants();
    this.userVotedIds = this.loadUserVotedIds();
    this.selectedKrathong = null;
  }

  loadContestants() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KRATHONGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using defaults', e);
    }
    // Save defaults initially
    this.saveContestants(DEFAULT_CONTESTANTS);
    return JSON.parse(JSON.stringify(DEFAULT_CONTESTANTS));
  }

  saveContestants(list) {
    try {
      localStorage.setItem(STORAGE_KEY_KRATHONGS, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving contestants', e);
    }
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

  voteFor(id) {
    const item = this.contestants.find(c => c.id === id);
    if (!item) return false;

    item.votes = (item.votes || 0) + 1;
    if (!this.userVotedIds.includes(id)) {
      this.userVotedIds.push(id);
      this.saveUserVotedIds();
    }
    this.saveContestants(this.contestants);
    return item.votes;
  }

  addContestant({ name, wish, style, photoDataUrl, color }) {
    const newId = 'k-' + Date.now();
    const styleColors = {
      lotus_pink: '#ff69b4',
      traditional_green: '#4caf50',
      golden_sukhothai: '#ffd700',
      purple_orchid: '#ba55d3'
    };

    const newContestant = {
      id: newId,
      name: name || 'ผู้ร่วมลอยกระทง',
      wish: wish || 'ขอให้ชีวิตรุ่งเรือง มีความสุขสมหวังตลอดไป',
      style: style || 'lotus_pink',
      votes: 1,
      avatar: photoDataUrl || this.createFallbackAvatar(name),
      color: color || styleColors[style] || '#ff80ab',
      x: (Math.random() - 0.5) * 6,
      z: 2 + Math.random() * 4,
      driftSpeed: 0.075 + Math.random() * 0.02,
      isUserCreated: true
    };

    this.contestants.unshift(newContestant);
    this.saveContestants(this.contestants);
    return newContestant;
  }

  createFallbackAvatar(name) {
    // Generate a simple canvas avatar with initial
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
    return canvas.toDataURL('image/png');
  }

  getLeaderboard(limit = 10) {
    return [...this.contestants]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, limit);
  }
}

export const appState = new AppState();

