const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 加载环境变量
dotenv.config();

const app = express();

// 确保上传目录存在
const ensureUploadDirectories = () => {
  const dirs = ['uploads', 'uploads/models', 'uploads/colors', 'uploads/interiors'];
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`创建目录: ${fullPath}`);
    }
  });
};

// 创建上传目录
ensureUploadDirectories();

// 配置CORS，允许前端跨域访问
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
// 提供静态文件访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 数据库连接配置
let dbConnected = false;

// 连接MongoDB数据库
async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const redactUri = (uri) => {
      try {
        return uri.replace(/(mongodb\+srv:\/\/[^:]+):([^@]+)@/i, '$1:****@');
      } catch { return uri; }
    };
    console.log('正在连接MongoDB数据库...', redactUri(mongoUri));
    
    const startTime = Date.now();
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    const endTime = Date.now();
    console.log('MongoDB数据库连接成功:', conn.connection.host, `(耗时: ${endTime - startTime}ms)`);
    dbConnected = true;
    
    // 添加事件监听
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB连接错误:', err.message);
      dbConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB连接断开');
      dbConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB重新连接');
      dbConnected = true;
    });
    
  } catch (err) {
    dbConnected = false;
    console.error('MongoDB连接失败:', err.message);
    // 每5秒尝试重新连接
    setTimeout(() => {
      console.log('尝试重新连接MongoDB...');
      connectToDatabase();
    }, 5000);
  }
}

// 启动数据库连接
connectToDatabase();

// 等待3秒后打印数据库连接状态
setTimeout(() => {
  console.log('数据库连接状态: ' + (dbConnected ? '已连接' : '未连接'));
}, 3000);

// 传递数据库连接状态
app.use((req, res, next) => {
  req.dbConnected = dbConnected;
  next();
});

// 路由导入和错误处理
let modelRoutes, colorRoutes, interiorRoutes, quoteRoutes;
try {
  // 使用完整功能的路由文件
  modelRoutes = require('./routes/modelRoutes');
  colorRoutes = require('./routes/colorRoutes');
  interiorRoutes = require('./routes/interiorRoutes');
  quoteRoutes = require('./routes/quoteRoutes');
} catch (err) {
  console.error('路由加载失败:', err);
}

// 已移除模拟数据，所有数据来自数据库

// 使用路由 - 同时支持/api前缀和无前缀的路径
// 模型路由 - 优先使用modelRoutes.js（包含完整功能）
if (modelRoutes) {
  app.use('/models', modelRoutes);
  app.use('/api/models', modelRoutes);
}

// 颜色路由
if (colorRoutes) {
  app.use('/colors', colorRoutes);
  app.use('/api/colors', colorRoutes);
}

// 内饰路由
if (interiorRoutes) {
  app.use('/interiors', interiorRoutes);
  app.use('/api/interiors', interiorRoutes);
}

// 报价单路由
if (quoteRoutes) {
  app.use('/quotes', quoteRoutes);
  app.use('/api/quotes', quoteRoutes);
}

// 静态文件服务，提供上传的图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 托管前端静态文件
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir));

// SPA 回退到前端 index.html（确保在 API 和静态路由之后）
app.get('*', (req, res) => {
  // 已匹配到的 /api 或 /uploads 路由不进入回退
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ message: 'Not Found' });
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err.message);
  console.error('错误堆栈:', err.stack);
  console.error('请求路径:', req.path);
  console.error('请求方法:', req.method);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 启动服务器
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});