# 🌸 3D Loy Krathong Festival & Online Voting Web App
(เว็บแอปพลิเคชัน 3D บรรยากาศงานลอยกระทงและระบบโหวตผู้เข้าประกวดออนไลน์)

พัฒนาด้วยสถาปัตยกรรมโมเดิร์น: **React** + **Vite** + **Tailwind CSS** + **Three.js (WebGL)** + **Firebase Firestore**

---

## 🌟 สถาปัตยกรรมและเทคโนโลยีหลัก (Tech Stack)

- **Frontend Framework:** React (Functional Components & Hooks: `useState`, `useRef`, `useEffect`, `useImperativeHandle`)
- **Database & Realtime Sync:** Firebase Firestore (`loy-krathong-festival-f4841`)
  - คอลเลกชัน `krathongs`: เก็บข้อมูลกระทง, ชื่อ, คำอธิษฐาน, คะแนนโหวต, และภาพถ่ายที่บีบอัดแล้ว
  - อัปเดตข้อมูลแบบ Real-time ด้วย `onSnapshot` ข้ามเครื่องทุกอุปกรณ์ทั่วโลก
- **Image Compression Engine:** Client-side Canvas Image Compressor (`src/utils/imageCompressor.js`)
  - ตรวจสอบและบีบอัดรูปถ่ายจากกล้องสด / ไฟล์อัปโหลด ให้มีขนาด **ไม่เกิน 500 KB** อย่างแน่นอนตามเกณฑ์ของ Firestore
- **Build Tool:** Vite (Hot Module Replacement รวดเร็วทันใจ)
- **Styling:** Tailwind CSS (Theme สีทองไทย, สีกรมท่าค่ำคืน, Glassmorphism, Responsive Grid & Flexbox)
- **3D Graphics Engine:** Three.js (WebGL, Real-time Shadow Map, Tone Mapping, Procedural 3D Mesh Generation)
- **Touch & Camera Controller:** Three.js OrbitControls (หมุนฉาก 360°, ซูมเข้า-ออก, แพนมุมมอง)
- **Icons:** Lucide React
- **Audio:** Web Audio API Synthesizer (ดนตรีไทยระนาดเอกเพลงวันลอยกระทง และเสียงน้ำไหล)

---

## 🚀 วิธีการรันใช้งาน (Getting Started)

### 1. รันเพื่อพัฒนาและเปิดดูในเครื่อง (Development Server)
```bash
npm run dev
```
เปิดในเบราว์เซอร์: `http://localhost:5173`

### 2. บิลด์สำหรับนำขึ้น Production Web Hosting (Build)
```bash
npm run build
```
ไฟล์ที่พร้อมเผยแพร่จะถูกสร้างไว้ในโฟลเดอร์ `dist/` สามารถนำไป Deploy ขึ้น **Firebase Hosting, Vercel, Netlify หรือ GitHub Pages** ได้ทันที
