import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AdminApp from './components/admin/AdminApp.jsx'
import QuoteViewer from './components/admin/QuoteViewer.jsx'
import QuotesList from './components/admin/QuotesList.jsx'
import QuoteDetails from './components/admin/QuoteDetails.jsx'
import './assets/styles/main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 默认路由直接进入admin主页 */}
        <Route path="/" element={<AdminApp />}>
          <Route index element={<QuotesList />} />
          <Route path="quotes" element={<QuotesList />} />
          <Route path="quotes/:id" element={<QuoteDetails />}>
            <Route index element={<div className="quote-details-placeholder">请选择一个配置项进行管理</div>} />
            <Route path="models" element={<QuoteDetails section="models" />} />
            <Route path="colors" element={<QuoteDetails section="colors" />} />
            <Route path="interior" element={<QuoteDetails section="interior" />} />
            <Route path="footer" element={<QuoteDetails section="footer" />} />
          </Route>
        </Route>
        <Route path="/quote/:id" element={<QuoteViewer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)