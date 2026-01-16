
import React from 'react';
import { Task, TaskStatus, User } from '../../types';
import { STATUS_CONFIG } from '../../constants';

// Hệ thống SVG Icons chuyên nghiệp
const Icons = {
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Redo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )
};

interface TaskItemProps {
  task: Task;
  canDelete: boolean;
  onUpdateStatus: (id: string, status: TaskStatus, additionalUpdates?: Partial<Task>) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
  currentUserId: string;
  users: User[];
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, onUpdateStatus, onClick, onEdit, onDelete, users, currentUserId 
}) => {
  const isFinished = task.status === TaskStatus.DONE;
  const statusConfig = STATUS_CONFIG[task.status];
  const creatorUser = users.find(u => u.id === task.creatorId);
  const assigneeUser = users.find(u => u.id === task.assigneeId);
  const lastLog = task.logs && task.logs.length > 0 ? task.logs[task.logs.length - 1] : null;

  const isOverdue = React.useMemo(() => {
    if (!task.endDate || isFinished || task.status === TaskStatus.CANCELLED) return false;
    return new Date(task.endDate) < new Date();
  }, [task.endDate, isFinished, task.status]);

  const isRelated = currentUserId === task.creatorId || currentUserId === task.assigneeId;
  const showQuickActions = isRelated && (
    (task.assigneeId === task.creatorId) || 
    isOverdue || 
    task.status === TaskStatus.TODO || 
    task.status === TaskStatus.REDO ||
    task.status === TaskStatus.IN_PROGRESS ||
    task.status === TaskStatus.PAUSED ||
    (task.status === TaskStatus.DONE && task.evaluation === "Tệ") ||
    task.status === TaskStatus.CANCELLED
  );

  const creatorDisplayName = task.creatorId === currentUserId ? 'Tôi' : (creatorUser?.name || '---');
  const assigneeDisplayName = task.assigneeId === currentUserId ? 'Tôi' : (assigneeUser?.name || '---');

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const yr = d.getFullYear();
    return `${hh}:${mm} ${dd}/${mo}/${yr}`;
  };

  const handleQuickAction = (e: React.MouseEvent, status: TaskStatus) => {
    e.stopPropagation();
    onUpdateStatus(task.id, status);
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.8rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 cursor-pointer grid grid-cols-[1fr_auto] gap-4 md:gap-6 active:scale-[0.99] ${isFinished ? 'bg-slate-50/50' : ''}`}
    >
      <div className="flex flex-col gap-3 md:gap-4 min-w-0 overflow-hidden">
        {/* Tiêu đề: Đảm bảo hiển thị đầy đủ */}
        <h4 className={`text-[14px] md:text-[16px] font-black text-slate-800 leading-tight transition-all break-words whitespace-normal ${isFinished ? 'line-through text-slate-300 italic' : ''}`}>
          {task.title}
        </h4>

        {/* Thông tin Meta: Sửa lỗi đè chữ trên mobile bằng flex-wrap */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 md:gap-2">
          <span className={`px-1.5 py-0.5 rounded-lg text-[7px] md:text-[7.5px] font-black uppercase tracking-wider border whitespace-nowrap ${statusConfig?.bgColor || 'bg-slate-50'} ${statusConfig?.color || 'text-slate-500'} border-current/10`}>
            {statusConfig?.title || 'N/A'}
          </span>
          
          <span className="hidden md:block text-[10px] text-slate-200 select-none">|</span>
          
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[7px] md:text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">GIAO BỞI:</span>
            <span className={`text-[8px] md:text-[8.5px] font-black uppercase whitespace-nowrap ${task.creatorId === currentUserId ? 'text-indigo-600' : 'text-slate-700'}`}>
              {creatorDisplayName}
            </span>
          </div>
          
          <span className="hidden md:block text-[10px] text-slate-200 select-none">|</span>
          
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[7px] md:text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">THỰC HIỆN:</span>
            <span className={`text-[8px] md:text-[8.5px] font-black uppercase whitespace-nowrap ${task.assigneeId === currentUserId ? 'text-indigo-600' : 'text-slate-700'}`}>
              {assigneeDisplayName}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-50">
          <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOverdue ? 'bg-rose-600 animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.4)]' : 'bg-slate-200'}`}></span>
            <span className="shrink-0">Thời hạn:</span> 
            <span className={`truncate ${isOverdue ? 'font-black' : 'font-bold text-slate-600'}`}>{formatShortDate(task.endDate)}</span>
          </p>
          <p className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)] shrink-0"></span>
            <span className="shrink-0">Cập nhật:</span>
            <span className="font-bold truncate">{formatShortDate(lastLog ? lastLog.timestamp : task.createdAt)}</span>
          </p>
          
          {isOverdue && (
            <div className="flex items-center gap-2 text-rose-600 mt-1 animate-pulse">
              <Icons.Alert />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em]">Tồn đọng / Quá hạn</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between items-end shrink-0 py-1 gap-2">
        <div className="flex gap-2">
          <button 
            title="Chỉnh sửa"
            onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white transition-all active:scale-90 shadow-sm"
          >
            <Icons.Edit />
          </button>
          <button 
            title="Xóa công việc"
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
            className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all active:scale-90 shadow-sm"
          >
            <Icons.Delete />
          </button>
        </div>

        {showQuickActions && (
          <div className="flex gap-1.5 md:gap-2">
            {(task.status === TaskStatus.TODO || task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.PAUSED || task.status === TaskStatus.REDO) ? (
              <>
                {(task.status === TaskStatus.TODO || task.status === TaskStatus.REDO) && (
                  <button 
                    title="Bắt đầu"
                    onClick={(e) => handleQuickAction(e, TaskStatus.IN_PROGRESS)} 
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-90"
                  >
                    <Icons.Clock />
                  </button>
                )}
                {task.status === TaskStatus.IN_PROGRESS && (
                  <button 
                    title="Tạm dừng"
                    onClick={(e) => handleQuickAction(e, TaskStatus.PAUSED)} 
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-md active:scale-90"
                  >
                    <Icons.Pause />
                  </button>
                )}
                {task.status === TaskStatus.PAUSED && (
                  <button 
                    title="Tiếp tục"
                    onClick={(e) => handleQuickAction(e, TaskStatus.IN_PROGRESS)} 
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md active:scale-90"
                  >
                    <Icons.Play />
                  </button>
                )}
                
                {task.status !== TaskStatus.PAUSED && (
                  <button 
                    title="Hoàn thành"
                    onClick={(e) => handleQuickAction(e, TaskStatus.DONE)} 
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-90"
                  >
                    <Icons.Check />
                  </button>
                )}

                <button 
                  title="Hủy"
                  onClick={(e) => handleQuickAction(e, TaskStatus.CANCELLED)} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-md active:scale-90"
                >
                  <Icons.Close />
                </button>
              </>
            ) : (
              ((task.status === TaskStatus.DONE && task.evaluation === "Tệ") || 
               task.status === TaskStatus.CANCELLED) && (
                <button 
                  title="Thực hiện lại"
                  onClick={(e) => handleQuickAction(e, TaskStatus.REDO)} 
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-md active:scale-90"
                >
                  <Icons.Redo />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
