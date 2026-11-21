import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import MediaPage from './pages/MediaPage'
import ResumenPage from './pages/ResumenPage'
import GenerosPage from './pages/GenerosPage'
import DirectoresPage from './pages/DirectoresPage'
import ProductorasPage from './pages/ProductorasPage'
import TiposPage from './pages/TiposPage'

// Una ruta por módulo. "/" abre el Resumen, que es la pantalla de entrada del panel.
// El ErrorBoundary lleva key={pathname}: si una pantalla falla, al cambiar de módulo
// se reinicia solo en vez de quedarse pegado al error.
function Panel() {
  const { pathname } = useLocation()

  return (
    <Layout>
      <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/" element={<ResumenPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/generos" element={<GenerosPage />} />
          <Route path="/directores" element={<DirectoresPage />} />
          <Route path="/productoras" element={<ProductorasPage />} />
          <Route path="/tipos" element={<TiposPage />} />
          <Route path="*" element={<Navigate to="/media" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}

export default function App() {
  return (
    // Los dos flags de la v7 quitan los avisos que React Router 6 deja en la consola en
    // cada carga; el comportamiento no cambia y la consola queda limpia en la grabación.
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Panel />
    </BrowserRouter>
  )
}
