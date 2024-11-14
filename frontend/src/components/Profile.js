import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Profile.css';
import { useTheme } from '../context/ThemeContext';
import { FiCamera } from 'react-icons/fi';

const Profile = () => {
  const { darkMode } = useTheme();
  const [user, setUser] = useState({ username: '', email: '', avatar: '' });
  const [preview, setPreview] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', postal_code: '', neighborhood: '', number: '', complement: '', isDefault: false, cpf: ''
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setError('Usuário não autenticado');
        return;
      }
  
      try {
        const profileResponse = await axios.get('http://localhost:8000/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (profileResponse.data) {
          const { username, email } = profileResponse.data;
          setUser((prevUser) => ({ ...prevUser, username, email }));
        } else {
          setError('Resposta inesperada da API para dados do usuário');
          return;
        }
  
        const avatarResponse = await axios.get('http://localhost:8000/profile/avatar/', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (avatarResponse.data && avatarResponse.data.avatar_url) {
          setUser((prevUser) => ({ ...prevUser, avatar: avatarResponse.data.avatar_url }));
        } else {
          setError('Avatar não encontrado');
        }
  
        const addressResponse = await axios.get('http://localhost:8000/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (Array.isArray(addressResponse.data.addresses)) {
          setAddresses(addressResponse.data.addresses);
        } else {
          setAddresses([]);
          setError('Erro ao carregar endereços');
        }
      } catch (err) {
        setError('Erro ao carregar o perfil');
      }
    };
  
    fetchUserData();
  }, [token]);
  

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post('http://localhost:8000/profile/avatar/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.avatar_url) {
        setUser((prevUser) => ({ ...prevUser, avatar: response.data.avatar_url }));
        setPreview(null);
      } else {
        setError('Erro ao salvar o avatar');
      }
    } catch (err) {
      setError("Erro ao enviar o avatar");
      console.error("Erro ao enviar o avatar", err);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleZipBlur = async () => {
    if (newAddress.postal_code.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${newAddress.postal_code}/json/`);
        if (response.data.erro) {
          setError("CEP não encontrado");
          return;
        }
        const { logradouro, localidade, uf, bairro } = response.data;
        setNewAddress((prev) => ({
          ...prev,
          street: logradouro,
          city: localidade,
          state: uf,
          neighborhood: bairro || ""
        }));
        setError("");
      } catch (err) {
        setError("Erro ao buscar CEP");
      }
    } else {
      setError("CEP deve ter 8 dígitos");
    }
  };

// Para adicionar um endereço
const handleAddAddress = async () => {
  if (addresses.length >= 3) {
    setError("Limite de 3 endereços atingido");
    return;
  }

  if (newAddress.isDefault) {
    // Garantir que todos os outros endereços não sejam padrão
    setAddresses((prev) =>
      prev.map((address) => ({ ...address, isDefault: false }))
    );
  } else if (!addresses.some((address) => address.isDefault)) {
    newAddress.isDefault = true;
  }

  try {
    const response = await axios.post('http://localhost:8000/profile/addresses/', newAddress, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      setAddresses((prev) => [...prev, response.data]);
      setNewAddress({
        street: '', city: '', state: '', postal_code: '', neighborhood: '', number: '', complement: '', isDefault: false, cpf: ''
      });
      setError("");
    } else {
      setError("Erro ao adicionar endereço");
    }
  } catch (err) {
    setError("Erro ao adicionar endereço");
  }
};


  const handleSetDefault = (index) => {
    setAddresses((prev) =>
      prev.map((address, i) => ({ ...address, isDefault: i === index }))
    );
  };

  const handleRemoveAddress = async (index) => {
    const addressToRemove = addresses[index];
  
    // Verifica se o id do endereço está presente
    if (!addressToRemove.id) {
      setError('ID do endereço não encontrado');
      return;
    }
  
    try {
      // Envia a requisição DELETE para a API
      const response = await axios.delete(`http://localhost:8000/profile/addresses/${addressToRemove.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Verifica se a exclusão foi bem-sucedida com o status 204 (No Content)
      if (response.status === 204) {
        // Após excluir, recarrega os endereços da API para refletir as alterações
        const addressResponse = await axios.get('http://localhost:8000/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Se os endereços forem um array válido, atualize o estado
        if (Array.isArray(addressResponse.data.addresses)) {
          const updatedAddresses = addressResponse.data.addresses;
  
          // Garantir que sempre tenha um endereço padrão após a remoção
          if (!updatedAddresses.some((address) => address.isDefault) && updatedAddresses.length > 0) {
            updatedAddresses[0].isDefault = true;
          }
  
          setAddresses(updatedAddresses);
        } else {
          setError('Erro ao carregar os endereços após a remoção');
        }
      } else {
        setError('Erro ao remover endereço');
      }
    } catch (err) {
      setError('Erro ao remover endereço');
    }
  };

  const formatCPF = (cpf) => {
    return cpf.replace(/\D/g, '')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  return (
    <div className={`profile-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="profile-header">
        <div className="avatar-container">
          <img
            src={preview || `http://127.0.0.1:8000/${user.avatar}`}
            alt="Avatar"
            className="avatar"
            onError={(e) => e.target.src = ''}
          />
          <label className="camera-icon-container">
            <FiCamera size={24} className="camera-icon" />
            <input type="file" onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
          </label>
        </div>
        <div className="user-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="address-form">
        <h3>Endereços de Entrega</h3>
        
        <div className="form-row">
          <label>CEP:</label>
          <input
            type="text"
            name="postal_code"
            value={newAddress.postal_code}
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
        </div>

        <div className="form-row">
          <label>Bairro:</label>
          <input
            type="text"
            name="neighborhood"
            value={newAddress.neighborhood}
            onChange={handleAddressChange}
            required
            className={darkMode ? 'input-dark' : ''}
          />

          <label>Número:</label>
          <input
            type="text"
            name="number"
            value={newAddress.number}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, number: e.target.value.replace(/\D/g, '') }))} 
            required
            className={darkMode ? 'input-dark' : ''}
          />
        </div>

        <div className="form-row">
          <label>Complemento:</label>
          <input
            type="text"
            name="complement"
            value={newAddress.complement}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, complement: e.target.value.slice(0, 30) }))} 
            maxLength="30"
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
        </div>

        <div className="form-row">
          <label>Estado:</label>
          <input
            type="text"
            name="state"
            value={newAddress.state}
            onChange={handleAddressChange}
            required
            className={darkMode ? 'input-dark' : ''}
          />

          <label>CPF:</label>
          <input
            type="text"
            name="cpf"
            value={newAddress.cpf}
            onChange={(e) => setNewAddress((prev) => ({ ...prev, cpf: formatCPF(e.target.value) }))}
            maxLength="14"
            required
            className={darkMode ? 'input-dark' : ''}
          />
        </div>

        <div className="form-row">
          <label>Definir como padrão</label>
          <input
            type="checkbox"
            checked={newAddress.isDefault}
            onChange={() => setNewAddress((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
          />
        </div>

        <button onClick={handleAddAddress} className="add-address-btn">Adicionar Endereço</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="address-list">
        <h3>Endereços Salvos</h3>
        {Array.isArray(addresses) && addresses.length > 0 ? (
          addresses.map((address, index) => (
            <div key={address.id || index} className={`address-item ${address.isDefault ? 'default' : ''}`}>
              <p>{address.street}, {address.number} - {address.city} / {address.state}</p>
              {address.isDefault && <span>Endereço Padrão</span>} {/* Exibe se for o endereço padrão */}
              <button onClick={() => handleSetDefault(index)} className="set-default">Definir como padrão</button>
              <button onClick={() => handleRemoveAddress(index)} className="remove-address">Remover</button>
            </div>
          ))
        ) : (
          <p>Nenhum endereço salvo</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
