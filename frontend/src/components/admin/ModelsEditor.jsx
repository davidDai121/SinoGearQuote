import React, { useState, useEffect } from 'react';
import { getModels, saveModels, getSelectedModels, saveSelectedModels, updateQuote } from '../../services/adminService';

function ModelsEditor({ quoteId, onModelsUpdated }) {
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [tempSelectedModels, setTempSelectedModels] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    energy: '',
    battery: '',
    cltc: '',
    prices: [{ type: '标准价格', amount: '' }]
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      await loadModels();
      if (quoteId) {
        await loadSelectedModels();
      }
    })();
  }, [quoteId]);

  const loadModels = async () => {
    const data = await getModels(quoteId);
    setModels(Array.isArray(data) ? data : []);
  };

  const loadSelectedModels = async () => {
    const selected = await getSelectedModels(quoteId);
    setSelectedModels(Array.isArray(selected) ? selected : []);
    setTempSelectedModels(Array.isArray(selected) ? [...selected] : []);
  };

  const handleSelectModel = (modelId) => {
    let newTempSelected;
    if (tempSelectedModels.includes(modelId)) {
      // 取消选择
      newTempSelected = tempSelectedModels.filter(id => id !== modelId);
    } else {
      // 选择
      newTempSelected = [...tempSelectedModels, modelId];
    }
    setTempSelectedModels(newTempSelected);
  };

  const handleConfirmAdd = () => {
    setSelectedModels([...tempSelectedModels]);
    saveSelectedModels(tempSelectedModels, quoteId);
    
    // 更新报价单对象中的车型信息
    if (quoteId && tempSelectedModels.length > 0) {
      // 获取所有选中的车型详细信息
      const allSelectedModels = tempSelectedModels.map(modelId => {
        const safeModels = models || [];
        const model = safeModels.find(m => m.id === modelId) || safeModels[modelId];
        return model ? {
          ...model,
          price: model.prices?.[0]?.amount || model.price // 保持向后兼容性
        } : null;
      }).filter(Boolean); // 过滤掉可能的null值
      
      // 找到第一个选中的车型作为主要显示的车型
      const firstSelectedModel = allSelectedModels[0];
      
      if (firstSelectedModel) {
        // 更新报价单，包含：
        // 1. 主要显示的model和modelDetails（向后兼容）
        // 2. 所有选中的车型列表selectedModels
        updateQuote(quoteId, {
          model: firstSelectedModel.name,
          modelDetails: firstSelectedModel,
          selectedModels: allSelectedModels // 存储所有选中的车型
        });
      }
    }
    
    setMessage('已成功添加到报价单！');
    if (onModelsUpdated) {
      onModelsUpdated();
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancelSelection = () => {
    setTempSelectedModels([...selectedModels]);
    setMessage('已取消当前选择！');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePriceChange = (index, field, value) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };
  
  const addPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { type: '', amount: '' }]
    }));
  };
  
  const removePrice = (index) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, prices: newPrices }));
    }
  };

  const handleAdd = () => {
    setEditingIndex(-1);
    setFormData({
      name: '',
      energy: '',
      battery: '',
      cltc: '',
      prices: [{ type: '标准价格', amount: '' }]
    });
  };

  

  const handleEdit = (index) => {
    setEditingIndex(index);
    // 确保模型数据结构一致，如果没有prices字段，创建一个包含原price的数组
    const model = models[index];
    const { id, name, energy, battery, cltc, price, prices } = model;
    const formDataToSet = {
      id,
      name,
      energy,
      battery,
      cltc,
      prices: prices || [{ type: '标准价格', amount: price || '' }]
    };
    setFormData(formDataToSet);
  };

  const handleDelete = (index) => {
    if (window.confirm('确定要删除这个车型吗？')) {
      const modelId = models[index].id || index;
      const newModels = [...models];
      newModels.splice(index, 1);
      setModels(newModels);
      saveModels(newModels, quoteId);
      
      // 同时从已选择列表中移除
      const newSelected = selectedModels.filter(id => id !== modelId);
      setSelectedModels(newSelected);
      saveSelectedModels(newSelected, quoteId);
      
      setMessage('删除成功！');
      if (onModelsUpdated) {
        onModelsUpdated();
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.energy || !formData.battery || !formData.cltc || !formData.prices?.[0]?.amount) {
      setMessage('请填写所有必填字段！');
      return;
    }

    let newModels;
    if (editingIndex >= 0) {
      // 编辑现有模型
      newModels = [...models];
      newModels[editingIndex] = { ...formData };
    } else {
      // 添加新模型
      const newId = models.length > 0 
        ? Math.max(...models.map(m => m.id || 0)) + 1 
        : 1;
      newModels = [...models, { ...formData, id: newId }];
    }

    // 保存模型数据并检查结果
    const saveSuccess = saveModels(newModels, quoteId);
    if (saveSuccess) {
      setModels(newModels);
      
      // 更新报价单对象中的modelDetails（如果该车型是选中的）
      if (quoteId) {
        const updatedModel = editingIndex >= 0 ? newModels[editingIndex] : newModels[newModels.length - 1];
        const isSelected = tempSelectedModels.includes(updatedModel.id);
        
        if (isSelected) {
          // 为了保持向后兼容性，确保有price字段
          const modelForQuote = {
            ...updatedModel,
            price: updatedModel.prices?.[0]?.amount
          };
          
          const updateSuccess = updateQuote(quoteId, {
            model: updatedModel.name,
            modelDetails: modelForQuote
          });
          
          if (!updateSuccess) {
            console.warn('更新报价单失败');
          }
        }
      }
      
      setMessage(editingIndex >= 0 ? '更新成功！' : '添加成功！');
      if (onModelsUpdated) {
        onModelsUpdated();
      }
      setEditingIndex(-1);
      setFormData({
        name: '',
        energy: '',
        battery: '',
        cltc: '',
        prices: [{ type: '标准价格', amount: '' }],
        image: ''
      });
    } else {
      setMessage('保存失败！可能是存储空间不足。');
      console.error('保存车型数据失败');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="editor-container">
      <h2>车辆型号管理</h2>
      {quoteId && <div className="quote-info">当前编辑报价单ID: {quoteId}</div>}
      
      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-row">
          <div className="form-group">
            <label>型号名称 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="例如：2025 430 AIR"
              required
            />
          </div>
          <div className="form-group">
            <label>能源类型 *</label>
            <input
              type="text"
              name="energy"
              value={formData.energy}
              onChange={handleInputChange}
              placeholder="例如：PURE ELECTRIC"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>电池信息 *</label>
            <input
              type="text"
              name="battery"
              value={formData.battery}
              onChange={handleInputChange}
              placeholder="例如：LFP BATTERY 50 KWH"
              required
            />
          </div>
          <div className="form-group">
            <label>续航里程 *</label>
            <input
              type="text"
              name="cltc"
              value={formData.cltc}
              onChange={handleInputChange}
              placeholder="例如：430KM"
              required
            />
          </div>
        </div>
        
        
        
        <div className="form-group">
          <label>价格信息 *</label>
          {formData.prices.map((price, index) => (
            <div key={index} className="price-row">
              <div className="price-inputs">
                <input
                  type="text"
                  placeholder="价格类型（例如：标准价格、促销价格）"
                  value={price.type}
                  onChange={(e) => handlePriceChange(index, 'type', e.target.value)}
                  className="price-type"
                />
                <input
                  type="text"
                  placeholder="价格（例如：$15,500）"
                  value={price.amount}
                  onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                  className="price-amount"
                />
              </div>
              <button
                type="button"
                onClick={() => removePrice(index)}
                className="btn btn-sm btn-remove"
                disabled={formData.prices.length <= 1}
              >
                删除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPrice}
            className="btn btn-sm btn-add-price"
          >
            添加价格
          </button>
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
              setFormData({ name: '', energy: '', battery: '', cltc: '', prices: [{ type: '标准价格', amount: '' }] });
            }}
          >
            取消
          </button>
        </div>
      </form>

      <div className="models-list">
        <h3>型号列表</h3>
        
        {tempSelectedModels.length > 0 && (
          <div className="selection-actions">
            <button 
              onClick={handleConfirmAdd}
              className="btn btn-primary"
            >
              确认添加选中的 {tempSelectedModels.length} 个车型到报价单
            </button>
            <button 
              onClick={handleCancelSelection}
              className="btn btn-secondary"
            >
              取消选择
            </button>
          </div>
        )}
        
        <table className="data-table">
              <thead>
                <tr>
                  <th>添加到报价单</th>
                  <th>型号名称</th>
                  <th>能源类型</th>
                  <th>电池信息</th>
                  <th>续航里程</th>
                  <th>价格信息</th>
                  <th>操作</th>
                </tr>
              </thead>
          <tbody>
            {(models || []).map((model, index) => {
              const modelId = model.id || index;
              const isSelected = tempSelectedModels.includes(modelId);
              // 确保有prices字段，如果没有则创建一个包含原price的数组
              const prices = model.prices || [{ type: '标准价格', amount: model.price || '' }];
              
              return (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectModel(modelId)}
                      className="select-checkbox"
                    />
                  </td>
                  <td>{model.name}</td>
                  <td>{model.energy || '-'}</td>
                  <td>{model.battery || '-'}</td>
                  <td>{model.cltc || '-'}</td>
                  <td>
                    <div className="prices-list">
                      {prices.map((price, priceIndex) => (
                        <div key={priceIndex} className="price-item">
                          {price.type && <span className="price-type">{price.type}: </span>}
                          <span className="price-amount">{price.amount}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ModelsEditor;