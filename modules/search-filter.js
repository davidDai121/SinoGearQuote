// 搜索和过滤功能模块
import { formatDate } from './utils.js';

/**
 * 过滤报价单列表
 * @param {object} quotes - 报价单数据对象
 * @param {string} searchTerm - 搜索关键词
 * @returns {array} 过滤后的报价单数组
 */
export function filterQuotes(quotes, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return Object.entries(quotes).map(([id, quote]) => ({ id, ...quote }));
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return Object.entries(quotes)
        .map(([id, quote]) => ({ id, ...quote }))
        .filter(({ name, createdAt, basicInfo }) => {
            // 搜索名称
            const nameMatch = name.toLowerCase().includes(term);
            
            // 搜索创建日期
            const dateStr = formatDate(createdAt).toLowerCase();
            const dateMatch = dateStr.includes(term);
            
            // 搜索公司名称
            const companyMatch = basicInfo && basicInfo.companyName && 
                basicInfo.companyName.toLowerCase().includes(term);
            
            // 搜索页面标题
            const titleMatch = basicInfo && basicInfo.pageTitle && 
                basicInfo.pageTitle.toLowerCase().includes(term);
            
            return nameMatch || dateMatch || companyMatch || titleMatch;
        });
}

/**
 * 根据条件排序报价单
 * @param {array} quotes - 报价单数组
 * @param {string} sortBy - 排序字段 ('createdAt', 'name')
 * @param {string} sortOrder - 排序顺序 ('asc', 'desc')
 * @returns {array} 排序后的报价单数组
 */
export function sortQuotes(quotes, sortBy = 'createdAt', sortOrder = 'desc') {
    return [...quotes].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // 处理日期类型
        if (sortBy === 'createdAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string') {
            // 字符串类型转为小写进行比较
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}

/**
 * 渲染过滤后的报价单列表
 * @param {array} filteredQuotes - 过滤后的报价单数组
 */
export function renderFilteredQuoteList(filteredQuotes) {
    const quoteListContainer = document.getElementById('all-quotes-list');
    const noQuotesMessage = document.getElementById('no-quotes-message');
    
    if (!quoteListContainer || !noQuotesMessage) return;
    
    if (filteredQuotes.length === 0) {
        quoteListContainer.innerHTML = '';
        noQuotesMessage.style.display = 'block';
        return;
    }
    
    noQuotesMessage.style.display = 'none';
    
    let html = '';
    filteredQuotes.forEach(({ id, name, createdAt }) => {
        html += `
            <div class="quote-item">
                <div class="quote-details">
                    <h4>${name}</h4>
                    <p class="quote-date">${formatDate(createdAt)}</p>
                </div>
                <div class="action-buttons">
                    <a href="edit-quote.html?id=${id}" class="btn btn-secondary">编辑</a>
                    <button class="btn btn-secondary" onclick="previewQuote('${id}')">预览</button>
                    <button class="btn btn-danger" onclick="deleteQuote('${id}')">删除</button>
                </div>
            </div>
        `;
    });
    
    quoteListContainer.innerHTML = html;
}