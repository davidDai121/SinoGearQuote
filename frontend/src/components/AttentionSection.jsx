import React from 'react';

const AttentionSection = () => {
  const attentionPoints = [
    'THE PRICE OF USED CARS IS DETERMINED BY THEIR CONDITION, SO THERE WILL BE DIFFERENCES IN PRICES.',
    'VEHICLE QUOTATIONS ARE TIME-SENSITIVE, AND THE PRICES USUALLY REMAIN VALID FOR ONE WEEK.',
    'THE VEHICLES ARE IN THE FOR-SALE STATUS. BEFORE A DEPOSIT IS RECEIVED, THEY MAY BE SOLD AT ANY TIME.'
  ];

  return (
    <section className="attention-section">
      <h2 className="attention-title">ATTENTION:</h2>
      <div className="attention-list">
        {attentionPoints.map((point, index) => (
          <p key={index}>{index + 1}. {point}</p>
        ))}
      </div>
    </section>
  );
};

export default AttentionSection;