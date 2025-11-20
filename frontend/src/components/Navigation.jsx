import React from 'react';

const Navigation = ({ activeSection, onSectionChange }) => {
  return (
    <nav className="navigation">
      <button 
        className={`nav-button ${activeSection === 'models' ? 'active' : ''}`}
        onClick={() => onSectionChange('models')}
      >
        车型选择
      </button>
      <button 
        className={`nav-button ${activeSection === 'exterior' ? 'active' : ''}`}
        onClick={() => onSectionChange('exterior')}
      >
        外观颜色
      </button>
      <button 
        className={`nav-button ${activeSection === 'interior' ? 'active' : ''}`}
        onClick={() => onSectionChange('interior')}
      >
        内饰展示
      </button>
    </nav>
  );
};

export default Navigation;