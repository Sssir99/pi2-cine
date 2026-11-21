import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { comprobarApi } from '../api/cliente'
import {
  IconoDirector,
  IconoGenero,
  IconoLuna,
  IconoMedia,
  IconoMenu,
  IconoProductora,
  IconoResumen,
  IconoSol,
  IconoTipo,
} from './Iconos'

const MODULOS = [
  { ruta: '/', nombre: 'Resumen', exacta: true, Icono: IconoResumen },
  { ruta: '/media', nombre: 'Media', Icono: IconoMedia },
  { ruta: '/generos', nombre: 'Géneros', Icono: IconoGenero },
  { ruta: '/directores', nombre: 'Directores', Icono: IconoDirector },
  { ruta: '/productoras', nombre: 'Productoras', Icono: IconoProductora },
  { ruta: '/tipos', nombre: 'Tipos', Icono: IconoTipo },
]

const INTERVALO_API = 30000

export default function Layout({ children }) {
  // null = comprobando; true/false = resultado de la última comprobación.
  const [apiEnLinea, setApiEnLinea] = useState(null)
  // En móvil el menú vive en un cajón lateral: oculto por defecto y se abre con el botón.
  const [menuAbierto, setMenuAbierto] = useState(false)
  // Tema claro u oscuro: se lee del <html> (main.jsx ya aplicó el guardado) y se guarda.
  const [tema, setTema] = useState(() =>
    document.documentElement.dataset.tema === 'claro' ? 'claro' : 'oscuro',
  )

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.documentElement.setAttribute('data-bs-theme', tema === 'claro' ? 'light' : 'dark')
    localStorage.setItem('tema', tema)
  }, [tema])

  useEffect(() => {
    let vivo = true

    const comprobar = async () => {
      const estado = await comprobarApi()
      if (vivo) setApiEnLinea(estado)
    }

    // Si cualquier petición de la app recibe respuesta, la API está viva: el pie se pone
    // en verde en ese momento en vez de esperar hasta el siguiente sondeo.
    const alVivir = () => setApiEnLinea(true)
    window.addEventListener('api:viva', alVivir)

    comprobar()
    const intervalo = setInterval(comprobar, INTERVALO_API)
    return () => {
      vivo = false
      window.removeEventListener('api:viva', alVivir)
      clearInterval(intervalo)
    }
  }, [])

  // ESC cierra el cajón, como cualquier capa que se superpone al contenido.
  useEffect(() => {
    if (!menuAbierto) return undefined
    const alPulsar = (evento) => {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [menuAbierto])

  const estadoApi = apiEnLinea === null ? 'dudoso' : apiEnLinea ? '' : 'caido'
  const textoApi = apiEnLinea === null ? 'Comprobando API…' : apiEnLinea ? 'API en línea' : 'API sin conexión'

  return (
    <div className="app">
      {/* Solo en móvil: botón del cajón, marca y estado de la API de un vistazo. */}
      <header className="barra-movil">
        <button
          type="button"
          className="boton-menu"
          aria-expanded={menuAbierto}
          aria-controls="menu-lateral"
          aria-label={menuAbierto ? 'Cerrar el menú' : 'Abrir el menú'}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <IconoMenu abierto={menuAbierto} tamano={20} />
        </button>
        <span className="marca marca--movil">
          PI2 <span>Cine</span>
        </span>
        <span className={`punto ${estadoApi}`.trim()} aria-hidden="true" />
        <span className="visually-hidden">{textoApi}</span>
      </header>

      {menuAbierto ? (
        <div className="velo" onClick={() => setMenuAbierto(false)} aria-hidden="true" />
      ) : null}

      <aside
        id="menu-lateral"
        className={`lateral${menuAbierto ? ' abierto' : ''}`}
        aria-label="Panel de administración"
      >
        <div className="marca">
          PI2 <span>Cine</span>
          <button
            type="button"
            className="cerrar-menu"
            aria-label="Cerrar el menú"
            onClick={() => setMenuAbierto(false)}
          >
            <IconoMenu abierto />
          </button>
        </div>
        <nav aria-label="Módulos del sistema">
          {MODULOS.map((modulo) => (
            <NavLink
              key={modulo.ruta}
              to={modulo.ruta}
              end={modulo.exacta}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) => `nav-item${isActive ? ' activo' : ''}`}
            >
              <modulo.Icono />
              {modulo.nombre}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="tema"
          onClick={() => setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'))}
          aria-label={`Cambiar al tema ${tema === 'claro' ? 'oscuro' : 'claro'}`}
        >
          {tema === 'claro' ? <IconoLuna /> : <IconoSol />}
          <span>{tema === 'claro' ? 'Tema oscuro' : 'Tema claro'}</span>
        </button>

        <div className="pie">
          <span className={`punto ${estadoApi}`.trim()} aria-hidden="true" />
          <span>{textoApi}</span>
        </div>
      </aside>

      <main className="principal">{children}</main>
    </div>
  )
}
