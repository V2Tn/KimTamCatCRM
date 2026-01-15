
import React, { useState, useEffect } from 'react';
import { User, Department } from '../../types';
import { SettingsViewUser } from './SettingsViewUser';
import { SettingsViewDepartments } from './SettingsViewDepartments';
import { SettingsViewConfig } from './SettingsViewConfig';

interface ApiLog {
  id: string;
  method: 'GET' | 'POST' | 'LOCAL';
  url: string;
  action: string;
  status: 'pending' | 'success' | 'error';
  timestamp: string;
  details?: string;
  rawResponse?: string;
}

interface SettingsViewProps {
  users: User[];
  departments: Department[];
  currentUser: User;
  gsheetReadUrl: string;
  gsheetWriteUrl: string;
  onUpdateReadUrl: (url: string) => void;
  onUpdateWriteUrl: (url: string) => void;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  onAddDepartment: (name: string) => void;
  onUpdateDepartment: (deptId: string, name: string) => void;
  onDeleteDepartment: (deptId: string) => void;
  onSyncUsers: (users: User[]) => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'config'>('users');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('last_user_sync'));
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [localReadUrl, setLocalReadUrl] = useState(props.gsheetReadUrl);
  const [localWriteUrl, setLocalWriteUrl] = useState(props.gsheetWriteUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => { setSuccessMessage(null); setErrorMessage(null); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localReadUrl !== props.gsheetReadUrl || localWriteUrl !== props.gsheetWriteUrl) {
        setIsSaving(true);
        props.onUpdateReadUrl(localReadUrl);
        props.onUpdateWriteUrl(localWriteUrl);
        setApiLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), method: 'LOCAL', url: 'localStorage', action: 'AUTO-SAVE CONFIG', status: 'success', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        setTimeout(() => setIsSaving(false), 800);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localReadUrl, localWriteUrl]);

  const fetchUsersFromGSheet = async () => {
    if (!props.gsheetReadUrl) { setErrorMessage("Chưa cấu hình Webhook URL!"); return; }
    setIsSyncing(true);
    const logId = Math.random().toString(36).substr(2, 9);
    setApiLogs(prev => [{ id: logId, method: 'GET', url: props.gsheetReadUrl, action: 'SYNC NHÂN SỰ', status: 'pending', timestamp: new Date().toLocaleTimeString() }, ...prev]);

    try {
      const response = await fetch(props.gsheetReadUrl);
      const data = await response.json();
      if (data.status === "success" || Array.isArray(data)) {
        const usersData = Array.isArray(data) ? data : data.data;
        props.onSyncUsers(usersData);
        const now = new Date().toLocaleString('vi-VN');
        setLastSync(now);
        localStorage.setItem('last_user_sync', now);
        setSuccessMessage(`Đồng bộ thành công ${usersData.length} tài khoản!`);
        setApiLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'success' } : l));
      } else throw new Error("Dữ liệu không hợp lệ");
    } catch (e: any) {
      setErrorMessage(`Lỗi đồng bộ: ${e.message}`);
      setApiLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'error' } : l));
    } finally { setIsSyncing(false); }
  };

  // Removed handleCancelAction as it was unused and caused TS errors

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={props.onBack} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">←</button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">CÀI ĐẶT HỆ THỐNG</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        <div className="w-full md:w-72 bg-slate-50/50 border-r border-slate-100 p-6 space-y-2">
          {(['users', 'departments', 'config'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-500 hover:bg-white'}`}>
              {tab === 'users' ? 'Nhân viên' : tab === 'departments' ? 'Phòng ban' : 'Cấu hình'}
            </button>
          ))}
        </div>

        <div className="flex-1 p-8 md:p-10">
          {activeTab === 'users' && (
            <SettingsViewUser 
              users={props.users} 
              departments={props.departments} 
              currentUser={props.currentUser} 
              isSyncing={isSyncing} 
              lastSync={lastSync} 
              onSync={fetchUsersFromGSheet} 
              onAddUser={props.onAddUser} 
              onUpdateUser={props.onUpdateUser} 
              onDeleteUser={props.onDeleteUser} 
              setSuccessMessage={setSuccessMessage} 
              setErrorMessage={setErrorMessage} 
              setShowAddUserModal={setShowAddUserModal}
              showAddUserModal={showAddUserModal}
            />
          )}
          {activeTab === 'departments' && (
            <SettingsViewDepartments 
              departments={props.departments} 
              users={props.users} 
              onAddDepartment={props.onAddDepartment}
              onUpdateDepartment={props.onUpdateDepartment}
              onDeleteDepartment={props.onDeleteDepartment}
              onUpdateUser={props.onUpdateUser}
            />
          )}
          {activeTab === 'config' && (
            <SettingsViewConfig 
              localReadUrl={localReadUrl} setLocalReadUrl={setLocalReadUrl} 
              localWriteUrl={localWriteUrl} setLocalWriteUrl={setLocalWriteUrl} 
              isSaving={isSaving} apiLogs={apiLogs} setApiLogs={setApiLogs} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
