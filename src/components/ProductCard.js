import React, { useState } from 'react';

const COLOR_NAMES = {
  yellow: 'Yellow Gold',
  white: 'White Gold',
  rose: 'Rose Gold',
};

const renderStars = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={`star${i < Math.round(rating) ? '' : ' empty'}`}>
        {i < Math.round(rating) ? '\u2605' : '\u2606'}
      </span>
    );
  }
  return stars;
};

const ProductCard = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState('yellow');

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.images[selectedColor]}
          alt={product.name}
          className="product-image"
        />
      </div>
      <h3 className="product-title">{product.name}</h3>
      <p className="product-price">${product.price.toFixed(2)} USD</p>
      <div className="color-picker">
        {Object.keys(product.images).map((color) => (
          <div
            key={color}
            className={`color-option ${color} ${selectedColor === color ? 'active' : ''}`}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
      <p className="selected-color">{COLOR_NAMES[selectedColor]}</p>
      <div className="rating">
        <div className="stars">{renderStars(product.popularityRating)}</div>
        <span className="rating-text">{product.popularityRating}/5</span>
      </div>
    </div>
  );
};

export default ProductCard; 