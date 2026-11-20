import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Sparkles, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { compressImageUnder500KB } from '../utils/imageCompressor.js';

export default function CreateKrathongModal({ isOpen, onClose, onSubmit }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoSizeKB, setPhotoSizeKB] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [wish, setWish] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('lotus_pink');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const stylesList = [
    { id: 'lotus_pink', name: 'ดอกบัวสีชมพู', color: '#ff69b4' },
    { id: 'traditional_green', name: 'ใบตองดั้งเดิม', color: '#4caf50' },
    { id: 'golden_sukhothai', name: 'สุโขทัยสีทอง', color: '#ffd700' },
    { id: 'purple_orchid', name: 'กล้วยไม้สีม่วง', color: '#ba55d3' }
  ];

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 } },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      }
    } catch (e) {
      console.warn('Camera error or denied, fallback to upload', e);
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture snapshot from webcam & compress <= 500 KB
  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    const minDim = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    const startX = ((video.videoWidth || 640) - minDim) / 2;
    const startY = ((video.videoHeight || 640) - minDim) / 2;
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 640, 640);

    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();

    setIsCompressing(true);
    try {
      const compressed = await compressImageUnder500KB(rawDataUrl, 500 * 1024);
      setPhotoDataUrl(compressed.dataUrl);
      setPhotoSizeKB(compressed.sizeKB);
    } catch (e) {
      console.warn('Compression error:', e);
      setPhotoDataUrl(rawDataUrl);
    } finally {
      setIsCompressing(false);
    }
  };

  // Upload image from file & compress <= 500 KB
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImageUnder500KB(file, 500 * 1024);
        setPhotoDataUrl(compressed.dataUrl);
        setPhotoSizeKB(compressed.sizeKB);
      } catch (err) {
        console.warn('Compression error:', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleRetake = () => {
    setPhotoDataUrl(null);
    setPhotoSizeKB(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !wish.trim()) {
      alert('กรุณากรอกชื่อและคำอธิษฐานให้ครบถ้วนครับ 🌸');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        wish: wish.trim(),
        style: selectedStyle,
        photoDataUrl
      });

      // Reset Form
      setName('');
      setWish('');
      setPhotoDataUrl(null);
      setPhotoSizeKB(null);
      onClose();
    } catch (err) {
      console.error('Error submitting Krathong:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกลง Firestore กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="glass-modal w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-5 md:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-amber-300 flex items-center gap-2">
              <span>🌸</span> ส่งกระทงเข้าประกวด
            </h2>
            <span className="text-[11px] text-amber-200/70">บันทึกออนไลน์ผ่าน Firebase Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => { setActiveTab('camera'); setPhotoDataUrl(null); setPhotoSizeKB(null); }}
            className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm rounded-xl border flex justify-center items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-medium'
                : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Camera size={15} /> ถ่ายรูปจากกล้อง
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); stopCamera(); fileInputRef.current?.click(); }}
            className={`flex-1 py-1.5 md:py-2 text-xs md:text-sm rounded-xl border flex justify-center items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-medium'
                : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Upload size={15} /> อัปโหลดรูปภาพ
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Photo Preview Box */}
        <div className="w-full h-44 bg-slate-950 rounded-2xl overflow-hidden relative flex items-center justify-center border-2 border-dashed border-amber-400/30 mb-2">
          {isCompressing ? (
            <div className="text-center text-amber-300 text-xs flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-amber-400" size={28} />
              <span>กำลังบีบอัดรูปภาพให้ไม่เกิน 500 KB...</span>
            </div>
          ) : photoDataUrl ? (
            <img src={photoDataUrl} alt="รูปถ่ายผู้เข้าประกวด" className="w-full h-full object-cover" />
          ) : activeTab === 'camera' ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-slate-400 text-xs px-4">
              <Upload className="mx-auto mb-2 text-amber-400" size={28} />
              <span>แตะเพื่อเลือกรูปภาพจากเครื่อง</span>
            </div>
          )}

          <div className="absolute bottom-2.5 flex gap-2">
            {!photoDataUrl && !isCompressing && activeTab === 'camera' && (
              <button
                type="button"
                onClick={handleCapture}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={14} /> แชะรูปภาพ
              </button>
            )}
            {photoDataUrl && !isCompressing && (
              <button
                type="button"
                onClick={handleRetake}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> ถ่ายใหม่
              </button>
            )}
          </div>
        </div>

        {/* Image Compression Status Badge (<= 500 KB requirement) */}
        {photoSizeKB && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-xl py-1 px-2.5 mb-3">
            <CheckCircle size={13} className="text-emerald-400" />
            <span>ขนาดภาพ: <strong>{photoSizeKB} KB</strong> (ผ่านเกณฑ์ Firestore ไม่เกิน 500 KB)</span>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1">
              ชื่อผู้เข้าประกวด / เจ้าของกระทง *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น น้องฟ้าใส สายมู"
              maxLength={40}
              required
              disabled={isSubmitting}
              className="w-full bg-slate-900/80 border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1">
              คำอธิษฐานขอพร *
            </label>
            <textarea
              rows={2}
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="ขอขมาพระแม่คงคา และขอให้ปีนี้มีความสุข สุขภาพแข็งแรง..."
              maxLength={120}
              required
              disabled={isSubmitting}
              className="w-full bg-slate-900/80 border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {/* Style Picker */}
          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1.5">
              เลือกรูปแบบกระทง
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stylesList.map((st) => (
                <div
                  key={st.id}
                  onClick={() => !isSubmitting && setSelectedStyle(st.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedStyle === st.id
                      ? `bg-amber-400/20 border-amber-400 text-amber-300 font-medium shadow-[0_0_10px_rgba(255,215,0,0.25)]`
                      : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: st.color }} />
                  <span>{st.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-bold text-sm md:text-base shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:shadow-[0_0_28px_rgba(255,215,0,0.7)] cursor-pointer flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>กำลังบันทึกลง Firestore...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>บันทึกและปล่อยกระทงลงน้ำ 🌸</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
