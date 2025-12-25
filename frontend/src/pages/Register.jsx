import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    gmail: '',
    password: '',
    team_name: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.username || !formData.name || !formData.gmail || !formData.password || !formData.team_name) {
      setError('All fields are required');
      return;
    }

    try {
      const payload = new URLSearchParams(Object.entries(formData));
      const response = await axios.post('/register/', payload, {
        withCredentials: true
      });

      setMessage('Registration successful! Redirecting to dashboard...');
      
      setTimeout(() => {
        localStorage.setItem('member_username', formData.username);
        localStorage.setItem('member_name', formData.name);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>Create your account</h1>
          <p>Join your team and start managing tasks.</p>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gmail">Email</label>
            <input
              type="email"
              id="gmail"
              name="gmail"
              placeholder="Enter your email"
              value={formData.gmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="team_name">Team Name</label>
            <input
              type="text"
              id="team_name"
              name="team_name"
              placeholder="Enter team name"
              value={formData.team_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <button className="btn-register" type="submit">Register</button>
          </div>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? 
      <br />
            <Link to="/login">Login here</Link>
            
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
