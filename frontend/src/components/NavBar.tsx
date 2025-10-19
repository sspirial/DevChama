import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const NavBar: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #eee' }}>
      <div>
        <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>DevChama</Link>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/chamas">Chamas</Link>
            <Link to="/">Dashboard</Link>
            <Link to="/rewards">Rewards</Link>
            <Link to="/profile">Profile</Link>
            <span style={{ marginLeft: 8 }}>{user.username}</span>
            <button onClick={() => auth?.logout()} style={{ marginLeft: 8 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
