import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fazendo a requisição para a API Django
    axios.get('http://127.0.0.1:8000/api/hello/')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error("Erro ao buscar dados da API", error);
      });
  }, []);

  return (
    <div className="App">
      <h1>{message ? message : "Carregando..."}</h1>
    </div>
  );
}

export default App;
