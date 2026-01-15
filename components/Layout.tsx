
import React, { useState, useRef, useEffect } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  onUserSelect: (user: User) => void;
  onSettingsOpen?: () => void;
  onLogoClick?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentUser, 
  onLogout, 
  onUserSelect, 
  onSettingsOpen, 
  onLogoClick,
  children 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFE]">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-[#F9FAFE]/80 backdrop-blur-md border-b border-slate-100">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onLogoClick}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">K</div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Kim Tâm Cát</h1>
        </div>
        
        <div className="flex items-center gap-6 relative" ref={menuRef}>
          {isAdmin && (
            <button 
              onClick={onSettingsOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all group"
            >
              <span className="text-lg group-hover:rotate-45 transition-transform duration-500">⚙️</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Cài đặt</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{currentUser.role}</p>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border-2 border-white shadow-sm hover:ring-2 hover:ring-indigo-100 transition-all"
            >
              {currentUser.name.charAt(0)}
            </button>
          </div>

          {/* User Switching Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chuyển đổi tài khoản</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserSelect(user);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                      currentUser.id === user.id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentUser.id === user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${currentUser.id === user.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{user.role}</p>
                    </div>
                    {currentUser.id === user.id && (
                      <span className="ml-auto text-indigo-600 text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-1 pt-1 border-t border-slate-50 px-2">
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>🚪</span> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
