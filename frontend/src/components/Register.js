import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Register.css';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa'; // Ícones de sucesso e carregamento
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para navegação no React Router v6

const Register = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate(); // Usando useNavigate para navegação

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [isRegistering, setIsRegistering] = useState(false); // Controla a exibição do formulário ou dos botões
  const [countdown, setCountdown] = useState(5); // Contador de 5 segundos
  const [loadingDuringCountdown, setLoadingDuringCountdown] = useState(false); // Novo estado para exibir o loading abaixo da contagem

  // Verifica se há token de acesso ao carregar o componente
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      navigate('/'); // Somente navega se o token de acesso existir
    }
  }, [navigate]);

  // Controla o contador de 5 segundos após o registro
  useEffect(() => {
    if (success) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(countdownInterval);
            setLoadingDuringCountdown(false); // Para de mostrar o loading quando a contagem termina
            navigate('/'); // Redireciona para a página inicial após 5 segundos
          }
          return prevCountdown - 1;
        });
      }, 1000);
      setLoadingDuringCountdown(true); // Começa a exibir o loading quando o sucesso for alcançado

      return () => clearInterval(countdownInterval); // Limpa o intervalo quando o componente for desmontado ou o contador for finalizado
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Ativa o estado de carregamento
    setError(null); // Reseta os erros ao submeter o formulário
  
    try {
      const response = await axios.post('http://localhost:8000/register/', formData);
      if (response.status === 201) {
        setSuccess(true); // Define sucesso como true
        setFormData({ username: '', email: '', password: '' }); // Limpa os campos do formulário
  
        // Armazena os dados do usuário no localStorage
        const user = {
          name: formData.username,
          email: formData.email,
        };
        localStorage.setItem('user', JSON.stringify(user));
  
        // Login automático após o registro
        const loginResponse = await axios.post('http://localhost:8000/login/', {
          email: formData.email,
          password: formData.password,
        });
  
        if (loginResponse.status === 200) {
          const { access, refresh } = loginResponse.data;
          localStorage.setItem('access_token', access); // Armazena o token de acesso
          localStorage.setItem('refresh_token', refresh); // Armazena o token de refresh
        }
      }
    } catch (error) {
      // Exibe a mensagem de erro detalhada
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error); // Exibe a mensagem de erro retornada do backend
      } else {
        setError('Erro ao registrar o usuário'); // Mensagem padrão
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleLoginClick = () => {
    navigate('/login'); // Navega para a página de login
  };

  const handleRegisterClick = () => {
    setIsRegistering(true); // Exibe o formulário de registro
  };

  return (
    <div className={`register-container ${darkMode ? 'dark-mode' : ''}`}>
      {success ? (
        <>
          <FaCheckCircle className="success-icon" />
          <p className="success-message">Usuário criado com sucesso!</p>
          <p>Você será redirecionado ao lobby de compras em {countdown}...</p>
          {loadingDuringCountdown && <FaSpinner className="loading-spinner" />} {/* Ícone de carregamento abaixo */}
        </>
      ) : isRegistering ? (
        <>
          <h2>Registrar-se</h2>
          {error && <p className="error">{error}</p>}
          {loading ? (
            <FaSpinner className="loading-spinner" />
          ) : (
            <form onSubmit={handleSubmit} className="register-form">
              <label>
                Nome de Usuário
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={darkMode ? 'input-dark' : ''}
                />
              </label>

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

              <button type="submit">Registrar</button>
            </form>
          )}
        </>
      ) : (
        <>
          <button className="register-button" onClick={handleRegisterClick}>Registrar-se</button>
          <p>OU</p>
          <button className="login-button" onClick={handleLoginClick}>Fazer Login</button>
        </>
      )}
    </div>
  );
};

export default Register;
