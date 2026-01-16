
import React, { useState, useMemo, useEffect } from 'react';
import { TaskItem } from '../Tasks/TaskItem';
import { EisenhowerMatrix } from '../Tasks/EisenhowerMatrix';
import { Task, User, Quadrant, TaskStatus } from '../../types';
import { QUADRANT_CONFIG, STATUS_CONFIG } from '../../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

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
  onTaskClick: (task: Task, forceStatus?: TaskStatus) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
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
    cancelled: number;
    total: number;
  };
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-1000">
    <div className="w-72 h-72 mb-8 opacity-20">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-indigo-200">
        <rect x="40" y="40" width="120" height="120" rx="24" fill="currentColor" />
        <path d="M70 80H130M70 100H130M70 120H100" stroke="white" strokeWidth="8" strokeLinecap="round" />
        <circle cx="150" cy="50" r="20" fill="#FBBF24" />
        <path d="M140 50L150 60L160 40" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">Chưa có dữ liệu</h3>
  </div>
);

const ProgressRing: React.FC<{ percentage: number; radius?: number; strokeWidth?: number }> = ({ 
  percentage, 
  radius = 36, 
  strokeWidth = 10 
}) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-28 h-28 md:w-40 md:h-40 transform -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-100" />
        <circle 
          cx="50" cy="50" r={radius} stroke="url(#progressGradient)" strokeWidth={strokeWidth} fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          className="transition-all duration-1000 ease-out drop-shadow-sm" 
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">{percentage}%</span>
      </div>
    </div>
  );
};

const TaskLogAccordion: React.FC<{ 
  tasks: Task[]; 
  onTaskClick: (t: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}> = ({ tasks, onTaskClick, onUpdateTask }) => {
  const [openGroups, setOpenGroups] = useState<Set<string> | null>(null);

  const groupedTasks = useMemo<Record<string, Task[]>>(() => {
    const groups: Record<string, Task[]> = {};
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    sortedTasks.forEach((task: Task) => {
      const date = new Date(task.createdAt);
      const dayNames = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
      const dateStr = `${dayNames[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(task);
    });
    return groups;
  }, [tasks]);

  const toggleGroup = (date: string) => {
    // FIX: Safely determine the initial open group to avoid undefined issues with Object.keys access
    const keys = Object.keys(groupedTasks);
    const firstKey = keys.length > 0 ? keys[0] : '';
    const currentOpen = openGroups || new Set(firstKey ? [firstKey] : []);
    const next = new Set(currentOpen);
    if (next.has(date)) next.delete(date);
    else next.add(date);
    setOpenGroups(next);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-indigo-600 text-lg md:text-xl font-black italic">≡</span>
          <h3 className="text-[12px] md:text-sm font-black text-slate-800 uppercase tracking-widest">Nhật ký công việc</h3>
        </div>
        <button className="px-3 md:px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all">
          Đã xong
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {/* FIX: Explicitly cast Object.entries to Task[] to prevent 'map' not found on unknown type error */}
        {(Object.entries(groupedTasks) as [string, Task[]][]).map(([date, groupTasks], idx) => {
          const isOpen = openGroups ? openGroups.has(date) : idx === 0;
          return (
            <div key={date} className="overflow-hidden">
              <button 
                onClick={() => toggleGroup(date)}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-slate-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <span className={`transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                  <span className="text-[12px] md:text-[13px] font-black text-slate-700 tracking-tight">{date}</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                   {!isOpen && <span className="hidden sm:inline-block text-[10px] text-slate-300 font-bold italic uppercase tracking-widest">XEM</span>}
                   <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[9px] md:text-[10px] font-black">{groupTasks.length}</span>
                </div>
              </button>

              {isOpen && (
                <div className="bg-white divide-y divide-slate-50 animate-in slide-in-from-top-2 duration-300">
                  {groupTasks.map(task => {
                    const statusCfg = STATUS_CONFIG[task.status];
                    const quadCfg = QUADRANT_CONFIG[task.quadrant];
                    const isCompleted = task.status === TaskStatus.DONE;
                    const isCancelled = task.status === TaskStatus.CANCELLED;
                    const dateObj = new Date(task.createdAt);
                    const timeStr = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')} ${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => onTaskClick(task)}
                        className="flex items-center gap-3 md:gap-4 p-4 md:p-5 pl-8 md:pl-14 hover:bg-slate-50 transition-all cursor-pointer group/row"
                      >
                        <div className="shrink-0">
                          {isCancelled ? (
                            <span className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-slate-200 text-slate-300 text-[8px] md:text-[10px] font-black">✕</span>
                          ) : isCompleted ? (
                            <span className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-emerald-500 text-emerald-500 text-[8px] md:text-[10px] font-black">✓</span>
                          ) : (
                            <span className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-indigo-200 text-indigo-300"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] md:text-[13px] font-bold text-slate-700 mb-1 md:mb-1.5 truncate ${isCancelled || isCompleted ? 'line-through text-slate-300 italic' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest ${statusCfg.bgColor} ${statusCfg.color} border border-current/10 whitespace-nowrap`}>
                              {statusCfg.title}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest ${quadCfg.tagBg} ${quadCfg.tagText} whitespace-nowrap`}>
                              {quadCfg.title}
                            </span>
                            <div className="flex items-center gap-1 text-slate-300 ml-1">
                              <span className="text-[9px] md:text-[10px]">🕒</span>
                              <span className="text-[8px] md:text-[9px] font-bold">{timeStr}</span>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transition-all">
                          {(isCancelled || isCompleted) && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onUpdateTask(task.id, { status: TaskStatus.REDO }); }}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-white transition-all"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onCreateTaskClick,
  checkCanDelete,
  stats
}) => {
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const todayStats = useMemo(() => {
    const today = new Date();
    const todayTasks = visibleTasks.filter((t: Task) => isSameDay(new Date(t.createdAt), today));
    
    const done = todayTasks.filter((t: Task) => t.status === TaskStatus.DONE).length;
    const total = todayTasks.length;
    
    return {
      done,
      doing: todayTasks.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS).length,
      todo: todayTasks.filter((t: Task) => t.status === TaskStatus.TODO).length,
      redo: todayTasks.filter((t: Task) => t.status === TaskStatus.REDO).length,
      paused: todayTasks.filter((t: Task) => t.status === TaskStatus.PAUSED).length,
      cancelled: todayTasks.filter((t: Task) => t.status === TaskStatus.CANCELLED).length,
      total,
      percentage: total === 0 ? 0 : Math.round((done / total) * 100)
    };
  }, [visibleTasks]);

  const [expandedQuadrants, setExpandedQuadrants] = useState<Set<Quadrant>>(new Set());

  const handleUpdateStatus = (id: string, status: TaskStatus, additionalUpdates?: Partial<Task>) => {
    if (status === TaskStatus.DONE) {
      const task = visibleTasks.find(t => t.id === id);
      if (task) {
        onTaskClick(task, TaskStatus.DONE);
        return;
      }
    }
    onUpdateTask(id, { status, ...additionalUpdates });
  };

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    if (activeTab === 'Tuần') {
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const dayTasks = visibleTasks.filter(t => isSameDay(new Date(t.createdAt), d));
        const doneCount = dayTasks.filter(t => t.status === TaskStatus.DONE).length;
        data.push({
          name: dStr,
          done: doneCount,
          remaining: dayTasks.length - doneCount,
          total: dayTasks.length
        });
      }
    } else if (activeTab === 'Tháng') {
      for (let i = 3; i >= 0; i--) {
        const weekName = `T${4-i}`;
        const start = new Date();
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(now.getDate() - i * 7);
        const weekTasks = visibleTasks.filter(t => {
          const createdAt = new Date(t.createdAt);
          return createdAt >= start && createdAt <= end;
        });
        const doneCount = weekTasks.filter(t => t.status === TaskStatus.DONE).length;
        data.push({
          name: weekName,
          done: doneCount,
          remaining: weekTasks.length - doneCount,
          total: weekTasks.length
        });
      }
    } else if (activeTab === 'Năm') {
      for (let i = 0; i < 4; i++) {
        const mName = `T${i + 1}`;
        const mTasks = visibleTasks.filter(t => {
          const createdAt = new Date(t.createdAt);
          return createdAt.getMonth() === i && createdAt.getFullYear() === now.getFullYear();
        });
        const doneCount = mTasks.filter(t => t.status === TaskStatus.DONE).length;
        data.push({
          name: mName,
          done: doneCount,
          remaining: mTasks.length - doneCount,
          total: mTasks.length
        });
      }
    }
    return data;
  }, [activeTab, visibleTasks]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center bg-white p-2 md:p-2.5 rounded-[2rem] md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
        <div className="flex bg-slate-50/80 p-1 rounded-full w-full md:w-auto overflow-x-auto hide-scrollbar">
          {(['Hôm nay', 'Tuần', 'Tháng', 'Năm'] as TabType[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 md:px-8 py-2 md:py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] rounded-full transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <div className="flex flex-1 md:flex-none bg-indigo-50/50 p-1 rounded-full border border-indigo-100/50">
            <button 
              onClick={() => setViewMode('list')} 
              className={`flex-1 md:flex-none px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}
            >
              D.Sách
            </button>
            <button 
              onClick={() => setViewMode('matrix')} 
              className={`flex-1 md:flex-none px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}
            >
              Ma trận
            </button>
          </div>
          <button 
            onClick={onCreateTaskClick} 
            className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-3.5 bg-[#111827] hover:bg-black text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>+</span> THÊM
          </button>
        </div>
      </div>

      {activeTab === 'Hôm nay' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 px-4 md:px-6">
            <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiến độ</h3>
            <div className="h-[1px] bg-slate-100 flex-1"></div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
            <div className="shrink-0 flex flex-col items-center gap-2">
              <ProgressRing percentage={todayStats.percentage} />
              <p className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest uppercase">Tỉ lệ xong</p>
            </div>
            <div className="hidden lg:block w-[1px] h-32 bg-slate-100/80"></div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 md:gap-4">
                {[
                  { label: 'Hoàn thành', val: todayStats.done, color: 'emerald' },
                  { label: 'Đang làm', val: todayStats.doing, color: 'blue' },
                  { label: 'Làm lại', val: todayStats.redo, color: 'amber' },
                  { label: 'Tạm dừng', val: todayStats.paused, color: 'orange' },
                  { label: 'Hủy', val: todayStats.cancelled, color: 'rose' }
                ].map((s, i) => (
                  <div key={i} className={`p-3 md:p-4 bg-${s.color}-50/50 rounded-2xl md:rounded-3xl border border-${s.color}-100/40 text-center`}>
                    <p className={`text-[7px] md:text-[8px] font-black text-${s.color}-600 uppercase tracking-widest mb-1`}>{s.label}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="space-y-8 md:space-y-12">
              {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map(q => {
                const qTasks = visibleTasks.filter(t => t.quadrant === q && isSameDay(new Date(t.createdAt), new Date()));
                if (qTasks.length === 0) return null;

                return (
                  <div key={q} className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 md:gap-4 px-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-1 h-5 md:w-1.5 md:h-6 rounded-full ${q === Quadrant.Q1 ? 'bg-red-500' : q === Quadrant.Q2 ? 'bg-blue-500' : q === Quadrant.Q3 ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                        <h3 className="font-black text-slate-800 uppercase tracking-[0.1em] md:tracking-[0.2em] text-[11px] md:text-[13px] flex items-center gap-2">
                          {QUADRANT_CONFIG[q].title}
                          <span className="text-slate-300 font-bold ml-1">({qTasks.length})</span>
                        </h3>
                      </div>
                      <div className="h-[1px] bg-slate-100 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-2 md:px-2">
                      {qTasks.map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          canDelete={checkCanDelete(task)}
                          onUpdateStatus={handleUpdateStatus}
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
              tasks={visibleTasks.filter(t => isSameDay(new Date(t.createdAt), new Date()))} 
              onTaskClick={onTaskClick} 
              onAddTask={onCreateTaskClick} 
              currentUserId={currentUser.id} 
            />
          )}
        </div>
      )}

      {activeTab !== 'Hôm nay' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full -mr-10 md:-mr-20 -mt-10 md:-mt-20"></div>
            <div className="relative z-10 space-y-2 md:space-y-4">
              <h4 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Hoàn thành {activeTab.toLowerCase()}</h4>
              <div className="flex items-end gap-2">
                <span className="text-5xl md:text-7xl font-black tracking-tighter leading-none">{stats.done}</span>
                <span className="text-xs md:text-lg font-bold uppercase tracking-widest opacity-70 mb-2 md:mb-4">Công việc</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-sm border border-slate-100 space-y-4 md:space-y-6">
            <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Biểu đồ tiến độ</h3>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 8, fontWeight: 700 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 8, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    content={({ active, payload }: any) => {
                      // FIX: Cast payload to any and use Array.isArray/length safely to avoid property 'length' does not exist on type 'unknown' error
                      if (active && payload && (payload as any).length) {
                        const data = (payload as any)[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 md:p-3 rounded-xl shadow-2xl border border-slate-800">
                            <p className="text-[8px] md:text-[10px] font-black uppercase mb-1">{data.name}</p>
                            <p className="text-[7px] md:text-[9px] font-bold text-emerald-400 uppercase">Xong: {data.done}</p>
                            <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase">Còn: {data.remaining}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="done" stackId="a" fill="#4F46E5" radius={[0, 0, 0, 0]} barSize={24} />
                  <Bar dataKey="remaining" stackId="a" fill="#F1F5F9" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <TaskLogAccordion 
            tasks={visibleTasks} 
            onTaskClick={onTaskClick} 
            onUpdateTask={onUpdateTask}
          />
        </div>
      )}
    </div>
  );
};
