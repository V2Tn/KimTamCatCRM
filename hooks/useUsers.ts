
import { useState, useEffect } from 'react';
import { User, Department } from '../types';
import { MOCK_USERS, DEPARTMENTS } from '../constants';
import { postSyncAction } from '../services/syncService';

export const useUsers = (writeUrl?: string, currentUserId?: string) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('synced_users');
    const data = saved ? JSON.parse(saved) : MOCK_USERS;
    // Đảm bảo dữ liệu cũ tương thích với isOnline mới (1: Online, 2: Offline)
    return data.map((u: any) => ({
      ...u,
      isOnline: typeof u.isOnline === 'boolean' ? (u.isOnline ? 1 : 2) : (u.isOnline || 2)
    }));
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('synced_departments');
    return saved ? JSON.parse(saved) : DEPARTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('synced_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('synced_departments', JSON.stringify(departments));
  }, [departments]);

  const getNextNumericId = (list: { id: string }[]) => {
    const numericIds = list
      .map(item => {
        const parsed = parseInt(item.id.toString().replace(/\D/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
      });
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return (maxId + 1).toString();
  };

  const addUser = (u: Partial<User>) => {
    const newId = getNextNumericId(users);
    const now = new Date().toISOString();
    const newUser = { 
      ...u, 
      id: newId,
      isOnline: 2, // Mặc định offline khi tạo mới
      createdAt: now,
      createdBy: currentUserId || 'system'
    } as User;
    setUsers(prev => [...prev, newUser]);
    if (writeUrl) postSyncAction(writeUrl, 'CREATE_USER', newUser);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;
    
    const now = new Date().toISOString();
    const updatedUser = { 
      ...userToUpdate, 
      ...data,
      updatedAt: now,
      updatedBy: currentUserId || 'system'
    };
    setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    if (writeUrl) postSyncAction(writeUrl, 'UPDATE_USER', updatedUser);
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;
    
    const now = new Date().toISOString();
    const deletedUser = {
      ...userToDelete,
      deletedAt: now,
      deletedBy: currentUserId || 'system'
    };
    if (writeUrl) postSyncAction(writeUrl, 'DELETE_USER', { id, deletedAt: now, deletedBy: currentUserId });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addDepartment = (name: string) => {
    const newId = getNextNumericId(departments);
    const now = new Date().toISOString();
    const newDept = { 
      id: newId, 
      name,
      createdAt: now,
      createdBy: currentUserId || 'system'
    };
    setDepartments(prev => [...prev, newDept]);
    if (writeUrl) postSyncAction(writeUrl, 'CREATE_DEPT', newDept);
  };

  const updateDepartment = (id: string, name: string) => {
    const now = new Date().toISOString();
    const updatedDept = { 
      id, 
      name,
      updatedAt: now,
      updatedBy: currentUserId || 'system'
    };
    setDepartments(prev => prev.map(d => d.id === id ? updatedDept : d));
    if (writeUrl) postSyncAction(writeUrl, 'UPDATE_DEPT', updatedDept);
  };

  const deleteDepartment = (id: string) => {
    const now = new Date().toISOString();
    if (writeUrl) postSyncAction(writeUrl, 'DELETE_DEPT', { id, deletedBy: currentUserId, deletedAt: now });
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  return { 
    users, 
    departments, 
    setUsers, 
    addUser, 
    updateUser, 
    deleteUser,
    addDepartment,
    updateDepartment,
    deleteDepartment
  };
};
