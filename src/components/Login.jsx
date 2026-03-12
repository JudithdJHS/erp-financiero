import React, { useState } from 'react';
import api from '../api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegistering) {
        await api.post(`/auth/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        setSuccess('¡Usuario creado! Ya puedes iniciar sesión.');
        setIsRegistering(false);
      } else {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        localStorage.setItem('erp_token', res.data.access_token);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error en el proceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h2>FundControl</h2>
          <p>ERP Financiero Institucional</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="admin@fundacion.org"
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>

          <div className="login-toggle">
            <button 
              type="button" 
              className="btn-link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
              }}
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
