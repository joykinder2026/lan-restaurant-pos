import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function OrdersPage({ user, onLogout }) {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  useEffect(() => { load(); }, []);

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
            <h1>Orders</h1>
            <p>View and track all orders</p>
          </div>
        </header>

        <section className="card">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.status}</td>
                  <td>{Number(order.total || 0).toLocaleString()} VND</td>
                  <td>{(order.items || []).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
