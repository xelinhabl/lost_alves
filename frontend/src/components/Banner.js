import React, { useState, useEffect } from 'react';
import './css/Banner.css'; // Criaremos o CSS para estilizar o banner

const Banner = () => {
  const banners = [
    '/logo/banner1.webp',
    '/logo/banner2.webp',
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Alterna para o próximo banner automaticamente a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Troca a cada 5 segundos
    return () => clearInterval(interval);
  }, [banners.length]);

  // Funções manuais para navegar pelos banners
  const nextBanner = () => {
    setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  return (
    <div className="banner-container">
      <button className="carousel-arrow prev" onClick={prevBanner}>❮</button>
      <img
        src={banners[currentBannerIndex]}
        alt={`Banner ${currentBannerIndex + 1}`}
        className="banner-image"
      />
      <button className="carousel-arrow next" onClick={nextBanner}>❯</button>
    </div>
  );
};

export default Banner;