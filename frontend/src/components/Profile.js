import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Profile.css';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { darkMode } = useTheme();
  const [user, setUser] = useState({ username: '', email: '', avatar: '' });
  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zip: '', number: '', complement: '', isDefault: false
  });
  const [error, setError] = useState('');

  // Recupera o token JWT do localStorage
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('Usuário não autenticado');
        return;
      }
  
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
  
        if (response.data) {
          const { username, email } = response.data;
          setUser({ username, email });  // Certifique-se de que `username` é atualizado
        } else {
          console.error('Resposta inesperada da API:', response);
          setError('Resposta inesperada da API');
        }
      } catch (err) {
        console.error("Erro ao carregar os dados do usuário", err);
        setError("Erro ao carregar os dados do perfil");
      }
    };
  
    fetchUserData();
  }, [token]);  
  

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleZipBlur = async () => {
    if (newAddress.zip.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${newAddress.zip}/json/`);
        if (response.data.erro) {
          setError("CEP não encontrado");
          return;
        }
        const { logradouro, localidade, uf } = response.data;
        setNewAddress((prev) => ({
          ...prev,
          street: logradouro,
          city: localidade,
          state: uf,
        }));
        setError("");
      } catch (err) {
        setError("Erro ao buscar CEP");
      }
    } else {
      setError("CEP deve ter 8 dígitos");
    }
  };

  const handleAddAddress = () => {
    if (addresses.length >= 3) {
      setError("Limite de 3 endereços atingido");
      return;
    }
    if (!newAddress.isDefault && addresses.length === 0) {
      newAddress.isDefault = true;
    }
    setAddresses((prev) => [...prev, newAddress]);
    setNewAddress({ street: '', city: '', state: '', zip: '', number: '', complement: '', isDefault: false });
    setError("");
  };

  const handleSetDefault = (index) => {
    setAddresses((prev) =>
      prev.map((address, i) => ({ ...address, isDefault: i === index }))
    );
  };

  const handleRemoveAddress = (index) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`profile-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="profile-header">
        <img src={preview || user.avatar} alt="Avatar" className="avatar" />
        <div className="user-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="avatar-upload">
        <label>Atualizar Avatar:</label>
        <input type="file" onChange={handleAvatarChange} accept="image/*" />
        {preview && <img src={preview} alt="Avatar Preview" className="avatar-preview" />}
      </div>

      <div className="address-form">
        <h3>Endereços de Entrega</h3>
        <label>CEP:</label>
        <input
          type="text"
          name="zip"
          value={newAddress.zip}
          onChange={handleAddressChange}
          onBlur={handleZipBlur}
          maxLength="8"
          required
          className={darkMode ? 'input-dark' : ''}
        />
        <label>Rua:</label>
        <input
          type="text"
          name="street"
          value={newAddress.street}
          onChange={handleAddressChange}
          required
          className={darkMode ? 'input-dark' : ''}
        />
        <label>Número:</label>
        <input
          type="text"
          name="number"
          value={newAddress.number}
          onChange={handleAddressChange}
          required
          className={darkMode ? 'input-dark' : ''}
        />
        <label>Complemento:</label>
        <input
          type="text"
          name="complement"
          value={newAddress.complement}
          onChange={handleAddressChange}
          className={darkMode ? 'input-dark' : ''}
        />
        <label>Cidade:</label>
        <input
          type="text"
          name="city"
          value={newAddress.city}
          onChange={handleAddressChange}
          required
          className={darkMode ? 'input-dark' : ''}
        />
        <label>Estado:</label>
        <input
          type="text"
          name="state"
          value={newAddress.state}
          onChange={handleAddressChange}
          required
          className={darkMode ? 'input-dark' : ''}
        />
        <label>Definir como padrão</label>
        <input
          type="checkbox"
          checked={newAddress.isDefault}
          onChange={() => setNewAddress((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
          disabled={addresses.length === 0}
        />
        <button onClick={handleAddAddress} className="add-address-btn">Adicionar Endereço</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="address-list">
        <h3>Endereços Salvos</h3>
        {addresses.map((address, index) => (
          <div key={index} className="address-item">
            <p>{address.street}, Nº {address.number}, {address.complement ? `${address.complement}, ` : ''}{address.city} - {address.state}</p>
            <p>CEP: {address.zip}</p>
            <p>{address.isDefault ? "Padrão" : ""}</p>
            <button onClick={() => handleSetDefault(index)} disabled={address.isDefault} className="set-default">
              {address.isDefault ? "Padrão" : "Definir como Padrão"}
            </button>
            <button onClick={() => handleRemoveAddress(index)} className="remove-address">
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
