
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User } from '../../types';

interface UserSelectProps {
  label: string;
  users: User[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  label,
  users,
  selectedValues,
  onChange,
  multiple = false,
  placeholder = "Chọn nhân sự...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      !u.deletedAt && 
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const selectedUsers = useMemo(() => {
    return users.filter(u => selectedValues.includes(u.id));
  }, [users, selectedValues]);

  const toggleUser = (userId: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(userId)
        ? selectedValues.filter(id => id !== userId)
        : [...selectedValues, userId];
      onChange(newValues);
    } else {
      onChange([userId]);
      setIsOpen(false);
    }
  };

  const removeUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter(id => id !== userId));
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-950 uppercase tracking-widest block ml-1">
        {label}
      </label>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[54px] flex items-center gap-2.5 p-2.5 bg-white rounded-2xl border-2 transition-all shadow-sm ${
          disabled 
            ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-100' 
            : 'hover:border-indigo-400 hover:shadow-md cursor-pointer active:scale-[0.98] border-slate-100'
        } ${isOpen ? 'border-indigo-400 ring-4 ring-indigo-50' : ''}`}
      >
        {!multiple ? (
          <div className="flex items-center gap-2.5 w-full">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg shrink-0 ${selectedUsers[0] ? 'bg-indigo-600' : 'bg-slate-200'}`}>
              {selectedUsers[0]?.image_avatar ? (
                <img src={selectedUsers[0].image_avatar} className="w-full h-full object-cover rounded-xl" />
              ) : (
                selectedUsers[0]?.name.charAt(0) || '?'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight leading-none">
                {selectedUsers[0]?.name || placeholder}
              </p>
              {selectedUsers[0] && (
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{selectedUsers[0].role}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 flex-1 pr-4">
            {selectedUsers.length > 0 ? (
              selectedUsers.map(u => (
                <div key={u.id} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-indigo-100 animate-in zoom-in-95 group/chip">
                  <span className="text-[9px] font-black uppercase tracking-tight">{u.name}</span>
                  <span 
                    onClick={(e) => removeUser(e, u.id)}
                    className="hover:bg-indigo-200 rounded-full w-3 h-3 flex items-center justify-center font-bold text-[10px] transition-colors"
                  >×</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-300 font-medium ml-2 italic tracking-tight">{placeholder}</p>
            )}
          </div>
        )}
        <span className="text-slate-300 text-[10px] pr-2">▼</span>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 z-[150] bg-white border border-slate-100 rounded-3xl shadow-2xl p-3 animate-in zoom-in-95 duration-200 origin-top overflow-hidden">
          <div className="relative mb-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input 
              autoFocus
              placeholder="Tìm kiếm nhanh..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl text-[11px] font-bold outline-none border border-transparent focus:border-indigo-100 transition-all uppercase tracking-wider" 
            />
          </div>
          <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-1.5 px-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => {
                const isSelected = selectedValues.includes(u.id);
                return (
                  <button 
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-slate-50 group text-left ${isSelected ? 'bg-indigo-50/50' : ''}`}
                  >
                    {multiple && (
                      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-400'}`}>
                        {isSelected && <span className="text-white text-[8px] font-bold">✓</span>}
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {u.image_avatar ? (
                        <img src={u.image_avatar} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {u.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase leading-none mt-0.5">{u.role}</p>
                    </div>
                    {!multiple && isSelected && (
                      <span className="text-indigo-600 text-xs pr-2 font-bold">✓</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Không tìm thấy nhân sự</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
