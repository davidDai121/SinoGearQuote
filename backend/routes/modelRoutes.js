const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/VehicleModel');
const multer = require('multer');
const path = require('path');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/models'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 获取所有车型数据
router.get('/', async (req, res) => {
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  try {
    const models = await VehicleModel.find();
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: '获取车型数据失败: ' + error.message });
  }
});

// 添加新车型
router.post('/', upload.single('image'), async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { name, quoteName, price, image } = req.body;
    const newModel = new VehicleModel({
      name: name || quoteName, // 支持name或quoteName字段
      price: Number(price),
      image: req.file ? `uploads/models/${req.file.filename}` : (image || '')
    });
    await newModel.save();
    res.status(201).json(newModel);
  } catch (error) {
    res.status(400).json({ message: '添加车型失败', error: error.message });
  }
});

// 更新车型
router.put('/:id', upload.single('image'), async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { name, quoteName, price, image } = req.body;
    const updateData = { name: name || quoteName, price: Number(price) }; // 支持name或quoteName字段
    
    // 如果有新图片，则更新图片路径
    if (req.file) {
      updateData.image = `uploads/models/${req.file.filename}`;
    } else if (typeof image !== 'undefined') {
      updateData.image = image;
    }
    
    const updatedModel = await VehicleModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedModel) {
      return res.status(404).json({ message: '车型不存在' });
    }
    
    res.json(updatedModel);
  } catch (error) {
    res.status(400).json({ message: '更新车型失败', error: error.message });
  }
});

// 删除车型
router.delete('/:id', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const deletedModel = await VehicleModel.findByIdAndDelete(req.params.id);
    if (!deletedModel) {
      return res.status(404).json({ message: '车型不存在' });
    }
    res.json({ message: '车型删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除车型失败', error: error.message });
  }
});

// 更新车型选择状态
router.put('/:id/select', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { selected } = req.body;
    const updatedModel = await VehicleModel.findByIdAndUpdate(
      req.params.id,
      { selected },
      { new: true }
    );
    res.json(updatedModel);
  } catch (error) {
    res.status(400).json({ message: '更新选择状态失败', error: error.message });
  }
});

// 重置车型为默认数据
router.post('/reset', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    // 清空当前所有车型数据
    await VehicleModel.deleteMany({});
    
    // 创建默认车型数据
    const defaultModels = [
      { name: '基础款', price: 100000, image: '' },
      { name: '舒适款', price: 120000, image: '' },
      { name: '豪华款', price: 150000, image: '' }
    ];
    
    await VehicleModel.insertMany(defaultModels);
    res.json({ message: '车型数据已重置为默认值' });
  } catch (error) {
    res.status(500).json({ message: '重置车型数据失败', error: error.message });
  }
});

module.exports = router;