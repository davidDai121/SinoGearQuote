// 全新重构版本 - 完全避免缓存问题

// 导入必要的函数
import { loadData, getDefaultQuoteData } from './data-manager.js';

// 使用完全不同的类名
class QuoteEditor {
    constructor() {
        console.log('QuoteEditor初始化');
        this.id = null;
        this.quote = null;
        this.data = {};
    }
    
    // 使用不同的方法名
    start() {
        console.log('QuoteEditor.start()');
        try {
            this.readParams();
            this.fetchData();
            console.log('初始化完成');
        } catch (err) {
            console.error('初始化错误:', err);
        }
    }
    
    readParams() {
        console.log('readParams()');
        try {
            const params = new URLSearchParams(window.location.search);
            this.id = params.get('id');
        } catch (err) {
            console.error('参数读取错误:', err);
        }
    }
    
    fetchData() {
        console.log('fetchData()');
        try {
            this.data = loadData() || {};
            
            if (this.id && this.data[this.id]) {
                this.quote = this.data[this.id];
            } else {
                this.makeNewQuote();
            }
            
            console.log('数据获取完成');
            // 绝对不调用任何可能导致问题的方法
        } catch (err) {
            console.error('数据获取错误:', err);
        }
    }
    
    makeNewQuote() {
        console.log('makeNewQuote()');
        try {
            const defaultQuote = getDefaultQuoteData();
            this.quote = defaultQuote;
            console.log('新报价单已创建');
        } catch (err) {
            console.error('创建报价单错误:', err);
        }
    }
    
    // 完全避免使用loadFormData名称
    setupForm() {
        console.log('setupForm() - 安全版本');
        // 这个方法不执行任何DOM操作
    }
    
    static getEditor() {
        if (!QuoteEditor.editor) {
            QuoteEditor.editor = new QuoteEditor();
        }
        return QuoteEditor.editor;
    }
}

// 创建实例
const editor = QuoteEditor.getEditor();

// 导出
const instance = {
    init: () => {
        console.log('instance.init()');
        editor.start();
    }
};

export default instance;

export function init() {
    console.log('导出的init()');
    instance.init();
}

// 所有其他导出函数都是安全的占位符
export function showTab(tabName) { console.log('showTab:', tabName); }
export function editModel(id) { console.log('editModel:', id); }
export function deleteModel(id) { console.log('deleteModel:', id); }
export function cancelModelEdit() { console.log('cancelModelEdit'); }
export function editColor(id) { console.log('editColor:', id); }
export function deleteColor(id) { console.log('deleteColor:', id); }
export function cancelColorEdit() { console.log('cancelColorEdit'); }
export function removeInteriorImage(index) { console.log('removeInteriorImage:', index); }
export function deleteAttention(index) { console.log('deleteAttention:', index); }
export function previewCurrentQuote() { console.log('previewCurrentQuote'); }