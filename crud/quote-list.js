// Quote List Functions
import { saveData, getDefaultQuoteData } from './quote-crud.js';

// 渲染Quote列表
export function renderQuoteList(quotes, currentQuoteId) {
    const selectorDiv = document.getElementById('quote-selector');
    const listDiv = document.getElementById('all-quotes-list');
    
    if (!selectorDiv || !listDiv) return;
    
    const quoteIds = Object.keys(quotes);
    
    // 渲染选择器
    let selectorHTML = '';
    if (quoteIds.length === 0) {
        selectorHTML = '<p>暂无Quote，请创建一个新的Quote</p>';
    } else {
        selectorHTML = '<select onchange="selectQuote(this.value)">';
        quoteIds.forEach(id => {
            const quote = quotes[id];
            const selected = id === currentQuoteId ? 'selected' : '';
            selectorHTML += `<option value="${id}" ${selected}>${quote.name}</option>`;
        });
        selectorHTML += '</select>';
    }
    selectorDiv.innerHTML = selectorHTML;
    
    // 渲染完整列表（带操作按钮）
    let listHTML = '';
    if (quoteIds.length === 0) {
        listHTML = '<p>暂无Quote，请创建一个新的Quote</p>';
    } else {
        listHTML = '<div class="quote-items">';
        quoteIds.forEach(id => {
            const quote = quotes[id];
            const isActive = id === currentQuoteId;
            const createDate = new Date(quote.createdAt).toLocaleString();
            
            listHTML += `
                <div class="quote-item ${isActive ? 'active' : ''}">
                    <div class="quote-details">
                        <h4>${quote.name}</h4>
                        <p class="quote-date">创建时间: ${createDate}</p>
                    </div>
                    <div class="action-buttons">
                        ${!isActive ? `<button onclick="selectQuote('${id}')" class="btn btn-secondary">编辑</button>` : ''}
                        <button onclick="duplicateQuote('${id}')" class="btn btn-secondary">复制</button>
                        <button onclick="deleteQuote('${id}')" class="btn btn-danger">删除</button>
                    </div>
                </div>
            `;
        });
        listHTML += '</div>';
    }
    listDiv.innerHTML = listHTML;
}

// 复制Quote
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

// 初始化数据加载
export function initializeData() {
    const savedQuotes = localStorage.getItem('quotes');
    let quotes = {};
    
    if (savedQuotes) {
        try {
            quotes = JSON.parse(savedQuotes);
        } catch {
            quotes = {};
        }
    }
    
    // 如果没有数据，创建一个默认quote
    if (Object.keys(quotes).length === 0) {
        const defaultQuoteId = 'default_1';
        quotes[defaultQuoteId] = getDefaultQuoteData('默认报价单');
        saveData(quotes);
    }
    
    return quotes;
}

// 显示指定部分
export function showSection(sectionId, currentQuote) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 如果选择了编辑区域但没有当前quote，保持显示quote列表
    if (sectionId !== 'quote-list' && !currentQuote) {
        document.getElementById('quote-list').classList.add('active');
        return;
    }
    
    document.getElementById(sectionId).classList.add('active');
}

// 显示通知
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
