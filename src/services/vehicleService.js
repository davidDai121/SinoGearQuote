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