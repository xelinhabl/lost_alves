import React, { createContext, useContext, useState, useCallback } from 'react';

// Cria o contexto
const UserContext = createContext();

// Hook customizado para consumir o contexto
export const useUser = () => {
  return useContext(UserContext);
};

// Provedor do UserContext
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Função para atualizar o usuário, memorizada para evitar recriações
  const updateUser = useCallback((newUser) => {
    setUser(newUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
