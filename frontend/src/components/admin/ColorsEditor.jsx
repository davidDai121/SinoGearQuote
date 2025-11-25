import React, { useState, useEffect } from 'react';
import { getExteriorColors, saveExteriorColors, updateQuote } from '../../services/adminService';

function ColorsEditor({ quoteId, onColorsUpdated }) {
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
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
      // 使用adminService中的服务函数获取报价单数据
      const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
      const quote = quotes.find(q => q.id === quoteId);
      if (quote && quote.colorColumns) {
        setColumns(quote.colorColumns);
      }
    }
  }, [quoteId]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      await loadColors();
    })();
  }, [quoteId]);

  const loadColors = async () => {
    const data = await getExteriorColors(quoteId);
    setColors(Array.isArray(data) ? data : []);
  };

  const handleSelectColor = (colorId) => {
    let newSelected;
    if (selectedColors.includes(colorId)) {
      // 取消选择
      newSelected = selectedColors.filter(id => id !== colorId);
    } else {
      // 选择
      newSelected = [...selectedColors, colorId];
    }
    setSelectedColors(newSelected);
  };

  const handleConfirmAdd = () => {
    // 直接获取并存储选中的外观图片
    if (!quoteId) {
      setMessage('错误：未找到报价单ID！');
      return;
    }
    
    if (selectedColors.length === 0) {
      setMessage('请先选择颜色！');
      return;
    }
    
    try {
      // 获取所有选中颜色的图片信息
      const exteriorImages = [];
      const allColorInfo = [];
      
      selectedColors.forEach(colorId => {
        // 查找颜色信息的多种方式
        let color;
        
        // 首先尝试通过id字段查找
        color = colors.find(c => c.id === colorId);
        
        // 如果找不到，再尝试通过数组索引查找
        if (!color && typeof colorId === 'number' && colorId >= 0 && colorId < colors.length) {
          color = colors[colorId];
        }
        
        // 如果还找不到，再尝试通过字符串索引查找
        if (!color && typeof colorId === 'string') {
          const index = parseInt(colorId);
          if (!isNaN(index) && index >= 0 && index < colors.length) {
            color = colors[index];
          }
        }
        
        // 如果找到颜色且有图片，添加到图片数组
        if (color && color.image) {
          exteriorImages.push({
            name: color.name,
            url: color.image
          });
          allColorInfo.push(color);
        }
      });
      
      if (exteriorImages.length === 0) {
        setMessage('错误：选中的颜色没有有效的图片！');
        return;
      }
      
      // 找到第一个选中的颜色作为主要显示的颜色（保持向后兼容）
      const firstSelectedColor = allColorInfo[0];
      
      // 更新报价单，直接存储外观图片
      const updatedQuote = updateQuote(quoteId, {
        // 向后兼容字段
        color: firstSelectedColor?.name || '',
        colorDetails: firstSelectedColor || null,
        // 新增直接存储的图片信息
        exteriorImages: exteriorImages, // 直接存储外观图片列表
        colorColumns: columns // 存储颜色展示列数
      });
      
      if (!updatedQuote) {
        setMessage('更新报价单失败，请检查报价单ID是否正确！');
        console.error('更新报价单失败，报价单ID:', quoteId);
        return;
      }
      
      setMessage('已成功添加到报价单！');
      if (onColorsUpdated) {
        onColorsUpdated();
      }
    } catch (error) {
      setMessage('添加到报价单时发生错误！');
      console.error('添加颜色到报价单失败:', error);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理图片文件上传 - 压缩图片以避免localStorage空间限制
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      // 使用canvas压缩图片以减少Base64字符串大小
      // 平衡图片质量和存储需求
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 创建图片对象以获取尺寸信息
          const img = new Image();
          img.onload = () => {
            try {
              // 创建canvas进行压缩
              const canvas = document.createElement('canvas');
              
              // 设置合理的最大尺寸，避免超大图片
              const maxWidth = 1200;
              const maxHeight = 1200;
              let width = img.width;
              let height = img.height;
              
              // 计算缩放比例
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
              }
              
              // 设置canvas尺寸
              canvas.width = width;
              canvas.height = height;
              
              // 绘制图片到canvas
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              // 压缩图片，quality参数(0.7-0.8)提供良好的质量/大小平衡
              const quality = 0.75;
              const imageDataUrl = canvas.toDataURL(file.type, quality);
              
              // 检查生成的dataURL大小
              const dataSize = new Blob([imageDataUrl]).size;
              if (dataSize > 2 * 1024 * 1024) { // 如果超过2MB，进一步压缩
                const compressedUrl = canvas.toDataURL(file.type, 0.6);
                setFormData(prev => ({ ...prev, image: compressedUrl }));
              } else {
                setFormData(prev => ({ ...prev, image: imageDataUrl }));
              }
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
    const saveResult = saveExteriorColors(newColors, quoteId);
    
    if (!saveResult) {
      setMessage('保存颜色数据失败！');
      return;
    }
    
    // 更新报价单中的颜色图片信息
    if (quoteId && selectedColors.length > 0) {
      // 获取所有选中颜色的图片信息
      const exteriorImages = [];
      const allColorInfo = [];
      
      selectedColors.forEach(colorId => {
        let color;
        
        // 多种方式查找颜色信息，确保找到对应颜色
        color = newColors.find(c => c.id === colorId);
        
        if (!color && typeof colorId === 'number') {
          // 如果是数字ID，尝试通过索引查找
          if (colorId >= 0 && colorId < newColors.length) {
            color = newColors[colorId];
          }
        }
        
        if (!color && typeof colorId === 'string') {
          // 如果是字符串ID，尝试转换为数字索引
          const numId = parseInt(colorId);
          if (!isNaN(numId) && numId >= 0 && numId < newColors.length) {
            color = newColors[numId];
          }
        }
        
        if (color && color.image) {
          exteriorImages.push({
            name: color.name,
            url: color.image
          });
          allColorInfo.push(color);
        }
      });
      
      // 找到第一个选中的颜色作为主要显示的颜色
      const firstSelectedColor = allColorInfo[0];
      
      // 更新报价单
      const updatedQuote = updateQuote(quoteId, {
        color: firstSelectedColor?.name || '',
        colorDetails: firstSelectedColor || null,
        exteriorImages: exteriorImages,
        colorColumns: columns
      });
      
      if (!updatedQuote) {
        console.warn('更新报价单失败，可能找不到指定的报价单ID');
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
    <div className="editor-container" style={{ width: '100%', display: 'block' }}>
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
      
      {/* 图片展示列数配置 */}
      {quoteId && (
        <div className="columns-config" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h4>图片展示配置</h4>
          <div className="form-group">
            <label>颜色图片显示列数：</label>
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
            <small className="help-text" style={{ display: 'block', marginTop: '5px', color: '#666' }}>设置在客户查看报价单时颜色图片的显示列数</small>
          </div>
          <button 
            onClick={() => {
              updateQuote(quoteId, { colorColumns: columns });
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

      <div className="colors-grid">
          <h3>颜色列表</h3>
          
          {selectedColors.length > 0 && (
            <div className="selection-actions">
              <button 
                onClick={handleConfirmAdd}
                className="btn btn-primary"
              >
                确认添加选中的 {selectedColors.length} 个颜色到报价单
              </button>
            </div>
          )}
          
          <div className="colors-container">
          {colors.map((color, index) => {
              const colorId = color.id || index;
              const isSelected = selectedColors.includes(colorId);
              return (
                <div 
                  key={index} 
                  className={`color-item ${isSelected ? 'selected' : ''}`}
                >
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