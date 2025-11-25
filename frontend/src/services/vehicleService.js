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

// 获取车辆模型数据
export const getVehicleModels = () => {
  return [];
};

// 获取外观颜色数据
export const getExteriorColors = () => {
  return [];
};

// 获取内饰图片数据
export const getInteriorImages = () => {
  return [];
};

// 未来可以添加API调用函数，用于与后端交互
export const fetchModelsFromApi = async () => {
  try {
    // 这里将是实际的API调用
    // const response = await fetch('/api/models');
    // return response.json();
    // 暂时返回空数组
    return [];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};