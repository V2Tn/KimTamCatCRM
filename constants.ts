
import { Role, Quadrant, TaskStatus, User, Department, Task } from './types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Kỹ thuật' },
  { id: 'dept-2', name: 'Kinh doanh' },
  { id: 'dept-3', name: 'Nhân sự' }
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
  }
];

export const MOCK_TASKS: Task[] = [
  { 
    id: 't1', 
    title: 'Xử lý sự cố server database', 
    description: 'Database bị quá tải khiến ứng dụng phản hồi chậm. Cần tối ưu query ngay.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.IN_PROGRESS, 
    assigneeId: '3', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-09T08:00:00Z' 
  },
  { 
    id: 't2', 
    title: 'Soạn thảo hợp đồng đối tác mới', 
    description: 'Hợp đồng cung cấp dịch vụ cho đối tác Alpha Corp.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.TODO, 
    assigneeId: '2', 
    creatorId: '1', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-09T08:30:00Z' 
  },
  { 
    id: 't3', 
    title: 'Lên kế hoạch đào tạo quý 2', 
    description: 'Xây dựng giáo trình đào tạo kỹ năng mềm cho nhân sự.', 
    quadrant: Quadrant.Q2, 
    status: TaskStatus.PAUSED, 
    assigneeId: '1', 
    creatorId: '1', 
    departmentId: 'dept-3', 
    createdAt: '2025-01-08T09:00:00Z' 
  },
  { 
    id: 't4', 
    title: 'Cập nhật tài liệu kỹ thuật API', 
    description: 'Bổ sung các endpoint mới của module thanh toán vào tài liệu Swagger.', 
    quadrant: Quadrant.Q2, 
    status: TaskStatus.DONE, 
    assigneeId: '3', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-07T14:20:00Z' 
  },
  { 
    id: 't5', 
    title: 'Phản hồi email khách hàng cũ', 
    description: 'Chăm sóc lại các khách hàng đã không tương tác trong 6 tháng.', 
    quadrant: Quadrant.Q3, 
    status: TaskStatus.REDO, 
    assigneeId: '2', 
    creatorId: '2', 
    departmentId: 'dept-2', 
    createdAt: '2025-01-09T10:15:00Z' 
  },
  { 
    id: 't6', 
    title: 'Đặt lịch họp hội đồng quản trị', 
    description: 'Họp tổng kết kết quả kinh doanh năm 2024.', 
    quadrant: Quadrant.Q3, 
    status: TaskStatus.TODO, 
    assigneeId: '1', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-09T11:00:00Z' 
  },
  { 
    id: 't7', 
    title: 'Kiểm tra hòm thư spam', 
    description: 'Dọn dẹp hòm thư rác định kỳ mỗi tuần.', 
    quadrant: Quadrant.Q4, 
    status: TaskStatus.CANCELLED, 
    assigneeId: '3', 
    creatorId: '3', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-09T13:00:00Z' 
  },
  { 
    id: 't8', 
    title: 'Nghiên cứu công nghệ Blockchain', 
    description: 'Tìm hiểu khả năng ứng dụng vào hệ thống truy xuất nguồn gốc.', 
    quadrant: Quadrant.Q2, 
    status: TaskStatus.IN_PROGRESS, 
    assigneeId: '2', 
    creatorId: '1', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-05T15:45:00Z' 
  },
  { 
    id: 't9', 
    title: 'Tổng kết chi phí marketing', 
    description: 'Báo cáo chi tiết ngân sách đã sử dụng cho chiến dịch tết.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.CLOSED, 
    assigneeId: '1', 
    creatorId: '1', 
    departmentId: 'dept-2', 
    createdAt: '2025-01-04T08:20:00Z' 
  },
  { 
    id: 't10', 
    title: 'Chỉnh sửa giao diện Login', 
    description: 'Fix lỗi tràn viền trên màn hình iPhone 13 mini.', 
    quadrant: Quadrant.Q1, 
    status: TaskStatus.REDO, 
    assigneeId: '3', 
    creatorId: '2', 
    departmentId: 'dept-1', 
    createdAt: '2025-01-09T16:00:00Z' 
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
  [TaskStatus.CLOSED]: { title: 'ĐÃ ĐÓNG', color: 'text-slate-900', bgColor: 'bg-slate-200' },
};
