const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 获取所有车型（使用模拟数据）
router.get('/', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.models) {
    return res.json(mockData.models);
  }
  res.json([]);
});

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/models');
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
    cb(null, `model-${uniqueSuffix}${ext}`);
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

// 获取单个车型详情
router.get('/:id', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.models) {
    const model = mockData.models.find(m => m._id === req.params.id);
    if (model) {
      return res.json(model);
    }
  }
  res.status(404).json({ error: '车型不存在' });
});

// 图片上传路由
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有文件上传' });
    }
    
    // 返回相对路径，前端可以通过 /uploads/models/... 访问
    const imagePath = `/uploads/models/${req.file.filename}`;
    res.json({ success: true, imagePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;