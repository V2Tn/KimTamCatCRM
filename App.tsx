
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Layout } from './components/Layout';
import { LoginView } from './components/Auth/LoginView';
import { TaskCreateModal } from './components/Tasks/TaskCreateModal';
import { SettingsView } from './components/Settings/SettingsView';
import { TaskDetailModal } from './components/Tasks/TaskDetailModal';
import { DashboardView } from './components/Dashboard/DashboardView';
import { AdminStaffManagement } from './components/Admin/AdminStaffManagement';
import { useTasks } from './hooks/useTasks';
import { useUsers } from './hooks/useUsers';
import { Task, User, TaskStatus } from './types';

type TabType = 'Hôm nay' | 'Tuần' | 'Tháng' | 'Năm';
type ViewMode = 'list' | 'matrix';
type AppView = 'dashboard' | 'settings' | 'staff_management';

const App: React.FC = () => {
  const { 
    users, 
    departments, 
    setUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    addDepartment,
    updateDepartment,
    deleteDepartment
  } = useUsers();
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeTab, setActiveTab] = useState<TabType>('Hôm nay');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const taskHook = useTasks(currentUser || users[0], users);
  const { visibleTasks, stats, addTask, updateTask, deleteTask, toggleTaskStatus } = taskHook;

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('auth_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('auth_user');
    setCurrentView('dashboard');
  };

  const handleUpdateTaskWithToast = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
    setSuccessToast("Cập nhật thành công");
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleTaskClick = (task: Task, forceStatus?: TaskStatus) => {
    setSelectedTaskId(task.id);
    setPendingStatus(forceStatus || null);
  };

  if (!isLoggedIn || !currentUser) {
    return <LoginView onLogin={handleLogin} users={users} />;
  }

  const selectedTask = visibleTasks.find(t => t.id === selectedTaskId);
  const checkCanDelete = (task: Task) => currentUser.role !== 'STAFF' || task.creatorId === currentUser.id;

  // Logic readonly mở rộng: Ẩn nút lưu nếu đang ở view Nhân sự HOẶC Dashboard nhưng tab không phải "Hôm nay"
  const isModalReadonly = currentView === 'staff_management' || (currentView === 'dashboard' && activeTab !== 'Hôm nay');

  return (
    <>
      <Layout 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onUserSelect={(user) => { handleLogin(user); setCurrentView('dashboard'); }}
        onSettingsOpen={() => setCurrentView('settings')}
        onLogoClick={() => setCurrentView('dashboard')}
        onStaffManagementOpen={() => setCurrentView('staff_management')}
      >
        {currentView === 'dashboard' ? (
          <DashboardView 
            currentUser={currentUser} 
            users={users} 
            visibleTasks={visibleTasks}
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            viewMode={viewMode} 
            setViewMode={setViewMode}
            onTaskClick={handleTaskClick} 
            onUpdateTask={handleUpdateTaskWithToast}
            onDeleteTask={deleteTask} 
            onEditTask={(task) => setSelectedTaskId(task.id)}
            onCreateTaskClick={() => setIsCreateModalOpen(true)}
            checkCanDelete={checkCanDelete} 
            stats={stats}
          />
        ) : currentView === 'settings' ? (
          <SettingsView 
            users={users} 
            departments={departments} 
            currentUser={currentUser}
            gsheetReadUrl={localStorage.getItem('gs_read') || ''}
            gsheetWriteUrl={localStorage.getItem('gs_write') || ''}
            onUpdateReadUrl={(u) => localStorage.setItem('gs_read', u)}
            onUpdateWriteUrl={(u) => localStorage.setItem('gs_write', u)}
            onAddUser={addUser} 
            onUpdateUser={updateUser} 
            onDeleteUser={deleteUser}
            onAddDepartment={addDepartment} 
            onUpdateDepartment={updateDepartment} 
            onDeleteDepartment={deleteDepartment} 
            onSyncUsers={setUsers} 
            onBack={() => setCurrentView('dashboard')}
          />
        ) : (
          <AdminStaffManagement 
            users={users}
            tasks={visibleTasks}
            currentUser={currentUser}
            onTaskClick={handleTaskClick}
            onEditTask={(task) => setSelectedTaskId(task.id)}
            onDeleteTask={deleteTask}
            onUpdateTask={handleUpdateTaskWithToast}
          />
        )}
      </Layout>

      <TaskCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onAdd={addTask} 
        currentUser={currentUser} 
        users={users} 
      />
      
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          users={users} 
          canDelete={checkCanDelete(selectedTask)} 
          onClose={() => { setSelectedTaskId(null); setPendingStatus(null); }} 
          onDelete={deleteTask} 
          onToggle={toggleTaskStatus} 
          onUpdateTask={handleUpdateTaskWithToast}
          currentUserId={currentUser.id} 
          initialStatus={pendingStatus}
          readonly={isModalReadonly}
        />
      )}

      {successToast && createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[30000] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-[#111827] text-white px-10 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{successToast}</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default App;
