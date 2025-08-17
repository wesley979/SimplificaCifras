import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

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
      navigate('/add-cifra'); // redireciona após login bem-sucedido
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
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      {msg && <p style={{ color: 'red', marginTop: '1rem' }}>{msg}</p>}
      <br />
      <p>
        Não tem cadastro? <Link to="/register">Registre-se aqui</Link>
      </p>
    </div>
  );
};

export default Login;
