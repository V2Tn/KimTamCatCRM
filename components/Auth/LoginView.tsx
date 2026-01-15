
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
  users: User[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFormMode, setIsFormMode] = useState(false);
  
  // Danh sách ID các user đã từng đăng nhập thành công trên thiết bị này
  const [recentUserIds, setRecentUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('remembered_user_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // Tự động chuyển sang Form Mode nếu chưa có tài khoản nào từng đăng nhập
  useEffect(() => {
    if (recentUserIds.length === 0) {
      setIsFormMode(true);
    }
  }, [recentUserIds]);

  const saveToRecent = (userId: string) => {
    const updated = Array.from(new Set([userId, ...recentUserIds])).slice(0, 5); // Lưu tối đa 5 tài khoản gần nhất
    setRecentUserIds(updated);
    localStorage.setItem('remembered_user_ids', JSON.stringify(updated));
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Tìm user trong danh sách nhân viên hiện tại (đã tạo trong settings)
    const user = users.find(u => 
      !u.deletedAt && 
      u.username === username && 
      (u.password === password || password === '123456') // Hỗ trợ master pass cho dev
    );
    
    if (user) {
      saveToRecent(user.id);
      onLogin(user);
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  const recentUsers = users.filter(u => recentUserIds.includes(u.id) && !u.deletedAt);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden z-10 mx-4">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white relative">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-4xl shadow-2xl">K</div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">Hệ thống Quản trị<br/>Kim Tâm Cát</h1>
          </div>
        </div>

        {/* Right Side: Login Content */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white/5">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Chào mừng trở lại</h2>
            <p className="text-slate-400 text-sm font-medium">Vui lòng đăng nhập để tiếp tục quản lý công việc.</p>
          </div>

          {(!isFormMode && recentUsers.length > 0) ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Tiếp tục với tư cách</p>
               <div className="grid grid-cols-1 gap-3">
                  {recentUsers.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => handleQuickLogin(user)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white hover:border-white transition-all group text-left shadow-sm active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm group-hover:scale-110 transition-transform overflow-hidden">
                        {user.image_avatar ? <img src={user.image_avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-100 group-hover:text-indigo-950 transition-colors uppercase tracking-tight truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 group-hover:text-indigo-600 transition-colors font-bold uppercase">{user.role}</p>
                      </div>
                      <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
               </div>
               
               <div className="pt-6 text-center">
                 <button 
                  onClick={() => setIsFormMode(true)}
                  className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                 >
                   Sử dụng tài khoản khác
                 </button>
               </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tài khoản đăng nhập</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nhập username của bạn"
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                  XÁC NHẬN ĐĂNG NHẬP
                </button>
                {recentUserIds.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setIsFormMode(false)}
                    className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Quay lại danh sách đã đăng nhập
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
