import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'
import App from './pages/App'
import Admin from './pages/Admin'
import Legal from './pages/Legal'

const NotFound = () => (
  <div className="min-h-screen bg-brand-dark flex items-center justify-center text-center px-6">
    <div>
      <div className="text-6xl mb-4">🍽️</div>
      <h1 className="text-3xl font-bold text-brand-cream mb-2">Sayfa Bulunamadi</h1>
      <p className="text-brand-muted mb-6">Aradiginiz sayfa mevcut degil.</p>
      <a href="/" className="btn-primary inline-block">Ana Sayfaya Don</a>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<App />} />
        <Route path="/admin"    element={<Admin />} />
        <Route path="/kvkk"     element={<Legal page="kvkk" />} />
        <Route path="/kullanim" element={<Legal page="terms" />} />
        <Route path="/cerez"    element={<Legal page="cookies" />} />
        <Route path="*"         element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
