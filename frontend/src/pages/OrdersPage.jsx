import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function OrdersPage({ user, onLogout }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data || []);
      } catch (error) {
        console.error('Failed to load orders', error);
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
            <h1>Orders</h1>
            <p>Track all orders in the restaurant</p>
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="4">No orders yet.</td>
                </tr>
              ) : orders.map((order) => (
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
