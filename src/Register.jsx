import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { updateProfile } from 'firebase/auth';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confSenha, setConfSenha] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validarSenha = (senha) => senha.length >= 6;

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!nome.trim()) {
      setMsg('Por favor, informe seu nome.');
      return;
    }

    if (!email.trim()) {
      setMsg('Por favor, informe seu e-mail.');
      return;
    }

    if (!validarSenha(senha)) {
      setMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confSenha) {
      setMsg('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await register(email, senha);
      await updateProfile(userCredential.user, { displayName: nome });
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMsg('Este e-mail já está em uso.');
      } else if (error.code === 'auth/invalid-email') {
        setMsg('E-mail inválido.');
      } else if (error.code === 'auth/weak-password') {
        setMsg('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setMsg('Erro ao cadastrar: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        width: '90%',
        margin: '2rem auto',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Cadastro</h2>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: 'clamp(0.9rem, 1vw, 1rem)',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: 'clamp(0.9rem, 1vw, 1rem)',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: 'clamp(0.9rem, 1vw, 1rem)',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirme a senha"
          value={confSenha}
          onChange={(e) => setConfSenha(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: 'clamp(0.9rem, 1vw, 1rem)',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          disabled={loading}
        />

        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 'clamp(0.9rem, 1vw, 1rem)',
          }}
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      {msg && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{msg}</p>}

      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Já tem cadastro? <Link to="/login">Faça login aqui</Link>
      </p>
    </div>
  );
};

export default Register;
