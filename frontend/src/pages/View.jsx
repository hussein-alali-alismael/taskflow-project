import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './View.css';

function View() {
  const [memberName, setMemberName] = useState('');
  const [teamTasks, setTeamTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('member_username');
    const name = localStorage.getItem('member_name');
    if (!username) {
      navigate('/login');
      return;
    }
    setMemberName(name || username);
    fetchUserTasks();
  }, [navigate]);

  const fetchUserTasks = async () => {
    try {
      const response = await axios.get('/view/', {
        withCredentials: true
      });
      setTeamTasks(response.data.team_tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error loading tasks' }]);
    }
  };

  const handleMarkDone = async (taskId) => {
    if (!window.confirm('Mark this task as complete?')) return;

    try {
      await axios.post(`/mark-task-complete/${taskId}/`, {}, {
        withCredentials: true
      });
      setMessages([{ type: 'success', text: 'Task marked as complete!' }]);
      fetchUserTasks();
    } catch (err) {
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error updating task' }]);
    }
  };

  return (
    <div>
      <header className="page-header py-3 header">
        <div className="container d-flex align-items-center">
          <div className="header-brand d-flex align-items-center">
            {/* <h2 className="logo ms-2">Infinity Syntax</h2>  */}
          </div>
        </div>
      </header>

      <div className="container-fluid dashboard-wrapper py-4">
      {messages.map((msg, idx) => (
        <div key={idx} className={`alert alert-${msg.type} alert-dismissible fade show`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMessages(messages.filter((_, i) => i !== idx))}></button>
        </div>
      ))}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Your Tasks, {memberName}</h3>
      </div>

      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Task</th>
                <th>Team</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {teamTasks.length > 0 ? (
                teamTasks.map((task, idx) => (
                  <tr key={task.id}>
                    <td>{idx + 1}</td>
                    <td>{task.task_name}</td>
                    <td>{task.team_name}</td>
                    <td>{task.start_date}</td>
                    <td>{task.end_date}</td>
                    <td>
                      <span className={`badge ${task.is_finish ? 'bg-success' : 'bg-warning'} task-badge`}>
                        {task.is_finish ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td>
                      {/* <button className="btn btn-sm btn-primary">View</button>  */}
                      <button 
                        className="btn btn-sm btn-secondary ms-1"
                        onClick={() => handleMarkDone(task.id)}
                        disabled={task.is_finish}
                      >
                        {task.is_finish ? 'Done' : 'Mark Done'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">You have no tasks assigned currently.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-4">
        <div className="footer-row">
          <div className="footer-col">
            <h3 className="footer-title">CONTACT US</h3>
            <p className="footer-text">infinitysyntax@gmail.com</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default View;
