import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      // Ensure CSRF token is available (fetch token which also sets cookie)
      try {
        const csrfResp = await axios.get('/csrf-token/', { withCredentials: true });
         axios.defaults.headers.common['X-CSRFToken'] = csrfResp.data.csrf_token;
      } catch (cErr) {
        // continue, server may already have set CSRF cookie
        console.warn('Failed to fetch CSRF token before login', cErr);
      }

      const payload = new URLSearchParams({ username, password });
      const response = await axios.post('/login/', payload, { withCredentials: true });

      if (response.data.member_username) localStorage.setItem('member_username', response.data.member_username);
      if (response.data.member_name) localStorage.setItem('member_name', response.data.member_name);
      setMessage(`Welcome ${response.data.member_name || response.data.member_username}!`);

      // Redirect based on is_admin
      setTimeout(() => {
        if (response.data.is_admin) {
          navigate('/dashboard');
        } else {
          navigate('/view');
        }
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Your Tasks are our trust!</h1>
            <p>Welcome to organize your team.</p>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <button className="btn-login" type="submit">{message ? 'Redirecting...' : 'Login'}</button>
            </div>

            <div className="login-footer">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </form>
        </div>
      </div>
{/* 
      <footer>
        <div className="footer-row">
          <div className="footer-col">
            <h3 className="footer-title">FOLLOW US</h3>
            <a href="#" className="footer-text">Facebook</a>
            <a href="#" className="footer-text">Instagram</a>
            <a href="#" className="footer-text">Twitter</a>
            <a href="#" className="footer-text">Pinterest</a>
          </div>
        </div>
        <div className="copyright">
          Copyright &copy; 2025 <span className="copyright-name">Infinity Syntax</span> All rights Reserved.
        </div>
      </footer> */}
    </div>
  );
}

export default Login;