import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { AuthContext } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Provide username and password');
      return;
    }
    try {
      const user = await login(username, password);
      auth?.setUser(user);
      navigate('/');
    } catch (err) {
      setError('Login failed. Check credentials and try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Login</button>
        {error && <div className="alert alert-error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
