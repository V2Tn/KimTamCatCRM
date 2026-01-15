
import { useState, useEffect } from 'react';
import { User, Department } from '../types';
import { MOCK_USERS, DEPARTMENTS } from '../constants';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('synced_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
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

  const addUser = (u: Partial<User>) => {
    setUsers(prev => [...prev, { ...u, id: Date.now().toString() } as User]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addDepartment = (name: string) => {
    setDepartments(prev => [...prev, { id: Date.now().toString(), name }]);
  };

  const updateDepartment = (id: string, name: string) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const deleteDepartment = (id: string) => {
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
