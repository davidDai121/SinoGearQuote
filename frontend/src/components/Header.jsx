import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <img src="/images/logo.png" alt="SinoGear Logo" className="logo" />
      </div>
      <div className="company-info">
        <h1>SINO GEAR POWER TECHNOLOGY CO., LTD</h1>
        <p>ROOM 1317, OFFICE FLOOR, BUILDING 1,<br />HUANMAO CENTER, HEFEI CITY,<br />ANHUI PROVINCE</p>
      </div>
    </header>
  );
};

export default Header;