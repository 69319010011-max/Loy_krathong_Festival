# 🌸 3D Loy Krathong Festival & Online Voting Web App
(เว็บแอปพลิเคชัน 3D บรรยากาศงานลอยกระทงและระบบโหวตผู้เข้าประกวดออนไลน์)

[![Deploy to GitHub Pages](https://github.com/69319010011-max/Loy_krathong_Festival/actions/workflows/deploy.yml/badge.svg)](https://github.com/69319010011-max/Loy_krathong_Festival/actions/workflows/deploy.yml)

🌐 **เข้าชมเว็บไซต์ออนไลน์ (Live Demo):** 👉 **[https://69319010011-max.github.io/Loy_krathong_Festival/](https://69319010011-max.github.io/Loy_krathong_Festival/)**

---

## 🌟 สถาปัตยกรรมและเทคโนโลยีหลัก (Tech Stack)

- **Frontend Framework:** React (Functional Components & Hooks: `useState`, `useRef`, `useEffect`, `useImperativeHandle`)
- **Database & Realtime Sync:** Firebase Firestore (`loy-krathong-festival-f4841`)
  - คอลเลกชัน `krathongs`: เก็บข้อมูลกระทง, ชื่อ, คำอธิษฐาน, คะแนนโหวต, และภาพถ่ายที่บีบอัดแล้ว
  - อัปเดตข้อมูลแบบ Real-time ด้วย `onSnapshot` ข้ามเครื่องทุกอุปกรณ์ทั่วโลก
- **Image Compression Engine:** Client-side Canvas Image Compressor (`src/utils/imageCompressor.js`)
  - ตรวจสอบและบีบอัดรูปถ่ายจากกล้องสด / ไฟล์อัปโหลด ให้มีขนาด **ไม่เกิน 500 KB** อย่างแน่นอนตามเกณฑ์ของ Firestore
- **CI/CD Automation:** GitHub Actions (`.github/workflows/deploy.yml`) Deploy ขึ้น GitHub Pages อัตโนมัติทุกครั้งที่ Push ขึ้น `main`
- **Build Tool:** Vite (Hot Module Replacement)
- **Styling:** Tailwind CSS (Theme สีทองไทย, สีกรมท่าค่ำคืน, Glassmorphism, Responsive Grid & Flexbox)
- **3D Graphics Engine:** Three.js (WebGL, Real-time Shadow Map, Tone Mapping, Procedural 3D Mesh Generation)
- **Touch & Camera Controller:** Three.js OrbitControls (หมุนฉาก 360°, ซูมเข้า-ออก, แพนมุมมอง)
- **Icons:** Lucide React
- **Audio:** Web Audio API Synthesizer (ดนตรีไทยระนาดเอกเพลงวันลอยกระทง และเสียงน้ำไหล)

---

## 🚀 วิธีการรันใช้งาน (Getting Started)

### 1. รันเพื่อพัฒนาในเครื่อง (Development Server)
```bash
npm run dev
```
เปิดในเบราว์เซอร์: `http://localhost:5173`

### 2. บิลด์สำหรับ Production
```bash
npm run build
```
ไฟล์ที่พร้อมเผยแพร่จะถูกสร้างไว้ในโฟลเดอร์ `dist/`
