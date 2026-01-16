
import React, { useState, useEffect } from 'react';
import { Quadrant, Task, User, Role, Attachment } from '../../types';
import { QUADRANT_CONFIG } from '../../constants';
import { UserSelect } from '../Common/UserSelect';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<Task>, selectedAssigneeIds?: string[], followerIds?: string[]) => void;
  currentUser: User;
  users: User[];
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({ isOpen, onClose, onAdd, currentUser, users }) => {
  const formatForInput = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState<Quadrant>(Quadrant.Q1);
  const [startDate, setStartDate] = useState(formatForInput(new Date()));
  const [endDate, setEndDate] = useState(formatForInput(new Date(new Date().setHours(new Date().getHours() + 4))));
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([currentUser.id]);
  const [selectedFollowerIds, setSelectedFollowerIds] = useState<string[]>([]);

  const canChangeAssignee = currentUser.role !== Role.STAFF;

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setError(null);
      setQuadrant(Quadrant.Q1);
      setStartDate(formatForInput(new Date()));
      setEndDate(formatForInput(new Date(new Date().setHours(new Date().getHours() + 4))));
      setSelectedFollowerIds([]);
      setSelectedAssigneeIds([currentUser.id]);
      setAttachments([]);
    }
  }, [isOpen, currentUser.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Fix: Explicitly typing 'file' to avoid 'unknown' type errors for property 'name' and passing to 'readAsDataURL'
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, { name: file.name, data: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const isImage = (data: string) => data?.startsWith('data:image/');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }
    if (selectedAssigneeIds.length === 0) { setError('Vui lòng chọn người thực hiện'); return; }
    onAdd(
      { title, description, quadrant, startDate, endDate, attachments }, 
      selectedAssigneeIds,
      selectedFollowerIds
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
      <div className="bg-white md:rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-full md:h-auto md:max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header */}
        <div className={`px-6 md:px-10 py-5 md:py-6 relative flex items-center justify-center shrink-0 ${QUADRANT_CONFIG[quadrant].bgColor} border-b ${QUADRANT_CONFIG[quadrant].borderColor}`}>
          <h2 className={`text-lg md:text-xl font-black uppercase tracking-[0.2em] ${QUADRANT_CONFIG[quadrant].color}`}>
            {QUADRANT_CONFIG[quadrant].title}
          </h2>
          <button onClick={onClose} className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all shadow-sm font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 md:p-12 hide-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 md:gap-12">
              
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] ml-1">Tiêu đề công việc</label>
                  <input 
                    autoFocus
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Nhập tên nhiệm vụ..." 
                    className="w-full text-xl md:text-3xl font-black text-slate-900 placeholder:text-slate-200 border-b-2 md:border-b-4 border-slate-50 focus:border-indigo-600 outline-none transition-all py-2 bg-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] ml-1">Mô tả</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ghi chú nội dung thực hiện..." 
                    className="w-full min-h-[150px] md:min-h-[200px] p-5 md:p-8 bg-slate-50/50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none text-sm md:text-base font-bold text-slate-700 leading-relaxed resize-none transition-all hide-scrollbar"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 hover:border-indigo-600 rounded-2xl cursor-pointer transition-all active:scale-95 group shadow-sm">
                      <span className="text-xl">📎</span>
                      <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Đính kèm tài liệu</span>
                      <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white shadow-sm bg-white">
                          {isImage(file.data) ? (
                            <img src={file.data} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                              <span className="text-3xl mb-1">📄</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase break-all px-2 leading-tight">{file.name}</span>
                            </div>
                          )}
                          <button 
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg text-[10px] font-bold"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 md:space-y-8 bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1 italic">Loại công việc</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuadrant(q)}
                        className={`flex items-center justify-center p-3 rounded-2xl border-2 transition-all text-center ${
                          quadrant === q 
                            ? `${QUADRANT_CONFIG[q].borderColor} ${QUADRANT_CONFIG[q].bgColor} shadow-sm border-indigo-500 ring-2 ring-indigo-50` 
                            : 'bg-white border-slate-100 text-slate-300 opacity-60'
                        }`}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${quadrant === q ? QUADRANT_CONFIG[q].color : ''}`}>
                          {QUADRANT_CONFIG[q].title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <UserSelect 
                  label="Người thực hiện"
                  placeholder="Chọn người thực hiện..."
                  users={users}
                  selectedValues={selectedAssigneeIds}
                  onChange={setSelectedAssigneeIds}
                  multiple={false}
                  disabled={!canChangeAssignee}
                />

                <UserSelect 
                  label="Người theo dõi"
                  placeholder="Chọn người cùng theo dõi..."
                  users={users}
                  selectedValues={selectedFollowerIds}
                  onChange={setSelectedFollowerIds}
                  multiple={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">Bắt đầu</label>
                    <input 
                      type="datetime-local" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="w-full px-3 py-3 bg-white rounded-xl border-2 border-slate-100 shadow-sm text-[10px] font-black text-slate-700 outline-none focus:border-indigo-400 transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">Kết thúc</label>
                    <input 
                      type="datetime-local" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full px-3 py-3 bg-white rounded-xl border-2 border-slate-100 shadow-sm text-[10px] font-black text-red-600 outline-none focus:border-red-400 transition-all" 
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[9px] font-black text-center uppercase tracking-widest">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 shrink-0 px-6 py-6 md:py-8 bg-white border-t border-slate-50 flex justify-center items-center z-[50]">
            <button 
              type="submit" 
              className="w-full md:w-auto px-12 md:px-24 py-5 md:py-6 bg-indigo-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-6 group"
            >
              Tạo công việc
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
