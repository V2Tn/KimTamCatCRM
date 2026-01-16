
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Task, User, TaskStatus, Role, TaskLog, Attachment } from '../../types';
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
  readonly?: boolean;
}

const LogItem: React.FC<{ log: TaskLog, users: User[] }> = ({ log, users }) => {
  const logUser = users.find(u => u.id === log.userId);
  return (
    <div className="flex gap-3 text-[10px]">
      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0 uppercase">
        {logUser?.name.charAt(0) || 'H'}
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-slate-600 font-bold leading-normal break-words">{log.content}</p>
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
  task, users, onClose, onUpdateTask, currentUserId, initialStatus, readonly = false
}) => {
  const [localTitle, setLocalTitle] = useState(task.title);
  const [localStatus, setLocalStatus] = useState(initialStatus || task.status);
  const [localAssigneeIds, setLocalAssigneeIds] = useState<string[]>([task.assigneeId]);
  const [localResultContent, setLocalResultContent] = useState(task.resultContent || '');
  const [localResultAttachments, setLocalResultAttachments] = useState<Attachment[]>(task.resultAttachments || []);
  const [localStartDate, setLocalStartDate] = useState(task.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(task.endDate || '');
  const [localEvaluation, setLocalEvaluation] = useState(task.evaluation || '');
  
  const [tempEvaluation, setTempEvaluation] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<Attachment | null>(null);

  const config = QUADRANT_CONFIG[task.quadrant];
  const isFinished = task.status === TaskStatus.DONE;
  
  const currentUser = users.find(u => u.id === currentUserId);
  const isAdminOrManager = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN || currentUser?.role === Role.MANAGER;
  const isAssignee = task.assigneeId === currentUserId;

  const showUpdateButton = !readonly && (initialStatus === TaskStatus.DONE || !isFinished || isAdminOrManager);

  const isImage = (data: string) => data?.startsWith('data:image/');

  const handleResultFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => setLocalResultAttachments(prev => [...prev, { name: file.name, data: reader.result as string }]);
      reader.readAsDataURL(file);
    });
  };

  const removeResultAttachment = (index: number) => {
    setLocalResultAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = () => {
    onUpdateTask(task.id, {
      title: localTitle,
      status: localStatus,
      assigneeId: localAssigneeIds[0],
      resultContent: localResultContent,
      resultAttachments: localResultAttachments,
      startDate: localStartDate,
      endDate: localEndDate,
      evaluation: tempEvaluation || localEvaluation || task.evaluation
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[2000] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
      <div className="bg-white md:rounded-[3.5rem] shadow-2xl w-full max-w-6xl h-full md:h-auto md:max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Sửa tràn viền bằng cách thêm container padding hợp lý */}
        <div className={`sticky top-0 z-[2100] px-4 md:px-6 py-4 md:py-5 shrink-0 ${config.bgColor} border-b ${config.borderColor} flex items-center justify-between bg-inherit`}>
          <h2 className={`text-xs md:text-lg font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${config.color} truncate pr-4`}>
             {initialStatus === TaskStatus.DONE ? 'BÁO CÁO HOÀN THÀNH' : 'CHI TIẾT CÔNG VIỆC'}
          </h2>
          <button onClick={onClose} className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold shadow-sm hover:scale-105 active:scale-95 transition-all">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar bg-white p-4 md:p-10">
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-1 border-b border-slate-50 pb-4 md:pb-6">
              <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Tên công việc</label>
              <textarea 
                value={localTitle}
                disabled={isFinished || readonly}
                onChange={(e) => setLocalTitle(e.target.value)}
                rows={1}
                className={`w-full text-lg md:text-3xl font-black text-slate-800 outline-none bg-transparent resize-none leading-tight overflow-hidden ${isFinished ? 'line-through text-slate-300' : ''}`}
                style={{ height: 'auto' }}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                }}
                ref={(el) => {
                    if (el) {
                        el.style.height = 'auto';
                        el.style.height = el.scrollHeight + 'px';
                    }
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">BÁO CÁO KẾT QUẢ</label>
                  </div>
                  
                  <textarea 
                    autoFocus={initialStatus === TaskStatus.DONE && !readonly}
                    value={localResultContent}
                    disabled={!isAssignee || isFinished || readonly}
                    onChange={(e) => setLocalResultContent(e.target.value)}
                    placeholder={readonly ? "Chưa có báo cáo kết quả" : "Nhập báo cáo kết quả thực hiện..."}
                    className="w-full min-h-[120px] md:min-h-[150px] p-4 md:p-6 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 focus:border-indigo-500 outline-none text-[13px] md:text-sm font-bold text-slate-700 shadow-inner"
                  />

                  <div className="space-y-3">
                    {!isFinished && !readonly && isAssignee && (
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                        <span>📸</span> Đính kèm minh chứng
                        <input type="file" multiple className="hidden" onChange={handleResultFileChange} />
                      </label>
                    )}

                    {localResultAttachments.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 md:gap-3 p-3 md:p-4 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-inner">
                        {localResultAttachments.map((file, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm flex flex-col">
                            {isImage(file.data) ? (
                              <img src={file.data} className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" onClick={() => setPreviewImage(file)} />
                            ) : (
                              <a href={file.data} download={file.name} className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-50 hover:bg-white transition-colors overflow-hidden">
                                <span className="text-xl md:text-2xl">📄</span>
                                <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase truncate w-full px-1">{file.name}</span>
                              </a>
                            )}
                            {!isFinished && !readonly && isAssignee && (
                              <button onClick={() => removeResultAttachment(idx)} className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[8px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">NHẬT KÝ HOẠT ĐỘNG</label>
                  <div className="bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 space-y-4 max-h-[200px] md:max-h-[300px] overflow-y-auto border border-slate-100 shadow-inner hide-scrollbar">
                    {task.logs?.slice().reverse().map(log => <LogItem key={log.id} log={log} users={users} />)}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50/30 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-100/50 overflow-hidden shadow-sm">
                   <div className="p-4 md:p-6 pb-2 md:pb-4 flex flex-wrap justify-between items-center gap-2">
                     <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic ml-1">MÔ TẢ CÔNG VIỆC</label>
                     <span className="text-[8px] font-black text-indigo-300 uppercase">Giao bởi: {users.find(u => u.id === task.creatorId)?.name === currentUser?.name ? 'Tôi' : users.find(u => u.id === task.creatorId)?.name}</span>
                   </div>
                   <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 md:space-y-5">
                     <div className="text-[13px] md:text-sm text-slate-700 font-bold leading-relaxed bg-white/80 p-4 md:p-6 rounded-2xl md:rounded-3xl italic border border-white shadow-inner min-h-[80px] md:min-h-[100px] whitespace-pre-wrap">
                        {task.description || 'Không có mô tả chi tiết cho công việc này.'}
                     </div>

                     {task.attachments && task.attachments.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                          {task.attachments.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white group hover:scale-[1.03] transition-all cursor-pointer flex flex-col">
                              {isImage(typeof file === 'string' ? file : file.data) ? (
                                <img src={typeof file === 'string' ? file : file.data} className="w-full h-full object-cover" onClick={() => setPreviewImage(typeof file === 'string' ? {name: `Attachment ${idx+1}`, data: file} : file)} />
                              ) : (
                                <a href={typeof file === 'string' ? file : file.data} download={typeof file === 'string' ? `attachment-${idx}` : file.name} className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-indigo-500 bg-slate-50 hover:bg-white transition-colors overflow-hidden">
                                  <span className="text-xl md:text-2xl mb-1">📄</span>
                                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter truncate w-full px-2">{typeof file === 'string' ? `File ${idx + 1}` : file.name}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                     )}
                   </div>
                </div>

                <div className="p-4 md:p-6 bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 space-y-4 md:space-y-6">
                  <UserSelect 
                    label="NGƯỜI THỰC HIỆN"
                    users={users}
                    selectedValues={localAssigneeIds}
                    onChange={setLocalAssigneeIds}
                    multiple={false}
                    disabled={!isAdminOrManager || isFinished || readonly}
                    placeholder={task.assigneeId === currentUserId ? 'Tôi' : 'Chọn nhân sự...'}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1 italic">NGÀY BẮT ĐẦU</label>
                      <input type="datetime-local" disabled value={localStartDate ? new Date(localStartDate).toISOString().slice(0, 16) : ''} className="w-full px-4 py-3 bg-slate-100/50 rounded-xl border-2 border-slate-100 text-[10px] font-black outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1 italic">NGÀY KẾT THÚC</label>
                      <input type="datetime-local" disabled value={localEndDate ? new Date(localEndDate).toISOString().slice(0, 16) : ''} className="w-full px-4 py-3 bg-slate-100/50 rounded-xl border-2 border-slate-100 text-[10px] font-black text-red-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showUpdateButton && (
          <div className="sticky bottom-0 z-[2100] px-4 md:px-6 py-4 md:py-8 bg-white border-t border-slate-100 flex items-center justify-center shrink-0">
            <button onClick={handleUpdate} className="w-full md:w-auto px-10 md:px-24 py-4 md:py-6 bg-indigo-600 text-white rounded-2xl text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95">
              {initialStatus === TaskStatus.DONE ? 'XÁC NHẬN HOÀN THÀNH' : 'LƯU THAY ĐỔI'}
            </button>
          </div>
        )}
      </div>

      {previewImage && createPortal(
        <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative animate-in zoom-in-95 duration-200 flex flex-col items-center w-full">
             <img src={previewImage.data} className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" onClick={(e) => e.stopPropagation()} />
             <div className="mt-4 md:mt-6 flex flex-col items-center gap-2 w-full">
                <p className="text-white text-[10px] md:text-[12px] font-black uppercase tracking-widest truncate max-w-xs">{previewImage.name}</p>
                <div className="flex gap-3 md:gap-4">
                   <a href={previewImage.data} download={previewImage.name} onClick={(e) => e.stopPropagation()} className="px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all">TẢI XUỐNG</a>
                   <button onClick={() => setPreviewImage(null)} className="px-4 md:px-6 py-3 bg-white/10 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all">ĐÓNG LẠI</button>
                </div>
             </div>
             <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 md:-right-12 w-10 h-10 bg-white/20 text-white rounded-full font-bold flex items-center justify-center hover:bg-white/40 transition-colors">✕</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
