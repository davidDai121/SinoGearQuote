import React, { useState, useEffect } from 'react';
import { getQuoteById, updateQuote } from '../../services/adminService';

function FooterEditor({ quoteId, onFooterUpdated }) {
  const [footerText, setFooterText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [tempFooterText, setTempFooterText] = useState('');

  // 初始化页脚内容
  useEffect(() => {
    if (quoteId) {
      const quote = getQuoteById(quoteId);
      if (quote && quote.footerText) {
        setFooterText(quote.footerText);
        setTempFooterText(quote.footerText);
      } else {
        // 设置默认页脚文本
        const defaultFooter = '感谢您选择我们的产品和服务。如有任何疑问，请随时联系我们的销售团队。';
        setFooterText(defaultFooter);
        setTempFooterText(defaultFooter);
      }
    }
  }, [quoteId]);

  // 处理保存页脚内容
  const handleSaveFooter = () => {
    if (tempFooterText.trim()) {
      const updatedQuote = updateQuote(quoteId, { footerText: tempFooterText.trim() });
      if (updatedQuote) {
        setFooterText(tempFooterText.trim());
        setIsEditing(false);
        setMessage('页脚内容已更新！');
        if (onFooterUpdated) {
          onFooterUpdated();
        }
      } else {
        setMessage('更新失败，请重试！');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setTempFooterText(footerText);
    setIsEditing(false);
  };

  return (
    <div className="editor-container">
      <h2>页脚管理</h2>
      {quoteId && <div className="quote-info">当前编辑报价单ID: {quoteId}</div>}
      
      {message && (
        <div className={`message ${message.includes('已更新') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="footer-editor">
        <h3>页脚内容设置</h3>
        <p className="info-text">设置在客户查看报价单时显示的页脚文本内容。</p>
        
        {isEditing ? (
          <div className="footer-edit-container">
            <textarea
              value={tempFooterText}
              onChange={(e) => setTempFooterText(e.target.value)}
              className="footer-textarea"
              placeholder="输入页脚文本内容..."
              rows={6}
              autoFocus
              style={{ whiteSpace: 'pre-wrap', textAlign: 'left', width: '100%' }}
            />
            <div className="form-actions">
              <button 
                onClick={handleSaveFooter} 
                className="btn btn-primary"
              >
                保存
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="btn btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="footer-display">
            <div className="footer-content-preview">
              <p>{footerText || '暂无页脚内容'}</p>
            </div>
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-primary"
            >
              编辑页脚内容
            </button>
          </div>
        )}
        
        <div className="footer-help">
          <h4>使用提示：</h4>
          <ul>
            <li>页脚内容将显示在报价单的底部</li>
            <li>建议添加联系信息、公司简介或感谢词</li>
            <li>支持多行文本格式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FooterEditor;