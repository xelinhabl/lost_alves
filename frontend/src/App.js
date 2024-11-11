// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importação do ThemeProvider e dos componentes
import { ThemeProvider } from './context/ThemeContext';
import CardProducts from './components/CardProducts';
import Register from './components/Register';
import Login from './components/Login'; // Certifique-se de que o Login está importado corretamente
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
            <Route path="/login" element={<Login />} /> {/* Adicionando a rota para Login */}
            {/* Adicione novas rotas aqui conforme necessário */}
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;
