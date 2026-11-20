import React from 'react';
import { X, Trophy, Heart } from 'lucide-react';

export default function LeaderboardModal({
  isOpen,
  leaderboardList,
  onSelectContestant,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-modal w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
          <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            <span>ตารางอันดับคะแนนโหวต</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-2">
          แตะที่รายชื่อเพื่อบินกล้องไปส่องกระทงในแม่น้ำ 🌸
        </p>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {leaderboardList.map((item, idx) => {
            const isGold = idx === 0;
            const isSilver = idx === 1;
            const isBronze = idx === 2;

            return (
              <div
                key={item.id}
                onClick={() => onSelectContestant(item.id)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isGold
                    ? 'bg-amber-400/15 border-amber-400/50 hover:bg-amber-400/25'
                    : isSilver
                    ? 'bg-slate-300/10 border-slate-300/40 hover:bg-slate-300/20'
                    : isBronze
                    ? 'bg-orange-600/15 border-orange-500/40 hover:bg-orange-600/25'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {/* Rank Badge */}
                <div className="w-7 text-center font-bold text-sm">
                  {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : idx + 1}
                </div>

                {/* Avatar */}
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                />

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs md:text-sm font-semibold text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.wish}
                  </div>
                </div>

                {/* Votes */}
                <div className="flex items-center gap-1 text-xs md:text-sm font-bold text-rose-400">
                  <Heart size={14} className="fill-rose-400" />
                  <span>{item.votes || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

