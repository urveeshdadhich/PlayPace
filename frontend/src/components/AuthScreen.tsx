import React, { useState } from 'react';
import { loginUser, registerUser } from '../api';
import './AuthScreen.css';

interface Props {
  onAuthSuccess: (token: string) => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(username, password);
        onAuthSuccess(data.token);
      } else {
        const data = await registerUser(username, password);
        onAuthSuccess(data.token);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="glass-panel auth-panel">
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '24px' }}>
          🎮 PlayPace
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Sync your backlog across devices
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="auth-toggle-btn">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
