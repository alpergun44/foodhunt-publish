import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'

const App = lazy(() => import('./pages/App'))
const Admin = lazy(() => import('./pages/Admin'))
const Legal = lazy(() => import('./pages/Legal'))
const Auth = lazy(() => import('./pages/Auth'))

const NotFound = () => (
  <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-center px-6">
    <div>
      <div className="text-8xl mb-6">🍔</div>
      <h1 className="text-3xl font-bold text-white mb-3">Sayfa Bulunamadı</h1>
      <p className="text-gray-400 mb-8 text-lg">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
      <a href="/" className="inline-block px-8 py-3 bg-[#FF6B35] text-white rounded-xl font-semibold text-lg hover:bg-[#e55d2d] transition active:scale-95">Ana Sayfaya Dön</a>
    </div>
  </div>
)

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
    <div className="animate-spin text-4xl">🍔</div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/"         element={<App />} />
              <Route path="/giris"    element={<Auth />} />
              <Route path="/profil"   element={<Auth />} />
              <Route path="/admin"    element={<Admin />} />
              <Route path="/kvkk"     element={<Legal page="kvkk" />} />
              <Route path="/kullanim" element={<Legal page="terms" />} />
              <Route path="/cerez"    element={<Legal page="cookies" />} />
              <Route path="*"         element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
