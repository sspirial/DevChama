import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { getStoredUser } from './api/auth';
import NavBar from './components/NavBar';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ChamaList from './pages/ChamaList.tsx';
import ChamaDetail from './pages/ChamaDetail.tsx';
import CreateChama from './pages/CreateChama.tsx';
import Profile from './pages/Profile.tsx';
import Rewards from './pages/Rewards.tsx';
import './App.css';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = React.useContext(AuthContext);
  if (!auth || !auth.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    // keep in sync with localStorage if user updates from other tabs
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const authValue = useMemo(() => ({ user, setUser, logout: () => { setUser(null); localStorage.removeItem('user'); window.location.href = '/login'; } }), [user]);

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <NavBar />
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chamas" element={<RequireAuth><ChamaList /></RequireAuth>} />
            <Route path="/chamas/new" element={<RequireAuth><CreateChama /></RequireAuth>} />
            <Route path="/chamas/:id" element={<RequireAuth><ChamaDetail /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/rewards" element={<RequireAuth><Rewards /></RequireAuth>} />
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App
