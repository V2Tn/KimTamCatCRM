
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginView } from './components/Auth/LoginView';
import { TaskCreateModal } from './components/Tasks/TaskCreateModal';
import { SettingsView } from './components/Settings/SettingsView';
import { TaskDetailModal } from './components/Tasks/TaskDetailModal';
import { DashboardView } from './components/Dashboard/DashboardView';
import { useTasks } from './hooks/useTasks';
import { useUsers } from './hooks/useUsers';
import { Task, User } from './types';

type TabType = 'Hôm nay' | 'Tuần' | 'Tháng' | 'Năm';
type ViewMode = 'list' | 'matrix';
type AppView = 'dashboard' | 'settings';

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
  
  // Quản lý trạng thái đăng nhập
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hook tasks chỉ hoạt động khi có currentUser
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

  if (!isLoggedIn || !currentUser) {
    return <LoginView onLogin={handleLogin} users={users} />;
  }

  const selectedTask = visibleTasks.find(t => t.id === selectedTaskId);
  const checkCanDelete = (task: Task) => currentUser.role !== 'STAFF' || task.creatorId === currentUser.id;

  return (
    <>
      <Layout 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onUserSelect={(user) => { handleLogin(user); setCurrentView('dashboard'); }}
        onSettingsOpen={() => setCurrentView('settings')}
        onLogoClick={() => setCurrentView('dashboard')}
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
            onTaskClick={(task) => setSelectedTaskId(task.id)} 
            onToggleTask={toggleTaskStatus}
            onDeleteTask={deleteTask} 
            onEditTask={(task) => setSelectedTaskId(task.id)}
            onCreateTaskClick={() => setIsCreateModalOpen(true)}
            checkCanDelete={checkCanDelete} 
            stats={stats}
          />
        ) : (
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
          onClose={() => setSelectedTaskId(null)} 
          onDelete={deleteTask} 
          onToggle={toggleTaskStatus} 
          onUpdateTask={updateTask}
          currentUserId={currentUser.id} 
        />
      )}
    </>
  );
};

export default App;
