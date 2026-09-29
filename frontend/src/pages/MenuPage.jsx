import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MenuPage({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    category_id: '',
    item_code: '',
    item_name: '',
    base_price: '',
    description: '',
  });

  const loadMenu = async () => {
    try {
      const { data } = await api.get('/stores');
      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load menu', error);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/stores/items', {
        category_id: Number(form.category_id),
        item_code: form.item_code,
        item_name: form.item_name,
        base_price: Number(form.base_price || 0),
        description: form.description,
      });

      setForm({
        category_id: '',
        item_code: '',
        item_name: '',
        base_price: '',
        description: '',
      });
      loadMenu();
    } catch (error) {
      console.error('Could not create menu item', error);
    }
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
            <p>Create and maintain menu items</p>
          </div>
        </header>

        <div className="two-col">
          <section className="card">
            <h3>Add item</h3>
            <form className="stack-form" onSubmit={submit}>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>

              <input placeholder="Item code" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} />
              <input placeholder="Item name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
              <input type="number" placeholder="Price" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button type="submit" className="primary-button">Add item</button>
            </form>
          </section>

          <section className="card">
            <h3>Current menu</h3>
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
                    <td>{Number(item.base_price || 0).toLocaleString()} VND</td>
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
