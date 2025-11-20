const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 获取所有颜色（使用模拟数据）
router.get('/', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.colors) {
    return res.json(mockData.colors);
  }
  res.json([]);
});

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/colors');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置Multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `color-${uniqueSuffix}${ext}`);
  }
});

// 创建上传中间件
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只接受图片文件
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('只支持图片文件上传！'));
    }
    cb(null, true);
  }
});

// 获取单个颜色详情
router.get('/:id', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.colors) {
    const color = mockData.colors.find(c => c._id === req.params.id);
    if (color) {
      return res.json(color);
    }
  }
  res.status(404).json({ error: '颜色不存在' });
});

// 图片上传路由
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有文件上传' });
    }
    
    // 返回相对路径，前端可以通过 /uploads/colors/... 访问
    const imagePath = `/uploads/colors/${req.file.filename}`;
    res.json({ success: true, imagePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;