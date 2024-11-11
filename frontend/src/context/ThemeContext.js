// src/context/ThemeContext.js

import React, { createContext, useContext, useState } from 'react';

// Criação do contexto
const ThemeContext = createContext();

// Custom hook para usar o contexto
export const useTheme = () => useContext(ThemeContext);

// Provider para envolver a aplicação
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Alterna entre os modos claro e escuro
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
