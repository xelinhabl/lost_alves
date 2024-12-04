import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './css/Header.css';
import { FaShoppingCart, FaUserCircle, FaSun, FaMoon, FaPlus } from 'react-icons/fa'; // Importando FaPlus
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importando o contexto do usuário
import axios from 'axios';

const Header = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useUser(); // Consome o contexto de usuário
  const location = useLocation(); // Hook para detectar a mudança de rota

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para controlar o dropdown
  const dropdownRef = useRef(null); // Referência para o menu dropdown
  const userButtonRef = useRef(null); // Referência para o botão do avatar
  const [avatar, setAvatar] = useState(user?.avatar || ''); // Estado local para armazenar o avatar atualizado

  // Alterna a exibição do menu dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation(); // Impede que o clique feche o menu imediatamente
    setIsDropdownOpen(!isDropdownOpen); // Alterna o estado do dropdown
  };

  // Função para fechar o dropdown ao clicar fora dele
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      !userButtonRef.current.contains(event.target)
    ) {
      setIsDropdownOpen(false); // Fecha o dropdown se clicar fora
    }
  };

  // Função para desconectar o usuário
  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Remove o token de acesso
    localStorage.removeItem('refresh_token'); // Remove o token de atualização
    localStorage.removeItem('user'); // Remove os dados do usuário
    updateUser(null); // Limpa o contexto de usuário
    setIsDropdownOpen(false); // Fecha o dropdown após o logout
    navigate('/'); // Redireciona para a página inicial
  };

  // Função para redirecionar para o perfil do usuário
  const handleUserClick = () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      // Se o token de acesso existir, redireciona para o perfil
      navigate('/profile');
    } else {
      // Se não existir, redireciona para a página de login
      navigate('/register');
    }
  };

  // Usando o useEffect para detectar mudanças na URL e atualizar o contexto de usuário
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      updateUser(storedUser); // Atualiza o contexto com os dados do usuário
      setAvatar(storedUser?.avatar || ''); // Atualiza o avatar no estado local
    } else {
      updateUser(null); // Se não estiver logado, limpa o contexto de usuário
    }
  }, [location, updateUser]); // O efeito será acionado sempre que a localização mudar

  // useEffect para fechar o dropdown ao clicar fora
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Função para buscar e atualizar o avatar
  const fetchAvatar = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:8000/profile/avatar/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.avatar_url) {
        setAvatar(response.data.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao buscar avatar', error);
    }
  };

  // Chama o fetchAvatar sempre que o usuário mudar ou o token for encontrado
  useEffect(() => {
    if (user) {
      fetchAvatar(); // Chama a função ao carregar o componente
    }
  }, [user]);

  return (
    <header className={`header ${darkMode ? 'header-dark' : ''}`}>
      <div className="header-logo">
        <Link to="/">
          <img 
            src={`/logo/${darkMode ? 'logoPretoViaFitness.png' : 'logoBrancoViaFitness.png'}`} 
            alt="Logo da Empresa" 
            className="logo" 
          />
        </Link>
      </div>

      <div className="header-icons">
        {/* Ícone do carrinho */}
        <FaShoppingCart 
          className="icon" 
          title="Carrinho de Compras" 
          style={{ color: darkMode ? 'white' : 'black' }} 
        />
        
        {/* Botão de Adicionar Produtos - visível apenas para superusuário/admin */}
        {user?.is_superuser || user?.is_admin ? (
          <button 
            onClick={() => navigate('/add-product')} 
            className="add-product-button"
            title="Cadastrar produtos"  // Tooltip
          >
            <FaPlus className="add-product-icon" />
          </button>
        ) : null}

        {/* Ícone do usuário - ao clicar verifica o token */}
        <div>
          {user ? (
            <button 
              className="user-avatar" 
              onClick={toggleDropdown} 
              ref={userButtonRef}  // Adiciona referência para o botão do avatar
            >
              {avatar ? (
                <img 
                  src={'http://127.0.0.1:8000/' + avatar}  // Avatar do usuário
                  alt="Avatar" 
                  className="avatar-img" 
                />
              ) : (
                <FaUserCircle 
                  className="icon" 
                  style={{ color: darkMode ? 'white' : 'black' }} 
                />
              )}
            </button>
          ) : (
            <FaUserCircle
              className="icon"
              style={{ color: darkMode ? 'white' : 'black' }}
              onClick={handleUserClick}
            />
          )}

          {/* Menu Dropdown */}
          {isDropdownOpen && user && (
            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`} ref={dropdownRef}>
              <button onClick={() => navigate('/profile')}>Meu perfil</button>
              <button onClick={handleLogout}>Sair</button>
            </div>
          )}
        </div>

        {/* Botão para alternar o modo escuro/claro */}
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? <FaSun title="Modo Claro" /> : <FaMoon title="Modo Escuro" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
