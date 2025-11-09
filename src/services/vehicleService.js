// 获取车辆模型数据
export const getVehicleModels = () => {
  return [
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
};

// 获取外观颜色数据
export const getExteriorColors = () => {
  return [
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
};

// 获取内饰图片数据（模拟）
export const getInteriorImages = () => {
  return [1, 2, 3, 4];
};

// 未来可以添加API调用函数，用于与后端交互
export const fetchModelsFromApi = async () => {
  try {
    // 这里将是实际的API调用
    // const response = await fetch('/api/models');
    // return response.json();
    // 暂时返回模拟数据
    return getVehicleModels();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};