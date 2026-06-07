// --- src/components/LoginForm.jsx ---
export default function LoginForm({ username, setUsername, password, setPassword, handleSubmit, submitting, error }) {
  return (
    <div className="login-form-wrapper">
      <h4 className="auth-title">Autenticazione</h4>
      <p className="auth-subtitle">Torino - "ultima corsa"</p>

      {error && (
        <div className="error-message">⚡ {error}</div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            placeholder="mail@gmail.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password">password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'VALIDAZIONE...' : 'accedi'}
        </button>
      </form>
    </div>
  );
}