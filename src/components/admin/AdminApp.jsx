import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import { saveQuote, getModels, getExteriorColors } from '../../services/adminService';
import '../../assets/styles/admin.css';

function AdminApp() {
  const location = useLocation();

  // 初始化时创建一个测试报价单
  useEffect(() => {
    initializeTestQuote();
  }, []);

  const initializeTestQuote = () => {
    // 获取现有数据
    const models = getModels();
    const colors = getExteriorColors();
    
    // 创建测试报价单
    if (models.length > 0 && colors.length > 0) {
      const testQuote = {
        customerName: '测试客户',
        model: models[0].name,
        color: colors[0].name,
        modelDetails: models[0],
        colorDetails: colors[0]
      };
      // 保存测试报价单
      saveQuote(testQuote);
    }
  };

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