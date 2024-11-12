import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importação do ThemeProvider, UserProvider e dos componentes
import { ThemeProvider } from './context/ThemeContext';
import CardProducts from './components/CardProducts';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import Header from './components/Header';
import { UserProvider } from './context/UserContext';

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          {/* Renderiza o Header no topo de todas as páginas */}
          <Header />
          
          {/* Configuração das rotas */}
          <Routes>
            <Route path="/" element={<CardProducts />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} /> {/* Adicionando a rota para Profile */}
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
