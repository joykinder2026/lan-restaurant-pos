import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <h1>LAN Restaurant POS</h1>
        <p>Login to continue</p>

        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>

        <div className="hint-box">
          Demo account: admin / admin123
        </div>
      </form>
    </div>
  );
}
