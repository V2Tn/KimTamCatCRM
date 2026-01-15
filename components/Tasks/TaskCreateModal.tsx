
import React, { useState, useEffect } from 'react';
import { Quadrant, Task, User, Role } from '../../types';
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
  const [attachments, setAttachments] = useState<string[]>([]);
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
    (Array.from(files) as File[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setAttachments(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200 border border-white/20">
        
        {/* Header */}
        <div className="px-10 py-6 relative flex items-center justify-center shrink-0 bg-slate-50 border-b border-slate-100">
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-slate-950">Tạo công việc mới</h2>
          <button onClick={onClose} className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all shadow-sm font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar bg-white">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-950 uppercase tracking-[0.2em] ml-1">Tiêu đề công việc</label>
              <input 
                autoFocus
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Nhập tên nhiệm vụ..." 
                className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-100 border-b-4 border-slate-50 focus:border-indigo-600 outline-none transition-all py-2 bg-transparent"
              />
            </div>

            <div className="flex-1 flex flex-col space-y-3">
              <label className="text-[11px] font-black text-slate-950 uppercase tracking-[0.2em] ml-1">Mô tả</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Ghi chú nội dung thực hiện tại đây..." 
                className="w-full min-h-[220px] p-6 bg-slate-50/50 rounded-[2rem] border-2 border-transparent focus:bg-white focus:border-indigo-100 outline-none text-base font-medium text-slate-700 leading-relaxed resize-none transition-all custom-scrollbar"
              />
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 hover:border-indigo-600 rounded-2xl cursor-pointer transition-all active:scale-95 group shadow-sm">
                  <span className="text-xl">📎</span>
                  <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Đính kèm tài liệu</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                {attachments.length > 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{attachments.length} Tệp tin</span>}
              </div>

              <button 
                type="submit" 
                className="px-14 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-4 group"
              >
                Tạo công việc
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Configuration Sidebar - Optimized layout to remove scrollbar */}
          <div className="w-[400px] bg-slate-50/50 border-l border-slate-100 p-6 space-y-5 overflow-y-auto scrollbar-hide">
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            {/* Quadrant Selector */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest ml-1">Loại công việc</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(QUADRANT_CONFIG) as Quadrant[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuadrant(q)}
                    className={`flex items-center justify-center p-2.5 rounded-2xl border-2 transition-all text-center ${
                      quadrant === q 
                        ? `${QUADRANT_CONFIG[q].borderColor} ${QUADRANT_CONFIG[q].bgColor} shadow-sm border-indigo-400 ring-2 ring-indigo-100` 
                        : 'bg-white border-slate-100 text-slate-400 opacity-60'
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

            {/* DateTime Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">Bắt đầu</label>
                <input 
                  type="datetime-local" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="w-full px-2.5 py-2.5 bg-white rounded-xl border-2 border-slate-100 shadow-sm text-[10px] font-black text-slate-700 outline-none focus:border-indigo-400 transition-all cursor-pointer" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">Kết thúc</label>
                <input 
                  type="datetime-local" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="w-full px-2.5 py-2.5 bg-white rounded-xl border-2 border-slate-100 shadow-sm text-[10px] font-black text-red-600 outline-none focus:border-red-400 transition-all cursor-pointer" 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[9px] font-black text-center uppercase">
                {error}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
