import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import App from './App.jsx'
import AdminApp from './components/admin/AdminApp.jsx'
import QuoteViewer from './components/admin/QuoteViewer.jsx'
import QuoteViewerPro from './components/admin/QuoteViewerPro.jsx'
import QuotesList from './components/admin/QuotesList.jsx'
import QuoteDetails from './components/admin/QuoteDetails.jsx'
import ColorsEditor from './components/admin/ColorsEditor.jsx'
import InteriorEditor from './components/admin/InteriorEditor.jsx'
import ModelsEditor from './components/admin/ModelsEditor.jsx'
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
            <Route path="price" element={<PriceEditorWrapper />} />
            <Route path="exterior" element={<ExteriorImagesEditorWrapper />} />
            <Route path="interior" element={<InteriorImagesEditorWrapper />} />
          </Route>
        </Route>
        {/* 添加/admin前缀的路由作为别名，确保兼容性 */}
        <Route path="/admin" element={<AdminApp />}>
          <Route index element={<QuotesList />} />
          <Route path="quotes" element={<QuotesList />} />
          <Route path="quotes/:id" element={<QuoteDetails />}>
            <Route index element={<div className="quote-details-placeholder">请选择一个配置项进行管理</div>} />
            <Route path="price" element={<PriceEditorWrapper />} />
            <Route path="exterior" element={<ExteriorImagesEditorWrapper />} />
            <Route path="interior" element={<InteriorImagesEditorWrapper />} />
          </Route>
        </Route>
        <Route path="/quote/:id" element={<QuoteViewer />} />
        <Route path="/quote-pro/:id" element={<QuoteViewerPro />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

function PriceEditorWrapper() {
  const { id } = useParams()
  return <ModelsEditor _id={id} />
}

function ExteriorImagesEditorWrapper() {
  const { id } = useParams()
  return <ColorsEditor _id={id} />
}

function InteriorImagesEditorWrapper() {
  const { id } = useParams()
  return <InteriorEditor _id={id} />
}