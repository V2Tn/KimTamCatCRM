
import React from 'react';
import { TaskItem } from '../Tasks/TaskItem';
import { EisenhowerMatrix } from '../Tasks/EisenhowerMatrix';
import { Task, User, Quadrant } from '../../types';
import { QUADRANT_CONFIG } from '../../constants';

type TabType = 'Hôm nay' | 'Tuần' | 'Tháng' | 'Năm';
type ViewMode = 'list' | 'matrix';

interface DashboardViewProps {
  currentUser: User;
  users: User[];
  visibleTasks: Task[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onTaskClick: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onCreateTaskClick: () => void;
  checkCanDelete: (task: Task) => boolean;
  stats: {
    done: number;
    doing: number;
    todo: number;
    redo: number;
    paused: number;
    closed: number;
    total: number;
  };
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-1000">
    <div className="w-72 h-72 mb-8 opacity-40">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-indigo-200">
        <rect x="40" y="40" width="120" height="120" rx="24" fill="currentColor" />
        <path d="M70 80H130M70 100H130M70 120H100" stroke="white" strokeWidth="8" strokeLinecap="round" />
        <circle cx="150" cy="50" r="20" fill="#FBBF24" />
        <path d="M140 50L150 60L160 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-[0.2em]">Tất cả đã hoàn thành!</h3>
    <p className="text-slate-400 font-medium mt-3 text-center max-w-sm px-6">Tuyệt vời, hiện không có nhiệm vụ nào cần xử lý. Hãy nghỉ ngơi hoặc tạo thêm đầu việc mới.</p>
  </div>
);

const ProgressRing: React.FC<{ percentage: number; radius?: number; strokeWidth?: number }> = ({ 
  percentage, 
  radius = 42, 
  strokeWidth = 8 
}) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-white/10" />
        <circle 
          cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          className="text-emerald-400 transition-all duration-1000 ease-out" 
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xl font-black text-white">{percentage}%</span>
        <span className="text-[7px] font-black uppercase tracking-widest text-emerald-400 mt-0.5">XONG</span>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  users,
  visibleTasks,
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  onTaskClick,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onCreateTaskClick,
  checkCanDelete,
  stats
}) => {
  const percentage = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. Navigation & Quick Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
          {(['Hôm nay', 'Tuần', 'Tháng', 'Năm'] as TabType[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 md:px-6 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-indigo-50 p-1 rounded-2xl border border-indigo-100 flex-1 md:flex-none">
            <button onClick={() => setViewMode('list')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}>Danh sách</button>
            <button onClick={() => setViewMode('matrix')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}>Ma trận</button>
          </div>
          <button 
            onClick={onCreateTaskClick} 
            className="flex-1 md:flex-none px-6 py-3 bg-[#111827] hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> THÊM CÔNG VIỆC
          </button>
        </div>
      </div>

      {/* 2. Unified Stats & Progress Header */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6">
        {/* Khối Tổng quan & Tiến độ (Dạng Ngang) */}
        <div className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden group flex items-center justify-between">
          <div className="relative z-10 space-y-2">
             <div className="flex items-center gap-2">
               <span className="w-6 h-[2px] bg-emerald-400"></span>
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">TIẾN ĐỘ HÔM NAY</span>
             </div>
             <div className="flex items-baseline gap-3">
               <h2 className="text-6xl font-black tracking-tighter animate-in slide-in-from-left-4 duration-500">
                {stats.total}
               </h2>
               <div className="flex flex-col">
                  <span className="text-lg font-bold opacity-40 uppercase tracking-widest leading-none">Task</span>
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.1em] mt-1 italic">Khối lượng</span>
               </div>
             </div>
          </div>
          <div className="relative z-10 scale-110">
            <ProgressRing percentage={percentage} />
          </div>
        </div>

        {/* Khối Phân rã trạng thái (Bao gồm Đã đóng) */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Hoàn thành</p>
                <p className="text-xl font-black text-slate-800">{stats.done}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Đang thực hiện</p>
                <p className="text-xl font-black text-slate-800">{stats.doing}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Thực hiện lại</p>
                <p className="text-xl font-black text-slate-800">{stats.redo}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tạm dừng</p>
                <p className="text-xl font-black text-slate-800">{stats.paused}</p>
              </div>
              <div className="p-3 bg-[#1e293b] rounded-2xl border border-slate-800 shadow-sm">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Đã đóng</p>
                <p className="text-xl font-black text-white">{stats.closed}</p>
              </div>
              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Chưa thực hiện</p>
                <p className="text-xl font-black text-slate-800">{stats.todo}</p>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Task List or Matrix View */}
      {visibleTasks.length === 0 ? (
        <EmptyState />
      ) : activeTab === 'Hôm nay' ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700 mt-8">
              {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map(q => {
                const qTasks = visibleTasks.filter(t => t.quadrant === q);
                if (qTasks.length === 0) return null;
                return (
                  <div key={q} className="space-y-5">
                    <div className="flex items-center gap-4 px-2">
                      <h3 className={`font-black uppercase tracking-[0.25em] text-[10px] flex items-center gap-3 ${QUADRANT_CONFIG[q].color}`}>
                        <span className="w-10 h-[1px] bg-current opacity-30"></span>
                        {QUADRANT_CONFIG[q].title}
                        <span className="text-[10px] font-black opacity-30">({qTasks.length})</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {qTasks.map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          canDelete={checkCanDelete(task)}
                          onToggle={onToggleTask}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onClick={() => onTaskClick(task)}
                          currentUserId={currentUser.id}
                          users={users}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EisenhowerMatrix 
              tasks={visibleTasks} 
              onTaskClick={onTaskClick} 
              onAddTask={(q) => onCreateTaskClick()} 
              currentUserId={currentUser.id} 
            />
          )}
        </>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-20 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-4">
          <div className="text-6xl grayscale opacity-30">📊</div>
          <p className="font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Phân tích dữ liệu {activeTab}...</p>
        </div>
      )}
    </div>
  );
};
