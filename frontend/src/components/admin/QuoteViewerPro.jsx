import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getQuoteById } from '../../services/adminService'
import '../../assets/styles/quote-viewer-pro.css'

function QuoteViewerPro() {
  const { id } = useParams()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const q = await getQuoteById(id)
      setQuote(q)
      setLoading(false)
    }
    run()
  }, [id])

  if (loading) return <div className="pro-loading">Loading...</div>
  if (!quote) return <div className="pro-error">Not Found</div>

  const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' }).replace(/\//g, '.')
  const models = (quote.models && quote.models.length ? quote.models : (quote.selectedModels && quote.selectedModels.length ? quote.selectedModels : (quote.modelDetails ? [quote.modelDetails] : [])))
  const colors = (quote.exteriorImages && quote.exteriorImages.length ? quote.exteriorImages : (quote.colors && quote.colors.length ? quote.colors : (quote.selectedColors && quote.selectedColors.length ? quote.selectedColors : (quote.colorDetails ? [quote.colorDetails] : []))))
  const interiors = (quote.interiorImages && quote.interiorImages.length ? quote.interiorImages : (quote.interiors && quote.interiors.length ? quote.interiors : (quote.selectedInteriorItems && quote.selectedInteriorItems.length ? quote.selectedInteriorItems : (quote.interiorDetails ? [quote.interiorDetails] : []))))

  return (
    <div className="quote-pro">
      <header className="pro-header">
        <div className="pro-brand">
          <img src="/images/logo.png" alt="Logo" className="pro-logo" />
          <div className="pro-meta">
            <h1 className="pro-title">{quote.name || 'SinoGear Quote'}</h1>
            <div className="pro-date">DATE: {dateStr}</div>
          </div>
          <div className="pro-total">
            <div className="pro-total-label">TOTAL</div>
            <div className="pro-total-value">{quote.totalPrice || 0}</div>
          </div>
        </div>
      </header>

      <main className="pro-content">
        <section className="pro-section">
          <div className="pro-section-title">Vehicle Models</div>
          <div className="pro-grid models">
            {(models || []).filter(Boolean).map((m, i) => {
              const isObj = typeof m === 'object';
              const name = isObj ? (m.name || '') : '';
              const energy = isObj ? (m.energy || '') : '';
              const battery = isObj ? (m.battery || '') : '';
              const cltc = isObj ? (m.cltc || '') : '';
              const price = isObj ? ((m.prices && m.prices[0] && m.prices[0].amount) || m.price || '') : '';
              return (
                <div key={i} className="pro-card model">
                  <div className="pro-card-body">
                    <div className="pro-card-title">{name}</div>
                    <div className="pro-spec">
                      <div className="row"><span className="label">Energy Type</span><span className="value">{energy}</span></div>
                      <div className="row"><span className="label">Battery Info</span><span className="value">{battery}</span></div>
                      <div className="row"><span className="label">Range</span><span className="value">{cltc}</span></div>
                    </div>
                    <div className="pro-price">{price}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="pro-section">
          <div className="pro-section-title">Exterior Colors</div>
          <div className="pro-grid colors">
            {(colors || []).filter(Boolean).map((c, i) => {
              const isObj = typeof c === 'object';
              const url = isObj ? (c.url || c.image || '') : '';
              const name = isObj ? (c.name || '') : '';
              return (
                <div key={i} className="pro-card color">
                  <div className="pro-image">
                    <img src={url} alt={name} />
                  </div>
                  <div className="pro-card-body">
                    <div className="pro-card-title small">{name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="pro-section">
          <div className="pro-section-title">Interior</div>
          <div className="pro-grid interiors">
            {(interiors || []).filter(Boolean).map((n, i) => {
              const isObj = typeof n === 'object';
              const url = isObj ? (n.url || n.image || '') : '';
              const name = isObj ? (n.name || '') : '';
              return (
                <div key={i} className="pro-card interior">
                  <div className="pro-image">
                    <img src={url} alt={name} />
                  </div>
                  <div className="pro-card-body">
                    <div className="pro-card-title small">{name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="pro-footer-card">
          <div className="pro-footer-text">{quote.footerText || ''}</div>
        </section>
      </main>

      <footer className="pro-footer">© 2025 SinoGear</footer>
    </div>
  )
}

export default QuoteViewerPro