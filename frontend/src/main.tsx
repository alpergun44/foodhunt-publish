import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

const App   = lazy(() => import('./pages/App'))
const Admin = lazy(() => import('./pages/Admin'))
const Legal = lazy(() => import('./pages/Legal'))
const Auth  = lazy(() => import('./pages/Auth'))

const NotFound = () => (
  <div className="min-h-screen bg-brand-dark flex items-center justify-center text-center px-6">
    <div className="max-w-md">
      <div className="text-6xl mb-6 select-none">🍽</div>
      <h1 className="text-2xl font-semibold text-brand-cream mb-2 tracking-tight">Sayfa bulunamadı</h1>
      <p className="text-brand-muted mb-8">Aradığın sayfa mevcut değil veya taşınmış olabilir.</p>
      <a href="/" className="btn-primary inline-block">Ana sayfaya dön</a>
    </div>
  </div>
)

const LoadingFallback = () => (
  <div className="min-h-screen bg-brand-dark flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-brand-muted/30 border-t-brand-cream animate-spin" />
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
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
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
