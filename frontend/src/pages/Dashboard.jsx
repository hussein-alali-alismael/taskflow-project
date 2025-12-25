import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const [memberName, setMemberName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // prefer username for auth check; keep display name for UI
    const username = localStorage.getItem('member_username');
    const name = localStorage.getItem('member_name');
    if (!username) {
      navigate('/login');
      return;
    }
    setMemberName(name || username);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard/', {
        withCredentials: true
      });
      setTeamMembers(response.data.team_members || []);
      setTeamTasks(response.data.team_tasks || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error loading dashboard' }]);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(new FormData(e.target));
    
    try {
      await axios.post('/add-member/', formData, {
        withCredentials: true
      });
      setMessages([{ type: 'success', text: 'Team member added successfully!' }]);
      setShowAddMember(false);
      fetchDashboardData();
      e.target.reset();
    } catch (err) {
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error adding member' }]);
    }
  };
  const handleEditMember = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(new FormData(e.target));
    const memberId = editingMember.id;
    
    try {
      await axios.post(`/edit-member/${memberId}/`, formData, {
        withCredentials: true
      });
      setMessages([{ type: 'success', text: 'Team member updated successfully!' }]);
      setEditingMember(null);
      fetchDashboardData();
      e.target.reset();
    } catch (err) {
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error updating member' }]);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await axios.post(`/delete-member/${memberId}/`, {}, {
          withCredentials: true
        });
        setMessages([{ type: 'success', text: 'Team member removed successfully!' }]);
        fetchDashboardData();
      } catch (err) {
        setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error removing member' }]);
      }
    }
  };
  const handleAddTask = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(new FormData(e.target));
    
    try {
      await axios.post('/add-task/', formData, {
        withCredentials: true
      });
      setMessages([{ type: 'success', text: 'Task added successfully!' }]);
      setShowAddTask(false);
      fetchDashboardData();
      e.target.reset();
    } catch (err) {
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error adding task' }]);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams(new FormData(e.target));
    const taskId = editingTask.id;
    
    try {
      await axios.post(`/edit-task/${taskId}/`, formData, {
        withCredentials: true
      });
      setMessages([{ type: 'success', text: 'Task updated successfully!' }]);
      setEditingTask(null);
      fetchDashboardData();
      e.target.reset();
    } catch (err) {
      setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error updating task' }]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.post(`/delete-task/${taskId}/`, {}, {
          withCredentials: true
        });
        setMessages([{ type: 'success', text: 'Task deleted successfully!' }]);
        fetchDashboardData();
      } catch (err) {
        setMessages([{ type: 'danger', text: err.response?.data?.error || 'Error deleting task' }]);
      }
    }
  };
  const editAssignedId = editingTask
    ? (teamMembers.find(tm => tm.name === editingTask.assigned_to)?.id || '')
    : '';
  return (
    <div>
      <header className="page-header py-3">
        <div className="container d-flex align-items-center">
          <div className="header-brand d-flex align-items-center">
            {/* <h2 className="logo ms-2">Infinity Syntax</h2>  */}
          </div>
        </div>
      </header>

      <div className="container-fluid dashboard-wrapper py-5">
      {messages.map((msg, idx) => (
        <div key={idx} className={`alert alert-${msg.type} alert-dismissible fade show`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMessages(messages.filter((_, i) => i !== idx))}></button>
        </div>
      ))}

      <h2 className="text-center mb-5 texth">Team & Tasks Management</h2>

      <div className="alert alert-info mb-4">
        <h5>Welcome, {memberName}! </h5>
        <p>Manage your team members and tasks here.</p>
      </div>

      {/* Team Members Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h5 style={{ textAlign: 'center' }}>Team Members</h5>
            </div>
            <div className="card-body">
              <button className="btn btn-success mb-3" onClick={() => setShowAddMember(true)}>
                Add Team Member
              </button>

              {showAddMember && (
                <div className="card mb-3">
                  <div className="card-body">
                    <form onSubmit={handleAddMember}>
                      <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input type="text" name="username" className="form-control" required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-control" required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input type="email" name="gmail" className="form-control" required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" required />
                      </div>
                      <button type="submit" className="btn btn-primary">Add Member</button>
                      <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowAddMember(false)}>Cancel</button>
                    </form>
                  </div>
                </div>
              )}

              {editingMember && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h5>Edit Team Member</h5>
                    <form onSubmit={handleEditMember}>
                      <div className="mb-2">
                        <label className="form-label">Name</label>
                        <input type="text" name="member_name" className="form-control" defaultValue={editingMember.name} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input type="text" name="member_username" className="form-control" defaultValue={editingMember.username} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input type="email" name="member_email" className="form-control" defaultValue={editingMember.gmail} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Password</label>
                        <input type="password" name="member_password" className="form-control" defaultValue={editingMember.password} required />
                      </div>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                      <button type="button" className="btn btn-secondary ms-2" onClick={() => setEditingMember(null)}>Cancel</button>
                    </form>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th style={{ minWidth: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.length > 0 ? (
                      teamMembers.map(member => (
                        <tr key={member.id}>
                          <td>{member.name}</td>
                          <td>{member.username}</td>
                          <td>{member.gmail}</td>
                          <td>
                            <span className={`badge ${member.is_admin ? 'bg-danger' : 'bg-secondary'}`}>
                              {member.is_admin ? 'Admin' : 'Member'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditingMember(member)}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMember(member.id)}>Remove</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">No team members yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-lg">
            <div className="card-header bg-info text-white">
              <h5 style={{ textAlign: 'center' }}>Tasks</h5>
            </div>
            <div className="card-body">
              <button className="btn btn-success mb-3" onClick={() => setShowAddTask(true)}>
                Add Task
              </button>

              {showAddTask && (
                <div className="card mb-3">
                  <div className="card-body">
                    <form onSubmit={handleAddTask}>
                      <div className="mb-2">
                        <label className="form-label">Task Name</label>
                        <input type="text" name="task_name" className="form-control" required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Assign To</label>
                        <select name="team_member_id" className="form-select" required>
                          <option value="">Select member</option>
                          {teamMembers.filter(tm => !tm.is_admin).map(tm => (
                            <option key={tm.id} value={tm.id}>
                              {tm.name} ({tm.username})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Start Date</label>
                        <input type="date" name="start_date" className="form-control" required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">End Date</label>
                        <input type="date" name="end_date" className="form-control" required />
                      </div>
                      <button type="submit" className="btn btn-primary">Add Task</button>
                      <button type="button" className="btn btn-secondary ms-2" onClick={() => setShowAddTask(false)}>Cancel</button>
                    </form>
                  </div>
                </div>
              )}

              {editingTask && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h5>Edit Task</h5>
                    <form onSubmit={handleEditTask}>
                      <div className="mb-2">
                        <label className="form-label">Task Name</label>
                        <input type="text" name="task_name" className="form-control" defaultValue={editingTask.task_name} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Assign To</label>
                        <select name="team_member_id" className="form-select" required>
                          {teamMembers.filter(tm => !tm.is_admin).map(tm => (
                            <option key={tm.id} value={tm.id}>
                              {tm.name} ({tm.username})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Start Date</label>
                        <input type="date" name="start_date" className="form-control" defaultValue={editingTask.start_date} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">End Date</label>
                        <input type="date" name="end_date" className="form-control" defaultValue={editingTask.end_date} required />
                      </div>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                      <button type="button" className="btn btn-secondary ms-2" onClick={() => setEditingTask(null)}>Cancel</button>
                    </form>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Assigned To</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Status</th>
                      <th style={{ minWidth: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamTasks.length > 0 ? (
                      teamTasks.map(task => (
                        <tr key={task.id}>
                          <td>{task.task_name}</td>
                          <td>{task.assigned_to}</td>
                          <td>{task.start_date}</td>
                          <td>{task.end_date}</td>
                          <td>
                            <span className={`badge ${task.is_finish ? 'bg-success' : 'bg-warning'}`}>
                              {task.is_finish ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditingTask(task)}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">No tasks assigned yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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

export default Dashboard;
