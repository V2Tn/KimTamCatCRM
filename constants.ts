
import { Role, Quadrant, TaskStatus, User, Department, Task } from './types';

export const DEPARTMENTS: Department[] = [
  { id: '1', name: 'Kinh doanh' },
  { id: '2', name: 'Kế toán' },
  { id: '3', name: 'Nhân sự' },
  { id: '4', name: 'CSKH' },
  { id: '5', name: 'Media' },
  { id: '6', name: 'Thủ kho' },
  { id: '7', name: 'Mật cách' },
  { id: '8', name: 'Tele sale' },
  { id: '9', name: 'Vận hành' },
  { id: '10', name: 'Nhập liệu' }
];

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Hệ thống', 
    username: 'admin',
    email: 'admin@system.com', 
    role: Role.SUPER_ADMIN, 
    isOnline: 1,
    phoneNumber: '0901234567',
    gender: 'Nam',
    password: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
    createdBy: '0'
  }
];

export const MOCK_TASKS: Task[] = [];

export const QUADRANT_CONFIG = {
  [Quadrant.Q1]: { title: 'Làm ngay', icon: '🔥', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', tagBg: 'bg-red-100', tagText: 'text-red-700' },
  [Quadrant.Q2]: { title: 'Lên lịch', icon: '📅', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', tagBg: 'bg-blue-100', tagText: 'text-blue-700' },
  [Quadrant.Q3]: { title: 'Giao việc', icon: '🤝', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', tagBg: 'bg-amber-100', tagText: 'text-amber-700' },
  [Quadrant.Q4]: { title: 'Loại bỏ', icon: '🗑️', color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', tagBg: 'bg-slate-100', tagText: 'text-slate-700' }
};

export const STATUS_CONFIG: Record<TaskStatus, { title: string; color: string; bgColor: string }> = {
  [TaskStatus.TODO]: { title: 'CHƯA THỰC HIỆN', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  [TaskStatus.IN_PROGRESS]: { title: 'ĐANG THỰC HIỆN', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  [TaskStatus.DONE]: { title: 'HOÀN THÀNH', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  [TaskStatus.REDO]: { title: 'THỰC HIỆN LẠI', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  [TaskStatus.PAUSED]: { title: 'TẠM DỪNG', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  [TaskStatus.CANCELLED]: { title: 'HỦY', color: 'text-rose-700', bgColor: 'bg-rose-100' },
  [TaskStatus.CLOSED]: { title: 'ĐÃ ĐÓNG', color: 'text-slate-900', bgColor: 'bg-slate-200' }
};
