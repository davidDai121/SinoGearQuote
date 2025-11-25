import React, { useState, useEffect } from 'react';
import { getModels, saveModels, getSelectedModels, saveSelectedModels, updateQuote, deleteModel } from '../../services/adminService';

function ModelsEditor({ _id, onModelsUpdated }) {
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
      if (_id) {
        await loadSelectedModels();
      }
    })();
  }, [_id]);

  const loadModels = async () => {
    const data = await getModels(_id);
    setModels(Array.isArray(data) ? data : []);
  };

  const loadSelectedModels = async () => {
    const selected = await getSelectedModels(_id);
    const ids = Array.isArray(selected) ? selected.map(x => String(x)) : [];
    setSelectedModels(ids);
    setTempSelectedModels([...ids]);
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
    // 仅保存有效的Mongo _id，过滤掉本地索引ID
    const idsForSave = (tempSelectedModels || []).map(selId => {
      const m = (models || []).find(mm => mm._id === selId);
      return m && m._id ? m._id : null;
    }).filter(Boolean);
    setSelectedModels(idsForSave);
    saveSelectedModels(idsForSave, _id);
    updateQuote(_id, { models: idsForSave });
    
    // 更新报价单对象中的车型信息
      if (_id && tempSelectedModels.length > 0) {
      // 获取所有选中的车型详细信息
      const allSelectedModels = tempSelectedModels.map(modelId => {
        const safeModels = models || [];
        const model = safeModels.find(m => m._id === modelId);
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
        updateQuote(_id, {
          model: firstSelectedModel.name,
          modelDetails: firstSelectedModel,
          selectedModels: allSelectedModels // 存储所有选中的车型
        });
        if (Array.isArray(selectedModels) && selectedModels.length > 0) {
          updateQuote(_id, { models: selectedModels });
        }
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
    const { _id, name, energy, battery, cltc, price, prices } = model;
    const formDataToSet = {
      _id,
      name,
      energy,
      battery,
      cltc,
      prices: prices || [{ type: '标准价格', amount: price || '' }]
    };
    setFormData(formDataToSet);
  };

  const handleDelete = async (index) => {
    if (window.confirm('确定要删除这个车型吗？')) {
      const modelId = models[index]._id;
      const newModels = [...models];
      newModels.splice(index, 1);
      setModels(newModels);
      // 后端删除对应模型
      await deleteModel(modelId);
      // 刷新列表，确保状态与后端一致
      await loadModels();
      
      // 同时从已选择列表中移除
      const newSelected = selectedModels.filter(id => id !== modelId);
      setSelectedModels(newSelected);
      await saveSelectedModels(newSelected, _id);
      
      setMessage('删除成功！');
      if (onModelsUpdated) {
        onModelsUpdated();
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
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
      newModels = [...models, { ...formData }];
    }

    // 保存模型数据并检查结果
    const saveSuccess = await saveModels(newModels, _id);
    if (saveSuccess) {
      await loadModels();
      
      // 更新报价单对象中的modelDetails（如果该车型是选中的）
      if (_id) {
        const updatedModel = editingIndex >= 0 ? newModels[editingIndex] : newModels[newModels.length - 1];
        const isSelected = tempSelectedModels.includes(updatedModel._id);
        
        if (isSelected) {
          // 为了保持向后兼容性，确保有price字段
          const modelForQuote = {
            ...updatedModel,
            price: updatedModel.prices?.[0]?.amount
          };
          
          const updateSuccess = updateQuote(_id, {
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
      {_id && <div className="quote-info">当前编辑报价单ID: {_id}</div>}
      
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
              const modelId = model._id;
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