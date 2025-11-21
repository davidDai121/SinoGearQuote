const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const VehicleModel = require('../models/VehicleModel');
const Color = require('../models/Color');
const Interior = require('../models/Interior');

// 获取所有报价单
router.get('/', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const quotes = await Quote.find().populate('models').populate('colors').populate('interiors');
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: '获取报价单失败', error: error.message });
  }
});

// 获取单个报价单
router.get('/:id', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('models')
      .populate('colors')
      .populate('interiors');
    
    if (!quote) {
      return res.status(404).json({ message: '报价单不存在' });
    }
    
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: '获取报价单失败', error: error.message });
  }
});

// 创建新报价单
router.post('/', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    let { name, quoteName, modelIds, colorIds, interiorIds, footerText } = req.body;
    // 兼容前端可能传递的字段名（models/colors/interiors）
    if (!modelIds && Array.isArray(req.body.models)) modelIds = req.body.models;
    if (!colorIds && Array.isArray(req.body.colors)) colorIds = req.body.colors;
    if (!interiorIds && Array.isArray(req.body.interiors)) interiorIds = req.body.interiors;
    
    // 计算总价
    let totalPrice = 0;
    
    // 获取并累加车型价格
    if (modelIds && modelIds.length > 0) {
      const models = await VehicleModel.find({ _id: { $in: modelIds } });
      models.forEach(model => {
        totalPrice += model.price;
      });
    }
    
    // 获取并累加颜色价格
    if (colorIds && colorIds.length > 0) {
      const colors = await Color.find({ _id: { $in: colorIds } });
      colors.forEach(color => {
        totalPrice += color.price;
      });
    }
    
    // 获取并累加内饰价格
    if (interiorIds && interiorIds.length > 0) {
      const interiors = await Interior.find({ _id: { $in: interiorIds } });
      interiors.forEach(interior => {
        totalPrice += interior.price;
      });
    }
    
    const newQuote = new Quote({
      name: name || quoteName, // 支持name或quoteName字段
      models: modelIds || [],
      colors: colorIds || [],
      interiors: interiorIds || [],
      footerText,
      totalPrice
    });
    
    await newQuote.save();
    
    // 填充引用的文档
    const populatedQuote = await Quote.findById(newQuote._id)
      .populate('models')
      .populate('colors')
      .populate('interiors');
    
    res.status(201).json(populatedQuote);
  } catch (error) {
    res.status(400).json({ message: '创建报价单失败', error: error.message });
  }
});

// 更新报价单
router.put('/:id', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    let { name, quoteName, modelIds, colorIds, interiorIds, footerText } = req.body;
    // 兼容前端可能传递的字段名（models/colors/interiors）
    if (!modelIds && Array.isArray(req.body.models)) modelIds = req.body.models;
    if (!colorIds && Array.isArray(req.body.colors)) colorIds = req.body.colors;
    if (!interiorIds && Array.isArray(req.body.interiors)) interiorIds = req.body.interiors;
    
    // 计算总价
    let totalPrice = 0;
    
    // 获取并累加车型价格
    if (modelIds && modelIds.length > 0) {
      const models = await VehicleModel.find({ _id: { $in: modelIds } });
      models.forEach(model => {
        totalPrice += model.price;
      });
    }
    
    // 获取并累加颜色价格
    if (colorIds && colorIds.length > 0) {
      const colors = await Color.find({ _id: { $in: colorIds } });
      colors.forEach(color => {
        totalPrice += color.price;
      });
    }
    
    // 获取并累加内饰价格
    if (interiorIds && interiorIds.length > 0) {
      const interiors = await Interior.find({ _id: { $in: interiorIds } });
      interiors.forEach(interior => {
        totalPrice += interior.price;
      });
    }
    
    const updateData = {
      name: name || quoteName, // 支持name或quoteName字段
      models: modelIds || [],
      colors: colorIds || [],
      interiors: interiorIds || [],
      footerText,
      totalPrice,
      updatedAt: Date.now()
    };
    
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('models').populate('colors').populate('interiors');
    
    if (!updatedQuote) {
      return res.status(404).json({ message: '报价单不存在' });
    }
    
    res.json(updatedQuote);
  } catch (error) {
    res.status(400).json({ message: '更新报价单失败', error: error.message });
  }
});

// 删除报价单
router.delete('/:id', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const deletedQuote = await Quote.findByIdAndDelete(req.params.id);
    if (!deletedQuote) {
      return res.status(404).json({ message: '报价单不存在' });
    }
    res.json({ message: '报价单删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除报价单失败', error: error.message });
  }
});

// 复制报价单
router.post('/:id/duplicate', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const originalQuote = await Quote.findById(req.params.id);
    if (!originalQuote) {
      return res.status(404).json({ message: '报价单不存在' });
    }
    
    const newQuote = new Quote({
      name: `${originalQuote.name} (复制)`,
      models: originalQuote.models,
      colors: originalQuote.colors,
      interiors: originalQuote.interiors,
      footerText: originalQuote.footerText,
      totalPrice: originalQuote.totalPrice
    });
    
    await newQuote.save();
    
    // 填充引用的文档
    const populatedQuote = await Quote.findById(newQuote._id)
      .populate('models')
      .populate('colors')
      .populate('interiors');
    
    res.status(201).json(populatedQuote);
  } catch (error) {
    res.status(400).json({ message: '复制报价单失败', error: error.message });
  }
});

// 清除所有报价单数据
router.delete('/clear', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    await Quote.deleteMany({});
    res.json({ message: '所有报价单数据已清除' });
  } catch (error) {
    res.status(500).json({ message: '清除报价单数据失败', error: error.message });
  }
});

// 重置特定报价单为默认数据
router.post('/:id/reset', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: '报价单不存在' });
    }
    
    // 重置报价单数据为默认值，仅使用Schema中定义的字段
    const defaultData = {
      name: quote.name || '默认报价单',
      models: [],
      colors: [],
      interiors: [],
      footerText: '',
      totalPrice: 0,
      updatedAt: Date.now()
    };
    
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      defaultData,
      { new: true }
    );
    
    res.json(updatedQuote);
  } catch (error) {
    res.status(500).json({ message: '重置报价单数据失败', error: error.message });
  }
});

module.exports = router;