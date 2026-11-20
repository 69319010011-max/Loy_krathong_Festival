import React from 'react';

export default function CameraHint() {
  return (
    <div className="self-center bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 md:px-5 md:py-2 rounded-full text-[11px] md:text-xs text-slate-200 shadow-lg animate-bounce pointer-events-none text-center">
      <span>✨ ลากเพื่อหมุนฉาก 360° • จีบนิ้วเพื่อซูมเข้า-ออก • แตะที่กระทงในแม่น้ำเพื่อโหวต ✨</span>
    </div>
  );
}

