
import React from 'react';

interface TodayProgressProps {
  done: number;
  doing: number;
  todo: number;
  redo: number;
  paused: number;
}

export const TodayProgress: React.FC<TodayProgressProps> = ({ done, doing, todo, redo, paused }) => {
  const total = done + doing + todo + redo + paused;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  
  // SVG Circle calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-6">
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 80 80" className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-emerald-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-lg font-black text-slate-800 tracking-tighter">{percentage}%</span>
      </div>
      
      <div className="flex-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Tiến độ hôm nay</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
            <span className="text-[11px] font-medium text-slate-500"><b className="text-slate-900 font-black">{done}</b> Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
            <span className="text-[11px] font-medium text-slate-500"><b className="text-slate-900 font-black">{doing}</b> đang thực hiện</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            <span className="text-[11px] font-medium text-slate-500"><b className="text-slate-900 font-black">{todo}</b> chưa thực hiện</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
            <span className="text-[11px] font-medium text-slate-500"><b className="text-slate-900 font-black">{redo}</b> thực hiện lại</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.3)]"></div>
            <span className="text-[11px] font-medium text-slate-500"><b className="text-slate-900 font-black">{paused}</b> tạm dừng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
