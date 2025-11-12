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

  // 辅助函数：更新报价单中的内饰图片信息
  const updateQuoteWithInteriorImages = (itemsToUse = interiorItems) => {
    try {
      // 获取所有选中内饰的图片信息
      const interiorImages = [];
      const allInteriorInfo = [];
      
      tempSelectedItems.forEach(itemId => {
        const item = itemsToUse.find(i => i.id === itemId);
        
        // 如果找到内饰且有图片，添加到图片数组
        if (item && item.image) {
          interiorImages.push({
            name: item.name,
            url: item.image
          });
          allInteriorInfo.push(item);
        }
      });
      
      if (interiorImages.length === 0) {
        console.warn('选中的内饰项没有有效的图片信息');
        return false;
      }
      
      // 找到第一个选中的内饰作为主要显示的内饰（保持向后兼容）
      const firstSelectedItem = allInteriorInfo[0];
      
      // 更新报价单，直接存储内饰图片
      const updatedQuote = updateQuote(quoteId, {
        // 向后兼容字段
        interior: firstSelectedItem?.name || '',
        interiorDetails: firstSelectedItem || null,
        // 新增直接存储的图片信息
        interiorImages: interiorImages, // 直接存储内饰图片列表
        interiorColumns: columns // 存储内饰展示列数
      });
      
      return updatedQuote !== null;
    } catch (error) {
      console.error('更新报价单内饰图片失败:', error);
      return false;
    }
  };

  const handleConfirmAdd = () => {
    // 直接获取并存储选中的内饰图片
    if (!quoteId) {
      setMessage('错误：未找到报价单ID！');
      return;
    }
    
    if (tempSelectedItems.length === 0) {
      setMessage('请先选择内饰项！');
      return;
    }
    
    try {
      const updateResult = updateQuoteWithInteriorImages();
      
      if (!updateResult) {
        setMessage('更新报价单失败，请检查选中的内饰项！');
        return;
      }
      
      // 更新状态
      setSelectedItems([...tempSelectedItems]);
      // 仍然保存selectedItems以保持UI一致性，但主要逻辑已改为直接存储图片
      
      setMessage('已成功添加到报价单！');
      if (onInteriorUpdated) {
        onInteriorUpdated();
      }
    } catch (error) {
      setMessage('添加到报价单时发生错误！');
      console.error('添加内饰到报价单失败:', error);
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
  
  // 处理图片文件上传 - 保持高质量图片，仅进行必要的尺寸调整
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      // 记录文件信息
      console.log(`Uploading image: ${file.name}, size: ${Math.round(file.size / 1024)}KB`);
      
      // 首先检查文件大小，如果非常小（小于500KB），直接使用原始数据
      if (file.size < 500 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, image: e.target.result }));
          console.log('Small image used without compression for best quality');
        };
        reader.readAsDataURL(file);
        return;
      }
      
      // 对于较大文件，保持高质量的同时进行最小化处理
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 创建图片对象以获取尺寸信息
          const img = new Image();
          img.onload = () => {
            try {
              // 创建canvas进行处理
              const canvas = document.createElement('canvas');
              
              // 设置更高的最大尺寸，保持更好的质量
              const maxWidth = 1600; // 提高最大宽度以保持清晰度
              const maxHeight = 1600; // 提高最大高度以保持清晰度
              let width = img.width;
              let height = img.height;
              
              // 仅在图片尺寸过大时才进行缩放
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
                console.log(`Image resized from ${img.width}x${img.height} to ${width}x${height}`);
              }
              
              // 设置canvas尺寸
              canvas.width = width;
              canvas.height = height;
              
              // 绘制图片到canvas，保持高质量
              const ctx = canvas.getContext('2d');
              // 使用高质量渲染设置
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high'; // 使用高质量平滑
              ctx.drawImage(img, 0, 0, width, height);
              
              // 使用更高的质量参数，保持图片清晰度
              const quality = 0.9; // 提高质量参数至0.9
              const imageDataUrl = canvas.toDataURL(file.type, quality);
              
              // 记录处理后的大小但不再进一步压缩
              const dataSize = new Blob([imageDataUrl]).size;
              console.log(`Processed image size: ${Math.round(dataSize / 1024)}KB (quality: 0.9)`);
              
              // 直接使用高质量图片数据，不再根据大小进一步压缩
              setFormData(prev => ({ ...prev, image: imageDataUrl }));
            } catch (canvasError) {
              console.error('图片压缩失败:', canvasError);
              // 压缩失败时，回退到使用原始图片数据
              setFormData(prev => ({ ...prev, image: e.target.result }));
            }
          };
          img.onerror = (err) => {
            console.error('图片加载失败:', err);
            // 图片加载失败时，使用原始数据
            setFormData(prev => ({ ...prev, image: e.target.result }));
          };
          img.src = e.target.result;
        } catch (error) {
          console.error('图片处理过程中发生错误:', error);
          // 发生任何错误时，使用原始数据
          setFormData(prev => ({ ...prev, image: e.target.result }));
        }
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
      // 保存更新后的选中列表以保持UI一致性
      
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
    const saveResult = saveInteriorItems(newItems, quoteId);
    
    if (!saveResult) {
      setMessage('保存内饰数据失败！');
      return;
    }
    
    // 如果当前有选中的内饰项且存在报价单，自动更新报价单中的内饰图片信息
    if (quoteId && tempSelectedItems.length > 0) {
      updateQuoteWithInteriorImages(newItems);
    }
    
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