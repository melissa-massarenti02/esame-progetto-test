// --- gestione dell'AuthProvider ---

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/sessions/current', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then(userData => {
        setUser(userData);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (username, password) => {
    const response = await fetch('http://127.0.0.1:3001/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }), 
    });
    
    if (response.ok) {
      const userWithSession = await response.json();
      setUser(userWithSession);
      navigate('/dashboard');
    } else {

      let errorMsg = 'Username o password errati';
      try {
        errorMsg = await response.text();
      } catch (e) {

      }
      throw new Error(errorMsg || 'Infelice tentativo di login');
    }
  };

  const logout = async () => {
    await fetch('http://127.0.0.1:3001/api/sessions/current', { method: 'DELETE', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}