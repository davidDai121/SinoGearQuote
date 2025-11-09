import React, { useState, useEffect } from 'react';
import { getExteriorColors, saveExteriorColors, getSelectedExteriorColors, saveSelectedExteriorColors, updateQuote } from '../../services/adminService';

function ColorsEditor({ quoteId, onColorsUpdated }) {
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [tempSelectedColors, setTempSelectedColors] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadColors();
    if (quoteId) {
      loadSelectedColors();
    }
  }, [quoteId]);

  const loadColors = () => {
    const data = getExteriorColors(quoteId);
    setColors(data);
  };

  const loadSelectedColors = () => {
    const selected = getSelectedExteriorColors(quoteId);
    setSelectedColors(selected);
    setTempSelectedColors([...selected]);
  };

  const handleSelectColor = (colorId) => {
    let newTempSelected;
    if (tempSelectedColors.includes(colorId)) {
      // 取消选择
      newTempSelected = tempSelectedColors.filter(id => id !== colorId);
    } else {
      // 选择
      newTempSelected = [...tempSelectedColors, colorId];
    }
    setTempSelectedColors(newTempSelected);
  };

  const handleConfirmAdd = () => {
    setSelectedColors([...tempSelectedColors]);
    saveSelectedExteriorColors(tempSelectedColors, quoteId);
    
    // 更新报价单对象中的颜色信息
    if (quoteId && tempSelectedColors.length > 0) {
      // 获取所有选中的颜色详细信息
      const allSelectedColors = tempSelectedColors.map(colorId => {
        const color = colors.find(c => c.id === colorId) || colors[colorId];
        return color || null;
      }).filter(Boolean); // 过滤掉可能的null值
      
      // 找到第一个选中的颜色作为主要显示的颜色
      const firstSelectedColor = allSelectedColors[0];
      
      if (firstSelectedColor) {
        // 更新报价单，包含：
        // 1. 主要显示的color和colorDetails（向后兼容）
        // 2. 所有选中的颜色列表selectedColors
        updateQuote(quoteId, {
          color: firstSelectedColor.name,
          colorDetails: firstSelectedColor,
          selectedColors: allSelectedColors // 存储所有选中的颜色
        });
      }
    }
    
    setMessage('已成功添加到报价单！');
    if (onColorsUpdated) {
      onColorsUpdated();
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancelSelection = () => {
    setTempSelectedColors([...selectedColors]);
    setMessage('已取消当前选择！');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理图片文件上传
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));
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
    setFormData(colors[index]);
  };

  const handleDelete = (index) => {
    if (window.confirm('确定要删除这个颜色吗？')) {
      const colorId = colors[index].id || index;
      const newColors = [...colors];
      newColors.splice(index, 1);
      setColors(newColors);
      saveExteriorColors(newColors, quoteId);
      
      // 同时从已选择列表中移除
      const newSelected = selectedColors.filter(id => id !== colorId);
      setSelectedColors(newSelected);
      saveSelectedExteriorColors(newSelected, quoteId);
      
      setMessage('删除成功！');
      if (onColorsUpdated) {
        onColorsUpdated();
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setMessage('请填写颜色名称！');
      return;
    }

    let newColors;
    if (editingIndex >= 0) {
      // 编辑现有颜色
      newColors = [...colors];
      newColors[editingIndex] = { ...formData };
    } else {
      // 添加新颜色
      const newId = colors.length > 0 
        ? Math.max(...colors.map(c => c.id || 0)) + 1 
        : 1;
      newColors = [...colors, { ...formData, id: newId }];
    }

    setColors(newColors);
    saveExteriorColors(newColors, quoteId);
    
    // 更新报价单对象中的colorDetails（如果该颜色是选中的）
    if (quoteId) {
      const updatedColor = editingIndex >= 0 ? newColors[editingIndex] : newColors[newColors.length - 1];
      const isSelected = tempSelectedColors.includes(updatedColor.id);
      
      if (isSelected) {
        updateQuote(quoteId, {
          color: updatedColor.name,
          colorDetails: updatedColor
        });
      }
    }
    
    setMessage(editingIndex >= 0 ? '更新成功！' : '添加成功！');
    if (onColorsUpdated) {
      onColorsUpdated();
    }
    setEditingIndex(-1);
    setFormData({
      name: '',
      image: ''
    });
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="editor-container">
      <h2>外观颜色管理</h2>
      {quoteId && <div className="quote-info">当前编辑报价单ID: {quoteId}</div>}
      
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-row">
          <div className="form-group">
            <label>颜色名称 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="例如：BLACK"
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
              onClick={() => document.getElementById('color-image-upload').click()}
            >
              <input
                type="file"
                id="color-image-upload"
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
        </div>
      </form>

      <div className="colors-grid">
        <h3>颜色列表</h3>
        
        {tempSelectedColors.length > 0 && (
          <div className="selection-actions">
            <button 
              onClick={handleConfirmAdd}
              className="btn btn-primary"
            >
              确认添加选中的 {tempSelectedColors.length} 个颜色到报价单
            </button>
            <button 
              onClick={handleCancelSelection}
              className="btn btn-secondary"
            >
              取消选择
            </button>
          </div>
        )}
        
        <div className="colors-container">
          {colors.map((color, index) => {
            const colorId = color.id || index;
            const isSelected = tempSelectedColors.includes(colorId);
            return (
              <div key={index} className={`color-item ${isSelected ? 'selected' : ''}`}>
                <div className="selection-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectColor(colorId)}
                    className="select-checkbox"
                  />
                </div>
                <div className="color-preview">
                  <img src={color.image} alt={color.name} />
                </div>
                <div className="color-info">
                  <span className="color-name">{color.name}</span>
                  <div className="color-actions">
                    <button 
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(index)}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(index)}
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

export default ColorsEditor;