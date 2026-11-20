import React from 'react';
import { Sparkles } from 'lucide-react';

export default function BottomBar({ onOpenCreate }) {
  return (
    <footer className="pointer-events-auto flex justify-center items-center pb-2">
      <button
        type="button"
        onClick={onOpenCreate}
        className="pointer-events-auto flex items-center gap-2.5 px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-bold text-sm md:text-base border-2 border-yellow-100 shadow-[0_0_28px_rgba(255,215,0,0.65)] hover:shadow-[0_0_38px_rgba(255,215,0,0.85)] hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 cursor-pointer"
      >
        <span className="text-xl md:text-2xl">🌸</span>
        <span>ร่วมลอยกระทง / ส่งเข้าประกวด</span>
        <Sparkles size={18} className="text-slate-900 hidden sm:inline" />
      </button>
    </footer>
  );
}

