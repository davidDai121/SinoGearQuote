// 预览功能模块
import { generateQuotePreviewHtml } from './ui-renderer.js';
import { createPreviewUrl } from './utils.js';

// 内联CSS样式
const inlineStyles = `
/* 报价单系统全局样式 */

/* 全局重置和基础样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', 'Helvetica', sans-serif;
    background-color: #ffffff;
    color: #333333;
    line-height: 1.4;
    width: 100%;
    max-width: 1125px;
    margin: 0 auto;
}

/* 头部区域 */
.header {
    width: 1125px;
    padding: 30px 70px 30px 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
    border-bottom: 1px solid #e0e0e0;
}

/* Logo部分 */
.logo-section {
    display: flex;
    align-items: center;
}

.logo {
    width: 120px;
    height: auto;
    object-fit: contain;
}

/* 公司信息 */
.company-info h1 {
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 5px;
    line-height: 1.2;
}

.company-info p {
    font-size: 12px;
    color: #666666;
    line-height: 1.3;
}

/* 标题区域 */
.title-section {
    width: 1125px;
    padding: 30px 70px 20px 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #F8F8F8;
}

.title-section h1 {
    font-size: 24px;
    font-weight: bold;
    color: #CC0000;
    margin: 0;
}

.title-section .date {
    font-size: 14px;
    color: #666666;
}

/* 车型部分 */
.models-section {
    width: 1125px;
    padding: 30px 70px 40px 70px;
    background-color: #F8F8F8;
}

.section-title {
    font-size: 20px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 25px;
}

/* 车型网格 - 3-3-1布局 */
.models-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px 25px;
    width: 100%;
}

.model-card {
    background-color: #ffffff;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    padding: 20px;
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.model-card h3 {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 12px;
    line-height: 1.2;
}

.model-card p {
    font-size: 13px;
    color: #333333;
    margin-bottom: 4px;
    line-height: 1.3;
}

.model-card .label {
    font-weight: 600;
    color: #333333;
}

.price {
    margin-top: 8px;
}

.price-value {
    font-size: 18px;
    font-weight: bold;
    color: #CC0000;
}

/* 外观颜色部分 */
.exterior-section {
    width: 1125px;
    padding: 40px 70px;
}

.exterior-section .section-title {
    font-size: 24px;
    font-weight: bold;
    color: #CC0000;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
}

.title-bar {
    width: 4px;
    height: 28px;
    background-color: #CC0000;
    margin-right: 15px;
}

/* 外观网格 - 2列5行布局 */
.exterior-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px 30px;
    width: 985px;
}

.color-item {
    width: 470px;
    height: 270px;
    position: relative;
    border: 1px solid #e0e0e0;
    background-color: #ffffff;
    overflow: hidden;
}

.vehicle-image {
    width: 470px;
    height: 270px;
    object-fit: contain;
    display: block;
}

.color-label {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #CC0000;
    color: white;
    font-size: 14px;
    font-weight: bold;
    padding: 5px 12px;
    border-radius: 3px;
}

/* 内饰显示部分 */
.interior-section {
    width: 1125px;
    padding: 40px 70px;
}

.interior-section .section-title {
    font-size: 24px;
    font-weight: bold;
    color: #CC0000;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
}

/* 内饰网格 - 2x2布局 */
.interior-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    width: 985px;
}

.interior-item {
    width: 470px;
    height: 270px;
    border: 1px solid #e0e0e0;
    background-color: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
}

.placeholder-image {
    font-size: 16px;
    color: #666666;
    font-weight: 500;
}

/* 注意事项部分 */
.attention-section {
    width: 1125px;
    padding: 40px 70px 50px 70px;
}

.attention-title {
    font-size: 20px;
    font-weight: bold;
    color: #CC0000;
    margin-bottom: 20px;
}

.attention-list p {
    font-size: 14px;
    color: #333333;
    line-height: 1.5;
    margin-bottom: 10px;
    padding-left: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    body, .header, .title-section, .models-section, 
    .exterior-section, .interior-section, .attention-section {
        max-width: 100%;
        width: 100%;
    }
    
    .header, .title-section, .models-section, 
    .exterior-section, .interior-section, .attention-section {
        padding-left: 30px;
        padding-right: 30px;
    }
    
    .models-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    
    .exterior-grid, .interior-grid {
        grid-template-columns: repeat(2, 1fr);
        width: 100%;
        gap: 20px;
    }
    
    .color-item, .interior-item {
        width: 100%;
        max-width: 450px;
        height: 250px;
    }
    
    .vehicle-image {
        width: 100%;
        max-width: 450px;
        height: 250px;
    }
}`;

/**
 * 生成完整的预览HTML，包含内联样式
 * @param {object} quote - 报价单数据
 * @returns {string} 完整的预览HTML
 */
function generateFullPreviewHtml(quote) {
    if (!quote) return '';
    
    // 确保basicInfo对象存在
    const basicInfo = quote.basicInfo || {
        pageTitle: '报价单',
        pageDate: new Date().toLocaleDateString(),
        companyName: '公司名称',
        companyAddress: '公司地址'
    };
    
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${basicInfo.pageTitle}</title>
        <style>
            ${inlineStyles}
        </style>
    </head>
    <body>
        <!-- Header Section -->
        <header class="header">
            <!-- Left: SinoGear Logo -->
            <div class="logo-section">
                <div style="width: 120px; height: 60px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; font-weight: bold;">
                    LOGO
                </div>
            </div>
            <!-- Right: Company Information -->
            <div class="company-info">
                <h1>${basicInfo.companyName}</h1>
                <p>${basicInfo.companyAddress.replace(/\n/g, '<br>')}</p>
            </div>
        </header>

        <!-- Quotation Title -->
        <section class="title-section">
            <h1>${basicInfo.pageTitle}</h1>
            <span class="date">DATE: ${basicInfo.pageDate}</span>
        </section>

        <!-- Vehicle Models Grid (3-3-1 Layout) -->
        <section class="models-section">
            <h2 class="section-title">VEHICLE MODELS</h2>
            <div class="models-grid">
    `;
    
    // 添加车型卡片
    (quote.models || []).forEach(model => {
        html += `
            <div class="model-card">
                <h3>${model.name || '未知车型'}</h3>
                <p><span class="label">ENERGY:</span> ${model.energy || '-'}</p>
                <p><span class="label">BATTERY:</span> ${model.battery || '-'}</p>
                <p><span class="label">CLTC:</span> ${model.cltc || '-'}</p>
                <p class="price"><span class="label">PRICE:</span> <span class="price-value">${model.price || '0'}</span></p>
            </div>
        `;
    });
    
    html += `
            </div>
        </section>

        <!-- Exterior Colors Section (2-Column Layout) -->
        <section class="exterior-section">
            <h2 class="section-title">
                <span class="title-bar"></span>
                EXTERIOR COLORS AVAILABLE
            </h2>
            <div class="exterior-grid">
    `;
    
    // 添加外观颜色
    (quote.exteriorColors || []).forEach(color => {
        const imageUrl = color.image ? color.image : 
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NzAiIGhlaWdodD0iMjcwIiB2aWV3Qm94PSIwIDAgNDcwIDI3MCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjQ3MCIgaGVpZ2h0PSIyNzAiIGZpbGw9IiNmNWY1ZjUiLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxyZWN0IHg9IjEwJSIgeT0iMTAiIHdpZHRoPSI4MCUiIGhlaWdodD0iODAlIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=';
        html += `
            <div class="color-item">
                <img src="${imageUrl}" alt="${color.name || '颜色'}" class="vehicle-image">
                <div class="color-label">${color.name || '颜色'}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </section>

        <!-- Interior Display Section -->
        <section class="interior-section">
            <h2 class="section-title">
                <span class="title-bar"></span>
                INTERIOR DISPLAY
            </h2>
            <div class="interior-grid">
    `;
    
    // 添加内饰图片
    (quote.interiorImages || []).forEach((item, index) => {
        if (item && item.image) {
            html += `
                <div class="interior-item">
                    <img src="${item.image}" alt="Interior" class="vehicle-image">
                </div>
            `;
        } else {
            html += `
                <div class="interior-item">
                    <div class="placeholder-image">INTERIOR ${index + 1}</div>
                </div>
            `;
        }
    });
    
    html += `
            </div>
        </section>

        <!-- Attention Section -->
        <section class="attention-section">
            <h2 class="attention-title">ATTENTION:</h2>
            <div class="attention-list">
    `;
    
    // 添加注意事项
    (quote.attentionItems || []).forEach(item => {
        html += `
            <p>${item}</p>
        `;
    });
    
    html += `
            </div>
        </section>
    </body>
    </html>
    `;
    
    return html;
}

/**
 * 预览报价单
 * @param {object} quote - 报价单数据
 */
export function previewQuote(quote) {
    if (!quote) return;
    
    // 将报价单数据存储到localStorage
    localStorage.setItem('previewQuoteData', JSON.stringify(quote));
    
    // 直接打开standalone-preview.html页面
    window.open('standalone-preview.html', '_blank');
}

/**
 * 预览当前编辑的报价单
 * @param {object} currentQuote - 当前编辑的报价单数据
 */
export function previewCurrentQuote(currentQuote) {
    if (!currentQuote) return;
    
    // 将报价单数据存储到localStorage
    localStorage.setItem('previewQuoteData', JSON.stringify(currentQuote));
    
    // 直接打开standalone-preview.html页面
    window.open('standalone-preview.html', '_blank');
}

/**
 * 生成并下载报价单为HTML文件
 * @param {object} quote - 报价单数据
 */
export function downloadQuoteAsHtml(quote) {
    if (!quote) return;
    
    // 使用完整的预览HTML生成函数（包含内联样式）
    const html = generateFullPreviewHtml(quote);
    
    // 创建Blob对象
    const blob = new Blob([html], { type: 'text/html' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${quote.name || '报价单'}_${new Date().toISOString().split('T')[0]}.html`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    URL.revokeObjectURL(link.href);
}