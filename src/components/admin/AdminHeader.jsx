import React from 'react';
import { Link } from 'react-router-dom';

function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="header-content">
        <h1>管理后台</h1>
        <Link to="/" className="logo-link">
          <img src="/images/logo.png" alt="Logo" className="logo" />
        </Link>
      </div>
    </header>
  );
}

export default AdminHeader;