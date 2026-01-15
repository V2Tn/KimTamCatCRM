
import React, { useState, useEffect } from 'react';
import { Task, Quadrant, TaskStatus, User, Role } from '../../types';
import { analyzeTask } from '../../services/geminiService';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  currentUser: User;
  users: User[];
  defaultQuadrant?: Quadrant;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, currentUser, users, defaultQuadrant }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [quadrant, setQuadrant] = useState<Quadrant>(task?.quadrant || defaultQuadrant || Quadrant.Q1);
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.TODO);
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || currentUser.id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');

  const canChangeAssignee = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.MANAGER;

  const handleAIAnalyze = async () => {
    if (!title || !description) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeTask(title, description);
      setQuadrant(result.quadrant);
      setAiReasoning(result.reasoning);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{task ? 'Chỉnh sửa Công việc' : 'Tạo Công việc Mới'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Nhập tên công việc..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              placeholder="Chi tiết công việc..."
            />
          </div>

          <button 
            onClick={handleAIAnalyze}
            disabled={isAnalyzing || !title || !description}
            className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                AI đang phân tích...
              </>
            ) : '🤖 Phân tích & Gợi ý Ma trận'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ma trận</label>
              <select 
                value={quadrant} 
                onChange={e => setQuadrant(e.target.value as Quadrant)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value={Quadrant.Q1}>Q1 - Khẩn cấp/Quan trọng</option>
                <option value={Quadrant.Q2}>Q2 - Không khẩn/Quan trọng</option>
                <option value={Quadrant.Q3}>Q3 - Khẩn/Không quan trọng</option>
                <option value={Quadrant.Q4}>Q4 - Không khẩn/Không quan trọng</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Hủy</button>
          <button onClick={() => onSave({ title, description, quadrant, status, assigneeId })} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-700">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  );
};
