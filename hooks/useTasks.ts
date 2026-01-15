
import { useState, useMemo, useEffect } from 'react';
import { Task, User, Role, TaskStatus, Quadrant, TaskLog } from '../types';
import { MOCK_TASKS, STATUS_CONFIG } from '../constants';

export const useTasks = (currentUser: User, users: User[]) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('synced_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('synced_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const createLogEntry = (content: string, userId: string): TaskLog => ({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    content,
    timestamp: new Date().toISOString(),
    userId
  });

  const visibleTasks = useMemo(() => {
    if (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) return tasks;
    if (currentUser.role === Role.MANAGER) {
      return tasks.filter(t => 
        t.departmentId === currentUser.departmentId || 
        t.creatorId === currentUser.id || 
        t.assigneeId === currentUser.id ||
        t.followerIds?.includes(currentUser.id)
      );
    }
    return tasks.filter(t => 
      t.assigneeId === currentUser.id || 
      t.creatorId === currentUser.id ||
      t.followerIds?.includes(currentUser.id)
    );
  }, [tasks, currentUser]);

  const stats = useMemo(() => {
    const statsTasks = visibleTasks.filter(t => t.assigneeId === currentUser.id || t.creatorId === currentUser.id);
    const done = statsTasks.filter(t => t.status === TaskStatus.DONE).length;
    const doing = statsTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const todo = statsTasks.filter(t => t.status === TaskStatus.TODO).length;
    const redo = statsTasks.filter(t => t.status === TaskStatus.REDO).length;
    const paused = statsTasks.filter(t => t.status === TaskStatus.PAUSED).length;
    const closed = statsTasks.filter(t => t.status === TaskStatus.CLOSED).length;
    return { 
      done, 
      doing, 
      todo, 
      redo, 
      paused, 
      closed, 
      total: done + doing + todo + redo + paused + closed 
    };
  }, [visibleTasks, currentUser.id]);

  const addTask = (taskData: Partial<Task>, selectedAssigneeIds?: string[], followerIds?: string[]) => {
    const assigneeIds = selectedAssigneeIds?.length ? selectedAssigneeIds : [currentUser.id];
    const newTasks: Task[] = assigneeIds.map(assigneeId => {
      const assigneeName = users.find(u => u.id === assigneeId)?.name || 'N/A';
      return {
        id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title || '',
        description: taskData.description || '',
        quadrant: taskData.quadrant || Quadrant.Q1,
        status: TaskStatus.TODO,
        assigneeId: assigneeId,
        creatorId: currentUser.id,
        followerIds: followerIds || [],
        departmentId: users.find(u => u.id === assigneeId)?.departmentId || currentUser.departmentId,
        createdAt: new Date().toISOString(),
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        logs: [createLogEntry(`Tạo bởi ${currentUser.name}${assigneeId !== currentUser.id ? ` giao cho ${assigneeName}` : ''}`, currentUser.id)]
      };
    });
    setTasks(prev => [...newTasks, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newLogs = [...(t.logs || [])];
        const isAdminOrManager = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.MANAGER;
        
        if (updates.assigneeId && updates.assigneeId !== t.assigneeId) {
          const oldAssigneeName = users.find(u => u.id === t.assigneeId)?.name || 'N/A';
          const newAssigneeName = users.find(u => u.id === updates.assigneeId)?.name || 'N/A';
          newLogs.push(createLogEntry(
            `${currentUser.name} đã thay đổi người thực hiện ${oldAssigneeName} thành ${newAssigneeName}`, 
            currentUser.id
          ));
        }

        const hasStatusChange = updates.status && updates.status !== t.status;
        const hasResultChange = updates.resultContent !== undefined && updates.resultContent !== (t.resultContent || '');

        const statusTitle = STATUS_CONFIG[updates.status || t.status].title;
        
        if (hasResultChange) {
          const content = updates.resultContent || '';
          const truncatedContent = content.length > 30 ? content.substring(0, 30) + '...' : content;
          newLogs.push(createLogEntry(
            `${currentUser.name} cập nhật nội dung: ${truncatedContent} với trạng thái ${statusTitle}`, 
            currentUser.id
          ));
        } else if (hasStatusChange) {
          newLogs.push(createLogEntry(
            `${currentUser.name} cập nhật trạng thái ${statusTitle}`, 
            currentUser.id
          ));
        }

        const hasEvaluationChange = updates.evaluation !== undefined && updates.evaluation !== t.evaluation;
        if (hasEvaluationChange && isAdminOrManager) {
          newLogs.push(createLogEntry(
            `${currentUser.name} xác nhận đánh giá: ${updates.evaluation}`, 
            currentUser.id
          ));
        }

        return { ...t, ...updates, logs: newLogs };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  
  const toggleTaskStatus = (id: string) => updateTask(id, { status: TaskStatus.DONE });

  return { visibleTasks, stats, addTask, updateTask, deleteTask, toggleTaskStatus };
};
