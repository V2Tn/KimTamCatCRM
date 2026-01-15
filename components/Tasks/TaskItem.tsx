
import React from 'react';
import { Task, TaskStatus, User } from '../../types';
import { QUADRANT_CONFIG, STATUS_CONFIG } from '../../constants';

interface TaskItemProps {
  task: Task;
  canDelete: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
  isFollowedOnly?: boolean;
  currentUserId: string;
  users: User[];
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onClick, onEdit, onDelete, isFollowedOnly, currentUserId, users }) => {
  const isFinished = task.status === TaskStatus.DONE || task.status === TaskStatus.CLOSED;
  const statusConfig = STATUS_CONFIG[task.status];
  const quadrantConfig = QUADRANT_CONFIG[task.quadrant];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const creatorUser = users.find(u => u.id === task.creatorId);
  const assigneeUser = users.find(u => u.id === task.assigneeId);

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer flex flex-col gap-3 active:scale-[0.98] ${isFinished ? 'bg-slate-50/50 opacity-80' : ''}`}
    >
      {/* 1. Header: Tiêu đề + Badge Trạng thái */}
      <div className="flex justify-between items-start gap-3">
        <h4 className={`text-[15px] font-black text-slate-800 leading-tight flex-1 transition-all ${isFinished ? 'line-through text-slate-300' : ''}`}>
          {task.title}
        </h4>
        <div className={`shrink-0 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border transition-colors ${statusConfig.bgColor} ${statusConfig.color} border-current/10`}>
          {statusConfig.title}
        </div>
      </div>

      {/* 2. Body: Mô tả ngắn */}
      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 font-medium leading-relaxed italic pr-2">
          {task.description}
        </p>
      )}

      {/* 3. Footer: Avatar Circles lồng nhau + Ngày tạo */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center">
          <div className="flex -space-x-3">
            {/* Người thực hiện (Assignee) */}
            <div 
              title={`Người thực hiện: ${assigneeUser?.name || 'Chưa rõ'}`} 
              className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm overflow-hidden z-20 transition-transform group-hover:translate-x-1"
            >
              {assigneeUser?.image_avatar ? (
                <img src={assigneeUser.image_avatar} className="w-full h-full object-cover" />
              ) : (
                assigneeUser?.name.charAt(0) || 'A'
              )}
            </div>
            {/* Người giao (Creator) */}
            <div 
              title={`Người giao: ${creatorUser?.name || 'Hệ thống'}`} 
              className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm overflow-hidden z-10 transition-transform group-hover:-translate-x-1"
            >
              {creatorUser?.image_avatar ? (
                <img src={creatorUser.image_avatar} className="w-full h-full object-cover" />
              ) : (
                creatorUser?.name.charAt(0) || 'C'
              )}
            </div>
          </div>
          {isFollowedOnly && (
            <span className="ml-5 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">👁️ THEO DÕI</span>
          )}
        </div>

        {/* Ngày tạo + Icon đồng hồ */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-black tracking-tight">{formatDate(task.createdAt)}</span>
        </div>
      </div>

      {/* Nút hành động (Icon only) - Chỉ hiện khi hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 scale-90 group-hover:scale-100">
         <button 
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="p-1.5 rounded-lg bg-white shadow-lg border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1.5 rounded-lg bg-white shadow-lg border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Quadrant Tag Overlay */}
      <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${quadrantConfig.tagBg} ${quadrantConfig.tagText} border ${quadrantConfig.borderColor} opacity-0 group-hover:opacity-100 transition-all shadow-sm`}>
        {quadrantConfig.title}
      </div>
    </div>
  );
};
