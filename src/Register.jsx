import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { updateProfile, signOut } from 'firebase/auth';
import { auth } from './firebase';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confSenha, setConfSenha] = useState('');
  const [msg, setMsg] = useState('');
  const [msgTipo, setMsgTipo] = useState(''); // success ou error
  const [loading, setLoading] = useState(false);

  const validarSenha = (senha) => senha.length >= 6;

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    setMsgTipo('');

    if (!nome.trim()) {
      setMsg('Por favor, informe seu nome.');
      setMsgTipo('error');
      return;
    }

    if (!email.trim()) {
      setMsg('Por favor, informe seu e-mail.');
      setMsgTipo('error');
      return;
    }

    if (!validarSenha(senha)) {
      setMsg('A senha deve ter pelo menos 6 caracteres.');
      setMsgTipo('error');
      return;
    }

    if (senha !== confSenha) {
      setMsg('As senhas não coincidem.');
      setMsgTipo('error');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await register(email, senha);

      await updateProfile(userCredential.user, { displayName: nome });
      await signOut(auth);

      setMsg('Usuário cadastrado com sucesso! Faça login.');
      setMsgTipo('success');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      setMsgTipo('error');
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
        minHeight: '100vh',
        backgroundColor: '#000', // fundo totalmente preto
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '2rem',
          borderRadius: '8px',
          backgroundColor: '#121212', // card escuro
          display: 'flex',
          flexDirection: 'column',
          color: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#d6aaff' }}>Cadastro</h2>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
          {['Nome', 'Email', 'Senha', 'Confirme a senha'].map((placeholder, idx) => {
            const value = [nome, email, senha, confSenha][idx];
            const setValue = [setNome, setEmail, setSenha, setConfSenha][idx];
            const type = idx >= 2 ? 'password' : idx === 1 ? 'email' : 'text';
            return (
              <input
                key={idx}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  borderRadius: '6px',
                  border: '1px solid #7d3cff',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                }}
              />
            );
          })}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#7d3cff',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              transition: 'background 0.3s',
              marginTop: '0.5rem',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#a066ff')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#7d3cff')}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {msg && (
          <p
            style={{
              color: msgTipo === 'success' ? '#7dff7d' : '#ff5c5c',
              marginTop: '1rem',
              textAlign: 'center',
            }}
          >
            {msg}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Já tem cadastro? <Link style={{ color: '#d6aaff' }} to="/login">Faça login aqui</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
