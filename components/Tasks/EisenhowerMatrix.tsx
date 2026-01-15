
import React from 'react';
import { Task, Quadrant, TaskStatus } from '../../types';
import { QUADRANT_CONFIG } from '../../constants';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (quadrant: Quadrant) => void;
  currentUserId: string;
}

export const EisenhowerMatrix: React.FC<EisenhowerMatrixProps> = ({ tasks, onTaskClick, onAddTask, currentUserId }) => {
  const quadrants: Quadrant[] = [Quadrant.Q1, Quadrant.Q2, Quadrant.Q3, Quadrant.Q4];

  const getQuadrantTasks = (q: Quadrant) => tasks.filter(t => t.quadrant === q);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
      {quadrants.map(q => {
        const config = QUADRANT_CONFIG[q];
        const qTasks = getQuadrantTasks(q);
        
        return (
          <div key={q} className={`bg-white border-2 rounded-3xl p-5 flex flex-col gap-4 shadow-sm transition-all hover:shadow-md ${config.borderColor}`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className={`font-black uppercase tracking-widest text-xs flex items-center gap-2 ${config.color}`}>
                <span className="text-xl">{config.icon}</span>
                {config.title}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.tagBg} ${config.tagText}`}>
                {qTasks.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {qTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center py-10 opacity-30 select-none">
                  <div className="text-center">
                    <p className="text-2xl mb-1">{config.icon}</p>
                    <p className="text-[10px] font-bold">Trống</p>
                  </div>
                </div>
              ) : (
                qTasks.map(task => {
                  const isFollowedOnly = task.assigneeId !== currentUserId && task.followerIds?.includes(currentUserId);
                  return (
                    <div 
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`bg-white p-3 rounded-2xl border border-slate-50 shadow-sm cursor-pointer hover:border-indigo-100 hover:shadow-md transition-all group relative active:scale-[0.98] ${isFollowedOnly ? 'border-l-4 border-l-amber-400' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <h4 className={`font-bold text-slate-800 text-xs line-clamp-1 ${task.status === TaskStatus.DONE ? 'line-through text-slate-300' : ''}`}>
                            {task.title}
                          </h4>
                          {isFollowedOnly && (
                            <span className="text-[8px] font-black text-amber-600 uppercase">👁️ Theo dõi</span>
                          )}
                        </div>
                        {task.status === TaskStatus.DONE && <span className="text-emerald-500 text-[10px]">✓</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
