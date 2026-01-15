
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export enum Quadrant {
  Q1 = 'Q1', // Urgent & Important
  Q2 = 'Q2', // Not Urgent & Important
  Q3 = 'Q3', // Urgent & Not Important
  Q4 = 'Q4'  // Not Urgent & Not Important
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  REDO = 'REDO',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  // Added CLOSED status to sync with types/index.ts and resolve errors in constants
  CLOSED = 'CLOSED'
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  departmentId?: string;
  isOnline?: boolean;
  phoneNumber?: string;
  password?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  image_avatar?: string;
  createdAt?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
}

export interface TaskLog {
  id: string;
  content: string;
  timestamp: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: Quadrant;
  status: TaskStatus;
  assigneeId: string;
  creatorId: string;
  followerIds?: string[];
  departmentId?: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  attachments?: string[];
  resultContent?: string;
  resultAttachments?: string[];
  evaluation?: string; 
  old_evaluation?: string; // Lưu vết đánh giá cũ khi Redo
  logs?: TaskLog[]; 
}

export interface AIAnalysisResult {
  quadrant: Quadrant;
  reasoning: string;
}
