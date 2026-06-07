import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RulesButton from '../components/RulesButton';
import '../index.css';
import coverApp from '../assets/cover-app.jpeg';
import mappaBg from '../assets/plancia-mappa-cover.jpg';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Inserisci sia lo username che la password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Username o password errati.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="login-page-container" 
      style={{ backgroundImage: `linear-gradient(rgba(240, 238, 230, 0.8), rgba(240, 238, 230, 0.8)), url(${mappaBg})` }}
    >
      <div className="login-card">
        
        {/* Componente del bottone regole */}
        <RulesButton />

        <div className="login-content">
          
          {/* Componente del form di login */}
          <LoginForm 
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            handleSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />

          {/* Immagine di copertina */}
          <div className="image-wrapper">
            <div className="cover-image-box">
              <img 
                src={coverApp} 
                alt="Torino Metro Cartoon" 
                className="cover-image"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}