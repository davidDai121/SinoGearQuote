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
  const models = (quote.selectedModels && quote.selectedModels.length ? quote.selectedModels : (quote.models || (quote.modelDetails ? [quote.modelDetails] : [])))
  const colors = (quote.exteriorImages && quote.exteriorImages.length ? quote.exteriorImages : (quote.selectedColors && quote.selectedColors.length ? quote.selectedColors : (quote.colors || (quote.colorDetails ? [quote.colorDetails] : []))))
  const interiors = (quote.interiorImages && quote.interiorImages.length ? quote.interiorImages : (quote.selectedInteriorItems && quote.selectedInteriorItems.length ? quote.selectedInteriorItems : (quote.interiors || (quote.interiorDetails ? [quote.interiorDetails] : []))))

  return (
    <div className="quote-pro">
      <header className="pro-header">
        <div className="pro-brand">
          <img src="/images/logo.png" alt="Logo" className="pro-logo" />
          <div className="pro-meta">
            <h1 className="pro-title">{quote.quoteName || 'SinoGear Quote'}</h1>
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
            {(models || []).map((m, i) => (
              <div key={i} className="pro-card model">
                {m.image ? (
                  <div className="pro-image"><img src={m.image} alt={m.name || ''} /></div>
                ) : null}
                <div className="pro-card-body">
                  <div className="pro-card-title">{m.name || ''}</div>
                  <div className="pro-spec">
                    <div className="row"><span className="label">Energy Type</span><span className="value">{m.energy || ''}</span></div>
                    <div className="row"><span className="label">Battery Info</span><span className="value">{m.battery || ''}</span></div>
                    <div className="row"><span className="label">Range</span><span className="value">{m.cltc || ''}</span></div>
                  </div>
                  <div className="pro-price">{(m.prices && m.prices[0] && m.prices[0].amount) || m.price || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pro-section">
          <div className="pro-section-title">Exterior Colors</div>
          <div className="pro-grid colors">
            {(colors || []).map((c, i) => (
              <div key={i} className="pro-card color">
                <div className="pro-image">
                  <img src={c.url || c.image || ''} alt={c.name || ''} />
                </div>
                <div className="pro-card-body">
                  <div className="pro-card-title small">{c.name || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pro-section">
          <div className="pro-section-title">Interior</div>
          <div className="pro-grid interiors">
            {(interiors || []).map((n, i) => (
              <div key={i} className="pro-card interior">
                <div className="pro-image">
                  <img src={n.url || n.image || ''} alt={n.name || ''} />
                </div>
                <div className="pro-card-body">
                  <div className="pro-card-title small">{n.name || ''}</div>
                </div>
              </div>
            ))}
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