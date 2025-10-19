import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { updateProfile } from '../api/auth';

const Profile: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateProfile({ first_name: firstName, last_name: lastName });
      auth?.setUser(updated);
      setMessage('Profile updated');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
        <label>Username<input value={user?.username ?? ''} disabled /></label>
        <label>Email<input value={user?.email ?? ''} disabled /></label>
        <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
        <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
        <button type="submit" disabled={saving}>Save</button>
      </form>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  );
};

export default Profile;
