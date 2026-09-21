import React from 'react';
import './VerticalSlider.css';

const profileHexagonImages = [
  '/assets/green.png',
  '/assets/white.jpg',
  '/assets/orange.png',
  '/assets/white.jpg',
  '/assets/green.png',
  '/assets/white.jpg',
  '/assets/orange.png',
  '/assets/white.jpg',
  
 
];

const HexagonSslider = ({ className, images }) => {
  const quantity = images.length;

  return (
    <div className={className}>
      <div className="hexagon-slider" style={{ '--quantity': quantity }}>
        {images.map((src, i) => (
          <div className="hexagon-item" style={{ '--position': i + 1 }} key={i}>
            <img src={src} alt={`Hexagon ${i + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

const HexagonProfileSlider = () => {
  return (
    <div className="hexagon-profile-slider">
      <div className="hexagon-profile-wrapper">
        <HexagonSslider className="hexagon-slider-wrapper" images={profileHexagonImages} />
      </div>
    </div>
  );
};

export default HexagonProfileSlider;
