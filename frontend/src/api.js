import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import api from './api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import MenuPage from './pages/MenuPage';
import MaterialsPage from './pages/MaterialsPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('lan_pos_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('lan_pos_user') || 'null'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
        localStorage.setItem('lan_pos_user', JSON.stringify(data));
      } catch (error) {
        localStorage.removeItem('lan_pos_token');
        localStorage.removeItem('lan_pos_user');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const handleLogin = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('lan_pos_token', data.token);
    localStorage.setItem('lan_pos_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('lan_pos_token');
    localStorage.removeItem('lan_pos_user');
    setToken('');
    setUser(null);
  };

  const authState = useMemo(() => ({ token, user, handleLogin, handleLogout }), [token, user]);

  if (loading) {
    return <div className="app-loading">Loading app...</div>;
  }

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage user={user} onLogout={handleLogout} />} />
      <Route path="/pos" element={<POSPage user={user} onLogout={handleLogout} />} />
      <Route path="/menu" element={<MenuPage user={user} onLogout={handleLogout} />} />
      <Route path="/materials" element={<MaterialsPage user={user} onLogout={handleLogout} />} />
      <Route path="/orders" element={<OrdersPage user={user} onLogout={handleLogout} />} />
      <Route path="/reports" element={<ReportsPage user={user} onLogout={handleLogout} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
