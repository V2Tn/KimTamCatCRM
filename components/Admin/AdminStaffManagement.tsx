
import React, { useState, useMemo } from 'react';
import { User, Task, TaskStatus, Role } from '../../types';
import { TaskItem } from '../Tasks/TaskItem';

interface AdminStaffManagementProps {
  users: User[];
  tasks: Task[];
  currentUser: User;
  onTaskClick: (task: Task, forceStatus?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const EVAL_MAP: Record<string, { label: string; color: string; bg: string; active: string }> = {
  "Xuất Sắc": { label: "Xuất Sắc", color: "text-purple-700", bg: "bg-purple-50 border-purple-100", active: "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100" },
  "Tốt": { label: "Tốt", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", active: "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100" },
  "Bình thường": { label: "Bình thường", color: "text-blue-700", bg: "bg-blue-50 border-blue-100", active: "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" },
  "Tệ": { label: "Tệ", color: "text-rose-700", bg: "bg-rose-50 border-rose-100", active: "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100" }
};

const STATUS_FILTER_MAP: Record<string, { label: string; color: string; bg: string; active: string }> = {
  "COMPLETED": { label: "Hoàn thành", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100", active: "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" },
  "PENDING": { label: "Chưa hoàn thành", color: "text-slate-700", bg: "bg-slate-50 border-slate-100", active: "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200" }
};

export const AdminStaffManagement: React.FC<AdminStaffManagementProps> = ({ 
  users, tasks, currentUser, onTaskClick, onEditTask, onDeleteTask, onUpdateTask 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTime, setFilterTime] = useState<'all' | 'week' | 'month'>('all');
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  const [userFilterKey, setUserFilterKey] = useState<Record<string, string | null>>({});
  const [userShowAll, setUserShowAll] = useState<Record<string, boolean>>({});

  const isSuperOrAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;
  const isManager = currentUser.role === Role.MANAGER;

  if (!isSuperOrAdmin && !isManager) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Truy cập bị từ chối</h2>
        <p className="text-slate-400 text-sm mt-2">Bạn không có quyền xem khu vực quản trị này.</p>
      </div>
    );
  }

  const handleUpdateStatus = (id: string, status: TaskStatus, additionalUpdates?: Partial<Task>) => {
    if (status === TaskStatus.DONE) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        onTaskClick(task, TaskStatus.DONE);
        return;
      }
    }
    onUpdateTask(id, { status, ...additionalUpdates });
  };

  const toggleFilter = (userId: string, filterKey: string) => {
    setUserFilterKey(prev => ({
      ...prev,
      [userId]: prev[userId] === filterKey ? null : filterKey
    }));
  };

  const departmentsData = useMemo(() => {
    const deptIds = Array.from(new Set(users.map(u => u.departmentId).filter(Boolean)));
    const deptMap: Record<string, string> = {
      'dept-1': 'Phòng Kỹ thuật',
      'dept-2': 'Phòng Kinh doanh',
      'dept-3': 'Phòng Nhân sự',
      'dept-4': 'Phòng Marketing',
      'dept-5': 'Phòng Kế toán',
      'dept-6': 'Phòng Vận hành',
      '': 'Chưa phân phòng'
    };
    
    let baseDepts = deptIds.map(id => ({ id: id as string, name: deptMap[id as string] || id as string }));

    // Rule: Manager only sees their own department
    if (isManager && currentUser.departmentId) {
      return baseDepts.filter(d => d.id === currentUser.departmentId);
    }
    
    return baseDepts;
  }, [users, isManager, currentUser.departmentId]);

  const departmentStats = useMemo(() => {
    const now = new Date();
    
    return departmentsData.map(dept => {
      const deptUsers = users.filter(u => u.departmentId === dept.id && !u.deletedAt);
      
      const userStats = deptUsers.map(user => {
        const userTasks = tasks.filter(t => t.assigneeId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const filteredByTime = userTasks.filter(t => {
          const createdAt = new Date(t.createdAt);
          if (filterTime === 'week') return createdAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (filterTime === 'month') return createdAt >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return true;
        });

        const done = filteredByTime.filter(t => t.status === TaskStatus.DONE).length;
        const pending = filteredByTime.length - done;
        const total = filteredByTime.length;
        const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

        const evals = { "Xuất Sắc": 0, "Tốt": 0, "Bình thường": 0, "Tệ": 0 };
        filteredByTime.forEach(t => { if (t.evaluation && evals.hasOwnProperty(t.evaluation)) evals[t.evaluation as keyof typeof evals]++; });

        return { 
          user, 
          stats: { done, pending, total, percentage }, 
          evals, 
          allTasks: filteredByTime 
        };
      });

      const totalDone = userStats.reduce((sum, u) => sum + u.stats.done, 0);
      const totalTasks = userStats.reduce((sum, u) => sum + u.stats.total, 0);

      return {
        id: dept.id,
        name: dept.name,
        users: userStats.filter(u => u.user.name.toLowerCase().includes(searchQuery.toLowerCase())),
        overallStats: {
          done: totalDone,
          total: totalTasks,
          percentage: totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100)
        }
      };
    }).filter(d => d.users.length > 0);
  }, [departmentsData, users, tasks, searchQuery, filterTime]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">BÁO CÁO NĂNG SUẤT</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
            {isManager ? `Dữ liệu ${departmentsData[0]?.name || 'phòng ban'}` : 'Dữ liệu nhân sự & Đánh giá hiệu quả công việc'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
            <input 
              type="text"
              placeholder="Tìm tên nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all text-xs font-bold"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['all', 'week', 'month'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterTime(t)}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${filterTime === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'all' ? 'Tất cả' : t === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentStats.map(dept => (
          <div 
            key={dept.id} 
            className={`bg-white rounded-[3rem] border shadow-sm transition-all duration-500 overflow-hidden ${expandedDeptId === dept.id ? 'lg:col-span-3 md:col-span-2' : 'hover:shadow-xl hover:border-indigo-100'}`}
          >
            <div 
              onClick={() => {
                setExpandedDeptId(expandedDeptId === dept.id ? null : dept.id);
                setExpandedUserId(null);
              }}
              className="p-8 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner border border-white">🏢</div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{dept.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{dept.users.length} Nhân sự</p>
                  </div>
                </div>
                <div className={`transition-transform duration-500 ${expandedDeptId === dept.id ? 'rotate-180' : ''}`}>
                  <span className="text-slate-200 text-xl">▼</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Tỷ lệ hoàn thành phòng ban</span>
                  <span className="text-indigo-600 text-xl font-black">{dept.overallStats.percentage}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-indigo-600" style={{ width: `${dept.overallStats.percentage}%` }}></div>
                </div>
              </div>
            </div>

            {expandedDeptId === dept.id && (
              <div className="bg-slate-50/50 p-6 md:p-10 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-4">
                  {dept.users.map(({ user, stats, evals, allTasks }) => {
                    const isExpanded = expandedUserId === user.id;
                    const activeFilter = userFilterKey[user.id];
                    const showAll = userShowAll[user.id];
                    
                    let filteredTasks = allTasks;
                    if (activeFilter === "COMPLETED") {
                      filteredTasks = allTasks.filter(t => t.status === TaskStatus.DONE);
                    } else if (activeFilter === "PENDING") {
                      filteredTasks = allTasks.filter(t => t.status !== TaskStatus.DONE);
                    } else if (activeFilter) {
                      filteredTasks = allTasks.filter(t => t.evaluation === activeFilter);
                    }
                    
                    const displayedTasks = showAll ? filteredTasks : filteredTasks.slice(0, 4);

                    return (
                      <div key={user.id} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden transition-all">
                        <div 
                          onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                          className="p-5 flex flex-col md:flex-row items-center gap-6 cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 w-full md:w-64 shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border-2 border-white shadow-sm overflow-hidden shrink-0">
                              {user.image_avatar ? <img src={user.image_avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-black text-slate-800 text-[13px] uppercase truncate">{user.name}</h5>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">{user.role}</p>
                            </div>
                          </div>

                          <div className="flex-1 w-full flex items-center gap-6">
                             <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${stats.percentage}%` }}></div>
                             </div>
                             <span className="text-[11px] font-black text-slate-800 w-10 text-right">{stats.percentage}%</span>
                          </div>

                          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <span className="text-slate-300">▼</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-6 pb-8 md:px-10 pt-4 animate-in slide-in-from-top-2 duration-300 border-t border-slate-50">
                            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
                              {/* Sidebar Filters */}
                              <div className="space-y-6">
                                <div className="space-y-3">
                                  <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex justify-between">
                                    LỌC TRẠNG THÁI
                                    {activeFilter && (activeFilter === "COMPLETED" || activeFilter === "PENDING") && <span className="text-indigo-500">●</span>}
                                  </h6>
                                  <div className="flex flex-col gap-2">
                                    {Object.entries(STATUS_FILTER_MAP).map(([key, cfg]) => {
                                      const isActive = activeFilter === key;
                                      const count = key === "COMPLETED" ? stats.done : stats.pending;
                                      return (
                                        <button 
                                          key={key} 
                                          onClick={(e) => { e.stopPropagation(); toggleFilter(user.id, key); }}
                                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all active:scale-95 ${isActive ? cfg.active : `${cfg.bg} ${cfg.color} border-current/10 hover:border-current/30`}`}
                                        >
                                          <span className="text-[9px] font-black uppercase tracking-tight">{cfg.label}</span>
                                          <span className="text-[11px] font-black">{count}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex justify-between">
                                    LỌC ĐÁNH GIÁ
                                    {activeFilter && EVAL_MAP[activeFilter] && <span className="text-indigo-500">●</span>}
                                  </h6>
                                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                                    {Object.entries(evals).map(([key, count]) => {
                                      const cfg = EVAL_MAP[key];
                                      const isActive = activeFilter === key;
                                      return (
                                        <button 
                                          key={key} 
                                          onClick={(e) => { e.stopPropagation(); toggleFilter(user.id, key); }}
                                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-95 ${isActive ? cfg.active : `${cfg.bg} ${cfg.color} border-current/5 hover:border-current/20`}`}
                                        >
                                          <span className="text-[9px] font-black uppercase tracking-tight">{key}</span>
                                          <span className="text-[11px] font-black">{count}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Task List Section */}
                              <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                                  <h6 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                    {activeFilter ? `ĐANG XEM: ${activeFilter === "COMPLETED" ? "HOÀN THÀNH" : activeFilter === "PENDING" ? "CHƯA HOÀN THÀNH" : activeFilter.toUpperCase()}` : 'CÔNG VIỆC GẦN ĐÂY'}
                                  </h6>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">KẾT QUẢ: {filteredTasks.length}</span>
                                    {activeFilter && (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setUserFilterKey(prev => ({...prev, [user.id]: null})); }}
                                        className="text-[9px] font-black text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:text-red-500 hover:border-red-100 transition-all"
                                      >BỎ LỌC</button>
                                    )}
                                  </div>
                                </div>
                                
                                {displayedTasks.length > 0 ? (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                      {displayedTasks.map(task => (
                                        <TaskItem 
                                          key={task.id}
                                          task={task}
                                          canDelete={true}
                                          currentUserId={currentUser.id}
                                          users={users}
                                          onEdit={onEditTask}
                                          onDelete={onDeleteTask}
                                          onUpdateStatus={handleUpdateStatus}
                                          onClick={() => onTaskClick(task)}
                                        />
                                      ))}
                                    </div>
                                    
                                    {filteredTasks.length > 4 && (
                                      <div className="flex justify-center pt-4">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setUserShowAll(prev => ({...prev, [user.id]: !prev[user.id]})); }}
                                          className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg flex items-center gap-3 ${showAll ? 'bg-slate-800 text-white' : 'bg-white border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100'}`}
                                        >
                                          {showAll ? 'THU GỌN DANH SÁCH' : `XEM TẤT CẢ ${filteredTasks.length} NHIỆM VỤ`}
                                          <span className="text-lg">{showAll ? '↑' : '↓'}</span>
                                        </button>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                                    <span className="text-4xl opacity-20">📂</span>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu trong mục này</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {departmentStats.length === 0 && (
        <div className="py-32 bg-white rounded-[4rem] border border-slate-100 text-center flex flex-col items-center gap-6 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl grayscale opacity-20">👥</div>
          <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.3em]">Không tìm thấy nhân sự phù hợp</p>
        </div>
      )}
    </div>
  );
};
