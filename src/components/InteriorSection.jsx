import React from 'react';

const InteriorSection = ({ interiorItems }) => {
  return (
    <section className="interior-section">
      <h2 className="section-title">
        <span className="title-bar"></span>
        INTERIOR DISPLAY
      </h2>
      <div className="interior-grid">
        {interiorItems.map((item) => (
          <div key={item} className="interior-item">
            <div className="placeholder-image">INTERIOR {item}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InteriorSection;