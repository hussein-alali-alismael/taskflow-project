import React, { createContext, useState, useCallback } from 'react';

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks (for dashboard)
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/dashboard/');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
      setTasks(data.team_tasks || []);
      return data.team_tasks;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch member's tasks (personal view)
  const fetchMemberTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/view/');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
      setTasks(data.team_tasks || []);
      return data.team_tasks;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new task (admin only)
  const addTask = useCallback(async (taskName, teamMemberId, startDate, endDate) => {
    setError(null);
    try {
      const response = await fetch('/add-task/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          task_name: taskName,
          team_member_id: teamMemberId,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add task');
      }
      await fetchTasks(); // Refresh task list
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTasks]);

  // Edit task (admin only)
  const editTask = useCallback(async (taskId, taskName, teamMemberId, startDate, endDate) => {
    setError(null);
    try {
      const response = await fetch(`/edit-task/${taskId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          task_name: taskName,
          team_member_id: teamMemberId,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to edit task');
      }
      await fetchTasks(); // Refresh task list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTasks]);

  // Delete task (admin only)
  const deleteTask = useCallback(async (taskId) => {
    setError(null);
    try {
      const response = await fetch(`/delete-task/${taskId}/`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete task');
      }
      await fetchTasks(); // Refresh task list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTasks]);

  // Mark task as complete
  const markTaskComplete = useCallback(async (taskId) => {
    setError(null);
    try {
      const response = await fetch(`/mark-task-complete/${taskId}/`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark task complete');
      }
      // Update local task state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, is_finish: true } : task
        )
      );
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        fetchMemberTasks,
        addTask,
        editTask,
        deleteTask,
        markTaskComplete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
