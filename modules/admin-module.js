// 管理页面功能模块
import { loadData, deleteQuote as removeQuote, saveData } from './data-manager.js';
import { renderQuoteList } from './ui-renderer.js';
import { filterQuotes as searchFilterQuotes, sortQuotes, renderFilteredQuoteList } from './search-filter.js';
import { previewQuote as previewQuoteFromManager } from './preview-manager.js';
import { showAlert } from './utils.js';

class AdminModule {
    constructor() {
        this.quotes = {};
    }
    
    /**
     * 初始化管理页面
     */
    init() {
        // 加载数据
        this.loadQuotes();
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 加载报价单数据
     */
    loadQuotes() {
        this.quotes = loadData();
        renderQuoteList(this.quotes);
    }
    
    /**
     * 绑定事件处理函数
     */
    bindEvents() {
        // 搜索输入事件已通过内联oninput绑定
    }
    
    /**
     * 删除报价单
     * @param {string} quoteId - 报价单ID
     */
    deleteQuote(quoteId) {
        if (confirm('确定要删除这个报价单吗？')) {
            const result = removeQuote(this.quotes, quoteId);
            if (result.success) {
                this.quotes = result.quotes;
                saveData(this.quotes);
                showAlert('quote-list-alert', `"${result.quoteName}" 已删除`);
                renderQuoteList(this.quotes);
            }
        }
    }
    
    /**
     * 预览报价单
     * @param {string} quoteId - 报价单ID
     */
    previewQuote(quoteId) {
        const quote = this.quotes[quoteId];
        if (quote) {
            previewQuoteFromManager(quote);
        }
    }
    
    /**
     * 过滤报价单
     */
    filterQuotes() {
        const searchTerm = document.getElementById('search-quote')?.value || '';
        let filtered = searchFilterQuotes(this.quotes, searchTerm);
        
        // 按创建时间降序排序
        filtered = sortQuotes(filtered, 'createdAt', 'desc');
        
        renderFilteredQuoteList(filtered);
    }
    
    /**
     * 获取实例（单例模式）
     */
    static getInstance() {
        if (!AdminModule.instance) {
            AdminModule.instance = new AdminModule();
        }
        return AdminModule.instance;
    }
}

// 导出单例实例
export default AdminModule.getInstance();

// 导出全局函数，供HTML内联事件使用
export function deleteQuote(quoteId) {
    const adminModule = AdminModule.getInstance();
    adminModule.deleteQuote(quoteId);
}

export function previewQuote(quoteId) {
    const adminModule = AdminModule.getInstance();
    adminModule.previewQuote(quoteId);
}

export function filterQuotes() {
    const adminModule = AdminModule.getInstance();
    adminModule.filterQuotes();
}

export function init() {
    const adminModule = AdminModule.getInstance();
    adminModule.init();
}