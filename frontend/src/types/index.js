// 价格项类型定义
/**
 * @typedef {Object} PriceItem
 * @property {string} type - 价格类型（如：标准价格、促销价格）
 * @property {string} amount - 价格金额
 */

// 车辆模型类型定义
// 注意：这是JavaScript文件，使用注释定义类型结构
/**
 * @typedef {Object} VehicleModel
 * @property {number} id - 车型ID
 * @property {string} name - 车型名称
 * @property {string} energy - 能源类型
 * @property {string} battery - 电池信息
 * @property {string} cltc - 续航里程
 * @property {Array<PriceItem>} prices - 价格信息数组
 */

// 导出一个示例对象作为类型参考
export const VehicleModelExample = {
  id: 1,
  name: '',
  energy: '',
  battery: '',
  cltc: '',
  prices: [{ type: '标准价格', amount: '' }],
};

// 车型选择状态类型定义
/**
 * @typedef {Array<number>} SelectedModels
 */

// 报价单类型定义
/**
 * @typedef {Object} Quote
 * @property {string} id - 报价单ID
 * @property {string} createdAt - 创建时间
 * @property {string} quoteName - 报价单名称
 * @property {Array<VehicleModel>} selectedModels - 所有选中的车型列表
 * @property {Array<string>} selectedExteriorColors - 选中的外观颜色ID列表
 * @property {Array<string>} selectedInteriorItems - 选中的内饰项ID列表
 */

// 导出报价单示例对象
export const QuoteExample = {
  id: '',
  createdAt: '',
  quoteName: '',
  selectedModels: [],
  selectedExteriorColors: [],
  selectedInteriorItems: []
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