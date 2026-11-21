import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/tema.css'
import App from './App.jsx'

// El tema guardado se aplica antes de pintar: así no se ve un parpadeo del tema oscuro
// cuando el usuario eligió el claro. Bootstrap lee data-bs-theme; el resto, data-tema.
const guardado = localStorage.getItem('tema') === 'claro' ? 'claro' : 'oscuro'
document.documentElement.dataset.tema = guardado
document.documentElement.setAttribute('data-bs-theme', guardado === 'claro' ? 'light' : 'dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
