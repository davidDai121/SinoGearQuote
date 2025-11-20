const express = require('express');
const router = express.Router();
const Color = require('../models/Color');
const multer = require('multer');
const path = require('path');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/colors'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 获取所有颜色
router.get('/', async (req, res) => {
  try {
    console.log('接收到获取颜色请求，使用模拟数据:', req.useMockData);
    
    // 如果使用模拟数据
    if (req.useMockData || !req.dbConnected) {
      const mockColors = req.app.locals.mockColors;
      console.log('返回模拟颜色数据，数量:', mockColors.length);
      return res.json(mockColors);
    }
    
    // 否则从数据库获取
    const colors = await Color.find();
    console.log('从数据库成功获取颜色数据，数量:', colors.length);
    res.json(colors);
  } catch (error) {
    console.error('获取颜色数据失败:', error.message, error.stack);
    res.status(500).json({ message: '获取颜色数据失败: ' + error.message });
  }
});

// 添加新颜色
router.post('/', upload.single('image'), async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { name, quoteName, price } = req.body;
    const newColor = new Color({
      name: name || quoteName, // 支持name或quoteName字段
      price: Number(price) || 0,
      image: req.file ? `uploads/colors/${req.file.filename}` : ''
    });
    await newColor.save();
    res.status(201).json(newColor);
  } catch (error) {
    res.status(400).json({ message: '添加颜色失败', error: error.message });
  }
});

// 更新颜色
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
      updateData.image = `uploads/colors/${req.file.filename}`;
    }
    
    const updatedColor = await Color.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedColor) {
      return res.status(404).json({ message: '颜色不存在' });
    }
    
    res.json(updatedColor);
  } catch (error) {
    res.status(400).json({ message: '更新颜色失败', error: error.message });
  }
});

// 删除颜色
router.delete('/:id', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const deletedColor = await Color.findByIdAndDelete(req.params.id);
    if (!deletedColor) {
      return res.status(404).json({ message: '颜色不存在' });
    }
    res.json({ message: '颜色删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除颜色失败', error: error.message });
  }
});

// 更新颜色选择状态
router.put('/:id/select', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    const { selected } = req.body;
    const updatedColor = await Color.findByIdAndUpdate(
      req.params.id,
      { selected },
      { new: true }
    );
    res.json(updatedColor);
  } catch (error) {
    res.status(400).json({ message: '更新选择状态失败', error: error.message });
  }
});

// 重置颜色为默认数据
router.post('/reset', async (req, res) => {
  // 检查数据库连接状态
  if (!req.dbConnected) {
    return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
  }
  
  try {
    // 清空当前所有颜色数据
    await Color.deleteMany({});
    
    // 创建默认颜色数据
    const defaultColors = [
      { name: '经典黑', price: 0, image: '' },
      { name: '珍珠白', price: 5000, image: '' },
      { name: '宝石红', price: 8000, image: '' },
      { name: '深海蓝', price: 8000, image: '' }
    ];
    
    await Color.insertMany(defaultColors);
    res.json({ message: '颜色数据已重置为默认值' });
  } catch (error) {
    res.status(500).json({ message: '重置颜色数据失败', error: error.message });
  }
});

module.exports = router;