const express = require('express');
const router = express.Router();
const Interior = require('../models/Interior');
const multer = require('multer');
const path = require('path');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/interiors'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 获取所有内饰
router.get('/', async (req, res) => {
  try {
    console.log('接收到获取内饰请求，使用模拟数据:', req.useMockData);
    
    // 如果使用模拟数据
    if (req.useMockData || !req.dbConnected) {
      const mockInteriors = req.app.locals.mockInteriors;
      console.log('返回模拟内饰数据，数量:', mockInteriors.length);
      return res.json(mockInteriors);
    }
    
    // 否则从数据库获取
    const interiors = await Interior.find();
    console.log('从数据库成功获取内饰数据，数量:', interiors.length);
    res.json(interiors);
  } catch (error) {
    console.error('获取内饰数据失败:', error.message, error.stack);
    res.status(500).json({ message: '获取内饰数据失败: ' + error.message });
  }
});

// 添加新内饰
router.post('/', upload.single('image'), async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { name, quoteName, price } = req.body;
    const newInterior = new Interior({
      name: name || quoteName, // 支持name或quoteName字段
      price: Number(price) || 0,
      image: req.file ? `uploads/interiors/${req.file.filename}` : ''
    });
    await newInterior.save();
    res.status(201).json(newInterior);
  } catch (error) {
    res.status(400).json({ message: '添加内饰失败', error: error.message });
  }
});

// 更新内饰
router.put('/:id', upload.single('image'), async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { name, quoteName, price } = req.body;
    const updateData = { name: name || quoteName, price: Number(price) || 0 }; // 支持name或quoteName字段
    
    // 如果有新图片，则更新图片路径
    if (req.file) {
      updateData.image = `uploads/interiors/${req.file.filename}`;
    }
    
    const updatedInterior = await Interior.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedInterior) {
      return res.status(404).json({ message: '内饰不存在' });
    }
    
    res.json(updatedInterior);
  } catch (error) {
    res.status(400).json({ message: '更新内饰失败', error: error.message });
  }
});

// 删除内饰
router.delete('/:id', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const deletedInterior = await Interior.findByIdAndDelete(req.params.id);
    if (!deletedInterior) {
      return res.status(404).json({ message: '内饰不存在' });
    }
    res.json({ message: '内饰删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除内饰失败', error: error.message });
  }
});

// 更新内饰选择状态
router.put('/:id/select', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { selected } = req.body;
    const updatedInterior = await Interior.findByIdAndUpdate(
      req.params.id,
      { selected },
      { new: true }
    );
    res.json(updatedInterior);
  } catch (error) {
    res.status(400).json({ message: '更新选择状态失败', error: error.message });
  }
});

// 重置内饰为默认数据
router.post('/reset', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    // 清空当前所有内饰数据
    await Interior.deleteMany({});
    
    // 创建默认内饰数据
    const defaultInteriors = [
      { name: '织物内饰', price: 0, image: '' },
      { name: '真皮内饰', price: 10000, image: '' },
      { name: 'alcantara内饰', price: 15000, image: '' }
    ];
    
    await Interior.insertMany(defaultInteriors);
    res.json({ message: '内饰数据已重置为默认值' });
  } catch (error) {
    res.status(500).json({ message: '重置内饰数据失败', error: error.message });
  }
});

module.exports = router;