import React from 'react';
import { Volume2, VolumeX, Trophy, Video } from 'lucide-react';

export default function TopBar({
  contestantCount,
  isAudioActive,
  onToggleAudio,
  onOpenLeaderboard,
  onResetCamera
}) {
  return (
    <header className="pointer-events-auto flex justify-between items-center glass-panel rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-2xl">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl md:text-3xl filter drop-shadow-[0_0_8px_#ffd54f]">🌕</span>
        <div>
          <h1 className="text-sm md:text-base font-semibold bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500 bg-clip-text text-transparent whitespace-nowrap">
            ลอยกระทงออนไลน์ 3D
          </h1>
          <span className="inline-block bg-amber-400/20 border border-amber-400/40 text-amber-200 text-[10px] md:text-xs px-2 py-0.5 rounded-full mt-0.5">
            {contestantCount > 0 ? `${contestantCount} กระทงในสายน้ำ` : 'รอร่วมลอยกระทง 🌸'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 text-xs md:text-sm px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border transition-all cursor-pointer ${
            isAudioActive
              ? 'bg-amber-500 border-amber-300 text-slate-950 font-medium shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
          }`}
          title="เปิด/ปิดเสียงดนตรีไทย"
        >
          {isAudioActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden sm:inline">ดนตรีไทย</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 text-xs md:text-sm px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-white/10 hover:bg-amber-400/20 border border-white/20 hover:border-amber-400/60 text-white transition-all cursor-pointer"
          title="ดูอันดับคะแนนโหวต"
        >
          <Trophy size={16} className="text-amber-400" />
          <span className="hidden sm:inline">อันดับโหวต</span>
        </button>

        <button
          onClick={onResetCamera}
          className="flex items-center gap-1.5 text-xs md:text-sm px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl bg-white/10 hover:bg-amber-400/20 border border-white/20 hover:border-amber-400/60 text-white transition-all cursor-pointer"
          title="รีเซ็ตมุมกล้องภาพรวม"
        >
          <Video size={16} className="text-cyan-400" />
          <span className="hidden sm:inline">มุมกล้อง</span>
        </button>
      </div>
    </header>
  );
}

