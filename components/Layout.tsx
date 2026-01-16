
import React, { useState, useRef, useEffect } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  onUserSelect: (user: User) => void;
  onSettingsOpen?: () => void;
  onStaffManagementOpen?: () => void;
  onLogoClick?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentUser, 
  onLogout, 
  onUserSelect, 
  onSettingsOpen, 
  onStaffManagementOpen,
  onLogoClick,
  children 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;
  const isManagerOrAdmin = isAdmin || currentUser.role === Role.MANAGER;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    onSettingsOpen?.();
    setIsMobileNavOpen(false);
  };

  const handleStaffClick = () => {
    onStaffManagementOpen?.();
    setIsMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFE]">
      {/* Header - Z-index: 50 */}
      <header className="px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-[50] bg-[#F9FAFE]/80 backdrop-blur-md border-b border-slate-100">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onLogoClick}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">K</div>
          <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight truncate">Kim Tâm Cát</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6 relative" ref={menuRef}>
          {/* Desktop Nav Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {isManagerOrAdmin && (
              <button 
                onClick={onStaffManagementOpen}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Nhân sự</span>
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={onSettingsOpen}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all group"
              >
                <span className="text-lg group-hover:rotate-45 transition-transform duration-500">⚙️</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Cài đặt</span>
              </button>
            )}
          </div>

          {/* User Info & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{currentUser.role}</p>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border-2 border-white shadow-sm hover:ring-2 hover:ring-indigo-100 transition-all"
            >
              {currentUser.name.charAt(0)}
            </button>

            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 sm:hidden text-slate-500 hover:text-indigo-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* User Switching Dropdown - Desktop & Mobile */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
              {isAdmin ? (
                <>
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chuyển đổi tài khoản</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto hide-scrollbar">
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
                  <div className="h-[1px] bg-slate-50 my-1"></div>
                </>
              ) : (
                <div className="px-4 py-3 border-b border-slate-50 mb-1 text-center bg-slate-50/30">
                   <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">{currentUser.name}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{currentUser.role}</p>
                </div>
              )}
              
              <div className="mt-1 pt-1 px-2">
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

      {/* Mobile Sidebar Navigation Overlay - Z-index: 100 */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Danh mục</span>
              <button onClick={() => setIsMobileNavOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <button 
                onClick={() => { onLogoClick?.(); setIsMobileNavOpen(false); }}
                className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-3"
              >
                <span>🏠</span> Dashboard
              </button>
              {isManagerOrAdmin && (
                <button 
                  onClick={handleStaffClick}
                  className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-3"
                >
                  <span>📊</span> Quản lý nhân sự
                </button>
              )}
              {isAdmin && (
                <button 
                  onClick={handleSettingsClick}
                  className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-3"
                >
                  <span>⚙️</span> Cài đặt hệ thống
                </button>
              )}
            </div>
            <div className="p-6 border-t border-slate-50">
              <button 
                onClick={onLogout}
                className="w-full p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center gap-3"
              >
                <span>🚪</span> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 p-3 md:p-6 overflow-y-auto hide-scrollbar">
        {children}
      </main>
    </div>
  );
};
