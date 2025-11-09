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

// 通用存储函数
const setToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// 通用读取函数
const getFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
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

// 获取选中的外观颜色
export const getSelectedExteriorColors = (quoteId) => {
  if (!quoteId) return [];
  return getFromStorage(getQuoteSpecificKey('selectedExteriorColors', quoteId), []);
};

// 保存选中的外观颜色
export const saveSelectedExteriorColors = (colorIds, quoteId) => {
  if (!quoteId) return;
  setToStorage(getQuoteSpecificKey('selectedExteriorColors', quoteId), colorIds);
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

// 获取选中的内饰项
export const getSelectedInteriorItems = (quoteId) => {
  if (!quoteId) return [];
  return getFromStorage(getQuoteSpecificKey('selectedInteriorItems', quoteId), []);
};

// 保存选中的内饰项
export const saveSelectedInteriorItems = (itemIds, quoteId) => {
  if (!quoteId) return;
  setToStorage(getQuoteSpecificKey('selectedInteriorItems', quoteId), itemIds);
};

// 报价单管理
export const getSavedQuotes = () => {
  return getFromStorage(STORAGE_KEYS.QUOTES, []);
};

export const saveQuote = (quote) => {
  const quotes = getSavedQuotes();
  const newQuote = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...quote
  };
  quotes.push(newQuote);
  setToStorage(STORAGE_KEYS.QUOTES, quotes);
  return newQuote;
};

export const getQuoteById = (id) => {
  const quotes = getSavedQuotes();
  return quotes.find(quote => quote.id === id);
};

// 复制报价单
export const duplicateQuote = (id) => {
  const quotes = getSavedQuotes();
  const quoteToDuplicate = quotes.find(quote => quote.id === id);
  
  if (!quoteToDuplicate) {
    return null;
  }
  
  // 创建新的报价单，保留原报价单的信息但生成新的ID和创建时间
  const newQuote = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    customerName: `${quoteToDuplicate.customerName} (复制)`,
    model: quoteToDuplicate.model,
    color: quoteToDuplicate.color,
    modelDetails: quoteToDuplicate.modelDetails,
    colorDetails: quoteToDuplicate.colorDetails
  };
  
  quotes.push(newQuote);
  setToStorage(STORAGE_KEYS.QUOTES, quotes);
  return newQuote;
};

// 删除报价单
export const deleteQuote = (id) => {
  const quotes = getSavedQuotes();
  const filteredQuotes = quotes.filter(quote => quote.id !== id);
  setToStorage(STORAGE_KEYS.QUOTES, filteredQuotes);
  return true;
};

// 更新报价单
export const updateQuote = (id, updatedData) => {
  const quotes = getSavedQuotes();
  const index = quotes.findIndex(quote => quote.id === id);
  
  if (index !== -1) {
    quotes[index] = { ...quotes[index], ...updatedData };
    setToStorage(STORAGE_KEYS.QUOTES, quotes);
    return quotes[index];
  }
  
  return null;
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
    setToStorage(getQuoteSpecificKey('selectedExteriorColors', quoteId), []);
    setToStorage(getQuoteSpecificKey('selectedInteriorItems', quoteId), []);
  }
};