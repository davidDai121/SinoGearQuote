import React, { useState } from 'react';
import { getModels, getExteriorColors, getInteriorItems } from './services/adminService';
import Header from './components/Header';
import TitleSection from './components/TitleSection';
import Navigation from './components/Navigation';
import ModelsSection from './components/ModelsSection';
import ExteriorSection from './components/ExteriorSection';
import InteriorSection from './components/InteriorSection';
import AttentionSection from './components/AttentionSection';
import './assets/styles/main.css';

function App() {
  const [activeSection, setActiveSection] = useState('models');
  
  // 从服务中获取数据
  const vehicleModels = getModels();
  const exteriorColors = getExteriorColors();
  const interiorItems = getInteriorItems();

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="app">
      <Header />
      <TitleSection />
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange} 
      />
      
      <main className="content">
        {activeSection === 'models' && (
          <ModelsSection models={vehicleModels} />
        )}

        {activeSection === 'exterior' && (
          <ExteriorSection colors={exteriorColors} />
        )}

        {activeSection === 'interior' && (
          <InteriorSection interiorItems={interiorItems} />
        )}
      </main>

      <AttentionSection />
    </div>
  );
}

export default App;