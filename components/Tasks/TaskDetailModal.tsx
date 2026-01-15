
import React, { useState, useMemo, useEffect } from 'react';
import { Task, User, TaskStatus, Role, TaskLog } from '../../types';
import { QUADRANT_CONFIG } from '../../constants';
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
  initialStatus?: TaskStatus | null;
}

const LogItem: React.FC<{ log: TaskLog, users: User[] }> = ({ log, users }) => {
  const logUser = users.find(u => u.id === log.userId);
  return (
    <div className="flex gap-3 text-[10px]">
      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0 uppercase">
        {logUser?.name.charAt(0) || 'H'}
      </div>
      <div className="flex flex-col">
        <p className="text-slate-600 font-bold leading-normal">{log.content}</p>
        <span className="text-[8px] font-black text-indigo-400 uppercase mt-0.5">
          {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(log.timestamp).toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  );
};

const EVALUATION_COLORS: Record<string, { bg: string; text: string; border: string; active: string }> = {
  "Xuất Sắc": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", active: "bg-emerald-600 text-white border-emerald-600" },
  "Tốt": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", active: "bg-blue-600 text-white border-blue-600" },
  "Bình thường": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", active: "bg-amber-500 text-white border-amber-500" },
  "Tệ": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", active: "bg-rose-600 text-white border-rose-600" },
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  task, users, onClose, onUpdateTask, currentUserId, initialStatus 
}) => {
  const [localTitle, setLocalTitle] = useState(task.title);
  const [localStatus, setLocalStatus] = useState(initialStatus || task.status);
  const [localAssigneeIds, setLocalAssigneeIds] = useState<string[]>([task.assigneeId]);
  const [localResultContent, setLocalResultContent] = useState(task.resultContent || '');
  const [localStartDate, setLocalStartDate] = useState(task.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(task.endDate || '');
  const [localEvaluation, setLocalEvaluation] = useState(task.evaluation || '');
  
  const [tempEvaluation, setTempEvaluation] = useState<string | null>(null);

  const config = QUADRANT_CONFIG[task.quadrant];
  const isFinished = task.status === TaskStatus.DONE;
  
  const currentUser = users.find(u => u.id === currentUserId);
  const isAdminOrManager = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.MANAGER;
  const isAssignee = task.assigneeId === currentUserId;

  // Logic hiển thị nút Cập nhật:
  // 1. Ẩn nếu trạng thái là DONE (Hoàn thành) VÀ đã có bất kỳ đánh giá nào (evaluation).
  // 2. Hiện nếu là DONE nhưng CHƯA đánh giá (để quản lý chọn đánh giá rồi bấm Lưu).
  // 3. Hiện cho các trạng thái khác (TODO, IN_PROGRESS, REDO...).
  const showUpdateButton = useMemo(() => {
    if (task.status === TaskStatus.DONE) {
      // Nếu đã tồn tại đánh giá chính thức từ DB, ẩn nút.
      if (task.evaluation && task.evaluation.trim() !== "") {
        return false;
      }
      return true;
    }
    
    return true;
  }, [task.status, task.evaluation]);

  const showRatingPanel = isAdminOrManager && (task.status === TaskStatus.DONE) && !task.evaluation;

  const handleUpdate = () => {
    onUpdateTask(task.id, {
      title: localTitle,
      status: localStatus,
      assigneeId: localAssigneeIds[0],
      resultContent: localResultContent,
      startDate: localStartDate,
      endDate: localEndDate,
      evaluation: tempEvaluation || localEvaluation || task.evaluation
    });
    onClose();
  };

  const handleRatingSelect = (rating: string) => {
    setTempEvaluation(rating);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[2000] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white md:rounded-[3.5rem] shadow-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`sticky top-0 z-[2100] px-6 py-5 shrink-0 ${config.bgColor} border-b ${config.borderColor} flex items-center justify-between bg-inherit`}>
          <h2 className={`text-xs md:text-lg font-black uppercase tracking-[0.2em] ${config.color}`}>
             {initialStatus === TaskStatus.DONE ? 'BÁO CÁO HOÀN THÀNH' : 'CHI TIẾT CÔNG VIỆC'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold shadow-sm hover:scale-105 active:scale-95 transition-all">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white p-6 md:p-10">
          <div className="space-y-8">
            <div className="space-y-4 border-b border-slate-50 pb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Tên công việc</label>
                <input 
                  value={localTitle}
                  disabled={isFinished}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className={`w-full text-xl md:text-3xl font-black text-slate-800 outline-none bg-transparent ${isFinished ? 'line-through text-slate-300' : ''}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Mô tả công việc</label>
                <div className="mt-1 p-5 bg-slate-50 rounded-[1.5rem] text-sm text-slate-600 font-medium italic border border-slate-100 leading-relaxed shadow-inner">
                  {task.description}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest">BÁO CÁO KẾT QUẢ</label>
                    {initialStatus === TaskStatus.DONE && <span className="text-[9px] font-black text-indigo-600 animate-pulse uppercase tracking-widest">Yêu cầu nhập báo cáo để hoàn thành</span>}
                  </div>
                  <textarea 
                    autoFocus={initialStatus === TaskStatus.DONE}
                    value={localResultContent}
                    disabled={!isAssignee || isFinished}
                    onChange={(e) => setLocalResultContent(e.target.value)}
                    placeholder="Nhập báo cáo kết quả thực hiện tại đây..."
                    className={`w-full min-h-[160px] p-6 bg-slate-50/50 rounded-[2rem] border-2 ${initialStatus === TaskStatus.DONE ? 'border-indigo-400 shadow-lg shadow-indigo-50' : 'border-slate-100'} focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 leading-relaxed shadow-inner transition-all`}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest">NHẬT KÝ HOẠT ĐỘNG</label>
                  <div className="bg-slate-50/50 rounded-[2rem] p-6 space-y-5 max-h-[250px] overflow-y-auto border border-slate-100 shadow-inner hide-scrollbar">
                    {task.logs?.slice().reverse().map(log => <LogItem key={log.id} log={log} users={users} />)}
                    {(!task.logs || task.logs.length === 0) && (
                      <p className="text-[10px] text-slate-300 font-black uppercase text-center py-4 tracking-widest">Chưa có hoạt động</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                  <UserSelect 
                    label="NGƯỜI THỰC HIỆN"
                    users={users}
                    selectedValues={localAssigneeIds}
                    onChange={setLocalAssigneeIds}
                    multiple={false}
                    disabled={!isAdminOrManager || isFinished}
                    placeholder={task.assigneeId === currentUserId ? 'Tôi' : 'Chọn nhân sự...'}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">NGÀY BẮT ĐẦU</label>
                      <input 
                        type="datetime-local" 
                        readOnly={true}
                        disabled={true} 
                        value={localStartDate ? new Date(localStartDate).toISOString().slice(0, 16) : ''} 
                        className="w-full px-4 py-3 bg-slate-100/50 cursor-not-allowed rounded-xl border-2 border-slate-100 text-[10px] font-black outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">NGÀY KẾT THÚC</label>
                      <input 
                        type="datetime-local" 
                        readOnly={true}
                        disabled={true} 
                        value={localEndDate ? new Date(localEndDate).toISOString().slice(0, 16) : ''} 
                        className="w-full px-4 py-3 bg-slate-100/50 cursor-not-allowed rounded-xl border-2 border-slate-100 text-[10px] font-black text-red-400 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {(showRatingPanel || task.evaluation) && (
                  <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 space-y-4 animate-in slide-in-from-top-4">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block italic ml-1">ĐÁNH GIÁ QUẢN LÝ</label>
                    
                    {task.evaluation ? (
                      <div className={`py-4 rounded-2xl border text-center shadow-sm ${EVALUATION_COLORS[task.evaluation]?.bg || 'bg-white'} ${EVALUATION_COLORS[task.evaluation]?.border || 'border-slate-100'}`}>
                        <p className={`text-sm font-black uppercase tracking-widest ${EVALUATION_COLORS[task.evaluation]?.text || 'text-slate-700'}`}>
                          {task.evaluation}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {["Xuất Sắc", "Tốt", "Bình thường", "Tệ"].map(opt => {
                          const isSelected = tempEvaluation === opt;
                          const colorCfg = EVALUATION_COLORS[opt];
                          return (
                            <button 
                              key={opt} 
                              type="button"
                              onClick={() => handleRatingSelect(opt)} 
                              className={`py-3 px-3 rounded-xl text-[9px] font-black uppercase transition-all border shadow-sm active:scale-95 ${
                                isSelected 
                                ? colorCfg.active 
                                : `bg-white ${colorCfg.text} border-slate-100 hover:${colorCfg.border}`
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-[2100] px-6 py-6 md:py-8 bg-white border-t border-slate-100 flex items-center justify-center shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          {showUpdateButton && (
            <button 
              onClick={handleUpdate}
              disabled={initialStatus === TaskStatus.DONE && !localResultContent.trim()}
              className={`w-full md:w-auto px-16 md:px-24 py-5 md:py-6 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.25em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${initialStatus === TaskStatus.DONE && !localResultContent.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-black'}`}
            >
              {initialStatus === TaskStatus.DONE ? 'XÁC NHẬN HOÀN THÀNH' : 'CẬP NHẬT'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
