// UI渲染模块
import { formatDate } from './utils.js';

/**
 * 渲染报价单列表
 * @param {object} quotes - 报价单数据对象
 * @param {string|null} currentQuoteId - 当前选中的报价单ID
 */
export function renderQuoteList(quotes, currentQuoteId = null) {
    const quoteListContainer = document.getElementById('all-quotes-list');
    const noQuotesMessage = document.getElementById('no-quotes-message');
    
    if (!quoteListContainer || !noQuotesMessage) return;
    
    const quoteArray = Object.entries(quotes)
        .map(([id, quote]) => ({ id, ...quote }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (quoteArray.length === 0) {
        quoteListContainer.innerHTML = '';
        noQuotesMessage.style.display = 'block';
        return;
    }
    
    noQuotesMessage.style.display = 'none';
    
    let html = '';
    quoteArray.forEach(({ id, name, createdAt }) => {
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

/**
 * 渲染车型列表
 * @param {object} currentQuote - 当前报价单数据
 */
export function renderModels(currentQuote) {
    const modelsPreview = document.getElementById('models-preview');
    if (!modelsPreview || !currentQuote) return;
    
    modelsPreview.innerHTML = '';
    
    currentQuote.models.forEach(model => {
        const modelCard = document.createElement('div');
        modelCard.className = 'preview-card';
        modelCard.innerHTML = `
            <div>
                <h3>${model.name}</h3>
                <p><span class="label">ENERGY:</span> ${model.energy}</p>
                <p><span class="label">BATTERY:</span> ${model.battery}</p>
                <p><span class="label">CLTC:</span> ${model.cltc}</p>
                <p class="price"><span class="label">PRICE:</span> <span class="price-value">${model.price}</span></p>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editModel(${model.id})"><span class="material-icons">edit</span> 编辑</button>
                    <button class="btn btn-danger" onclick="deleteModel(${model.id})"><span class="material-icons">delete</span> 删除</button>
                </div>
            </div>
        `;
        modelsPreview.appendChild(modelCard);
    });
}

/**
 * 渲染外观颜色列表
 * @param {object} currentQuote - 当前报价单数据
 */
export function renderExteriorColors(currentQuote) {
    const colorsPreview = document.getElementById('colors-preview');
    if (!colorsPreview || !currentQuote) return;
    
    colorsPreview.innerHTML = '';
    
    currentQuote.exteriorColors.forEach(color => {
        const colorItem = document.createElement('div');
        colorItem.className = 'preview-card';
        colorItem.innerHTML = `
            <div style="position: relative;">
                <img src="${color.image}" alt="${color.name}" class="preview-image">
                <div class="color-label">${color.name}</div>
                <div class="action-buttons" style="position: absolute; bottom: 10px; right: 10px;">
                    <button class="btn btn-secondary" onclick="editColor(${color.id})"><span class="material-icons">edit</span> 编辑</button>
                    <button class="btn btn-danger" onclick="deleteColor(${color.id})"><span class="material-icons">delete</span> 删除</button>
                </div>
            </div>
        `;
        colorsPreview.appendChild(colorItem);
    });
}

/**
 * 渲染内饰图片
 * @param {object} currentQuote - 当前报价单数据
 * @param {array} uploadedImages - 已上传的临时图片
 */
export function renderInteriorImages(currentQuote, uploadedImages = []) {
    const previewContainer = document.getElementById('interior-images-preview');
    if (!previewContainer || !currentQuote) return;
    
    previewContainer.innerHTML = '';
    
    // 使用数据中的图片或上传的临时图片
    const imagesToDisplay = uploadedImages.length > 0 ? uploadedImages : currentQuote.interiorImages;
    
    imagesToDisplay.forEach((item, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'current-image-item';
        
        if (item.image) {
            imageItem.innerHTML = `
                <img src="${item.image}" alt="Interior ${index + 1}" class="current-image">
                <div class="remove-image" onclick="removeInteriorImage(${index})"><span class="material-icons">close</span></div>
            `;
        } else {
            imageItem.innerHTML = `
                <div class="current-image" style="display: flex; justify-content: center; align-items: center; background-color: #f5f5f5;">
                    内饰 ${index + 1}
                </div>
            `;
        }
        
        previewContainer.appendChild(imageItem);
    });
}

/**
 * 渲染注意事项列表
 * @param {object} currentQuote - 当前报价单数据
 */
export function renderAttentionItems(currentQuote) {
    const attentionList = document.getElementById('attention-list');
    if (!attentionList || !currentQuote) return;
    
    attentionList.innerHTML = '';
    
    currentQuote.attentionItems.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';
        listItem.style.marginBottom = '10px';
        listItem.style.padding = '10px';
        listItem.style.backgroundColor = 'white';
        listItem.style.borderRadius = '4px';
        listItem.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        
        listItem.innerHTML = `
            <div style="flex: 1; padding: 10px; margin-right: 10px;">
                <span style="font-weight: bold; margin-right: 10px;">${index + 1}.</span>
                ${item}
            </div>
            <button class="btn btn-danger" onclick="deleteAttention(${index})"><span class="material-icons">delete</span> 删除</button>
        `;
        attentionList.appendChild(listItem);
    });
}

/**
 * 生成报价单预览HTML
 * @param {object} quote - 报价单数据
 * @returns {string} 预览HTML内容
 */
export function generateQuotePreviewHtml(quote) {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${quote.basicInfo.pageTitle}</title>
        <link rel="stylesheet" href="public/css/styles.css">
    </head>
    <body>
        <!-- Header Section -->
        <header class="header">
            <!-- Left: SinoGear Logo -->
            <div class="logo-section">
                <img src="public/images/logo.png" alt="SinoGear Logo" class="logo">
            </div>
            <!-- Right: Company Information Placeholder -->
            <div class="company-info">
                <h1>${quote.basicInfo.companyName}</h1>
                <p>${quote.basicInfo.companyAddress.replace(/\n/g, '<br>')}</p>
            </div>
        </header>

        <!-- Quotation Title -->
        <section class="title-section">
            <h1>${quote.basicInfo.pageTitle}</h1>
            <span class="date">DATE: ${quote.basicInfo.pageDate}</span>
        </section>

        <!-- Vehicle Models Grid (3-3-1 Layout) -->
        <section class="models-section">
            <h2 class="section-title">VEHICLE MODELS</h2>
            <div class="models-grid">
    `;
    
    // 添加车型卡片
    quote.models.forEach(model => {
        html += `
            <div class="model-card">
                <h3>${model.name}</h3>
                <p><span class="label">ENERGY:</span> ${model.energy}</p>
                <p><span class="label">BATTERY:</span> ${model.battery}</p>
                <p><span class="label">CLTC:</span> ${model.cltc}</p>
                <p class="price"><span class="label">PRICE:</span> <span class="price-value">${model.price}</span></p>
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
    quote.exteriorColors.forEach(color => {
        html += `
            <div class="color-item">
                <img src="${color.image}" alt="${color.name}" class="vehicle-image">
                <div class="color-label">${color.name}</div>
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
    quote.interiorImages.forEach(item => {
        if (item.image) {
            html += `
                <div class="interior-item">
                    <img src="${item.image}" alt="Interior" class="vehicle-image">
                </div>
            `;
        } else {
            html += `
                <div class="interior-item">
                    <div class="placeholder-image">INTERIOR</div>
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
    quote.attentionItems.forEach(item => {
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