import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { TaskContext } from '../context/TaskContext';
import { TeamContext } from '../context/TeamContext';

/**
 * Custom hook to use Auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Custom hook to use Task context
 * Usage: const { tasks, addTask, markTaskComplete } = useTasks();
 */
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
}

/**
 * Custom hook to use Team context
 * Usage: const { members, addMember, deleteMember } = useTeam();
 */
export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}
