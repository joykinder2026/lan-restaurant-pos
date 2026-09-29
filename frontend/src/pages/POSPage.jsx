import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function DashboardPage({ user, onLogout }) {
  const [stats, setStats] = useState({ orders: 0, tables: 0, materials: 0, items: 0 });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, tablesRes, matsRes, menuRes] = await Promise.all([
        api.get('/orders'),
        api.get('/tables'),
        api.get('/materials'),
        api.get('/stores'),
      ]);

      const menuItems = menuRes.data?.items || [];
      setStats({
        orders: ordersRes.data.length,
        tables: tablesRes.data.length,
        materials: matsRes.data.length,
        items: menuItems.length,
      });
      setOrders(ordersRes.data.slice(0, 5));
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
            <p>{user.role} • {user.store_name}</p>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Orders</span>
            <strong>{stats.orders}</strong>
          </div>
          <div className="stat-card">
            <span>Tables</span>
            <strong>{stats.tables}</strong>
          </div>
          <div className="stat-card">
            <span>Materials</span>
            <strong>{stats.materials}</strong>
          </div>
          <div className="stat-card">
            <span>Menu Items</span>
            <strong>{stats.items}</strong>
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
              {orders.length === 0 ? (
                <tr><td colSpan="3">No orders yet.</td></tr>
              ) : orders.map((order) => (
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
