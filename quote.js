// 报价单系统主入口文件

// 导入所有模块
export * from './modules/utils.js';
export * from './modules/data-manager.js';
export * from './modules/ui-renderer.js';
export * from './modules/search-filter.js';
export * from './modules/preview-manager.js';
export * from './modules/admin-module.js';
export * from './modules/edit-module.js';

// 主初始化函数
export function initializeApp() {
    // 根据当前页面判断使用哪个模块
    if (window.location.pathname.includes('admin.html')) {
        // 管理页面初始化
        const adminModule = import('./modules/admin-module.js');
        adminModule.then(module => {
            module.init();
        });
    } else if (window.location.pathname.includes('edit-quote.html')) {
        // 编辑页面初始化
        const editModule = import('./modules/edit-module.js');
        editModule.then(module => {
            module.init();
        }).catch(error => {
            console.error('加载edit-module.js失败:', error);
        });
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/quote/') {
        // 主页初始化 - 可以添加主页特定的初始化逻辑
        console.log('Quote system initialized on main page');
    }
}

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});