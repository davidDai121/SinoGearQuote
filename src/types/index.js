// 车辆模型类型定义
// 注意：这是JavaScript文件，使用注释定义类型结构
/**
 * @typedef {Object} VehicleModel
 * @property {string} name - 车型名称
 * @property {string} energy - 能源类型
 * @property {string} battery - 电池信息
 * @property {string} cltc - 续航里程
 * @property {string} price - 价格
 */

// 导出一个示例对象作为类型参考
export const VehicleModelExample = {
  name: '',
  energy: '',
  battery: '',
  cltc: '',
  price: ''
};

// 外观颜色类型定义
/**
 * @typedef {Object} ExteriorColor
 * @property {string} name - 颜色名称
 * @property {string} image - 图片路径
 */

export const ExteriorColorExample = {
  name: '',
  image: ''
};

// 导航状态类型
/**
 * @typedef {('models' | 'exterior' | 'interior')} SectionType
 */

// 导出有效的section类型值
export const SectionTypes = {
  MODELS: 'models',
  EXTERIOR: 'exterior',
  INTERIOR: 'interior'
};