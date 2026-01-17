
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Department, Role } from '../../types';

interface SettingsViewUserProps {
  users: User[];
  departments: Department[];
  currentUser: User;
  isSyncing: boolean;
  lastSync: string | null;
  onSync: () => void;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
  setShowAddUserModal: (show: boolean) => void;
  showAddUserModal: boolean;
}

const HeartLotusLogo = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[120px] md:h-[120px]">
    <path d="M50 85C50 85 85 65 85 40C85 25 70 15 50 40C30 15 15 25 15 40C15 65 50 85 50 85Z" fill="#6366F1" fillOpacity="0.8"/>
    <path d="M50 35C52.7614 35 55 32.7614 55 30C55 27.2386 52.7614 25 50 25C47.2386 25 45 27.2386 45 30C45 32.7614 47.2386 35 50 35Z" fill="#F43F5E"/>
    <path d="M50 85C50 85 85 65 85 40C85 25 70 15 50 40C30 15 15 25 15 40C15 65 50 85 50 85Z" stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const CustomDropdown = ({ label, value, options, onChange, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => (opt.id || opt) === value);
  const displayValue = selectedOption?.name || selectedOption || 'CHỌN...';

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-4 py-3 md:py-3.5 bg-white border-2 rounded-2xl transition-all cursor-pointer shadow-sm ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{displayValue}</span>
        <svg className={`w-3 h-3 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[150] p-1 animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt: any) => {
              const optValue = opt.id || opt;
              const optLabel = opt.name || opt;
              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => { onChange({ target: { value: optValue } }); setIsOpen(false); }}
                  className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all ${value === optValue ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const EditableField = ({ label, value, onChange, type = "text", readOnly = false, error }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
      <div className={`relative flex items-center transition-all border-2 bg-white rounded-2xl px-4 py-3 md:py-3.5 ${error ? 'border-red-500 ring-4 ring-red-50' : (isFocused ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100')} ${readOnly ? 'bg-slate-50/50' : ''}`}>
        <input 
          type={inputType} 
          value={value || ''} 
          onChange={onChange} 
          onFocus={() => !readOnly && setIsFocused(true)} 
          onBlur={() => setIsFocused(false)} 
          readOnly={readOnly} 
          className={`w-full bg-transparent outline-none font-bold text-slate-800 text-sm transition-all pr-10 ${readOnly ? 'cursor-default' : ''}`} 
        />
        {isPasswordField && !readOnly && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-slate-400 hover:text-indigo-600 transition-colors">
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>
      {error && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1 animate-in slide-in-from-top-1">{error}</p>}
    </div>
  );
};

export const SettingsViewUser: React.FC<SettingsViewUserProps> = ({ 
  users, departments, currentUser, isSyncing, lastSync, onSync, onAddUser, onUpdateUser, onDeleteUser, setErrorMessage, setSuccessMessage, setShowAddUserModal, showAddUserModal
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [editFields, setEditFields] = useState<Partial<User>>({});
  const [newUserFields, setNewUserFields] = useState<Partial<User>>({
    name: '', username: '', email: '', phoneNumber: '', gender: 'Nam', role: Role.STAFF, departmentId: departments[0]?.id || '', password: '', isOnline: false, image_avatar: ''
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [localToast, setLocalToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const addAvatarInputRef = useRef<HTMLInputElement>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localToast) {
      const timer = setTimeout(() => setLocalToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [localToast]);

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setLocalToast({ msg, type });
  };

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length > 0 && (cleanPhone.length < 10 || cleanPhone.length > 12)) {
      return "SỐ ĐIỆN THOẠI PHẢI TỪ 10 ĐẾN 12 SỐ";
    }
    return null;
  };

  const handlePhoneChange = (val: string, isAdd: boolean) => {
    const error = validatePhone(val);
    setPhoneError(error);
    if (isAdd) setNewUserFields({...newUserFields, phoneNumber: val});
    else setEditFields({...editFields, phoneNumber: val});
  };

  const handleCreateUser = () => {
    const currentPhone = newUserFields.phoneNumber || '';
    const error = validatePhone(currentPhone);
    
    if (error || (currentPhone.length > 0 && (currentPhone.length < 10 || currentPhone.length > 12))) {
      setPhoneError(error || "SỐ ĐIỆN THOẠI KHÔNG HỢP LỆ");
      triggerToast("Số điện thoại không hợp lệ!", "error");
      return;
    }

    if (!newUserFields.name || !newUserFields.username || !newUserFields.password) {
      triggerToast("Thiếu thông tin bắt buộc!", "error");
      return;
    }

    try {
      onAddUser({ ...newUserFields, createdAt: new Date().toISOString() });
      triggerToast("Thêm nhân viên mới thành công!");
      setShowAddUserModal(false);
      setNewUserFields({
        name: '', username: '', email: '', phoneNumber: '', gender: 'Nam', role: Role.STAFF, departmentId: departments[0]?.id || '', password: '', isOnline: false, image_avatar: ''
      });
    } catch (e) {
      triggerToast("Lỗi hệ thống khi tạo tài khoản!", "error");
    }
  };

  const handleConfirmUpdate = () => {
    if (!selectedUser) return;
    const error = validatePhone(editFields.phoneNumber || '');
    if (error) {
      setPhoneError(error);
      triggerToast("Số điện thoại không hợp lệ!", "error");
      return;
    }

    try {
      onUpdateUser(selectedUser.id, editFields);
      triggerToast("Cập nhật thông tin thành công!");
      setShowUpdateConfirmModal(false);
      setSelectedUser(null);
    } catch (e) {
      triggerToast("Cập nhật thất bại!", "error");
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    try {
      onDeleteUser(selectedUser.id);
      triggerToast("Đã xóa nhân viên khỏi hệ thống!");
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (e) {
      triggerToast("Không thể xóa lúc này!", "error");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, isAdd: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isAdd) setNewUserFields(prev => ({ ...prev, image_avatar: reader.result as string }));
        else setEditFields(prev => ({ ...prev, image_avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const activeUsers = users.filter(u => !u.deletedAt);

  return (
    <div className="space-y-6 md:space-y-8">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800">Danh sách nhân viên</h3>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-xs text-slate-400 font-medium">Hiện có {activeUsers.length} tài khoản trong hệ thống</p>
            {lastSync && <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Cập nhật lần cuối: {lastSync}</p>}
          </div>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={onSync} 
            disabled={isSyncing} 
            className={`flex-1 md:flex-none px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm ${isSyncing ? 'bg-indigo-50 text-indigo-400 border-indigo-100' : 'bg-white text-indigo-600 border-slate-200 hover:bg-slate-50 active:scale-95'}`}
          >
            {isSyncing ? <span className="animate-spin">⏳</span> : '🔄'} 
            {isSyncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ'}
          </button>
          <button onClick={() => setShowAddUserModal(true)} className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-[#111827] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
            + THÊM MỚI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {activeUsers.map(user => (
          <div key={user.id} onClick={() => { setSelectedUser(user); setEditFields(user); setPhoneError(null); }} className="group flex items-center gap-4 bg-white p-4 md:p-5 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 cursor-pointer min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-lg font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm flex-shrink-0 overflow-hidden relative border border-slate-50">
              {user.image_avatar ? <img src={user.image_avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[14px] font-black text-slate-800 truncate uppercase tracking-tight leading-tight">{user.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="text-[8px] md:text-[9px] font-black text-indigo-500 uppercase tracking-widest">{user.role}</span>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wider">{departments.find(d => d.id === user.departmentId)?.name || 'Chưa gán'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal - Z-index: 1000 */}
      {showAddUserModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
           <div className="bg-white md:rounded-[3rem] shadow-2xl w-full md:max-w-6xl h-full md:h-auto md:max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 overflow-hidden">
              <div className="px-6 md:px-10 py-5 md:py-7 bg-[#111827] text-white flex justify-between items-center shrink-0">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-[0.2em]">Thêm nhân viên mới</h2>
                <button onClick={() => setShowAddUserModal(false)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all font-bold">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 md:p-12 hide-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 md:gap-12">
                  <div className="flex flex-col items-center gap-6 md:gap-8 lg:border-r border-slate-100 lg:pr-12">
                    <div 
                      onClick={() => addAvatarInputRef.current?.click()} 
                      className="w-36 h-36 md:w-64 md:h-64 rounded-[2rem] md:rounded-[3.5rem] bg-slate-50 border-4 md:border-8 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all group overflow-hidden relative"
                    >
                      {newUserFields.image_avatar ? <img src={newUserFields.image_avatar} className="w-full h-full object-cover" /> : <HeartLotusLogo />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Chọn ảnh</span>
                      </div>
                    </div>
                    <input type="file" ref={addAvatarInputRef} onChange={(e) => handleAvatarChange(e, true)} className="hidden" accept="image/*" />
                    
                    <div className="w-full space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">TRẠNG THÁI KHỞI TẠO</label>
                      <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 border-2 bg-indigo-50 border-indigo-100 text-indigo-600">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">TÀI KHOẢN MỚI</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <EditableField label="Họ và tên" value={newUserFields.name} onChange={(e: any) => setNewUserFields({...newUserFields, name: e.target.value})} />
                      <EditableField label="Địa chỉ Email" type="email" value={newUserFields.email} onChange={(e: any) => setNewUserFields({...newUserFields, email: e.target.value})} />
                      <EditableField label="Tài khoản đăng nhập" value={newUserFields.username} onChange={(e: any) => setNewUserFields({...newUserFields, username: e.target.value})} />
                      <EditableField label="Mật khẩu truy cập" type="password" value={newUserFields.password} onChange={(e: any) => setNewUserFields({...newUserFields, password: e.target.value})} />
                      <div className="md:col-span-2">
                        <EditableField 
                          label="Số điện thoại" 
                          type="tel" 
                          value={newUserFields.phoneNumber} 
                          onChange={(e: any) => handlePhoneChange(e.target.value, true)} 
                          error={phoneError}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                      <CustomDropdown label="Giới tính" options={['Nam', 'Nữ', 'Khác']} value={newUserFields.gender} onChange={(e: any) => setNewUserFields({...newUserFields, gender: e.target.value})} />
                      <CustomDropdown label="Chức vụ" options={[{ id: Role.STAFF, name: 'Staff' }, { id: Role.MANAGER, name: 'Manager' }, { id: Role.ADMIN, name: 'Admin' }]} value={newUserFields.role} onChange={(e: any) => setNewUserFields({...newUserFields, role: e.target.value})} />
                      <CustomDropdown label="Phòng ban" options={departments} value={newUserFields.departmentId} onChange={(e: any) => setNewUserFields({...newUserFields, departmentId: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 px-6 py-5 md:py-8 bg-white border-t border-slate-100 flex justify-end shrink-0 z-20">
                <button onClick={handleCreateUser} className="w-full md:w-auto px-14 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">XÁC NHẬN TẠO</button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Edit User Modal - Z-index: 1000 */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[1000] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
          <div className="bg-white md:rounded-[3rem] shadow-2xl w-full md:max-w-6xl h-full md:h-auto md:max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 overflow-hidden">
            <div className="px-6 md:px-10 py-5 md:py-7 bg-[#111827] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs shadow-lg">K</div>
                <h2 className="text-base md:text-xl font-black uppercase tracking-[0.2em]">Hồ sơ nhân viên</h2>
              </div>
              <button onClick={() => { setSelectedUser(null); setPhoneError(null); }} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all font-bold">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-12 hide-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 md:gap-12">
                <div className="flex flex-col items-center gap-6 md:gap-8 lg:border-r border-slate-100 lg:pr-12">
                  <div 
                    onClick={() => editAvatarInputRef.current?.click()} 
                    className="w-36 h-36 md:w-64 md:h-64 rounded-[2rem] md:rounded-[3.5rem] bg-slate-50 border-4 md:border-8 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all group overflow-hidden relative"
                  >
                    {editFields.image_avatar ? <img src={editFields.image_avatar} className="w-full h-full object-cover" /> : <HeartLotusLogo />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Thay đổi</span>
                    </div>
                  </div>
                  <input type="file" ref={editAvatarInputRef} onChange={(e) => handleAvatarChange(e, false)} className="hidden" accept="image/*" />
                  
                  <div className="w-full space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">TRẠNG THÁI HIỆN TẠI</label>
                    <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${selectedUser.isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${selectedUser.isOnline ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                        {selectedUser.isOnline ? 'ĐANG TRỰC TUYẾN' : 'ĐANG NGOẠI TUYẾN'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full p-4 md:p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">NGÀY THAM GIA</p>
                    <p className="text-[11px] md:text-[12px] font-black text-slate-800 text-center uppercase tracking-tight">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <EditableField label="Họ và tên" value={editFields.name} onChange={(e: any) => setEditFields({...editFields, name: e.target.value})} />
                      <EditableField label="Email nhân sự" type="email" value={editFields.email} onChange={(e: any) => setEditFields({...editFields, email: e.target.value})} />
                      <EditableField label="Tài khoản đăng nhập" value={editFields.username} onChange={(e: any) => setEditFields({...editFields, username: e.target.value})} />
                      <EditableField label="Mật khẩu truy cập" type="password" value={editFields.password} onChange={(e: any) => setEditFields({...editFields, password: e.target.value})} />
                      <div className="md:col-span-2">
                        <EditableField 
                          label="Số điện thoại" 
                          type="tel" 
                          value={editFields.phoneNumber} 
                          onChange={(e: any) => handlePhoneChange(e.target.value, false)} 
                          error={phoneError}
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                      <CustomDropdown label="Giới tính" options={['Nam', 'Nữ', 'Khác']} value={editFields.gender} onChange={(e: any) => setEditFields({...editFields, gender: e.target.value})} />
                      <CustomDropdown label="Chức vụ" options={[{ id: Role.STAFF, name: 'Staff' }, { id: Role.MANAGER, name: 'Manager' }, { id: Role.ADMIN, name: 'Admin' }]} value={editFields.role} onChange={(e: any) => setEditFields({...editFields, role: e.target.value})} />
                      <CustomDropdown label="Phòng ban" options={departments} value={editFields.departmentId} onChange={(e: any) => setEditFields({...editFields, departmentId: e.target.value})} />
                   </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-5 md:py-8 bg-white border-t border-slate-50 flex flex-col md:flex-row justify-between items-center shrink-0 z-20 gap-3 md:gap-4">
               <button onClick={() => setShowDeleteModal(true)} className="w-full md:w-auto px-8 py-4 text-rose-500 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition-all">XÓA NHÂN VIÊN</button>
               <button onClick={() => setShowUpdateConfirmModal(true)} className="w-full md:w-auto px-16 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">LƯU THÔNG TIN</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal - Z-index higher than current modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
           <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Xác nhận xóa?</h3>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">HỦY</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-200 transition-all hover:bg-rose-700">XÓA NGAY</button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Update Confirmation Modal - Z-index higher than current modal */}
      {showUpdateConfirmModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4">
           <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95">
              <div className="text-6xl">💾</div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lưu thay đổi?</h3>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowUpdateConfirmModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">HỦY</button>
                <button onClick={handleConfirmUpdate} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700">CẬP NHẬT</button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Notifications - Z-index: 30000 */}
      {localToast && createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[30000] animate-in slide-in-from-bottom-10 duration-500 w-[calc(100%-2rem)] md:w-auto">
          <div className={`px-10 py-5 rounded-2xl shadow-2xl border flex items-center gap-4 ${localToast.type === 'success' ? 'bg-[#111827] text-emerald-400 border-emerald-500/20' : 'bg-[#111827] text-rose-400 border-rose-500/20'}`}>
            <span className="text-xl">{localToast.type === 'success' ? '✅' : '❌'}</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{localToast.msg}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
