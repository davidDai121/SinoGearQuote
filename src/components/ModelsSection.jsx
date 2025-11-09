import React from 'react';

const ModelsSection = ({ models }) => {
  return (
    <section className="models-section">
      <h2 className="section-title">VEHICLE MODELS</h2>
      <div className="models-grid">
        {models.map((model, index) => (
          <div key={index} className="model-card">
            <h3>{model.name}</h3>
            <p><span className="label">ENERGY:</span> {model.energy}</p>
            <p><span className="label">BATTERY:</span> {model.battery}</p>
            <p><span className="label">CLTC:</span> {model.cltc}</p>
            <p className="price"><span className="label">PRICE:</span> <span className="price-value">{model.price}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ModelsSection;