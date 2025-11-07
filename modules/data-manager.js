// 数据管理模块

/**
 * 获取默认quote数据模板
 * @param {string} quoteName - 报价单名称
 * @returns {object} 默认报价单数据
 */
export function getDefaultQuoteData(quoteName) {
    return {
        name: quoteName || 'New Quote',
        basicInfo: {
            pageTitle: '2025 TOYOTA BZ3X QUOTATION',
            pageDate: '2025.9.19',
            companyName: 'SINO GEAR POWER TECHNOLOGY CO., LTD',
            companyAddress: 'ROOM 1317, OFFICE FLOOR, BUILDING 1,\nHUANMAO CENTER, HEFEI CITY,\nANHUI PROVINCE'
        },
        models: [
            { id: 1, name: '2025 430 AIR', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 50 KWH', cltc: '430KM', price: '$15,500' },
            { id: 2, name: '2025 430 AIR+', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 50 KWH', cltc: '430KM', price: '$16,800' },
            { id: 3, name: '2025 520 PRO', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 58.3 KWH', cltc: '520KM', price: '$18,000' },
            { id: 4, name: '2025 520 PRO+', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 58.3 KWH', cltc: '520KM', price: '$19,300' },
            { id: 5, name: '2025 520 PRO LIDAR EDITION', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 58.3 KWH', cltc: '520KM', price: '$20,600' },
            { id: 6, name: '2025 610 MAX', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 67.9 KWH', cltc: '610KM', price: '$21,800' },
            { id: 7, name: '2025 520 PRO+ LIDAR EDITION', energy: 'PURE ELECTRIC', battery: 'LFP BATTERY 58.3 KWH', cltc: '520KM', price: '$21,800' }
        ],
        exteriorColors: [
            { id: 1, name: 'BLACK', image: 'public/images/exterior/black.png' },
            { id: 2, name: 'GREY', image: 'public/images/exterior/grey.png' },
            { id: 3, name: 'PINK', image: 'public/images/exterior/pink.png' },
            { id: 4, name: 'GOLDEN', image: 'public/images/exterior/golden.png' },
            { id: 5, name: 'SILVERY', image: 'public/images/exterior/silvery.png' },
            { id: 6, name: 'SILVERY-BLACK', image: 'public/images/exterior/silvery-black.png' },
            { id: 7, name: 'WHITE-1', image: 'public/images/exterior/white-1.png' },
            { id: 8, name: 'WHITE-2', image: 'public/images/exterior/white-2.png' },
            { id: 9, name: 'WHITE-BLACK', image: 'public/images/exterior/white-black.png' }
        ],
        interiorImages: [
            { id: 1, image: '' },
            { id: 2, image: '' },
            { id: 3, image: '' },
            { id: 4, image: '' }
        ],
        attentionItems: [
            'THE PRICE OF USED CARS IS DETERMINED BY THEIR CONDITION, SO THERE WILL BE DIFFERENCES IN PRICES.',
            'VEHICLE QUOTATIONS ARE TIME-SENSITIVE, AND THE PRICES USUALLY REMAIN VALID FOR ONE WEEK.',
            'THE VEHICLES ARE IN THE FOR-SALE STATUS. BEFORE A DEPOSIT IS RECEIVED, THEY MAY BE SOLD AT ANY TIME.'
        ],
        createdAt: new Date().toISOString()
    };
}

/**
 * 从localStorage加载数据
 * @returns {object} 报价单数据对象
 */
export function loadData() {
    try {
        const savedQuotes = localStorage.getItem('quotes');
        return savedQuotes ? JSON.parse(savedQuotes) : {};
    } catch (error) {
        console.error('加载数据失败:', error);
        return {};
    }
}

/**
 * 保存数据到localStorage
 * @param {object} quotes - 报价单数据对象
 */
export function saveData(quotes) {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

/**
 * 创建新的Quote
 * @param {object} quotes - 现有报价单对象
 * @param {string} quoteName - 报价单名称
 * @returns {object} 包含新ID和更新后数据的对象
 */
export function createNewQuote(quotes, quoteName) {
    if (!quoteName || quoteName.trim() === '') {
        quoteName = `Quote ${Object.keys(quotes).length + 1}`;
    }
    
    // 生成唯一ID
    const quoteId = `quote_${Date.now()}`;
    
    // 创建新的quote数据
    quotes[quoteId] = getDefaultQuoteData(quoteName);
    
    return { quoteId, quotes };
}

/**
 * 删除Quote
 * @param {object} quotes - 报价单对象
 * @param {string} quoteId - 要删除的报价单ID
 * @returns {object} 操作结果
 */
export function deleteQuote(quotes, quoteId) {
    if (quotes[quoteId]) {
        const quoteName = quotes[quoteId].name;
        delete quotes[quoteId];
        return { success: true, quoteName, quotes };
    }
    return { success: false };
}

/**
 * 更新Quote名称
 * @param {object} quotes - 报价单对象
 * @param {string} quoteId - 报价单ID
 * @param {string} newName - 新名称
 * @returns {object} 操作结果
 */
export function updateQuoteName(quotes, quoteId, newName) {
    if (quotes[quoteId] && newName && newName.trim() !== '') {
        quotes[quoteId].name = newName.trim();
        return { success: true, quotes };
    }
    return { success: false };
}

/**
 * 复制Quote
 * @param {object} quotes - 报价单对象
 * @param {string} quoteId - 要复制的报价单ID
 * @returns {object} 包含新ID和更新后数据的对象
 */
export function duplicateQuote(quotes, quoteId) {
    const originalQuote = quotes[quoteId];
    const newQuoteId = `quote_${Date.now()}`;
    const newQuoteName = `${originalQuote.name} (副本)`;
    
    // 深拷贝原quote数据
    quotes[newQuoteId] = JSON.parse(JSON.stringify(originalQuote));
    quotes[newQuoteId].name = newQuoteName;
    quotes[newQuoteId].createdAt = new Date().toISOString();
    
    saveData(quotes);
    return { newQuoteId, quotes };
}

/**
 * 初始化数据加载
 * @returns {object} 报价单数据对象
 */
export function initializeData() {
    let quotes = loadData();
    
    // 如果没有数据，创建一个默认quote
    if (Object.keys(quotes).length === 0) {
        const defaultQuoteId = 'default_1';
        quotes[defaultQuoteId] = getDefaultQuoteData('默认报价单');
        saveData(quotes);
    }
    
    return quotes;
}

/**
 * 获取单个Quote
 * @param {string} quoteId - 报价单ID
 * @returns {object|null} 报价单数据或null
 */
export function getQuoteById(quoteId) {
    const quotes = loadData();
    return quotes[quoteId] || null;
}