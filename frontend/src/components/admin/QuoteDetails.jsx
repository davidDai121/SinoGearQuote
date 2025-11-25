import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import ModelsEditor from './ModelsEditor';
import ColorsEditor from './ColorsEditor';
import InteriorEditor from './InteriorEditor';
import FooterEditor from './FooterEditor';
import { getQuoteById, updateQuote } from '../../services/adminService';

function QuoteDetails({ section }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [quote, setQuote] = useState(null);
  
  // 获取当前报价单信息
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const fetchedQuote = await getQuoteById(id);
        setQuote(fetchedQuote);
        if (fetchedQuote && fetchedQuote.name) {
          setQuoteName(fetchedQuote.name);
        }
      } catch (error) {
        console.error('获取报价单失败:', error);
      }
    };
    
    fetchQuote();
  }, [id]);
  
  // 处理报价单名称更新
  const handleUpdateQuoteName = async () => {
    if (quoteName.trim()) {
      try {
        const updatedQuote = await updateQuote(id, { name: quoteName.trim() });
        if (updatedQuote) {
          setMessage('报价单名称已更新！');
          setIsEditingName(false);
        } else {
          setMessage('更新失败，请重试！');
        }
      } catch (error) {
        console.error('更新报价单名称失败:', error);
        setMessage('更新失败，请重试！');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
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
  const handleFooterUpdated = () => {
    setMessage('页脚数据已更新！');
    setTimeout(() => setMessage(''), 3000);
  };
  
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
  
  const getCurrentSection = () => {
    if (section) return section;
    const parts = location.pathname.split('/');
    return parts[parts.length - 1];
  };
  const currentSection = getCurrentSection();
  
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
                setQuoteName(quote.name);
              }} className="btn btn-sm btn-secondary">取消</button>
            </div>
          ) : (
            <span className="quote-name">
              名称: {quote.name || '未命名报价单'}
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
      
      <div className="quote-navigation">
        <Link 
          to={`/admin/quotes/${id}/price`}
          className={`config-nav-item ${currentSection === 'price' ? 'active' : ''}`}
        >
          价格管理
        </Link>
        <Link 
          to={`/admin/quotes/${id}/exterior`}
          className={`config-nav-item ${currentSection === 'exterior' ? 'active' : ''}`}
        >
          外观图片管理
        </Link>
        <Link 
          to={`/admin/quotes/${id}/interior`}
          className={`config-nav-item ${currentSection === 'interior' ? 'active' : ''}`}
        >
          内饰图片管理
        </Link>
      </div>

      <div className="admin-editors">
        <Outlet />
      </div>
      
      {/* 编辑器内容区域通过 <Outlet /> 渲染 */}
    </div>
  );
}

export default QuoteDetails;