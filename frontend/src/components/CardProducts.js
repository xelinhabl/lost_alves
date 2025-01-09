import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './css/CardProducts.css';
import axios from 'axios';

const CardProducts = () => {
  const { darkMode } = useTheme();
  const [isFavorited, setIsFavorited] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [quantity, setQuantity] = useState({});
  const [size, setSize] = useState({});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('access_token'); // Obter o token de autenticação
      if (!token) {
        setError('Usuário não autenticado. Faça login para acessar os produtos.');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/products/', {
          headers: {
            Authorization: `Bearer ${token}`, // Adiciona o token ao cabeçalho
          },
        });

        // Atualiza o estado com todos os produtos
        setProducts(response.data);

      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setError('Não foi possível carregar os produtos. Verifique sua conexão ou autenticação.');
      }
    };

    fetchProducts();
  }, []); // O useEffect agora é executado apenas uma vez, pois a dependência está vazia.

  // Funções auxiliares para controle de favoritos e imagens
  const toggleFavorite = (productId) => {
    setIsFavorited((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleQuantityChange = (e, productId) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 99) {
      setQuantity((prev) => ({
        ...prev,
        [productId]: value,
      }));
    }
  };

  const incrementQuantity = (productId) => {
    if (quantity[productId] < 99) {
      setQuantity((prev) => ({
        ...prev,
        [productId]: prev[productId] + 1,
      }));
    }
  };

  const decrementQuantity = (productId) => {
    if (quantity[productId] > 1) {
      setQuantity((prev) => ({
        ...prev,
        [productId]: prev[productId] - 1,
      }));
    }
  };

  const nextImage = (productId) => {
    if (products && products[productId].photo) {
      setSelectedImageIndex((prev) => ({
        ...prev,
        [productId]: (prev[productId] + 1) % (Array.isArray(products[productId].photo) ? products[productId].photo.length : 1),
      }));
    }
  };

  const prevImage = (productId) => {
    if (products && products[productId].photo) {
      setSelectedImageIndex((prev) => ({
        ...prev,
        [productId]: (prev[productId] - 1 + (Array.isArray(products[productId].photo) ? products[productId].photo.length : 1)) % (Array.isArray(products[productId].photo) ? products[productId].photo.length : 1),
      }));
    }
  };

  const selectImage = (productId, index) => {
    setSelectedImageIndex((prev) => ({
      ...prev,
      [productId]: index,
    }));
  };

  const selectSize = (productId, size) => {
    setSize((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const sizeOptions = ['P', 'M', 'G', 'GG'];

  // Função para garantir que o preço seja um número
  const formatPrice = (price) => {
    const numericPrice = parseFloat(price);
    return !isNaN(numericPrice) ? numericPrice.toFixed(2) : '0.00';
  };

  return (
    <div className={`card-products-container ${darkMode ? 'dark' : ''}`}>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        products.map((product) => {
          const { id, name, photo, color, reference, retail_price } = product;

          // Verifique se o produto tem foto e se é um array ou string
          const imageUrl = Array.isArray(photo) ? `http://127.0.0.1:8000${photo[selectedImageIndex[id] || 0]}` : `http://127.0.0.1:8000${photo}`;

          return (
            <div className="card-product" key={id}>
              <div className="carousel-container">
                <div className="carousel-main-image">
                  <button 
                    className="carousel-arrow prev" 
                    onClick={() => prevImage(id)} 
                    disabled={!Array.isArray(photo) || photo.length <= 1}
                  >
                    ❮
                  </button>
                  <img
                    src={imageUrl}
                    alt={`${name} - Imagem`}
                    className="main-image"
                    onError={(e) => e.target.src = 'default-image.jpg'} // Fallback de imagem se não carregar
                  />
                  <button 
                    className="carousel-arrow next" 
                    onClick={() => nextImage(id)} 
                    disabled={!Array.isArray(photo) || photo.length <= 1}
                  >
                    ❯
                  </button>
                </div>

                <div className="carousel-thumbnails">
                  {Array.isArray(photo) && photo.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${selectedImageIndex[id] === index ? 'active' : ''}`}
                      onClick={() => selectImage(id, index)}
                    >
                      <img
                        src={img}
                        alt={`Miniatura ${index + 1}`}
                        onError={(e) => e.target.src = 'default-image.jpg'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="product-details">
                <h2 className="product-title">{name}</h2>
                <p>Cor: {color || 'Indisponível'}</p>
                <p>Referência: {reference || 'N/A'}</p>
                
                <div className="size-selector">
                  {sizeOptions.map((s) => (
                    <button
                      key={s}
                      className={`size-option ${size[id] === s ? 'selected' : ''}`}
                      onClick={() => selectSize(id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="quantity-section">
                  <button className="quantity-button" onClick={() => decrementQuantity(id)}>-</button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity[id] || 1}
                    onChange={(e) => handleQuantityChange(e, id)}
                    className="quantity-input"
                  />
                  <button className="quantity-button" onClick={() => incrementQuantity(id)}>+</button>
                </div>
                
                <p className="product-price">
                  Valor Unitário: R$ {formatPrice(retail_price)}<br />
                  Total: R$ {formatPrice(retail_price * (quantity[id] || 1))}
                </p>

                <div className="buttons">
                  <button
                    className={`favorite-button ${isFavorited[id] ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(id)}
                  >
                    ❤
                  </button>
                  <button className="buy-button">COMPRAR</button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CardProducts;
