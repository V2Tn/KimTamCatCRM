
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, User, TaskStatus, Role, TaskLog } from '../../types';
import { QUADRANT_CONFIG, STATUS_CONFIG } from '../../constants';
import { UserSelect } from '../Common/UserSelect';

interface TaskDetailModalProps {
  task: Task;
  users: User[];
  canDelete: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  currentUserId: string;
}

const LogItem: React.FC<{ log: TaskLog, users: User[] }> = ({ log, users }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logUser = users.find(u => u.id === log.userId);
  const isLong = log.content.length > 80;

  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400 shrink-0 shadow-sm">
        {logUser?.name.charAt(0) || 'H'}
      </div>
      <div className="flex flex-col flex-1">
        <p className="text-[10px] text-slate-600 font-bold leading-normal">
          {isExpanded ? log.content : (isLong ? log.content.substring(0, 80) + '...' : log.content)}
          {isLong && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-indigo-500 hover:text-indigo-700 underline font-black"
            >
              {isExpanded ? ' Thu gọn' : '...'}
            </button>
          )}
        </p>
        <span className="text-[8px] font-black text-indigo-700 uppercase tracking-tighter mt-0.5">
          {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(log.timestamp).toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  );
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, 
  users, 
  onClose, 
  onUpdateTask,
  currentUserId 
}) => {
  const [localTitle, setLocalTitle] = useState(task.title);
  const [localStatus, setLocalStatus] = useState(task.status);
  const [localAssigneeIds, setLocalAssigneeIds] = useState<string[]>([task.assigneeId]);
  const [localResultContent, setLocalResultContent] = useState(task.resultContent || '');
  const [localStartDate, setLocalStartDate] = useState(task.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(task.endDate || '');
  const [localEvaluation, setLocalEvaluation] = useState(task.evaluation || '');

  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const statusPopoverRef = useRef<HTMLDivElement>(null);
  const statusTriggerRef = useRef<HTMLDivElement>(null);

  const creator = users.find(u => u.id === task.creatorId);
  const config = QUADRANT_CONFIG[task.quadrant];
  const isDone = task.status === TaskStatus.DONE;
  const isClosed = task.status === TaskStatus.CLOSED;
  const isReadonlyStatus = isDone || isClosed; 
  
  const currentUser = users.find(u => u.id === currentUserId);
  const isAdminOrManager = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.MANAGER;
  const isCreator = task.creatorId === currentUserId;
  const isAssignee = task.assigneeId === currentUserId;

  const canEditResult = isAssignee && !isReadonlyStatus;
  const canUpdateStatus = isAssignee || isCreator || isAdminOrManager;
  const canChangeAssignee = isAdminOrManager && !isReadonlyStatus;
  const canEvaluate = isAdminOrManager && (isDone || isClosed);
  const showEvaluation = isDone || isClosed || !!task.evaluation;
  const evaluationChanged = localEvaluation !== (task.evaluation || '');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (isChangingStatus) {
        if (statusTriggerRef.current && statusTriggerRef.current.contains(target)) return;
        if (statusPopoverRef.current && !statusPopoverRef.current.contains(target)) setIsChangingStatus(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChangingStatus]);

  const availableStatusOptions = useMemo(() => {
    if (isDone) {
      return Object.entries(STATUS_CONFIG).filter(([key]) => {
        const statusKey = key as TaskStatus;
        if (statusKey === TaskStatus.DONE) return true;
        if (statusKey === TaskStatus.CLOSED && (isCreator || isAdminOrManager)) return true;
        if (statusKey === TaskStatus.REDO && isAdminOrManager) return true;
        return false;
      });
    }
    if (isClosed) {
      return Object.entries(STATUS_CONFIG).filter(([key]) => (key as TaskStatus) === TaskStatus.CLOSED);
    }
    return Object.entries(STATUS_CONFIG).filter(([key]) => {
      const statusKey = key as TaskStatus;
      if (statusKey === TaskStatus.CLOSED) return false;
      if (statusKey === TaskStatus.CANCELLED) return isAdminOrManager;
      return true;
    });
  }, [isAdminOrManager, isCreator, task.status, isDone, isClosed]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    setLocalStatus(newStatus);
    setIsChangingStatus(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'attachments' | 'resultAttachments') => {
    if (isReadonlyStatus) return;
    const files = e.target.files;
    if (!files) return;
    const newAttachments = [...(task[field] || [])];
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newAttachments.push(reader.result as string);
        onUpdateTask(task.id, { [field]: newAttachments });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleQuickUpdateEvaluation = () => {
    if (canEvaluate && evaluationChanged) {
      onUpdateTask(task.id, { evaluation: localEvaluation });
    }
  };

  const handleFooterButtonClick = () => {
    if (isClosed) {
      if (isAdminOrManager) {
        onUpdateTask(task.id, { status: TaskStatus.TODO });
        onClose();
      }
    } else {
      onUpdateTask(task.id, {
        title: localTitle,
        status: localStatus,
        assigneeId: localAssigneeIds[0],
        resultContent: localResultContent,
        startDate: localStartDate,
        endDate: localEndDate,
        evaluation: localEvaluation
      });
      onClose();
    }
  };

  const formatForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const evaluationOptions = ["Xuất Sắc", "Tốt", "Bình thường", "Tệ"];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200 border border-white/20">
        
        <div className={`px-10 py-5 relative flex items-center justify-center shrink-0 ${config.bgColor} border-b ${config.borderColor}`}>
          <h2 className={`text-2xl font-black uppercase tracking-[0.2em] text-center ${config.color}`}>
            {config.title}
          </h2>
          <button onClick={onClose} className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 transition-all shadow-sm font-bold">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">TIÊU ĐỀ CÔNG VIỆC</label>
                <input 
                  type="text" 
                  disabled={isReadonlyStatus}
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className={`w-full bg-transparent text-xl font-black text-slate-800 leading-tight tracking-tight outline-none rounded-lg px-2 py-1 ${isReadonlyStatus ? 'line-through text-slate-300 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">MÔ TẢ</label>
                <textarea 
                  value={task.description}
                  disabled={true} 
                  className="w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 min-h-[50px] max-h-[80px] text-sm text-slate-600 leading-relaxed font-medium outline-none transition-all resize-none cursor-not-allowed opacity-70 hide-scrollbar"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest">NỘI DUNG THỰC HIỆN</label>
                  {!isReadonlyStatus && canEditResult && (
                    <label className="cursor-pointer text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-widest">📎 Đính kèm</span>
                      <input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'resultAttachments')} />
                    </label>
                  )}
                </div>
                <div className={`bg-white rounded-[1.5rem] border-2 shadow-sm flex flex-col p-1 overflow-hidden transition-all ${!canEditResult ? 'border-slate-100 bg-slate-50/30' : 'border-indigo-100 focus-within:border-indigo-400'}`}>
                  <textarea 
                    value={localResultContent}
                    disabled={!canEditResult}
                    onChange={(e) => setLocalResultContent(e.target.value)}
                    placeholder={canEditResult ? "Nhập kết quả thực hiện công việc..." : "Đang chờ nhân viên cập nhật kết quả..."}
                    className={`w-full min-h-[120px] p-5 bg-transparent text-sm text-slate-700 leading-relaxed font-bold outline-none resize-none hide-scrollbar ${!canEditResult ? 'cursor-not-allowed text-slate-400 italic' : 'text-slate-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Nhật ký công việc</label>
                <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-4 max-h-[160px] overflow-y-auto hide-scrollbar space-y-3">
                  {task.logs && task.logs.length > 0 ? (
                    task.logs.slice().reverse().map((log) => (
                      <LogItem key={log.id} log={log} users={users} />
                    ))
                  ) : (
                    <div className="py-4 text-center text-[9px] font-black text-slate-950 uppercase tracking-widest opacity-50">Chưa có nhật ký hoạt động</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 shadow-sm relative space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">TRẠNG THÁI</label>
                    <div 
                      ref={statusTriggerRef}
                      className={`flex items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border-2 border-slate-100 shadow-sm transition-all ${(!canUpdateStatus || isClosed) ? 'opacity-70 cursor-not-allowed' : 'hover:border-indigo-400 hover:shadow-md cursor-pointer active:scale-[0.98]'}`}
                      onClick={() => !isClosed && canUpdateStatus && setIsChangingStatus(!isChangingStatus)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_CONFIG[localStatus].color.replace('text-', 'bg-')}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest truncate ${STATUS_CONFIG[localStatus].color}`}>
                          {STATUS_CONFIG[localStatus].title}
                        </span>
                      </div>
                      <span className="text-slate-300 text-[10px]">▼</span>
                    </div>
                    {isChangingStatus && (
                      <div ref={statusPopoverRef} className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-1 animate-in zoom-in-95 duration-200">
                        {availableStatusOptions.map(([key, cfg]) => (
                          <button key={key} onClick={() => handleStatusChange(key as TaskStatus)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.title}</span>
                            {localStatus === key && <span className="text-indigo-600">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">BẮT ĐẦU</label>
                    <input type="datetime-local" disabled={isReadonlyStatus} value={formatForInput(localStartDate)} onChange={(e) => setLocalStartDate(e.target.value)} className="w-full px-2 py-2 bg-white rounded-xl border-2 border-slate-100 shadow-sm text-[10px] font-black text-slate-700 outline-none transition-all disabled:opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">KẾT THÚC</label>
                    <input type="datetime-local" disabled={isReadonlyStatus} value={formatForInput(localEndDate)} onChange={(e) => setLocalEndDate(e.target.value)} className="w-full px-2 py-2 bg-white rounded-xl border-2 border-slate-100 shadow-sm text-[10px] font-black text-red-600 outline-none transition-all disabled:opacity-50" />
                  </div>
                </div>

                <UserSelect 
                  label="NGƯỜI THỰC HIỆN"
                  users={users}
                  selectedValues={localAssigneeIds}
                  onChange={setLocalAssigneeIds}
                  multiple={false}
                  disabled={!canChangeAssignee}
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">NGƯỜI GIAO VIỆC</label>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-2xl border-2 border-dashed border-slate-100 transition-all opacity-80">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0 bg-slate-400">
                        {creator?.image_avatar ? <img src={creator.image_avatar} className="w-full h-full object-cover rounded-xl" /> : creator?.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-slate-500 truncate uppercase tracking-tight">
                          {isCreator ? 'Tôi' : (creator?.name || 'Hệ thống')}
                        </p>
                      </div>
                  </div>
                </div>
              </div>

              {showEvaluation && (
                <div className="bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100 shadow-sm space-y-3 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">☆ ĐÁNH GIÁ</label>
                    {canEvaluate && evaluationChanged && (
                      <button onClick={handleQuickUpdateEvaluation} className="px-3 py-1.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">✓ XÁC NHẬN</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {evaluationOptions.map(opt => (
                      <button key={opt} type="button" disabled={!canEvaluate} onClick={() => setLocalEvaluation(opt)} className={`py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${localEvaluation === opt ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-10 py-5 bg-white border-t border-slate-50 flex items-center justify-center shrink-0">
          <button 
            onClick={handleFooterButtonClick}
            className="px-16 py-3.5 rounded-2xl text-[11px] font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl active:scale-95 uppercase tracking-[0.2em]"
          >
            {isClosed ? 'MỞ LẠI' : 'CẬP NHẬT'}
          </button>
        </div>
      </div>
    </div>
  );
};
