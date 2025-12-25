import React, { useEffect, useState } from 'react';
import { useTeam } from '../hooks/useContextHooks';

/**
 * Example Add Member Component
 * Shows how to use the useTeam hook to add team members (admin only)
 */
export function AddMemberExample() {
  const { addMember, loading, error } = useTeam();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    gmail: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMember(
        formData.username,
        formData.name,
        formData.gmail,
        formData.password
      );
      // Reset form
      setFormData({ username: '', name: '', gmail: '', password: '' });
      alert('Member added successfully!');
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Team Member</h3>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="gmail"
        placeholder="Email"
        value={formData.gmail}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Member'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
