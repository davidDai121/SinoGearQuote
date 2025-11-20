const express = require('express');
const router = express.Router();

// 获取所有报价单
router.get('/', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.quotes) {
    return res.json(mockData.quotes);
  }
  res.json([]);
});

// 获取单个报价单
router.get('/:id', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.quotes) {
    const quote = mockData.quotes.find(q => q._id === req.params.id);
    if (quote) {
      return res.json(quote);
    }
  }
  res.status(404).json({ error: '报价单不存在' });
});

// 创建报价单
router.post('/', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.quotes) {
    const newQuote = {
      _id: `quote-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    mockData.quotes.push(newQuote);
    res.status(201).json(newQuote);
    return;
  }
  res.status(500).json({ error: '无法创建报价单' });
});

// 更新报价单
router.put('/:id', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.quotes) {
    const index = mockData.quotes.findIndex(q => q._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '报价单不存在' });
    }
    mockData.quotes[index] = { ...mockData.quotes[index], ...req.body };
    res.json(mockData.quotes[index]);
    return;
  }
  res.status(500).json({ error: '无法更新报价单' });
});

// 删除报价单
router.delete('/:id', (req, res) => {
  const mockData = req.app.locals.mockData;
  if (mockData && mockData.quotes) {
    const index = mockData.quotes.findIndex(q => q._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '报价单不存在' });
    }
    mockData.quotes.splice(index, 1);
    res.json({ success: true });
    return;
  }
  res.status(500).json({ error: '无法删除报价单' });
});

// 复制报价单
router.post('/:id/duplicate', (req, res) => {
  const quote = quotes.find(q => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ error: '报价单不存在' });
  }
  
  const duplicateQuote = {
    id: `quote-${currentId++}`,
    ...quote,
    name: `${quote.name} (副本)`,
    createdAt: new Date().toISOString()
  };
  quotes.push(duplicateQuote);
  res.status(201).json(duplicateQuote);
});

module.exports = router;