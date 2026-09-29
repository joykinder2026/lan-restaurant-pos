import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function POSPage({ user, onLogout }) {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tablesRes, menuRes] = await Promise.all([
          api.get('/tables'),
          api.get('/stores')
        ]);

        const items = menuRes.data?.items || [];
        setTables(tablesRes.data || []);
        setMenuItems(items);

        if ((tablesRes.data || [])[0]) {
          setSelectedTable(String((tablesRes.data || [])[0].id));
        }
      } catch (error) {
        console.error('Failed to load POS data', error);
      }
    };

    load();
  }, []);

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((row) => row.menu_item_id === item.id);
      if (existing) {
        return current.map((row) =>
          row.menu_item_id === item.id
            ? { ...row, quantity: row.quantity + 1 }
            : row
        );
      }

      return [
        ...current,
        {
          menu_item_id: item.id,
          item_name: item.item_name,
          quantity: 1,
          unit_price: Number(item.base_price || 0),
        },
      ];
    });
  };

  const updateQty = (menuItemId, delta) => {
    setCart((current) =>
      current
        .map((row) =>
          row.menu_item_id === menuItemId
            ? { ...row, quantity: Math.max(0, row.quantity + delta) }
            : row
        )
        .filter((row) => row.quantity > 0)
    );
  };

  const total = cart.reduce((sum, row) => sum + row.quantity * row.unit_price, 0);

  const submitOrder = async () => {
    if (!selectedTable || cart.length === 0) {
      setMessage('Please select a table and add at least one item.');
      return;
    }

    try {
      await api.post('/orders', {
        table_id: Number(selectedTable),
        notes: 'Created from POS',
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      });

      setMessage('Order created successfully.');
      setCart([]);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to create order.');
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
            <h1>Point of Sale</h1>
            <p>{user.full_name || user.username}</p>
          </div>
        </header>

        <div className="pos-layout">
          <section className="card pos-menu">
            <h3>Menu</h3>

            <div className="select-wrap">
              <label>Table</label>
              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>{table.table_name}</option>
                ))}
              </select>
            </div>

            <div className="menu-grid">
              {menuItems.map((item) => (
                <button key={item.id} className="menu-item" onClick={() => addToCart(item)}>
                  <strong>{item.item_name}</strong>
                  <span>{Number(item.base_price || 0).toLocaleString()} VND</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card cart-panel">
            <h3>Current Order</h3>

            {cart.length === 0 ? (
              <p>No items selected.</p>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div key={item.menu_item_id} className="cart-row">
                    <span>{item.item_name}</span>
                    <div className="qty-controls">
                      <button type="button" onClick={() => updateQty(item.menu_item_id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.menu_item_id, 1)}>+</button>
                    </div>
                    <strong>{(item.quantity * item.unit_price).toLocaleString()} VND</strong>
                  </div>
                ))}
              </div>
            )}

            <div className="total-line">
              <span>Total</span>
              <strong>{total.toLocaleString()} VND</strong>
            </div>

            {message && <div className="info-box">{message}</div>}
            <button type="button" className="primary-button" onClick={submitOrder}>Create Order</button>
          </section>
        </div>
      </main>
    </div>
  );
}
