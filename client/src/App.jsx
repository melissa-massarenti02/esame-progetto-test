import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        
        <div className="game-container" style={{ 
          padding: '24px', 
          maxWidth: '1200px', 
          margin: '20px auto',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/game" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

        </div>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;