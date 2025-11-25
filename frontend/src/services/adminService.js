// 基于API的管理员数据服务

// API基础配置
const resolveBaseUrl = () => {
  try {
    const candidate = (typeof window !== 'undefined' && window.__API_BASE_URL__) || process.env.API_BASE_URL || process.env.VITE_API_BASE_URL;
    if (candidate) {
      const base = String(candidate).replace(/\/+$/, '');
      return base.endsWith('/api') ? base : `${base}/api`;
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return `${window.location.origin.replace(/\/+$/, '')}/api`;
    }
  } catch {}
  return '/api';
};
const API_BASE_URL = resolveBaseUrl();

// 通用API请求函数
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    // 检查响应是否为空
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`API请求错误 (${endpoint}):`, error);
    // 返回空数组作为默认值，保持与原localStorage版本的兼容性
    return [];
  }
};

// 默认数据 - 保持与原版本一致的接口
const DEFAULT_MODELS = [];
const DEFAULT_EXTERIOR_COLORS = [];
const DEFAULT_INTERIOR_ITEMS = [];

// 车辆模型管理 - 支持特定报价单
export const getModels = async (_id = null) => {
  // 由于API是异步的，但为了保持与原接口兼容性，这里我们返回Promise
  // 在实际使用时，调用方需要使用await或.then()
  const res = await apiRequest('/models');
  return Array.isArray(res) ? res : [];
};

export const saveModels = async (models, _id = null) => {
  // 对于保存模型，我们实际上是更新现有模型或创建新模型
  // 这里简化处理，实际可能需要根据模型ID进行区分
  try {
    if (Array.isArray(models)) {
      // 如果是多个模型，分别处理
      for (const model of models) {
        if (model && model._id) {
          // 更新现有模型
          await apiRequest(`/models/${model._id}`, {
            method: 'PUT',
            body: JSON.stringify(model)
          });
        } else {
          // 创建新模型
          await apiRequest('/models', {
            method: 'POST',
            body: JSON.stringify(model)
          });
        }
      }
    } else {
      // 单个模型
      if (models && models._id) {
        await apiRequest(`/models/${models._id}`, {
          method: 'PUT',
          body: JSON.stringify(models)
        });
      } else {
        await apiRequest('/models', {
          method: 'POST',
          body: JSON.stringify(models)
        });
      }
    }
    return true;
  } catch (error) {
    console.error('保存模型失败:', error);
    return false;
  }
};

// 获取选中的车辆型号 - 在API版本中，这通常由报价单中的models字段管理
export const getSelectedModels = async (_id) => {
  if (!_id) return [];
  try {
    const quote = await apiRequest(`/quotes/${_id}`);
    if (!quote) return [];
    const arr = quote.models || [];
    return Array.isArray(arr) ? arr.map(m => (m && m._id) ? m._id : null).filter(Boolean) : [];
  } catch (error) {
    console.error('获取选中模型失败:', error);
    return [];
  }
};

// 保存选中的车辆型号 - 实际上是更新报价单中的models字段
export const saveSelectedModels = async (modelIds, _id) => {
  if (!_id) return;
  try {
    await apiRequest(`/quotes/${_id}`, {
      method: 'PUT',
      body: JSON.stringify({ models: modelIds })
    });
    return true;
  } catch (error) {
    console.error('保存选中模型失败:', error);
    return false;
  }
};

// 外观颜色管理 - 支持特定报价单
export const getExteriorColors = async (_id = null) => {
  const res = await apiRequest('/colors');
  return Array.isArray(res) ? res : [];
};

export const saveExteriorColors = async (colors, _id = null) => {
  try {
    if (Array.isArray(colors)) {
      for (const color of colors) {
        if (color && color._id) {
          await apiRequest(`/colors/${color._id}`, {
            method: 'PUT',
            body: JSON.stringify(color)
          });
        } else {
          await apiRequest('/colors', {
            method: 'POST',
            body: JSON.stringify(color)
          });
        }
      }
    } else {
      if (colors && colors._id) {
        await apiRequest(`/colors/${colors._id}`, {
          method: 'PUT',
          body: JSON.stringify(colors)
        });
      } else {
        await apiRequest('/colors', {
          method: 'POST',
          body: JSON.stringify(colors)
        });
      }
    }
    return true;
  } catch (error) {
    console.error('保存颜色失败:', error);
    return false;
  }
};

// 获取选中的外观颜色ID列表（为了向后兼容）
export const getSelectedExteriorColors = async (_id) => {
  if (!_id) return [];
  try {
    const quote = await apiRequest(`/quotes/${_id}`);
    if (!quote) return [];
    const arr = quote.colors || [];
    return Array.isArray(arr) ? arr.map(c => (c && c._id) ? c._id : null).filter(Boolean) : [];
  } catch (error) {
    console.error('获取选中颜色失败:', error);
    return [];
  }
};

// 保存选中的外观颜色ID列表（为了向后兼容）
export const saveSelectedExteriorColors = async (colorIds, _id) => {
  if (!_id) return;
  try {
    await apiRequest(`/quotes/${_id}`, {
      method: 'PUT',
      body: JSON.stringify({ colors: colorIds })
    });
    return true;
  } catch (error) {
    console.error('保存选中颜色失败:', error);
    return false;
  }
};

// 内饰项管理 - 支持特定报价单
export const getInteriorItems = async (_id = null) => {
  const res = await apiRequest('/interiors');
  return Array.isArray(res) ? res : [];
};

export const saveInteriorItems = async (items, _id = null) => {
  try {
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item && item._id) {
          await apiRequest(`/interiors/${item._id}`, {
            method: 'PUT',
            body: JSON.stringify(item)
          });
        } else {
          await apiRequest('/interiors', {
            method: 'POST',
            body: JSON.stringify(item)
          });
        }
      }
    } else {
      if (items && items._id) {
        await apiRequest(`/interiors/${items._id}`, {
          method: 'PUT',
          body: JSON.stringify(items)
        });
      } else {
        await apiRequest('/interiors', {
          method: 'POST',
          body: JSON.stringify(items)
        });
      }
    }
    return true;
  } catch (error) {
    console.error('保存内饰项失败:', error);
    return false;
  }
};

// 获取选中的内饰项ID列表（为了向后兼容）
export const getSelectedInteriorItems = async (_id) => {
  if (!_id) return [];
  try {
    const quote = await apiRequest(`/quotes/${_id}`);
    if (!quote) return [];
    const arr = quote.interiors || [];
    return Array.isArray(arr) ? arr.map(i => (i && i._id) ? i._id : null).filter(Boolean) : [];
  } catch (error) {
    console.error('获取选中内饰项失败:', error);
    return [];
  }
};

// 保存选中的内饰项ID列表（为了向后兼容）
export const saveSelectedInteriorItems = async (itemIds, _id) => {
  if (!_id) return;
  try {
    await apiRequest(`/quotes/${_id}`, {
      method: 'PUT',
      body: JSON.stringify({ interiors: itemIds })
    });
    return true;
  } catch (error) {
    console.error('保存选中内饰项失败:', error);
    return false;
  }
};

// 报价单管理
export const getSavedQuotes = async () => {
  return apiRequest('/quotes');
};

export const saveQuote = async (quote) => {
  try {
    // 处理图片数据（在API版本中，图片通常通过单独的上传接口处理）
    const newQuote = await apiRequest('/quotes', {
      method: 'POST',
      body: JSON.stringify(quote)
    });
    return newQuote;
  } catch (error) {
    console.error('保存报价单失败:', error);
    return null;
  }
};

export const getQuoteById = async (id) => {
  try {
    const q = await apiRequest(`/quotes/${id}`);
    return q;
  } catch (error) {
    console.error(`获取报价单失败 (ID: ${id}):`, error);
    return null;
  }
};

// 复制报价单 - 使用API实现
export const duplicateQuote = async (id) => {
  try {
    return await apiRequest(`/quotes/${id}/duplicate`, {
      method: 'POST'
    });
  } catch (error) {
    console.error(`复制报价单失败 (ID: ${id}):`, error);
    return null;
  }
};

// 删除报价单
export const deleteQuote = async (id) => {
  try {
    await apiRequest(`/quotes/${id}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error(`删除报价单失败 (ID: ${id}):`, error);
    return false;
  }
};

// 清除所有报价单数据
export const clearAllQuotes = async () => {
  try {
    // 注意：实际应用中可能需要更严格的权限控制
    await apiRequest('/quotes/clear', {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('清除所有报价单失败:', error);
    return false;
  }
};

// 更新报价单 - 使用API实现
export const updateQuote = async (id, updatedData) => {
  try {
    if (updatedData && typeof updatedData === 'object') {
      if (typeof updatedData.quoteName === 'string' && updatedData.quoteName.trim().length > 0) {
        updatedData.name = updatedData.quoteName.trim();
        delete updatedData.quoteName;
      }
    }
    // 处理图片数据
    if ((updatedData.exteriorImages || updatedData.interiorImages) && Array.isArray(updatedData.exteriorImages) && Array.isArray(updatedData.interiorImages)) {
      // 确保不存储过多图片
      const maxImages = 10;
      if (updatedData.exteriorImages && updatedData.exteriorImages.length > maxImages) {
        console.warn(`Too many exterior images provided (${updatedData.exteriorImages.length}), truncating to ${maxImages}`);
        updatedData.exteriorImages = updatedData.exteriorImages.slice(0, maxImages);
      }
      if (updatedData.interiorImages && updatedData.interiorImages.length > maxImages) {
        console.warn(`Too many interior images provided (${updatedData.interiorImages.length}), truncating to ${maxImages}`);
        updatedData.interiorImages = updatedData.interiorImages.slice(0, maxImages);
      }
    }
    
    return await apiRequest(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  } catch (error) {
    console.error(`更新报价单失败 (ID: ${id}):`, error);
    return null;
  }
};

// 重置为默认数据
// 如果提供quoteId，则只重置该报价单的数据
// 否则重置全局默认数据
export const resetToDefaults = async (_id = null) => {
  try {
    if (_id) {
      // 重置特定报价单的数据
      await apiRequest(`/quotes/${_id}/reset`, {
        method: 'POST'
      });
    } else {
      // 重置全局默认数据
      await Promise.all([
        apiRequest('/models/reset', { method: 'POST' }),
        apiRequest('/colors/reset', { method: 'POST' }),
        apiRequest('/interiors/reset', { method: 'POST' })
      ]);
    }
    return true;
  } catch (error) {
    console.error('重置数据失败:', error);
    return false;
  }
};

export const deleteModel = async (id) => {
  try {
    if (!id) return false;
    await apiRequest(`/models/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('删除车型失败:', error);
    return false;
  }
};

export const deleteColor = async (id) => {
  try {
    if (!id) return false;
    await apiRequest(`/colors/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('删除颜色失败:', error);
    return false;
  }
};

export const deleteInterior = async (id) => {
  try {
    if (!id) return false;
    await apiRequest(`/interiors/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('删除内饰项失败:', error);
    return false;
  }
};