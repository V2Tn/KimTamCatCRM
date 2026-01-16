
import { Role, Quadrant, TaskStatus, User, Department, Task } from './types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Kỹ thuật' },
  { id: 'dept-2', name: 'Kinh doanh' },
  { id: 'dept-3', name: 'Nhân sự' },
  { id: 'dept-4', name: 'Marketing' },
  { id: 'dept-5', name: 'Kế toán' },
  { id: 'dept-6', name: 'Vận hành' }
];

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Hệ thống', 
    username: 'admin',
    email: 'admin@system.com', 
    role: Role.SUPER_ADMIN, 
    isOnline: true,
    phoneNumber: '0901234567',
    gender: 'Nam',
    password: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
    createdBy: '0'
  },
  { 
    id: '2', 
    name: 'Trần Manager', 
    username: 'manager1',
    email: 'manager.tech@system.com', 
    role: Role.MANAGER, 
    departmentId: 'dept-1', 
    isOnline: true,
    phoneNumber: '0912345678',
    gender: 'Nam',
    password: 'password123',
    createdAt: '2024-02-15T09:30:00Z',
    createdBy: '1'
  },
  { 
    id: '3', 
    name: 'Lê Staff', 
    username: 'staff1',
    email: 'staff.tech@system.com', 
    role: Role.STAFF, 
    departmentId: 'dept-1', 
    isOnline: false,
    phoneNumber: '0923456789',
    gender: 'Nữ',
    password: 'password123',
    createdAt: '2024-03-10T14:20:00Z',
    createdBy: '1'
  },
  { 
    id: '4', 
    name: 'Phạm Marketing', 
    username: 'mkt1',
    email: 'mkt@system.com', 
    role: Role.MANAGER, 
    departmentId: 'dept-4', 
    isOnline: true,
    phoneNumber: '0933445566',
    gender: 'Nữ',
    password: 'password123',
    createdAt: '2024-04-01T10:00:00Z',
    createdBy: '1'
  },
  { 
    id: '5', 
    name: 'Nguyễn Content', 
    username: 'content1',
    email: 'content@system.com', 
    role: Role.STAFF, 
    departmentId: 'dept-4', 
    isOnline: false,
    phoneNumber: '0944556677',
    gender: 'Nam',
    password: 'password123',
    createdAt: '2024-04-05T11:00:00Z',
    createdBy: '1'
  },
  { 
    id: '6', 
    name: 'Đặng Kế Toán', 
    username: 'acc1',
    email: 'acc@system.com', 
    role: Role.MANAGER, 
    departmentId: 'dept-5', 
    isOnline: true,
    phoneNumber: '0955667788',
    gender: 'Nữ',
    password: 'password123',
    createdAt: '2024-05-01T09:00:00Z',
    createdBy: '1'
  },
  { 
    id: '7', 
    name: 'Hoàng Vận Hành', 
    username: 'ops1',
    email: 'ops@system.com', 
    role: Role.STAFF, 
    departmentId: 'dept-6', 
    isOnline: true,
    phoneNumber: '0966778899',
    gender: 'Nam',
    password: 'password123',
    createdAt: '2024-05-15T14:00:00Z',
    createdBy: '1'
  }
];

// Tạo ngày trong quá khứ để test Tồn đọng
const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 5);
const overdueStr = pastDate.toISOString();

// Tạo ngày trong tương lai
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 5);
const futureStr = futureDate.toISOString();

export const MOCK_TASKS: Task[] = [
  { 
    id: 't1', 
    title: '⚠️ TEST: Task Tồn đọng (Manager giao cho Staff)', 
    description: 'Task này đã quá hạn và chưa xong. Sẽ hiện icon cảnh báo và ẩn Quick Actions nếu log bằng Staff.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.TODO, 
    assigneeId: '3', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: overdueStr,
    endDate: overdueStr 
  },
  { 
    id: 't2', 
    title: '🎯 TEST: Task Tự giao (Hiện "Tôi" và Quick Actions)', 
    description: 'Bạn tự giao task này cho mình. Sẽ thấy dòng "Giao bởi: Tôi" và đầy đủ nút hành động.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.IN_PROGRESS, 
    assigneeId: '2', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: new Date().toISOString(),
    endDate: futureStr
  },
  { 
    id: 't3', 
    title: '🔄 TEST: Task Thực hiện lại (Redo)', 
    description: 'Công việc này bị Manager yêu cầu làm lại.', 
    quadrant: Quadrant.Q2, 
    status: TaskStatus.REDO, 
    assigneeId: '3', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: overdueStr
  },
  { 
    id: 't4', 
    title: '✅ TEST: Task Quá hạn nhưng đã xong', 
    description: 'Mặc dù endDate đã qua nhưng status là DONE nên không hiện cảnh báo tồn đọng.', 
    quadrant: Quadrant.Q2, 
    status: TaskStatus.DONE, 
    assigneeId: '3', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: overdueStr,
    endDate: overdueStr
  },
  { 
    id: 't7', 
    title: '📢 Chiến dịch Marketing Mùa Hè', 
    description: 'Lên kế hoạch nội dung cho fanpage.', 
    quadrant: Quadrant.Q2, 
    status: TaskStatus.IN_PROGRESS, 
    assigneeId: '5', 
    creatorId: '4', 
    departmentId: 'dept-4', 
    createdAt: new Date().toISOString()
  },
  { 
    id: 't8', 
    title: '📊 Báo cáo thuế quý 2', 
    description: 'Hoàn thiện hồ sơ chứng từ.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.TODO, 
    assigneeId: '6', 
    creatorId: '1', 
    departmentId: 'dept-5', 
    createdAt: new Date().toISOString()
  }
];

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
