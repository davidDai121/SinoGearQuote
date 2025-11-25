import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getQuoteById } from '../../services/adminService';
import Header from '../Header';
// 移除不需要的组件
// 移除所有不需要的组件导入
import '../../assets/styles/quote-viewer.css';

function QuoteViewer() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 图片查看器状态
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  // 移除不再使用的状态和函数

  useEffect(() => {
    const fetchQuote = async () => {
      const quoteData = await getQuoteById(id);
      if (quoteData) {
        setQuote(quoteData);
      } else {
        setError('未找到该报价单');
      }
      setLoading(false);
    };
    fetchQuote();
  }, [id]);

  // 显示加载状态
  if (loading) {
    return (
      <div className="loading-container">
        <p>加载中...</p>
      </div>
    );
  }

  // 显示错误状态
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
      {/* 移除TitleSection */}
      
      {/* 移除导航栏 */}
      
      {/* 只要有quote数据就显示报价单内容 */}
      {quote && (
        <main className="quote-content">
        <h1>{quote?.name}</h1>
        <p className="quote-date">
          DATE: {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(/\//g, '.')}
        </p>

        <div className="quote-details">
          <div className="model-section">
            <h3>Vehicle Models</h3>
            {Array.isArray(quote.models) && quote.models.length > 0 ? (
              <div className="models-grid">
                {quote.models.filter(Boolean).map((model, index) => {
                  const isObj = typeof model === 'object';
                  const name = isObj ? (model.name || '') : '';
                  const energy = isObj ? (model.energy || '') : '';
                  const battery = isObj ? (model.battery || '') : '';
                  const cltc = isObj ? (model.cltc || '') : '';
                  const prices = isObj ? (model.prices || []) : [];
                  const priceVal = isObj ? (model.price || '') : '';
                  return (
                    <div key={`model-${index}`} className="model-card">
                      <h4>{name}</h4>
                      <div className="model-info">
                        <div className="info-item">
                          <span className="label">Energy Type: </span>
                          <span className="value">{energy}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Battery Info: </span>
                          <span className="value">{battery}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Range: </span>
                          <span className="value">{cltc}</span>
                        </div>
                        {prices && prices.length > 0 ? (
                          prices.map((p, pIndex) => (
                            <div key={`price-${pIndex}`} className="info-item price">
                              <span className="label">{p?.type ? `${p.type}: ` : pIndex === 0 ? 'Price: ' : `Price ${pIndex + 1}: `}</span>
                              <span className="value">{p?.amount || ''}</span>
                            </div>
                          ))
                        ) : (
                          <div className="info-item price">
                            <span className="label">Price: </span>
                            <span className="value">{priceVal}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // 显示单个车型信息（保持向后兼容）
              <div className="model-card">
                
                <h4>{quote.modelDetails?.name || ''}</h4>
                <div className="model-info">
                  <div className="info-item">
                      <span className="label">Energy Type: </span>
                      <span className="value">{quote.modelDetails?.energy || ''}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Battery Info: </span>
                      <span className="value">{quote.modelDetails?.battery || ''}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Range: </span>
                      <span className="value">{quote.modelDetails?.cltc || ''}</span>
                    </div>
                  
                  {/* 显示多价格信息 */}
                  {Array.isArray(quote.modelDetails?.prices) && quote.modelDetails.prices.length > 0 ? (
                    quote.modelDetails.prices.map((price, index) => (
                      <div key={index} className="info-item price">
                        <span className="label">
                        {price.type ? `${price.type}: ` : index === 0 ? "Price: " : `Price ${index + 1}: `}
                      </span>
                        <span className="value">{price.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="info-item price">
                      <span className="label">Price: </span>
                      <span className="value">{quote.modelDetails?.price || ''}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="color-section">
            <h3>Exterior Colors</h3>
            {quote.exteriorImages && quote.exteriorImages.length > 0 ? (
              <div className="colors-grid">
                {quote.exteriorImages.map((image, index) => (
                  <div key={`exterior-${index}`} className="color-display">
                    <img 
                      src={image.url || ''} 
                      alt={image.name || 'Color'} 
                      className="color-image clickable-image"
                      onClick={() => {
                        if (image.url) {
                          setSelectedImage(image.url);
                          setSelectedImageName(image.name || 'Color');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <p className="color-name">{image.name}</p>
                  </div>
                ))}
              </div>
            ) : quote.colors && Array.isArray(quote.colors) && quote.colors.length > 0 ? (
              <div className="colors-grid">
                {quote.colors.filter(Boolean).map((color, index) => (
                  <div key={`color-${index}`} className="color-display">
                    <img 
                      src={color.image || ''} 
                      alt={color.name || 'Color'} 
                      className="color-image clickable-image"
                      onClick={() => {
                        if (color.image) {
                          setSelectedImage(color.image);
                          setSelectedImageName(color.name || 'Color');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <p className="color-name">{color.name}</p>
                  </div>
                ))}
              </div>
            ) : quote.selectedColors && quote.selectedColors.length > 0 ? (
              // 显示多个颜色，使用CSS控制的自适应列数
              <div className="colors-grid">
                {quote.selectedColors
                  .filter((color) => color !== null && color !== undefined)
                  .map((color, index) => {
                    const isObj = typeof color === 'object';
                    const imgSrc = isObj ? (color.image || '') : '';
                    const name = isObj ? (color.name || 'Color') : 'Color';
                    return (
                      <div key={`selected-color-${index}`} className="color-display">
                        <img
                          src={imgSrc}
                          alt={name}
                          className="color-image clickable-image"
                          onClick={() => {
                            if (imgSrc) {
                              setSelectedImage(imgSrc);
                              setSelectedImageName(name);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <p className="color-name">{name}</p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              // 显示单个颜色（保持向后兼容）
              <div className="color-display single-display">
                <img 
                  src={quote.colorDetails?.image || ''} 
                  alt={quote.colorDetails?.name || 'Color'} 
                  className="color-image clickable-image"
                  onClick={() => {
                    if (quote.colorDetails?.image) {
                      setSelectedImage(quote.colorDetails.image);
                      setSelectedImageName(quote.colorDetails.name || 'Color');
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <p className="color-name">{quote.colorDetails?.name || ''}</p>
              </div>
            )}
          </div>
          
          {/* 内饰部分 */}
          {quote.interiorImages && quote.interiorImages.length > 0 ? (
            <div className="interior-section">
              <h3>Interior Selection</h3>
              <div className="interior-grid">
                {quote.interiorImages.map((image, index) => (
                  <div key={`interior-${index}`} className="interior-display">
                    <img 
                      src={image.url || ''} 
                      alt={image.name || 'Interior'} 
                      className="interior-image clickable-image"
                      onClick={() => {
                        if (image.url) {
                          setSelectedImage(image.url);
                          setSelectedImageName(image.name || 'Interior');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <p className="interior-name">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : quote.interiors && Array.isArray(quote.interiors) && quote.interiors.length > 0 ? (
            <div className="interior-section">
              <h3>Interior Selection</h3>
              <div className="interior-grid">
                {quote.interiors.filter(Boolean).map((item, index) => (
                  <div key={`interior-pop-${index}`} className="interior-display">
                    <img 
                      src={item.image || ''} 
                      alt={item.name || 'Interior'} 
                      className="interior-image clickable-image"
                      onClick={() => {
                        if (item.image) {
                          setSelectedImage(item.image);
                          setSelectedImageName(item.name || 'Interior');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <p className="interior-name">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : quote.selectedInteriorItems && quote.selectedInteriorItems.length > 0 ? (
            <div className="interior-section">
              <h3>Interior Selection</h3>
              <div className="interior-grid">
                {quote.selectedInteriorItems
                  .filter(item => item !== null && item !== undefined)
                  .map((item, index) => {
                    const isObj = typeof item === 'object';
                    const imgSrc = isObj ? (item.image || '') : '';
                    const name = isObj ? (item.name || 'Interior') : 'Interior';
                    return (
                      <div key={`selected-interior-${index}`} className="interior-display">
                        <img 
                          src={imgSrc} 
                          alt={name} 
                          className="interior-image clickable-image"
                          onClick={() => {
                            if (imgSrc) {
                              setSelectedImage(imgSrc);
                              setSelectedImageName(name);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <p className="interior-name">{name}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : quote.interiorDetails ? (
            // 单个内饰显示（向后兼容）
            <div className="interior-section">
              <h3>Interior Selection</h3>
              <div className="interior-display single-display">
                <img 
                  src={quote.interiorDetails?.image || ''} 
                  alt={quote.interiorDetails?.name || 'Interior'} 
                  className="interior-image clickable-image"
                  onClick={() => {
                    if (quote.interiorDetails?.image) {
                      setSelectedImage(quote.interiorDetails.image);
                      setSelectedImageName(quote.interiorDetails.name || 'Interior');
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <p className="interior-name">{quote.interiorDetails.name}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* 页脚显示 - 从admin中获取设置的值 */}
        <div className="quote-footer">
          <p>{quote?.footerText || 'Thank you for choosing our products! Please feel free to contact us if you have any questions.'}</p>
        </div>
      </main>
      )}

      {/* 移除集成的App内容区域 */}

      <footer className="quote-footer">
        <p className="copyright">© 2025 SinoGear. All rights reserved.</p>
      </footer>
      
      {/* 图片查看器模态框 */}
      {selectedImage && (
        <div 
          className="image-viewer-modal" 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="image-viewer-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <button 
              className="image-viewer-close"
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '30px',
                cursor: 'pointer',
                padding: '10px',
                zIndex: 1001
              }}
            >
              ×
            </button>
            <div style={{ marginBottom: '15px', color: 'white', fontSize: '18px', fontWeight: '500' }}>
              {selectedImageName}
            </div>
            <img 
              src={selectedImage} 
              alt={selectedImageName}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '2px solid white'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteViewer;