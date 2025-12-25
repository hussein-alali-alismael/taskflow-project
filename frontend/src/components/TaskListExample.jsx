import React, { useEffect } from 'react';
import { useTasks } from '../hooks/useContextHooks';

/**
 * Example Task List Component
 * Shows how to use the useTasks hook to display and manage tasks
 */
export function TaskListExample() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    markTaskComplete,
  } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleMarkComplete = async (taskId) => {
    try {
      await markTaskComplete(taskId);
    } catch (err) {
      console.error('Failed to mark task complete:', err);
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks assigned</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.task_name}</strong>
              <p>Team: {task.team_name}</p>
              <p>Due: {task.end_date}</p>
              <p>Status: {task.is_finish ? '✅ Completed' : '⏳ In Progress'}</p>
              {!task.is_finish && (
                <button onClick={() => handleMarkComplete(task.id)}>
                  Mark Complete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
