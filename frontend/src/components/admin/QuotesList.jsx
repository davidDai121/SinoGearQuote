import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSavedQuotes, saveQuote, duplicateQuote, deleteQuote, clearAllQuotes } from '../../services/adminService';
import { getModels, getExteriorColors } from '../../services/adminService';

function QuotesList() {
  const [quotes, setQuotes] = useState([]);
  const [models, setModels] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quotesData, modelsData, colorsData] = await Promise.all([
        getSavedQuotes(),
        getModels(),
        getExteriorColors()
      ]);
      sortAndFilterQuotes(Array.isArray(quotesData) ? quotesData : []);
      setModels(Array.isArray(modelsData) ? modelsData : []);
      setColors(Array.isArray(colorsData) ? colorsData : []);
    } catch (error) {
      console.error('加载数据失败:', error);
      sortAndFilterQuotes([]);
      setModels([]);
      setColors([]);
    }
  };

  const sortAndFilterQuotes = (allQuotes) => {
    // 先筛选
    let filteredQuotes = allQuotes.filter(quote => 
      ((quote.quoteName) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.color.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // 再排序
    const sortedQuotes = filteredQuotes.sort((a, b) => {
      // 特殊处理quoteName排序
      if (sortField === 'quoteName') {
        const aValue = (a.quoteName) || '';
        const bValue = (b.quoteName) || '';
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
      // 其他字段排序
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setQuotes(sortedQuotes);
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    try {
      const allQuotes = await getSavedQuotes();
      sortAndFilterQuotes(Array.isArray(allQuotes) ? allQuotes : []);
    } catch (error) {
      console.error('搜索数据失败:', error);
      sortAndFilterQuotes([]);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDuplicateQuote = async (id) => {
    try {
      const newQuote = await duplicateQuote(id);
      if (newQuote) {
        loadData();
        setMessage('报价单复制成功！');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('复制报价单失败:', error);
      setMessage('复制报价单失败，请重试！');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteQuote = async (id) => {
    try {
      // 直接删除，不需要确认
      const success = await deleteQuote(id);
      if (success) {
        // 立即重新加载数据以更新列表
        loadData();
        setMessage('报价单删除成功！');
      } else {
        setMessage('删除报价单失败，请刷新页面重试！');
      }
    } catch (error) {
      console.error('删除报价单失败:', error);
      setMessage('删除报价单失败，请重试！');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClearAllQuotes = async () => {
    // 显示确认对话框
    if (window.confirm('确定要删除所有报价单吗？此操作不可恢复！')) {
      try {
        const success = await clearAllQuotes();
        if (success) {
          loadData();
          setMessage('所有报价单已成功删除！');
        } else {
          setMessage('删除所有报价单失败，请刷新页面重试！');
        }
      } catch (error) {
        console.error('清除所有报价单失败:', error);
        setMessage('删除所有报价单失败，请重试！');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateQuote = async () => {
    // 构建新报价单，所有字段都是可选的
    const newQuote = {
      quoteName: quoteName.trim() || 'Unnamed Quote',
      // 兼容旧格式
      model: selectedModel || '未选择',
      color: selectedColor || '未选择',
      modelDetails: selectedModel ? models.find(m => m.name === selectedModel) : null,
      colorDetails: selectedColor ? colors.find(c => c.name === selectedColor) : null,
      // 新格式字段
      selectedModels: selectedModel ? [models.find(m => m.name === selectedModel)] : [],
      selectedExteriorColors: selectedColor ? [colors.find(c => c.name === selectedColor)] : [],
      selectedInteriorItems: []
    };

    try {
      const savedQuote = await saveQuote(newQuote);
      if (savedQuote) {
        await loadData(); // 重新加载数据
        setMessage('报价单创建成功！');
        setQuoteName('');
        setSelectedModel('');
        setSelectedColor('');
      } else {
        setMessage('创建报价单失败，请重试！');
      }
    } catch (error) {
      console.error('创建报价单失败:', error);
      setMessage('创建报价单失败，请重试！');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  // 移除了选择报价单的方法，现在直接通过路由跳转到报价单详情页

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/quote/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="quotes-container">
      <h2>报价单管理</h2>
      
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="create-quote">
        <h3>创建新报价单</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quoteName">报价单名称</label>
            <input
              type="text"
              id="quoteName"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="请输入报价单名称（选填）"
            />
          </div>
          <div className="form-group">
            <label>选择车型（可选）</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">请选择</option>
              {models.map((model, index) => (
                <option key={index} value={model.name}>
                  {model.name} - {model.price}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>选择颜色（可选）</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              <option value="">请选择</option>
              {colors.map((color, index) => (
                <option key={index} value={color.name}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group full-width">
            <p className="helper-text">提示：创建后可以在编辑详情页面添加更多车型、颜色和内饰项目</p>
          </div>
        </div>
        <div className="buttons-container">
          <button 
            className="btn btn-primary"
            onClick={handleCreateQuote}
          >
            创建报价单
          </button>
        </div>
        <div className="buttons-container" style={{marginTop: '0.5rem'}}>
          <button 
            className="btn btn-danger"
            onClick={handleClearAllQuotes}
          >
            清除所有报价单
          </button>
        </div>
      </div>

      <div className="quotes-list">
        <div className="quotes-header">
          <h3>报价单管理</h3>
          <div className="search-bar">
            <input
                type="text"
                className="search-input"
                placeholder="搜索报价单（报价单名称、车型或颜色）..."
                value={searchTerm}
                onChange={handleSearch}
              />
          </div>
        </div>
        
        <div className="quotes-summary">
          <span>共 {quotes.length} 个报价单</span>
        </div>
        
        {quotes.length === 0 ? (
          <p className="no-data">暂无报价单</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('quoteName')} className="sortable">
                    报价单名称 {sortField === 'quoteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('model')} className="sortable">
                    车型 {sortField === 'model' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('color')} className="sortable">
                    颜色 {sortField === 'color' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="sortable">
                    创建时间 {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
          {quotes.map((quote, index) => (
            <tr key={`${(quote._id || quote.id)}-${index}`}>
              <td>{quote.quoteName || '未命名报价单'}</td>
              <td>{quote.model}</td>
              <td>{quote.color}</td>
              <td>{formatDate(quote.createdAt)}</td>
              <td className="action-buttons">
                    <Link 
                      to={`/quote/${(quote._id || quote.id)}`} 
                      target="_blank"
                      className="btn btn-sm btn-view"
                      title="预览报价单"
                    >
                      预览
                    </Link>
                    <Link 
                      to={`/quote-pro/${(quote._id || quote.id)}`} 
                      target="_blank"
                      className="btn btn-sm btn-view"
                      title="新版预览"
                    >
                      新版预览
                    </Link>
                    <Link 
                      to={`/admin/quotes/${(quote._id || quote.id)}`} 
                      className="btn btn-sm btn-edit"
                      title="编辑报价单详情"
                    >
                      编辑详情
                    </Link>
                    <button 
                      className={`btn btn-sm btn-copy ${copiedId === quote.id ? 'copied' : ''}`}
                      onClick={() => handleCopyLink(quote._id || quote.id)}
                      title="复制访问链接"
                    >
                      {copiedId === (quote._id || quote.id) ? '已复制' : '复制链接'}
                    </button>
                    <button 
                      className="btn btn-sm btn-duplicate"
                      onClick={() => handleDuplicateQuote(quote._id || quote.id)}
                      title="复制报价单"
                    >
                      复制
                    </button>
                    <button 
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDeleteQuote(quote._id || quote.id)}
                      title="删除报价单"
                    >
                      删除
                    </button>
               </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuotesList;