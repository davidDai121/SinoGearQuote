import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getQuoteById } from '../../services/adminService';
import Header from '../Header';
import TitleSection from '../TitleSection';
import '../../assets/styles/quote-viewer.css';

function QuoteViewer() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = () => {
      const quoteData = getQuoteById(id);
      if (quoteData) {
        setQuote(quoteData);
      } else {
        setError('未找到该报价单');
      }
      setLoading(false);
    };

    fetchQuote();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <a href="/" className="btn btn-primary">返回首页</a>
      </div>
    );
  }

  return (
    <div className="quote-viewer">
      <Header />
      <TitleSection />
      
      <main className="quote-content">
        <div className="quote-header">
          <h2>车辆报价单</h2>
          <p className="quote-customer">客户：{quote.customerName}</p>
        </div>

        <div className="quote-details">
          <div className="model-section">
            <h3>车型信息</h3>
            {quote.selectedModels && quote.selectedModels.length > 0 ? (
              // 显示多个车型信息
              <div className="models-grid">
                {quote.selectedModels.map((model, index) => (
                  <div key={`${model.id || model.name}-${index}`} className="model-card">
                    {model.image && (
                      <div className="model-image">
                        <img src={model.image} alt={model.name} />
                      </div>
                    )}
                    <h4>{model.name}</h4>
                    <div className="model-info">
                      <div className="info-item">
                        <span className="label">能源类型：</span>
                        <span className="value">{model.energy}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">电池信息：</span>
                        <span className="value">{model.battery}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">续航里程：</span>
                        <span className="value">{model.cltc}</span>
                      </div>
                      
                      {/* 显示多价格信息 */}
                      {model.prices && model.prices.length > 0 ? (
                        model.prices.map((price, priceIndex) => (
                          <div key={priceIndex} className="info-item price">
                            <span className="label">
                              {price.type ? `${price.type}：` : priceIndex === 0 ? "价格：" : `价格${priceIndex + 1}：`}
                            </span>
                            <span className="value">{price.amount}</span>
                          </div>
                        ))
                      ) : (
                        <div className="info-item price">
                          <span className="label">价格：</span>
                          <span className="value">{model.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 显示单个车型信息（保持向后兼容）
              <div className="model-card">
                {quote.modelDetails.image && (
                  <div className="model-image">
                    <img src={quote.modelDetails.image} alt={quote.modelDetails.name} />
                  </div>
                )}
                <h4>{quote.modelDetails.name}</h4>
                <div className="model-info">
                  <div className="info-item">
                    <span className="label">能源类型：</span>
                    <span className="value">{quote.modelDetails.energy}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">电池信息：</span>
                    <span className="value">{quote.modelDetails.battery}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">续航里程：</span>
                    <span className="value">{quote.modelDetails.cltc}</span>
                  </div>
                  
                  {/* 显示多价格信息 */}
                  {quote.modelDetails.prices && quote.modelDetails.prices.length > 0 ? (
                    quote.modelDetails.prices.map((price, index) => (
                      <div key={index} className="info-item price">
                        <span className="label">
                          {price.type ? `${price.type}：` : index === 0 ? "价格：" : `价格${index + 1}：`}
                        </span>
                        <span className="value">{price.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="info-item price">
                      <span className="label">价格：</span>
                      <span className="value">{quote.modelDetails.price}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="color-section">
            <h3>外观颜色</h3>
            {quote.selectedColors && quote.selectedColors.length > 0 ? (
              // 显示多个颜色
              <div className="colors-grid">
                {quote.selectedColors.map((color, index) => (
                  <div key={`${color.id || color.name}-${index}`} className="color-display">
                    <img 
                      src={color.image} 
                      alt={color.name} 
                      className="color-image"
                    />
                    <p className="color-name">{color.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              // 显示单个颜色（保持向后兼容）
              <div className="color-display">
                <img 
                  src={quote.colorDetails.image} 
                  alt={quote.colorDetails.name} 
                  className="color-image"
                />
                <p className="color-name">{quote.colorDetails.name}</p>
              </div>
            )}
          </div>
          
          {/* 内饰部分 */}
          {quote.selectedInteriorItems && quote.selectedInteriorItems.length > 0 && (
            <div className="interior-section">
              <h3>内饰选择</h3>
              <div className="interior-grid">
                {quote.selectedInteriorItems.map((item, index) => (
                  <div key={`${item.id || item.name}-${index}`} className="interior-display">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="interior-image"
                    />
                    <p className="interior-name">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 单个内饰显示（向后兼容）*/}
          {!quote.selectedInteriorItems && quote.interiorDetails && (
            <div className="interior-section">
              <h3>内饰选择</h3>
              <div className="interior-display">
                <img 
                  src={quote.interiorDetails.image} 
                  alt={quote.interiorDetails.name} 
                  className="interior-image"
                />
                <p className="interior-name">{quote.interiorDetails.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="quote-footer">
          <p>感谢您选择我们的产品！如有任何问题，请随时联系我们。</p>
        </div>
      </main>

      <footer className="quote-footer">
        <p className="copyright">© 2025 SinoGear. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default QuoteViewer;