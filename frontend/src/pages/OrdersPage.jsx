import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MaterialsPage({ user, onLogout }) {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ material_code: '', material_name: '', unit: 'kg', unit_price: '', current_quantity: '' });

  const load = async () => {
    const { data } = await api.get('/materials');
    setMaterials(data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/materials', { ...form, unit_price: Number(form.unit_price), current_quantity: Number(form.current_quantity) });
    setForm({ material_code: '', material_name: '', unit: 'kg', unit_price: '', current_quantity: '' });
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
            <h1>Inventory</h1>
            <p>Manage raw materials and stock</p>
          </div>
        </header>

        <div className="two-col">
          <section className="card">
            <h3>Add Material</h3>
            <form className="stack-form" onSubmit={submit}>
              <input placeholder="Material code" value={form.material_code} onChange={(e) => setForm({ ...form, material_code: e.target.value })} />
              <input placeholder="Material name" value={form.material_name} onChange={(e) => setForm({ ...form, material_name: e.target.value })} />
              <input placeholder="Unit (kg, g, ml, can...)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <input type="number" placeholder="Current quantity" value={form.current_quantity} onChange={(e) => setForm({ ...form, current_quantity: e.target.value })} />
              <input type="number" placeholder="Unit price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
              <button className="primary-button" type="submit">Add material</button>
            </form>
          </section>

          <section className="card">
            <h3>Material List</h3>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((item) => (
                  <tr key={item.id}>
                    <td>{item.material_code}</td>
                    <td>{item.material_name}</td>
                    <td>{item.current_quantity}</td>
                    <td>{item.unit}</td>
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
