import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ReportsPage({ user, onLogout }) {
  const [summary, setSummary] = useState({ orderCount: 0, revenue: 0, materialCount: 0, itemCount: 0, tableCount: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/reports/summary');
        setSummary({
          orderCount: Number(data?.orderCount || 0),
          revenue: Number(data?.revenue || 0),
          materialCount: Number(data?.materialCount || 0),
          itemCount: Number(data?.itemCount || 0),
          tableCount: Number(data?.tableCount || 0),
        });
      } catch (error) {
        console.error('Failed to load report summary', error);
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
            <h1>Reports</h1>
            <p>Restaurant performance overview</p>
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
            <span>Menu Items</span>
            <strong>{summary.itemCount}</strong>
          </div>
          <div className="stat-card">
            <span>Tables</span>
            <strong>{summary.tableCount}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}
