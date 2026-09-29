import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MenuPage({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category_id: '', item_code: '', item_name: '', base_price: '', description: '' });

  const load = async () => {
    const { data } = await api.get('/stores');
    setCategories(data.categories || []);
    setItems(data.items || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/stores/items', {
      ...form,
      category_id: Number(form.category_id),
      base_price: Number(form.base_price),
    });
    setForm({ category_id: '', item_code: '', item_name: '', base_price: '', description: '' });
    load();
  };

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
            <h1>Menu Management</h1>
            <p>Maintain menu items and categories</p>
          </div>
        </header>

        <div className="two-col">
          <section className="card">
            <h3>Add Item</h3>
            <form className="stack-form" onSubmit={submit}>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.category_name}</option>)}
              </select>
              <input placeholder="Item code" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} />
              <input placeholder="Item name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
              <input type="number" placeholder="Price" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button className="primary-button" type="submit">Add item</button>
            </form>
          </section>

          <section className="card">
            <h3>Menu Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.item_code}</td>
                    <td>{item.item_name}</td>
                    <td>{Number(item.base_price).toLocaleString()} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
