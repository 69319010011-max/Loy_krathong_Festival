import React from 'react';
import { X, Heart } from 'lucide-react';

export default function VoteModal({
  isOpen,
  contestant,
  hasVoted,
  onVote,
  onClose
}) {
  if (!isOpen || !contestant) return null;

  const styleNames = {
    lotus_pink: '🪷 ดอกบัวสีชมพู',
    traditional_green: '🌿 ใบตองดั้งเดิม',
    golden_sukhothai: '✨ สุโขทัยสีทอง',
    purple_orchid: '💜 กล้วยไม้สีม่วง'
  };

  const handleVoteClick = (e) => {
    onVote(contestant.id, e.clientX, e.clientY);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-modal w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="text-amber-300 font-bold text-sm mb-4 flex items-center justify-center gap-1.5">
          <span>🪷</span> ข้อมูลกระทงผู้เข้าประกวด
        </div>

        {/* Avatar Frame with Gold Aura */}
        <div className="w-28 h-28 mx-auto mb-3.5 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_24px_rgba(255,215,0,0.5)]">
          <img
            src={contestant.avatar}
            alt={contestant.name}
            className="w-full h-full object-cover rounded-full bg-slate-800"
          />
        </div>

        {/* Name & Badge */}
        <h3 className="text-lg md:text-xl font-bold text-white mb-1">
          {contestant.name}
        </h3>
        <span className="inline-block bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs px-3 py-0.5 rounded-full mb-3.5">
          {styleNames[contestant.style] || 'กระทงไทย'}
        </span>

        {/* Wish Quote Box */}
        <div className="bg-white/5 border-l-4 border-amber-400 rounded-lg p-3 text-left mb-4">
          <div className="text-[11px] text-amber-300/80 font-medium mb-1">🪔 คำอธิษฐาน:</div>
          <div className="text-xs md:text-sm text-slate-200 italic leading-relaxed">
            "{contestant.wish}"
          </div>
        </div>

        {/* Vote Score Tally */}
        <div className="flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 mb-4">
          <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={26} />
          <div className="text-left">
            <div className="text-2xl font-bold text-rose-400 leading-none">
              {contestant.votes || 0}
            </div>
            <div className="text-[11px] text-slate-300">คะแนนโหวตทั้งหมด</div>
          </div>
        </div>

        {/* Vote Button */}
        <button
          onClick={handleVoteClick}
          className={`w-full py-3 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
            hasVoted
              ? 'bg-slate-700 text-slate-400 cursor-default'
              : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-[0_4px_20px_rgba(244,63,94,0.5)] hover:-translate-y-0.5'
          }`}
        >
          <Heart size={18} className={hasVoted ? 'fill-slate-400' : 'fill-white'} />
          <span>{hasVoted ? 'โหวตแล้ว ขอบคุณครับ!' : 'กดโหวตให้คะแนน (Vote)'}</span>
        </button>
      </div>
    </div>
  );
}

