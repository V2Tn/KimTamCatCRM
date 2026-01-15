
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Department } from '../../types';

interface SettingsViewDepartmentsProps {
  departments: Department[];
  users: User[];
  onAddDepartment?: (name: string) => void;
  onUpdateDepartment?: (deptId: string, name: string) => void;
  onDeleteDepartment?: (deptId: string) => void;
  onUpdateUser?: (userId: string, data: Partial<User>) => void;
}

export const SettingsViewDepartments: React.FC<SettingsViewDepartmentsProps> = ({ 
  departments, 
  users, 
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onUpdateUser 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<Department | null>(null);
  const [editingDeptName, setEditingDeptName] = useState('');
  
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddDept = () => {
    if (newDeptName.trim() && onAddDepartment) {
      onAddDepartment(newDeptName.trim());
      setNewDeptName('');
      setShowAddModal(false);
      triggerSuccess("Thêm phòng ban thành công!");
    }
  };

  const getDeptUsers = (deptId: string) => {
    return users.filter(u => u.departmentId === deptId && !u.deletedAt);
  };

  const filteredAvailableEmployees = useMemo(() => {
    if (!selectedDeptForDetail) return [];
    return users.filter(u => 
      !u.deletedAt && 
      u.departmentId !== selectedDeptForDetail.id &&
      u.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
    );
  }, [users, selectedDeptForDetail, employeeSearchQuery]);

  const handleAddEmployeeToDept = (userId: string) => {
    if (onUpdateUser && selectedDeptForDetail) {
      onUpdateUser(userId, { departmentId: selectedDeptForDetail.id });
      setEmployeeSearchQuery('');
      setIsSearchingEmployees(false);
      triggerSuccess("Đã thêm nhân viên vào phòng!");
    }
  };

  const handleRemoveEmployeeFromDept = (userId: string) => {
    if (onUpdateUser) {
      onUpdateUser(userId, { departmentId: '' });
      triggerSuccess("Đã xóa nhân viên khỏi phòng!");
    }
  };

  const handleConfirmDeleteDept = () => {
    if (selectedDeptForDetail && onDeleteDepartment) {
      onDeleteDepartment(selectedDeptForDetail.id);
      setShowDeleteConfirm(false);
      setSelectedDeptForDetail(null);
      triggerSuccess("Đã xóa phòng ban!");
    }
  };

  const handleConfirmSaveDept = () => {
    if (selectedDeptForDetail && onUpdateDepartment) {
      onUpdateDepartment(selectedDeptForDetail.id, editingDeptName);
      setShowSaveConfirm(false);
      setSelectedDeptForDetail(null);
      triggerSuccess("Cập nhật phòng ban thành công!");
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none !important; }
        .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Danh sách phòng ban</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-10 py-3.5 bg-[#111827] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:bg-black transition-all active:scale-95 flex items-center gap-2"
        >
          <span>+</span> THÊM PHÒNG BAN
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {departments.map(dept => (
          <div 
            key={dept.id} 
            onClick={() => {
              setSelectedDeptForDetail(dept);
              setEditingDeptName(dept.name);
            }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 flex items-center gap-8 group hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:border-indigo-100 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-indigo-50/50 rounded-[1.5rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform relative z-10 shadow-inner border border-white">
              🏢
            </div>
            <div className="space-y-2 relative z-10">
              <p className="font-black text-slate-800 uppercase tracking-[0.1em] text-[15px] leading-none">
                {dept.name}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-200"></span>
                {getDeptUsers(dept.id).length} NHÂN SỰ
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="px-10 py-7 bg-[#111827] text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-[0.2em]">Thêm phòng ban mới</h2>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all font-bold">✕</button>
            </div>
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">TÊN PHÒNG BAN</label>
                <input 
                  autoFocus
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Vd: PHÒNG KẾ HOẠCH"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-black text-slate-800 uppercase"
                />
              </div>
            </div>
            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setShowAddModal(false)} className="px-8 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">HỦY</button>
              <button onClick={handleAddDept} className="px-12 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">TẠO PHÒNG BAN</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Department Modal (Details) */}
      {selectedDeptForDetail && createPortal(
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-10 py-8 bg-[#111827] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-lg">🏢</div>
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">QUẢN LÝ PHÒNG BAN</h2>
                  <input 
                    value={editingDeptName}
                    onChange={(e) => setEditingDeptName(e.target.value)}
                    className="bg-transparent text-2xl font-black uppercase tracking-[0.1em] outline-none border-b border-white/20 focus:border-indigo-400 transition-all w-full min-w-[250px]"
                  />
                </div>
              </div>
              <button 
                onClick={() => setSelectedDeptForDetail(null)} 
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all font-bold"
              >✕</button>
            </div>

            {/* Modal Content */}
            <div className="p-10 space-y-8 bg-white flex-1 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                <div>
                  <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-[0.2em]">DANH SÁCH NHÂN VIÊN HIỆN TẠI</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">CÓ {getDeptUsers(selectedDeptForDetail.id).length} THÀNH VIÊN TRONG PHÒNG</p>
                </div>
                <button 
                  onClick={() => setIsSearchingEmployees(!isSearchingEmployees)}
                  className={`px-8 py-3 ${isSearchingEmployees ? 'bg-slate-800' : 'bg-indigo-600'} text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl shadow-indigo-100 flex items-center gap-2`}
                >
                  {isSearchingEmployees ? '✕ ĐÓNG TÌM KIẾM' : '+ THÊM NHÂN VIÊN'}
                </button>
              </div>

              {/* Employee Search/Add Section */}
              {isSearchingEmployees && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="relative">
                    <input 
                      type="text"
                      autoFocus
                      placeholder="NHẬP TÊN NHÂN VIÊN ĐỂ TÌM KIẾM..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="w-full px-8 py-5 rounded-2xl border-2 border-indigo-100 bg-white text-xs font-black uppercase tracking-widest outline-none shadow-xl shadow-indigo-50 focus:border-indigo-500 transition-all"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</div>
                  </div>
                  
                  {employeeSearchQuery && (
                    <div className="max-h-60 overflow-y-auto bg-slate-50 rounded-[2rem] border border-slate-100 p-2 space-y-1 hide-scrollbar">
                      {filteredAvailableEmployees.length > 0 ? (
                        filteredAvailableEmployees.map(u => (
                          <button 
                            key={u.id}
                            onClick={() => handleAddEmployeeToDept(u.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-[12px] font-black text-slate-500 overflow-hidden">
                                {u.image_avatar ? <img src={u.image_avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                              </div>
                              <div className="text-left">
                                <p className="text-[12px] font-black text-slate-800 uppercase">{u.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{u.role}</p>
                              </div>
                            </div>
                            <span className="text-indigo-600 text-[10px] font-black opacity-0 group-hover:opacity-100 uppercase tracking-widest">+ THÊM VÀO</span>
                          </button>
                        ))
                      ) : (
                        <div className="py-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Không tìm thấy nhân viên phù hợp</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Current Employee List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar">
                {getDeptUsers(selectedDeptForDetail.id).length > 0 ? (
                  getDeptUsers(selectedDeptForDetail.id).map(user => (
                    <div key={user.id} className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[14px] font-black text-slate-400 border border-slate-100 overflow-hidden">
                          {user.image_avatar ? <img src={user.image_avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{user.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveEmployeeFromDept(user.id)}
                        className="px-6 py-2.5 text-[9px] font-black text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all opacity-0 group-hover:opacity-100 uppercase tracking-widest"
                      >
                        LOẠI KHỎI PHÒNG
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12 gap-4">
                    <span className="text-6xl grayscale opacity-20">👥</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">CHƯA CÓ NHÂN SỰ TRONG PHÒNG NÀY</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-white border-t border-slate-50 flex justify-between items-center shrink-0">
               <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="px-8 py-4 text-rose-500 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition-all"
               >XÓA PHÒNG BAN</button>
               <div className="flex gap-4 ml-auto">
                  <button 
                    onClick={() => setShowSaveConfirm(true)} 
                    className="px-16 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                  >LƯU THAY ĐỔI</button>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[20000] flex items-center justify-center p-4">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-8 animate-in zoom-in-95">
              <div className="text-6xl mb-2">⚠️</div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Xác nhận xóa?</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hành động này không thể hoàn tác.</p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">HỦY</button>
                <button onClick={handleConfirmDeleteDept} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-200 transition-all hover:bg-rose-700">XÓA NGAY</button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && createPortal(
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[20000] flex items-center justify-center p-4">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-8 animate-in zoom-in-95">
              <div className="text-6xl mb-2">💾</div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Lưu thay đổi?</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật thông tin phòng ban mới.</p>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowSaveConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-200">HỦY</button>
                <button onClick={handleConfirmSaveDept} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700">CẬP NHẬT</button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Success Notification Toast */}
      {successMessage && createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[30000] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-[#111827] text-emerald-400 px-10 py-5 rounded-2xl shadow-2xl border border-emerald-500/20 flex items-center gap-4">
            <span className="text-xl">✅</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{successMessage}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
