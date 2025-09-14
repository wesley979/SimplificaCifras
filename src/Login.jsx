import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      await login(email, senha);
      setLoading(false);
      navigate('/home2');
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/user-not-found') {
        setMsg('Usuário não cadastrado. Faça o registro.');
      } else if (error.code === 'auth/wrong-password') {
        setMsg('Senha incorreta.');
      } else if (error.code === 'auth/invalid-email') {
        setMsg('E-mail inválido.');
      } else {
        setMsg('Erro ao fazer login: ' + error.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        {msg && <p className="error">{msg}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="register-link">
          Não tem cadastro? <Link to="/register">Registre-se aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
