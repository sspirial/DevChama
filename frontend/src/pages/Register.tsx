import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (!username.trim() || !email.trim()) {
      setError('Username and email are required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await register({ username, email, password, password_confirm: passwordConfirm, first_name: firstName, last_name: lastName });
      navigate('/login');
    } catch (err) {
      setError('Registration failed.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
        <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></label>
        <label>Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label>Confirm password<input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} /></label>
        <button type="submit">Create account</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
};

export default Register;
