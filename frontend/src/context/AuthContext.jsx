import React, { createContext, useState, useCallback } from 'react';
import axios from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login user
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure CSRF cookie is set (Django will set csrftoken cookie)
      await axios.get('/csrf-token/');

      const params = new URLSearchParams({ username, password });
      const response = await axios.post('/login/', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = response.data;
      
      setUser(data.member_username || data.member_name);
      if (data.member_name) localStorage.setItem('member_name', data.member_name);
      if (data.member_username) localStorage.setItem('member_username', data.member_username);
      setIsAdmin(data.is_admin);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register new user
  const register = useCallback(async (username, name, gmail, password, teamName) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure CSRF cookie is set
      await axios.get('/csrf-token/');

      const params = new URLSearchParams({ username, name, gmail, password, team_name: teamName });
      const response = await axios.post('/register/', params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = response.data;
      setUser(data.member_username || data.member_name);
      if (data.member_name) localStorage.setItem('member_name', data.member_name);
      if (data.member_username) localStorage.setItem('member_username', data.member_username);
      setIsAdmin(data.is_admin);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    setUser(null);
    setIsAdmin(false);
    setError(null);
  }, []);

  // Check if user is logged in
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
