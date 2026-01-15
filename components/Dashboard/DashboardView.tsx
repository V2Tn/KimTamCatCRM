
import React, { useState, useMemo } from 'react';
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
      <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
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
        <span className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter">{percentage}%</span>
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
  const percentage = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);
  const [expandedQuadrants, setExpandedQuadrants] = useState<Set<Quadrant>>(new Set());

  const toggleQuadrant = (q: Quadrant) => {
    const newSet = new Set(expandedQuadrants);
    if (newSet.has(q)) newSet.delete(q);
    else newSet.add(q);
    setExpandedQuadrants(newSet);
  };

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

  // Mock data for charts based on period
  const chartData = useMemo(() => {
    if (activeTab === 'Tuần') {
      return [
        { name: '06/01', done: 3, total: 4 },
        { name: '07/01', done: 0, total: 0 },
        { name: '08/01', done: 0, total: 0 },
        { name: '09/01', done: 0, total: 0 },
        { name: '10/01', done: 0, total: 0 },
        { name: '11/01', done: 0, total: 0 },
        { name: '12/01', done: 0, total: 0 },
        { name: '13/01', done: 0, total: 0 },
        { name: '14/01', done: 0, total: 0 },
        { name: '15/01', done: 1, total: 9 },
      ];
    }
    if (activeTab === 'Tháng') {
      return [
        { name: 'Tuần 1', done: 5, total: 12 },
        { name: 'Tuần 2', done: 8, total: 15 },
        { name: 'Tuần 3', done: 3, total: 20 },
        { name: 'Tuần 4', done: 12, total: 14 },
      ];
    }
    if (activeTab === 'Năm') {
      return [
        { name: 'T1', done: 40, total: 50 },
        { name: 'T2', done: 30, total: 45 },
        { name: 'T3', done: 55, total: 60 },
        { name: 'T4', done: 20, total: 30 },
      ];
    }
    return [];
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Top Navigation Bar - Pill Shape */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
        <div className="flex bg-slate-50/80 p-1 rounded-full w-full md:w-auto">
          {(['Hôm nay', 'Tuần', 'Tháng', 'Năm'] as TabType[]).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-indigo-50/50 p-1 rounded-full border border-indigo-100/50">
            <button 
              onClick={() => setViewMode('list')} 
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}
            >
              Danh sách
            </button>
            <button 
              onClick={() => setViewMode('matrix')} 
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}
            >
              Ma trận
            </button>
          </div>
          <button 
            onClick={onCreateTaskClick} 
            className="px-8 py-3.5 bg-[#111827] hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-full shadow-2xl transition-all active:scale-95 flex items-center gap-3"
          >
            <span className="text-lg">+</span> THÊM CÔNG VIỆC
          </button>
        </div>
      </div>

      {/* Stats Section - ONLY visible on "Hôm nay" tab */}
      {activeTab === 'Hôm nay' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 px-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiến độ hôm nay</h3>
            <div className="h-[1px] bg-slate-100 flex-1"></div>
          </div>

          <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Progress Section */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <ProgressRing percentage={percentage} />
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Tỉ lệ hoàn thành</p>
            </div>

            {/* Vertical Divider for desktop */}
            <div className="hidden lg:block w-[1px] h-32 bg-slate-100/80"></div>

            {/* Status Grid Section */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100/40 hover:bg-emerald-50 transition-all cursor-default text-center">
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Hoàn thành</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.done}</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-3xl border border-blue-100/40 hover:bg-blue-50 transition-all cursor-default text-center">
                  <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1">Đang thực hiện</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.doing}</p>
                </div>
                <div className="p-4 bg-amber-50/50 rounded-3xl border border-amber-100/40 hover:bg-amber-50 transition-all cursor-default text-center">
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Thực hiện lại</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.redo}</p>
                </div>
                <div className="p-4 bg-orange-50/50 rounded-3xl border border-orange-100/40 hover:bg-orange-50 transition-all cursor-default text-center">
                  <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mb-1">Tạm dừng</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.paused}</p>
                </div>
                <div className="p-4 bg-rose-50/80 rounded-3xl border border-rose-100/40 hover:bg-rose-100 transition-all cursor-default text-center">
                  <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-1">Hủy</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.cancelled}</p>
                </div>
                <div className="p-4 bg-indigo-50/40 rounded-3xl border border-indigo-100/30 hover:bg-indigo-50 transition-all cursor-default text-center md:col-span-1 lg:col-span-3 xl:col-span-1">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Chưa thực hiện</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{stats.todo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Periodic Summary Section - Visible on Weekly, Monthly, Yearly */}
      {activeTab !== 'Hôm nay' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Banner (Purple Card) */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform"></div>
            <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Hoàn thành {activeTab.toLowerCase()} này</h4>
              </div>
              <div>
                <span className="text-7xl font-black tracking-tighter leading-none">{stats.done}</span>
                <span className="text-lg font-bold ml-4 uppercase tracking-widest opacity-70">Công việc</span>
              </div>
              <div className="pt-2">
                <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                  {activeTab === 'Tuần' ? '12/01 - 18/01' : activeTab === 'Tháng' ? 'Tháng 01/2026' : 'Năm 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Chart Container */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Biểu đồ tiến độ <span className="text-slate-300 font-medium lowercase">({activeTab === 'Tuần' ? '10 ngày gần nhất' : activeTab === 'Tháng' ? 'Các tuần trong tháng' : 'Các tháng trong năm'})</span></h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 animate-in zoom-in-95">
                            <p className="text-[10px] font-black uppercase mb-1">{payload[0].payload.name}</p>
                            <p className="text-[9px] font-bold text-emerald-400 uppercase">Hoàn thành: {payload[0].value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Tổng cộng: {payload[0].payload.total}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Background Bar (Total) */}
                  <Bar dataKey="total" fill="#F1F5F9" radius={[6, 6, 0, 0]} barSize={32} />
                  {/* Progress Bar (Done) */}
                  <Bar dataKey="done" radius={[6, 6, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#4F46E5" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Task List Header Decor */}
      {visibleTasks.length > 0 && (
        <div className="flex items-center gap-4 px-6 pt-4">
          <div className="flex items-center gap-3">
            <span className="text-indigo-600">📊</span>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Nhật ký công việc</h3>
          </div>
          <div className="h-[1px] bg-slate-100 flex-1"></div>
        </div>
      )}

      {/* Task List Section */}
      {visibleTasks.length === 0 ? (
        <EmptyState />
      ) : activeTab === 'Hôm nay' ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-12 mt-4">
              {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map(q => {
                const qTasks = visibleTasks.filter(t => t.quadrant === q);
                if (qTasks.length === 0) return null;
                
                const isExpanded = expandedQuadrants.has(q);
                const displayTasks = isExpanded ? qTasks : qTasks.slice(0, 4);

                return (
                  <div key={q} className="space-y-6">
                    {/* Section Header with Line Decoration */}
                    <div className="flex items-center gap-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full ${q === Quadrant.Q1 ? 'bg-red-500' : q === Quadrant.Q2 ? 'bg-blue-500' : q === Quadrant.Q3 ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                        <h3 className="font-black text-slate-800 uppercase tracking-[0.2em] text-[13px] flex items-center gap-2">
                          {QUADRANT_CONFIG[q].title}
                          <span className="text-slate-300 font-bold ml-1">({qTasks.length})</span>
                        </h3>
                      </div>
                      <div className="h-[1px] bg-slate-100 flex-1"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
                      {displayTasks.map(task => (
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

                    {qTasks.length > 4 && (
                      <div className="flex justify-center pt-2">
                        <button 
                          onClick={() => toggleQuadrant(q)}
                          className="px-6 py-2 rounded-full bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                        >
                          {isExpanded ? 'Thu gọn' : `Xem thêm ${qTasks.length - 4} việc`}
                        </button>
                      </div>
                    )}
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
        /* Period View (Week/Month/Year) - Just list tasks for simplicity but with period headers */
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
            {visibleTasks.map(task => (
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
      )}
    </div>
  );
};
