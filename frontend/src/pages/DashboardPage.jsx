import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function DashboardPage({ user, onLogout }) {
  const [summary, setSummary] = useState({ orderCount: 0, revenue: 0, materialCount: 0, itemCount: 0, tableCount: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [reportRes, orderRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/orders')
        ]);

        setSummary({
          orderCount: Number(reportRes.data?.orderCount || 0),
          revenue: Number(reportRes.data?.revenue || 0),
          materialCount: Number(reportRes.data?.materialCount || 0),
          itemCount: Number(reportRes.data?.itemCount || 0),
          tableCount: Number(reportRes.data?.tableCount || 0),
        });

        setRecentOrders((orderRes.data || []).slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard', error);
      }
    };

    load();
  }, []);

  return (
    <div className="page-shell">
      <aside className="sidebar">
        <h2>LAN POS</h2>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/pos">POS</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/materials">Materials</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>Welcome, {user.full_name || user.username}</h1>
            <p>{user.role} • {user.store_name || user.store_id}</p>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Orders</span>
            <strong>{summary.orderCount}</strong>
          </div>
          <div className="stat-card">
            <span>Revenue</span>
            <strong>{summary.revenue.toLocaleString()} VND</strong>
          </div>
          <div className="stat-card">
            <span>Materials</span>
            <strong>{summary.materialCount}</strong>
          </div>
          <div className="stat-card">
            <span>Tables</span>
            <strong>{summary.tableCount}</strong>
          </div>
        </section>

        <section className="card">
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="3">No orders yet.</td>
                </tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.status}</td>
                  <td>{Number(order.total || 0).toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
