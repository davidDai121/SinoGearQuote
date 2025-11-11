import React, { useState, useEffect } from 'react';
import { getInteriorItems, saveInteriorItems, getSelectedInteriorItems, saveSelectedInteriorItems, updateQuote } from '../../services/adminService';

function InteriorEditor({ quoteId, onInteriorUpdated }) {
  const [interiorItems, setInteriorItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tempSelectedItems, setTempSelectedItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  });
  
  // 图片展示列数设置
  const [columns, setColumns] = useState(2); // 默认2列
  
  useEffect(() => {
    // 从报价单中加载列数配置
    if (quoteId) {
      const quote = localStorage.getItem(`quote_${quoteId}`);
      if (quote) {
        const quoteData = JSON.parse(quote);
        if (quoteData.interiorColumns) {
          setColumns(quoteData.interiorColumns);
        }
      }
    }
  }, [quoteId]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInteriorItems();
    if (quoteId) {
      loadSelectedItems();
    }
  }, [quoteId]);

  const loadInteriorItems = () => {
    const data = getInteriorItems(quoteId);
    setInteriorItems(data);
  };

  const loadSelectedItems = () => {
    const selected = getSelectedInteriorItems(quoteId);
    setSelectedItems(selected);
    setTempSelectedItems([...selected]);
  };

  const handleSelectItem = (itemId) => {
    let newTempSelected;
    if (tempSelectedItems.includes(itemId)) {
      // 取消选择
      newTempSelected = tempSelectedItems.filter(id => id !== itemId);
    } else {
      // 选择
      newTempSelected = [...tempSelectedItems, itemId];
    }
    setTempSelectedItems(newTempSelected);
  };

  const handleConfirmAdd = () => {
    setSelectedItems([...tempSelectedItems]);
    saveSelectedInteriorItems(tempSelectedItems, quoteId);
    
    // 更新报价单对象中的内饰信息
    if (quoteId && tempSelectedItems.length > 0) {
      // 获取所有选中的内饰详细信息
      const allSelectedItems = tempSelectedItems.map(itemId => {
        const item = interiorItems.find(i => i.id === itemId);
        return item || null;
      }).filter(Boolean); // 过滤掉可能的null值
      
      // 找到第一个选中的内饰作为主要显示的内饰
      const firstSelectedItem = allSelectedItems[0];
      
      if (firstSelectedItem) {
        // 更新报价单，包含：
        // 1. 主要显示的interior和interiorDetails（如果需要）
        // 2. 所有选中的内饰列表selectedInteriorItems
        // 3. 内饰展示列数配置
        updateQuote(quoteId, {
          interior: firstSelectedItem.name,
          interiorDetails: firstSelectedItem,
          selectedInteriorItems: allSelectedItems, // 存储所有选中的内饰
          interiorColumns: columns // 存储内饰展示列数
        });
      }
    }
    
    setMessage('已成功添加到报价单！');
    if (onInteriorUpdated) {
      onInteriorUpdated();
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancelSelection = () => {
    setTempSelectedItems([...selectedItems]);
    setMessage('已取消当前选择！');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理图片文件上传 - 优化图片质量
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      // 使用Blob直接读取，避免Base64编码的潜在质量损失
      const reader = new FileReader();
      reader.onload = (e) => {
        // 确保以二进制字符串形式读取，然后创建Blob URL
        const imageDataUrl = e.target.result;
        
        // 为了保持最高质量，直接使用读取的dataURL
        // 如果将来需要，可以在这里添加图片处理逻辑（如调整大小但保持质量）
        setFormData(prev => ({ ...prev, image: imageDataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 处理拖拽上传
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.add('drag-over');
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('drag-over');
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('drag-over');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };
  
  // 处理文件选择
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleAdd = () => {
    setEditingIndex(-1);
    setFormData({
      name: '',
      image: ''
    });
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(interiorItems[index]);
  };

  const handleRemoveItem = (index) => {
    if (window.confirm('确定要删除这个内饰项吗？')) {
      const itemId = interiorItems[index].id;
      const newItems = [...interiorItems];
      newItems.splice(index, 1);
      setInteriorItems(newItems);
      saveInteriorItems(newItems, quoteId);
      
      // 同时从已选择列表中移除
      const newSelected = selectedItems.filter(id => id !== itemId);
      setSelectedItems(newSelected);
      saveSelectedInteriorItems(newSelected, quoteId);
      
      setMessage('删除成功！');
      if (onInteriorUpdated) {
        onInteriorUpdated();
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image) {
      setMessage('请填写必填字段！');
      return;
    }

    let newItems;
    if (editingIndex >= 0) {
      // 编辑现有内饰项
      newItems = [...interiorItems];
      newItems[editingIndex] = { 
        ...formData,
        id: newItems[editingIndex].id // 保留原ID
      };
    } else {
      // 添加新内饰项
      const newId = interiorItems.length > 0 
        ? Math.max(...interiorItems.map(item => item.id)) + 1 
        : 1;
      newItems = [...interiorItems, { 
        ...formData,
        id: newId
      }];
    }

    setInteriorItems(newItems);
    saveInteriorItems(newItems, quoteId);
    setMessage(editingIndex >= 0 ? '更新成功！' : '添加成功！');
    if (onInteriorUpdated) {
      onInteriorUpdated();
    }
    setEditingIndex(-1);
    setFormData({ name: '', image: '' });
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    if (window.confirm('确定要重置为默认内饰项吗？')) {
      // 不传递quoteId时会返回默认内饰项
      const defaultItems = getInteriorItems();
      setInteriorItems(defaultItems);
      saveInteriorItems(defaultItems, quoteId);
      setMessage('重置成功！');
      if (onInteriorUpdated) {
        onInteriorUpdated();
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="editor-container">
      <h2>内饰管理</h2>
      {quoteId && <div className="quote-info">当前编辑报价单ID: {quoteId}</div>}
      
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-row">
          <div className="form-group">
            <label>内饰名称 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="例如：内饰1"
              required
            />
          </div>
          <div className="form-group">
            <label>上传图片 *</label>
            <div 
              className="image-upload-container"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('interior-image-upload').click()}
            >
              <input
                type="file"
                id="interior-image-upload"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {formData.image ? (
                <div className="image-preview">
                  <img src={formData.image} alt="预览" />
                  <button 
                    type="button" 
                    className="btn btn-sm btn-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                  >
                    移除
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <p>拖拽图片到这里或点击上传</p>
                  <p className="upload-hint">支持 JPG, PNG, GIF 等格式</p>
                </div>
              )}
            </div>
            <small className="help-text">图片将以Base64格式存储</small>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingIndex >= 0 ? '更新' : '添加'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              setEditingIndex(-1);
              setFormData({ name: '', image: '' });
            }}
          >
            取消
          </button>
          <button 
            type="button" 
            className="btn btn-warning"
            onClick={handleReset}
          >
            重置为默认
          </button>
        </div>
      </form>
      
      {/* 图片展示列数配置 */}
      {quoteId && (
        <div className="columns-config" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h4>图片展示配置</h4>
          <div className="form-group">
            <label>内饰图片显示列数：</label>
            <select 
              value={columns} 
              onChange={(e) => setColumns(parseInt(e.target.value))}
              className="form-control"
              style={{ maxWidth: '150px' }}
            >
              <option value="1">1列</option>
              <option value="2">2列</option>
              <option value="3">3列</option>
              <option value="4">4列</option>
              <option value="5">5列</option>
            </select>
            <small className="help-text" style={{ display: 'block', marginTop: '5px', color: '#666' }}>设置在客户查看报价单时内饰图片的显示列数</small>
          </div>
          <button 
            onClick={() => {
              updateQuote(quoteId, { interiorColumns: columns });
              setMessage('列数配置已保存！');
              setTimeout(() => setMessage(''), 3000);
            }}
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
          >
            保存列数配置
          </button>
        </div>
      )}

      <div className="interior-items">
        <h3>内饰项列表</h3>
        
        {tempSelectedItems.length > 0 && (
          <div className="selection-actions">
            <button 
              onClick={handleConfirmAdd}
              className="btn btn-primary"
            >
              确认添加选中的 {tempSelectedItems.length} 个内饰项到报价单
            </button>
            <button 
              onClick={handleCancelSelection}
              className="btn btn-secondary"
            >
              取消选择
            </button>
          </div>
        )}
        
        <div className="interior-grid">
          {interiorItems.map((item, index) => {
            const isSelected = tempSelectedItems.includes(item.id);
            return (
              <div key={index} className={`interior-item ${isSelected ? 'selected' : ''}`}>
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                    className="select-checkbox"
                  />
                </div>
                <div className="interior-preview">
                  <img src={item.image} alt={item.name} onError={(e) => {
                    e.target.src = '/images/placeholder.png';
                    e.target.alt = '图片加载失败';
                  }} />
                </div>
                <div className="interior-info">
                  <span className="interior-name">{item.name}</span>
                  <div className="interior-actions">
                    <button 
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(index)}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-sm btn-delete"
                      onClick={() => handleRemoveItem(index)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InteriorEditor;