import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import {} from '../../services/adminService';
import '../../assets/styles/admin.css';

function AdminApp() {
  const location = useLocation();

  // 移除测试数据初始化代码

  // 检查当前是否在报价详情页面
  const isQuoteDetailPage = location.pathname.includes('/admin/quotes/');

  return (
    <div className="admin-app">
      <AdminHeader />
      
      <div className="admin-container">
        <nav className="admin-sidebar">
          <ul>
            <li 
              className={!isQuoteDetailPage ? 'active' : ''}
            >
              <Link to="/admin/quotes">报价单列表</Link>
            </li>
          </ul>
          
          <div className="sidebar-footer">
            <Link to="/" className="view-client-link">
              查看客户端页面
            </Link>
          </div>
        </nav>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminApp;