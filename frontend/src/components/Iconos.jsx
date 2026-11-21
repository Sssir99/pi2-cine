// Iconos de la interfaz. SVG en línea, heredan el color del texto (currentColor) y no
// traen dependencias: el proyecto usa Bootstrap solo por CSS y no tiene librería de iconos.
//
// Todos miden 16 px por defecto y comparten el mismo trazo (1.7, redondeado), para que se
// vean de la misma familia aunque estén dibujados a mano.

const BASE = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

function Con({ children, tamano = 16, ...resto }) {
  return (
    <svg {...BASE} width={tamano} height={tamano} {...resto}>
      {children}
    </svg>
  )
}

export function IconoResumen(props) {
  return (
    <Con {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Con>
  )
}

export function IconoMedia(props) {
  return (
    <Con {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </Con>
  )
}

export function IconoGenero(props) {
  return (
    <Con {...props}>
      <path d="M3 12.5V5a2 2 0 0 1 2-2h7.5L21 11.5 12.5 20z" />
      <circle cx="8" cy="8" r="1.4" />
    </Con>
  )
}

export function IconoDirector(props) {
  return (
    <Con {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5c0-3.6 3.4-5.7 7.5-5.7s7.5 2.1 7.5 5.7" />
    </Con>
  )
}

export function IconoProductora(props) {
  return (
    <Con {...props}>
      <path d="M4 21V6.5L10 4v17" />
      <path d="M10 9.5h10V21H10" />
      <path d="M6.5 9h1M6.5 12.5h1M6.5 16h1M13 13h1M13 16.5h1M16.5 13h1M16.5 16.5h1" />
    </Con>
  )
}

export function IconoTipo(props) {
  return (
    <Con {...props}>
      <path d="M12 3 3 7.5 12 12l9-4.5z" />
      <path d="M3 12.5 12 17l9-4.5" />
      <path d="M3 17 12 21.5 21 17" />
    </Con>
  )
}

export function IconoEditar(props) {
  return (
    <Con {...props}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </Con>
  )
}

export function IconoBorrar(props) {
  return (
    <Con {...props}>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.5h5V7" />
      <path d="M6.5 7 7.6 20h8.8L17.5 7" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </Con>
  )
}

export function IconoMenu({ abierto = false, ...props }) {
  return (
    <Con {...props}>
      {abierto ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </Con>
  )
}

export function IconoMas(props) {
  return (
    <Con {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Con>
  )
}
