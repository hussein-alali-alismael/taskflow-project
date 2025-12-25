import React, { createContext, useState, useCallback } from 'react';

export const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all team members (admin dashboard)
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/dashboard/');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch members');
      }
      setMembers(data.team_members || []);
      return data.team_members;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new member (admin only)
  const addMember = useCallback(async (username, name, gmail, password) => {
    setError(null);
    try {
      const response = await fetch('/add-member/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, name, gmail, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }
      await fetchMembers(); // Refresh member list
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchMembers]);

  // Edit member details (admin only)
  const editMember = useCallback(async (memberId, newName, newUsername, newEmail, newPassword) => {
    setError(null);
    try {
      const response = await fetch(`/edit-member/${memberId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          member_name: newName,
          member_username: newUsername,
          member_email: newEmail,
          member_password: newPassword,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to edit member');
      }
      await fetchMembers(); // Refresh member list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchMembers]);

  // Delete member (admin only)
  const deleteMember = useCallback(async (memberId) => {
    setError(null);
    try {
      const response = await fetch(`/delete-member/${memberId}/`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete member');
      }
      await fetchMembers(); // Refresh member list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchMembers]);

  return (
    <TeamContext.Provider
      value={{
        members,
        loading,
        error,
        fetchMembers,
        addMember,
        editMember,
        deleteMember,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
