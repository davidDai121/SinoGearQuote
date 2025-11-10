import React, { useState } from 'react';
import { Link, useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import ModelsEditor from './ModelsEditor';
import ColorsEditor from './ColorsEditor';
import InteriorEditor from './InteriorEditor';
import { getQuoteById, updateQuote } from '../../services/adminService';

function QuoteDetails({ section }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  // 获取当前报价单信息
  const quote = getQuoteById(id);
  
  // 初始化报价单名称
  React.useEffect(() => {
    if (quote) {
      setQuoteName(quote.quoteName || quote.customerName);
    }
  }, [quote]);
  
  // 处理报价单名称更新
  const handleUpdateQuoteName = () => {
    if (quoteName.trim()) {
      const updatedQuote = updateQuote(id, { quoteName: quoteName.trim() });
      if (updatedQuote) {
        setMessage('报价单名称已更新！');
        setIsEditingName(false);
      } else {
        setMessage('更新失败，请重试！');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  // 处理各编辑器的数据更新
  const handleModelsUpdated = () => {
    setMessage('车型数据已更新！');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleColorsUpdated = () => {
    setMessage('颜色数据已更新！');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleInteriorUpdated = () => {
    setMessage('内饰数据已更新！');
    setTimeout(() => setMessage(''), 3000);
  };
  
  // 从路由路径中解析当前section
  const getCurrentSection = () => {
    if (section) return section;
    const pathParts = location.pathname.split('/');
    return pathParts[pathParts.length - 1];
  };
  
  const currentSection = getCurrentSection();
  
  // 如果找不到报价单，显示错误信息
  if (!quote) {
    return (
      <div className="quote-details-error">
        <h2>报价单不存在</h2>
        <p>找不到ID为 {id} 的报价单</p>
        <Link to="/admin/quotes" className="btn btn-primary">返回报价单列表</Link>
      </div>
    );
  }
  
  // 渲染配置编辑器
  const renderEditor = () => {
    if (location.pathname.endsWith(`/quotes/${id}`)) {
      return <Outlet />;
    }
    
    switch (currentSection) {
      case 'models':
        return (
          <ModelsEditor 
            quoteId={id} 
            onModelsUpdated={handleModelsUpdated} 
          />
        );
      case 'colors':
        return (
          <ColorsEditor 
            quoteId={id} 
            onColorsUpdated={handleColorsUpdated} 
          />
        );
      case 'interior':
        return (
          <InteriorEditor 
            quoteId={id} 
            onInteriorUpdated={handleInteriorUpdated} 
          />
        );
      default:
        return <Outlet />;
    }
  };
  
  return (
    <div className="quote-details">
      {/* 报价单信息和导航 */}
      <div className="quote-header">
        <div className="quote-info">
        <h2>编辑报价单</h2>
        <div className="quote-meta">
          {isEditingName ? (
            <div className="quote-name-edit">
              <input
                type="text"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
                className="quote-name-input"
                placeholder="输入报价单名称"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateQuoteName()}
              />
              <button onClick={handleUpdateQuoteName} className="btn btn-sm btn-primary">保存</button>
              <button onClick={() => {
                setIsEditingName(false);
                setQuoteName(quote.quoteName || quote.customerName);
              }} className="btn btn-sm btn-secondary">取消</button>
            </div>
          ) : (
            <span className="quote-name">
              名称: {quote.quoteName || quote.customerName}
              <button onClick={() => setIsEditingName(true)} className="btn-edit-name">
                <span role="img" aria-label="编辑">✏️</span>
              </button>
            </span>
          )}
          <span className="quote-id">ID: {id}</span>
        </div>
      </div>
        
        <Link to="/admin/quotes" className="btn btn-secondary">
          返回报价单列表
        </Link>
      </div>
      
      {message && (
        <div className={`message ${message.includes('更新') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      {/* 配置项导航 */}
      <div className="quote-navigation">
        <Link 
          to={`/admin/quotes/${id}/models`}
          className={`config-nav-item ${currentSection === 'models' ? 'active' : ''}`}
        >
          车辆型号管理
        </Link>
        <Link 
          to={`/admin/quotes/${id}/colors`}
          className={`config-nav-item ${currentSection === 'colors' ? 'active' : ''}`}
        >
          外观颜色管理
        </Link>
        <Link 
          to={`/admin/quotes/${id}/interior`}
          className={`config-nav-item ${currentSection === 'interior' ? 'active' : ''}`}
        >
          内饰管理
        </Link>
      </div>
      
      {/* 编辑器内容区域 */}
      <div className="quote-editor-content">
        {renderEditor()}
      </div>
    </div>
  );
}

export default QuoteDetails;