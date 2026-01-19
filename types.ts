
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export enum Quadrant {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  REDO = 'REDO',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED'
}

export interface Attachment {
  name: string;
  data: string;
}

export interface Department {
  id: string;
  name: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  departmentId?: string;
  isOnline?: number; // 1: Online, 2: Offline
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
  attachments?: Attachment[];
  resultContent?: string;
  resultAttachments?: Attachment[];
  evaluation?: string; 
  old_evaluation?: string;
  logs?: TaskLog[]; 
}

export interface AIAnalysisResult {
  quadrant: Quadrant;
  reasoning: string;
}
