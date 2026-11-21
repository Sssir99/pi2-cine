import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { comprobarApi } from '../api/cliente'

const MODULOS = [
  { ruta: '/', nombre: 'Resumen', exacta: true },
  { ruta: '/media', nombre: 'Media' },
  { ruta: '/generos', nombre: 'Géneros' },
  { ruta: '/directores', nombre: 'Directores' },
  { ruta: '/productoras', nombre: 'Productoras' },
  { ruta: '/tipos', nombre: 'Tipos' },
]

const INTERVALO_API = 30000

export default function Layout({ children }) {
  // null = comprobando; true/false = resultado de la última comprobación.
  const [apiEnLinea, setApiEnLinea] = useState(null)

  useEffect(() => {
    let vivo = true

    const comprobar = async () => {
      const estado = await comprobarApi()
      if (vivo) setApiEnLinea(estado)
    }

    comprobar()
    const intervalo = setInterval(comprobar, INTERVALO_API)
    return () => {
      vivo = false
      clearInterval(intervalo)
    }
  }, [])

  const estadoApi = apiEnLinea === null ? 'dudoso' : apiEnLinea ? '' : 'caido'
  const textoApi = apiEnLinea === null ? 'Comprobando API…' : apiEnLinea ? 'API en línea' : 'API sin conexión'

  return (
    <div className="app">
      <aside className="lateral" aria-label="Panel de administración">
        <div className="marca">
          PI2 <span>Cine</span>
        </div>
        <nav aria-label="Módulos del sistema">
          {MODULOS.map((modulo) => (
            <NavLink
              key={modulo.ruta}
              to={modulo.ruta}
              end={modulo.exacta}
              className={({ isActive }) => `nav-item${isActive ? ' activo' : ''}`}
            >
              {modulo.nombre}
            </NavLink>
          ))}
        </nav>
        <div className="pie">
          <span className={`punto ${estadoApi}`.trim()} aria-hidden="true" />
          <span>{textoApi}</span>
        </div>
      </aside>

      <main className="principal">{children}</main>
    </div>
  )
}
