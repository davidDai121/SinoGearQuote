// 工具函数模块

/**
 * 显示通知提示
 * @param {string} elementId - 通知元素ID
 * @param {string} message - 通知消息
 * @param {boolean} isSuccess - 是否成功消息
 */
export function showAlert(elementId, message, isSuccess = true) {
    const alertElement = document.getElementById(elementId);
    if (!alertElement) return;
    
    alertElement.textContent = message;
    alertElement.className = isSuccess ? 'alert alert-success' : 'alert alert-error';
    alertElement.style.display = 'block';
    
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000);
}

/**
 * 格式化日期
 * @param {string} dateString - ISO日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
}

/**
 * 创建临时预览URL
 * @param {string} html - HTML内容
 * @returns {string} 预览URL
 */
export function createPreviewUrl(html) {
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
}