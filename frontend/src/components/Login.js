import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Login.css';
import { FaSpinner } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { updateUser } = useUser();  // Usando o contexto de usuário

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  // Verificar se o usuário já está logado (token existe)
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      navigate('/'); // Se já estiver logado, redireciona
    }
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:8000/login/', formData);

      if (response.status === 200) {
        // Store access and refresh tokens
        const { access, refresh, user } = response.data;
        localStorage.setItem('access_token', access);  // Store access token
        localStorage.setItem('refresh_token', refresh);  // Store refresh token

        // Store user data (e.g., name) for use in the avatar
        localStorage.setItem('user', JSON.stringify(user)); // Save user data to localStorage

        setUserData(user);

        setSuccess(true); // Definir sucesso como true após login bem-sucedido
        setMessage('Aguarde, você será redirecionado ao lobby de compras');
        
        // Atualiza o contexto com os dados do usuário
        updateUser(user);
      }
    } catch (err) {
      setError('Credenciais incorretas. Tente novamente!');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      // Se o token existir, o usuário está logado
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        // Perguntar ao usuário se ele deseja fazer logout
        const logout = window.confirm(`Bem-vindo, ${user.name}. Deseja sair?`);
        if (logout) {
          // Limpar tokens e redirecionar
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUserData(null); // Atualiza o estado do usuário
          updateUser(null);  // Limpa o contexto de usuário
          navigate('/login'); // Redireciona para a página de login
        }
      }
    } else {
      // Se não estiver logado, perguntar ao usuário se deseja fazer login ou registrar-se
      const action = window.confirm('Você não está logado. Deseja fazer login ou registrar-se?');
      if (action) {
        navigate('/login'); // Redireciona para a página de login
      } else {
        navigate('/register'); // Redireciona para a página de registro
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "N/A";  // Retorna "N/A" se o nome for undefined ou vazio
  
    const nameParts = name.split(' ');
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();  // Retorna as iniciais ou as duas primeiras letras
  };

  // Redirecionar após o login bem-sucedido (5 segundos)
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate('/'); // Redireciona para a página inicial após 5 segundos
      }, 5000);

      // Limpar timeout quando o componente for desmontado ou sucesso for alterado
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  return (
    <div className={`login-container ${darkMode ? 'dark-mode' : ''}`}>
      {userData ? (
        <div>
          <p className="success-message">Logado com Sucesso ! Aguarde </p>
          <p>{message}</p>
        </div>
      ) : (
        <>
          <h2>Login</h2>
          {error && <p className="error">{error}</p>}
          {loading ? (
            <FaSpinner className="loading-spinner" />
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              <label>
                E-mail
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={darkMode ? 'input-dark' : ''}
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={darkMode ? 'input-dark' : ''}
                />
              </label>

              <button type="submit">Login</button>
            </form>
          )}
        </>
      )}

      {userData && !loading && !success && (
        <div className="user-avatar" onClick={handleAvatarClick}>
          <div className="avatar-circle">
            {getInitials(userData.name)} {/* Display user initials */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
