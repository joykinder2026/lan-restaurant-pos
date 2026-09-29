import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MaterialsPage({ user, onLogout }) {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    material_code: '',
    material_name: '',
    unit: 'kg',
    current_quantity: '',
    unit_price: '',
  });

  const loadMaterials = async () => {
    try {
      const { data } = await api.get('/materials');
      setMaterials(data || []);
    } catch (error) {
      console.error('Failed to load materials', error);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/materials', {
        material_code: form.material_code,
        material_name: form.material_name,
        unit: form.unit,
        current_quantity: Number(form.current_quantity || 0),
        unit_price: Number(form.unit_price || 0),
      });

      setForm({ material_code: '', material_name: '', unit: 'kg', current_quantity: '', unit_price: '' });
      loadMaterials();
    } catch (error) {
      console.error('Could not create material', error);
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
            <h1>Inventory</h1>
            <p>Materials and stock tracking</p>
          </div>
        </header>

        <div className="two-col">
          <section className="card">
            <h3>Add material</h3>
            <form className="stack-form" onSubmit={submit}>
              <input placeholder="Material code" value={form.material_code} onChange={(e) => setForm({ ...form, material_code: e.target.value })} />
              <input placeholder="Material name" value={form.material_name} onChange={(e) => setForm({ ...form, material_name: e.target.value })} />
              <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              <input type="number" placeholder="Current quantity" value={form.current_quantity} onChange={(e) => setForm({ ...form, current_quantity: e.target.value })} />
              <input type="number" placeholder="Unit price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
              <button type="submit" className="primary-button">Add material</button>
            </form>
          </section>

          <section className="card">
            <h3>Material list</h3>
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
                    <td>{Number(item.current_quantity || 0)}</td>
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
