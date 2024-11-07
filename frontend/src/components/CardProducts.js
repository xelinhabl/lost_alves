import React, { useState, useEffect } from 'react';
import './css/CardProducts.css';

const CardProducts = () => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(null);
  const [images, setImages] = useState([]);
  const [productTitle, setProductTitle] = useState('');

  // Mover a função loadImages para dentro do useEffect para evitar o warning
  useEffect(() => {
    const loadImages = () => {
      const context = require.context('../../public/products', false, /\.(png|jpe?g|svg)$/);

      // Coleta todas as imagens e organiza pelo nome do produto sem o sufixo numérico
      const productImages = {};
      context.keys().forEach((key) => {
        const filename = key.replace('./', '').split('.')[0];
        const productName = filename.replace(/\d+$/, ''); // Remove números do final do nome
        productImages[productName] = productImages[productName] || [];
        productImages[productName].push(context(key));
      });

      // Usar o primeiro conjunto de imagens para inicializar o componente
      const firstProduct = Object.keys(productImages)[0];
      setProductTitle(formatProductTitle(firstProduct));  // Formatando o nome do produto
      setImages(productImages[firstProduct]);
    };

    // Chama a função para carregar as imagens
    loadImages();
  }, []);  // O array de dependências vazio faz com que a função seja chamada uma única vez

  // Função para formatar o nome do produto (com split e capitalização)
  const formatProductTitle = (title) => {
    const formattedTitle = title.replace(/([a-z])([A-Z])/g, '$1 $2');
    return formattedTitle.charAt(0).toUpperCase() + formattedTitle.slice(1);
  };

  const toggleFavorite = () => setIsFavorited(!isFavorited);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 99) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const nextImage = () => setSelectedImageIndex((selectedImageIndex + 1) % images.length);
  const prevImage = () => setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);

  const selectImage = (index) => setSelectedImageIndex(index);
  const selectSize = (size) => setSize(size);

  const sizeOptions = ['P', 'M', 'G', 'GG'];

  return (
    <div className="card-product">
      <div className="carousel-container">
        <div className="carousel-main-image">
          <button className="carousel-arrow prev" onClick={prevImage}>❮</button>
          <img src={images[selectedImageIndex]} alt={`${productTitle} - Imagem ${selectedImageIndex + 1}`} className="main-image" />
          <button className="carousel-arrow next" onClick={nextImage}>❯</button>
        </div>
        
        <div className="carousel-thumbnails">
          {images.map((img, index) => (
            <div
              key={index}
              className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
              onClick={() => selectImage(index)}
            >
              <img src={img} alt={`Miniatura ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="product-details">
        <h2 className="product-title">{productTitle}</h2>
        
        <div className="size-selector">
          {sizeOptions.map((s) => (
            <button
              key={s}
              className={`size-option ${size === s ? 'selected' : ''}`}
              onClick={() => selectSize(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="quantity-section">
          <button className="quantity-button" onClick={decrementQuantity}>-</button>
          <input
            type="number"
            min="1"
            max="99"
            value={quantity}
            onChange={handleQuantityChange}
            className="quantity-input"
          />
          <button className="quantity-button" onClick={incrementQuantity}>+</button>
        </div>
        
        <p className="product-price">Valor: R$ {100.00 * quantity}</p>
        <div className="buttons">
          <button
            className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
            onClick={toggleFavorite}
          >
            ❤
          </button>
          <button className="buy-button">COMPRAR</button>
        </div>
      </div>
    </div>
  );
};

export default CardProducts;
