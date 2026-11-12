import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import MediaPage from './pages/MediaPage'
import GenerosPage from './pages/GenerosPage'
import DirectoresPage from './pages/DirectoresPage'
import ProductorasPage from './pages/ProductorasPage'
import TiposPage from './pages/TiposPage'

// Una ruta por módulo. "/" abre Media, que es la pantalla principal del panel.
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/media" replace />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/generos" element={<GenerosPage />} />
          <Route path="/directores" element={<DirectoresPage />} />
          <Route path="/productoras" element={<ProductorasPage />} />
          <Route path="/tipos" element={<TiposPage />} />
          <Route path="*" element={<Navigate to="/media" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
