// 基于localStorage的管理员数据服务

// 存储键名常量
const STORAGE_KEYS = {
  MODELS: 'vehicleModels',
  EXTERIOR_COLORS: 'exteriorColors',
  INTERIOR_ITEMS: 'interiorItems',
  QUOTES: 'savedQuotes'
};

// 获取特定报价单的存储键名
const getQuoteSpecificKey = (baseKey, quoteId) => {
  return `${baseKey}_${quoteId}`;
};

// 默认数据
const DEFAULT_MODELS = [
  {
    name: '2025 430 AIR',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 50 KWH',
    cltc: '430KM',
    price: '$15,500'
  },
  {
    name: '2025 430 AIR+',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 50 KWH',
    cltc: '430KM',
    price: '$16,800'
  },
  {
    name: '2025 520 PRO',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 58.3 KWH',
    cltc: '520KM',
    price: '$18,000'
  },
  {
    name: '2025 520 PRO+',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 58.3 KWH',
    cltc: '520KM',
    price: '$19,300'
  },
  {
    name: '2025 520 PRO LIDAR EDITION',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 58.3 KWH',
    cltc: '520KM',
    price: '$20,600'
  },
  {
    name: '2025 610 MAX',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 67.9 KWH',
    cltc: '610KM',
    price: '$21,800'
  },
  {
    name: '2025 520 PRO+ LIDAR EDITION',
    energy: 'PURE ELECTRIC',
    battery: 'LFP BATTERY 58.3 KWH',
    cltc: '520KM',
    price: '$21,800'
  }
];

const DEFAULT_EXTERIOR_COLORS = [
  { name: 'BLACK', image: '/images/exterior/black.png' },
  { name: 'GREY', image: '/images/exterior/grey.png' },
  { name: 'PINK', image: '/images/exterior/pink.png' },
  { name: 'GOLDEN', image: '/images/exterior/golden.png' },
  { name: 'SILVERY', image: '/images/exterior/silvery.png' },
  { name: 'SILVERY-BLACK', image: '/images/exterior/silvery-black.png' },
  { name: 'WHITE-1', image: '/images/exterior/white-1.png' },
  { name: 'WHITE-2', image: '/images/exterior/white-2.png' },
  { name: 'WHITE-BLACK', image: '/images/exterior/white-black.png' }
];

const DEFAULT_INTERIOR_ITEMS = [
  { id: 1, name: '内饰1', image: '/images/interior/interior-1.png' },
  { id: 2, name: '内饰2', image: '/images/interior/interior-2.png' },
  { id: 3, name: '内饰3', image: '/images/interior/interior-3.png' },
  { id: 4, name: '内饰4', image: '/images/interior/interior-4.png' }
];

// 通用存储函数 - 增强错误处理
const setToStorage = (key, data) => {
  try {
    // 检查数据大小
    const dataString = JSON.stringify(data);
    const dataSize = new Blob([dataString]).size;
    
    // 对于可能很大的数据（如包含多张图片）发出警告
    if (dataSize > 5 * 1024 * 1024) { // 5MB
      console.warn(`Warning: Large data size (${Math.round(dataSize / (1024 * 1024) * 100) / 100}MB) being stored for key: ${key}`);
    }
    
    // 尝试存储
    localStorage.setItem(key, dataString);
    return true;
  } catch (error) {
    // 专门处理QuotaExceededError
    if (error.name === 'QuotaExceededError') {
      console.error(`Storage quota exceeded for key: ${key}. This is likely due to large image files. Consider reducing image sizes.`, error);
      
      // 尝试清除一些非关键数据来释放空间
      try {
        // 可以选择清除一些非必要的历史数据或缓存
        if (key.includes('savedQuotes') || key.includes('QUOTES')) {
          // 对于报价单数据，可以尝试清理旧的或临时数据
          const tempKeys = Object.keys(localStorage).filter(k => k.startsWith('temp_'));
          tempKeys.forEach(k => localStorage.removeItem(k));
          console.log(`Cleaned up ${tempKeys.length} temporary items to free space.`);
        }
        
        // 再次尝试存储
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (secondError) {
        console.error(`Failed to save even after cleanup:`, secondError);
      }
    } else {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
    return false;
  }
};

// 通用读取函数
const getFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    // 尝试解析JSON，捕获可能的解析错误
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    
    // 如果是解析错误，尝试清理损坏的数据
    if (error instanceof SyntaxError) {
      console.warn(`Removing corrupted data for key: ${key}`);
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Failed to remove corrupted item:`, removeError);
      }
    }
    return defaultValue;
  }
};

// 车辆模型管理 - 支持特定报价单
export const getModels = (quoteId = null) => {
  if (!quoteId) {
    return getFromStorage(STORAGE_KEYS.MODELS, DEFAULT_MODELS);
  }
  // 先尝试获取报价单特定的模型，如果没有则使用默认模型
  const quoteSpecificModels = getFromStorage(
    getQuoteSpecificKey(STORAGE_KEYS.MODELS, quoteId),
    null
  );
  return quoteSpecificModels !== null ? quoteSpecificModels : DEFAULT_MODELS;
};

export const saveModels = (models, quoteId = null) => {
  if (!quoteId) {
    return setToStorage(STORAGE_KEYS.MODELS, models);
  }
  return setToStorage(getQuoteSpecificKey(STORAGE_KEYS.MODELS, quoteId), models);
};

// 获取选中的车辆型号
export const getSelectedModels = (quoteId) => {
  if (!quoteId) return [];
  return getFromStorage(getQuoteSpecificKey('selectedModels', quoteId), []);
};

// 保存选中的车辆型号
export const saveSelectedModels = (modelIds, quoteId) => {
  if (!quoteId) return;
  setToStorage(getQuoteSpecificKey('selectedModels', quoteId), modelIds);
};

// 外观颜色管理 - 支持特定报价单
export const getExteriorColors = (quoteId = null) => {
  if (!quoteId) {
    return getFromStorage(STORAGE_KEYS.EXTERIOR_COLORS, DEFAULT_EXTERIOR_COLORS);
  }
  // 先尝试获取报价单特定的颜色，如果没有则使用默认颜色
  const quoteSpecificColors = getFromStorage(
    getQuoteSpecificKey(STORAGE_KEYS.EXTERIOR_COLORS, quoteId),
    null
  );
  return quoteSpecificColors !== null ? quoteSpecificColors : DEFAULT_EXTERIOR_COLORS;
};

export const saveExteriorColors = (colors, quoteId = null) => {
  if (!quoteId) {
    return setToStorage(STORAGE_KEYS.EXTERIOR_COLORS, colors);
  }
  return setToStorage(getQuoteSpecificKey(STORAGE_KEYS.EXTERIOR_COLORS, quoteId), colors);
};

// 获取选中的外观颜色ID列表（为了向后兼容）
export const getSelectedExteriorColors = (quoteId) => {
  if (!quoteId) return [];
  return getFromStorage(getQuoteSpecificKey('selectedExteriorColors', quoteId), []);
};

// 保存选中的外观颜色ID列表（为了向后兼容）
export const saveSelectedExteriorColors = (colorIds, quoteId) => {
  if (!quoteId) return;
  // 仅在需要保持向后兼容时调用，主要数据现在直接存储在报价单的exteriorImages字段中
  console.log('saveSelectedExteriorColors 已过时，请使用直接存储图片的方式');
};

// 内饰项管理 - 支持特定报价单
export const getInteriorItems = (quoteId = null) => {
  if (!quoteId) {
    return getFromStorage(STORAGE_KEYS.INTERIOR_ITEMS, DEFAULT_INTERIOR_ITEMS);
  }
  // 先尝试获取报价单特定的内饰项，如果没有则使用默认内饰项
  const quoteSpecificItems = getFromStorage(
    getQuoteSpecificKey(STORAGE_KEYS.INTERIOR_ITEMS, quoteId),
    null
  );
  return quoteSpecificItems !== null ? quoteSpecificItems : DEFAULT_INTERIOR_ITEMS;
};

export const saveInteriorItems = (items, quoteId = null) => {
  if (!quoteId) {
    return setToStorage(STORAGE_KEYS.INTERIOR_ITEMS, items);
  }
  return setToStorage(getQuoteSpecificKey(STORAGE_KEYS.INTERIOR_ITEMS, quoteId), items);
};

// 获取选中的内饰项ID列表（为了向后兼容）
export const getSelectedInteriorItems = (quoteId) => {
  if (!quoteId) return [];
  return getFromStorage(getQuoteSpecificKey('selectedInteriorItems', quoteId), []);
};

// 保存选中的内饰项ID列表（为了向后兼容）
export const saveSelectedInteriorItems = (itemIds, quoteId) => {
  if (!quoteId) return;
  // 仅在需要保持向后兼容时调用，主要数据现在直接存储在报价单的interiorImages字段中
  console.log('saveSelectedInteriorItems 已过时，请使用直接存储图片的方式');
};

// 报价单管理
export const getSavedQuotes = () => {
  return getFromStorage(STORAGE_KEYS.QUOTES, []);
};

export const saveQuote = (quote) => {
  try {
    // 优化：在保存前检查并处理大图片数据
    const optimizedQuote = { ...quote };
    
    // 处理外观图片数据
    if (optimizedQuote.exteriorImages && Array.isArray(optimizedQuote.exteriorImages)) {
      optimizedQuote.exteriorImages = optimizedQuote.exteriorImages.map(img => {
        // 对于超大的Base64字符串，记录警告
        if (img.url && img.url.length > 1000000) { // 约1MB的Base64字符串
          console.warn(`Warning: Large exterior image data detected`);
        }
        return img;
      });
    }
    
    // 处理内饰图片数据
    if (optimizedQuote.interiorImages && Array.isArray(optimizedQuote.interiorImages)) {
      optimizedQuote.interiorImages = optimizedQuote.interiorImages.map(img => {
        if (img.url && img.url.length > 1000000) {
          console.warn(`Warning: Large interior image data detected`);
        }
        return img;
      });
    }
    
    const quotes = getSavedQuotes();
    const newQuote = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...optimizedQuote
    };
    
    quotes.push(newQuote);
    
    // 如果报价单数量超过一定限制，提示用户
    if (quotes.length > 10) {
      console.warn(`Warning: You have ${quotes.length} saved quotes. Consider removing old ones to save space.`);
    }
    
    const success = setToStorage(STORAGE_KEYS.QUOTES, quotes);
    
    if (!success) {
      console.error('Failed to save quote due to storage limitations');
      // 尝试保存简化版本
      try {
        const simplifiedQuotes = [...quotes];
        const lastQuote = simplifiedQuotes[simplifiedQuotes.length - 1];
        
        // 简化最后添加的报价单图片数据
        if (lastQuote.exteriorImages) {
          lastQuote.exteriorImages = lastQuote.exteriorImages.slice(0, 3); // 仅保留前3张
        }
        if (lastQuote.interiorImages) {
          lastQuote.interiorImages = lastQuote.interiorImages.slice(0, 3); // 仅保留前3张
        }
        
        const simplifiedSuccess = setToStorage(STORAGE_KEYS.QUOTES, simplifiedQuotes);
        if (simplifiedSuccess) {
          console.log('Successfully saved quote with simplified image data');
          return lastQuote;
        }
      } catch (retryError) {
        console.error('Failed even with simplified data:', retryError);
      }
      return null;
    }
    
    return newQuote;
  } catch (error) {
    console.error('Error saving quote:', error);
    return null;
  }
};

export const getQuoteById = (id) => {
  const quotes = getSavedQuotes();
  return quotes.find(quote => quote.id === id);
};

// 复制报价单 - 增强错误处理和存储优化
export const duplicateQuote = (id) => {
  try {
    const quotes = getSavedQuotes();
    const quoteToDuplicate = quotes.find(quote => quote.id === id);
    
    if (!quoteToDuplicate) {
      console.warn(`Quote with ID ${id} not found for duplication`);
      return null;
    }
    
    // 优化复制的图片数据以节省空间
    const optimizedQuoteToDuplicate = { ...quoteToDuplicate };
    
    // 处理外观图片数据
    if (optimizedQuoteToDuplicate.exteriorImages && Array.isArray(optimizedQuoteToDuplicate.exteriorImages)) {
      // 复制时保持图片数据不变，但添加警告
      optimizedQuoteToDuplicate.exteriorImages.forEach(img => {
        if (img.url && img.url.length > 500000) { // 约500KB
          console.warn(`Warning: Duplicating quote with large image data`);
        }
      });
    }
    
    // 创建新的报价单，保留原报价单的所有信息但生成新的ID和创建时间
    const newQuote = {
      // 复制所有原始字段
      ...optimizedQuoteToDuplicate,
      // 重新设置ID和创建时间，覆盖可能从展开运算符获取的旧值
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      // 更新名称字段，统一使用quoteName
      quoteName: quoteToDuplicate.quoteName ? `${quoteToDuplicate.quoteName} (复制)` : undefined
    };
    
    quotes.push(newQuote);
    
    // 如果报价单数量超过一定限制，提示用户
    if (quotes.length > 10) {
      console.warn(`Warning: You have ${quotes.length} saved quotes. Consider removing old ones to save space.`);
    }
    
    const success = setToStorage(STORAGE_KEYS.QUOTES, quotes);
    
    if (!success) {
      console.error('Failed to duplicate quote due to storage limitations');
      // 尝试保存简化版本
      try {
        const simplifiedQuotes = [...quotes];
        const lastQuote = simplifiedQuotes[simplifiedQuotes.length - 1];
        
        // 简化重复后的报价单图片数据
        if (lastQuote.exteriorImages) {
          lastQuote.exteriorImages = lastQuote.exteriorImages.slice(0, 3); // 仅保留前3张
        }
        if (lastQuote.interiorImages) {
          lastQuote.interiorImages = lastQuote.interiorImages.slice(0, 3); // 仅保留前3张
        }
        
        const simplifiedSuccess = setToStorage(STORAGE_KEYS.QUOTES, simplifiedQuotes);
        if (simplifiedSuccess) {
          console.log('Successfully duplicated quote with simplified image data');
          return lastQuote;
        }
      } catch (retryError) {
        console.error('Failed to duplicate even with simplified data:', retryError);
      }
      return null;
    }
    
    return newQuote;
  } catch (error) {
    console.error('Error duplicating quote:', error);
    return null;
  }
};

// 删除报价单
export const deleteQuote = (id) => {
  try {
    // 直接操作localStorage以确保正确性
    const quotesJson = localStorage.getItem(STORAGE_KEYS.QUOTES);
    let quotes = quotesJson ? JSON.parse(quotesJson) : [];
    
    // 过滤掉要删除的报价单
    const filteredQuotes = quotes.filter(quote => quote.id !== id);
    
    // 强制保存到localStorage
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filteredQuotes));
    
    // 清除可能的缓存
    // 有些浏览器会缓存localStorage的值，这里通过设置再获取来刷新缓存
    const verifyQuotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTES) || '[]');
    return verifyQuotes.length === filteredQuotes.length;
  } catch (error) {
    console.error('删除报价单失败:', error);
    return false;
  }
};

// 清除所有报价单数据
export const clearAllQuotes = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUOTES);
    return true;
  } catch (error) {
    console.error('清除所有报价单失败:', error);
    return false;
  }
};

// 更新报价单 - 增强错误处理和大小控制
export const updateQuote = (id, updatedData) => {
  try {
    const quotes = getSavedQuotes();
    const index = quotes.findIndex(quote => quote.id === id);
    
    if (index === -1) {
      console.warn(`Quote with ID ${id} not found for update`);
      return null;
    }
    
    // 优化更新对象，避免重复数据
    const updatedQuote = { ...quotes[index] };
    
    // 只更新必要的字段，避免不必要的数据复制
    Object.keys(updatedData).forEach(key => {
      // 特别处理图片数据，避免无限增长
      if ((key === 'exteriorImages' || key === 'interiorImages') && updatedData[key]) {
        // 确保不存储过多图片
        const maxImages = 10; // 每个类别最多存储10张图片
        if (Array.isArray(updatedData[key]) && updatedData[key].length > maxImages) {
          console.warn(`Too many images provided (${updatedData[key].length}), truncating to ${maxImages}`);
          updatedQuote[key] = updatedData[key].slice(0, maxImages);
        } else {
          updatedQuote[key] = updatedData[key];
        }
      } else {
        updatedQuote[key] = updatedData[key];
      }
    });
    
    quotes[index] = updatedQuote;
    const success = setToStorage(STORAGE_KEYS.QUOTES, quotes);
    
    if (!success) {
      console.error(`Failed to update quote ${id}, likely due to storage limitations`);
      // 尝试仅保存必要数据的简化版本
      try {
        const simplifiedQuote = { ...updatedQuote };
        // 在极端情况下，可以移除一些非必要的图片数据
        if (simplifiedQuote.exteriorImages) {
          simplifiedQuote.exteriorImages = simplifiedQuote.exteriorImages.slice(0, 3); // 仅保留前3张
        }
        if (simplifiedQuote.interiorImages) {
          simplifiedQuote.interiorImages = simplifiedQuote.interiorImages.slice(0, 3); // 仅保留前3张
        }
        
        quotes[index] = simplifiedQuote;
        const simplifiedSuccess = setToStorage(STORAGE_KEYS.QUOTES, quotes);
        if (simplifiedSuccess) {
          console.log(`Successfully saved simplified version of quote ${id}`);
          return simplifiedQuote;
        }
      } catch (retryError) {
        console.error(`Failed even with simplified data:`, retryError);
      }
      return null;
    }
    
    return updatedQuote;
  } catch (error) {
    console.error('Error updating quote:', error);
    return null;
  }
};

// 重置为默认数据
// 如果提供quoteId，则只重置该报价单的数据
// 否则重置全局默认数据
export const resetToDefaults = (quoteId = null) => {
  saveModels(DEFAULT_MODELS, quoteId);
  saveExteriorColors(DEFAULT_EXTERIOR_COLORS, quoteId);
  saveInteriorItems(DEFAULT_INTERIOR_ITEMS, quoteId);
  
  // 如果是特定报价单，同时清除选中状态
  if (quoteId) {
    setToStorage(getQuoteSpecificKey('selectedModels', quoteId), []);
    // 不再需要清除这些字段，因为主要数据现在直接存储在报价单中
    // 但为了完全重置，仍然保留清除操作
    setToStorage(getQuoteSpecificKey('selectedExteriorColors', quoteId), []);
    setToStorage(getQuoteSpecificKey('selectedInteriorItems', quoteId), []);
  }
};