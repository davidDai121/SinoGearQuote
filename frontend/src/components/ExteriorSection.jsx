import React from 'react';

const ExteriorSection = ({ colors }) => {
  return (
    <section className="exterior-section">
      <h2 className="section-title">
        <span className="title-bar"></span>
        EXTERIOR COLORS AVAILABLE
      </h2>
      <div className="exterior-grid">
        {colors.map((color, index) => (
          <div key={index} className="color-item">
            <img src={color.image} alt={color.name} className="vehicle-image" />
            <div className="color-label">{color.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExteriorSection;