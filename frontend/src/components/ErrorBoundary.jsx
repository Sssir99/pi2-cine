import { Component } from 'react'

// Si una pantalla lanza un error, React desmonta todo el árbol y la app queda en
// blanco. Con este límite se ve un mensaje legible y el resto del panel sigue vivo
// (la navegación funciona, así que se puede salir del módulo roto).
//
// Se reinicia solo al cambiar de ruta: en App.jsx va con key={ubicacion.pathname}.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Queda en la consola del navegador para poder ver el archivo y la línea.
    console.error('Error en una pantalla:', error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta sección no se pudo mostrar</p>
        <p className="estado-texto">
          {error.message || 'Ocurrió un error inesperado en esta pantalla.'}
        </p>
        <p className="estado-texto">
          Abre la consola del navegador (F12) para ver el archivo y la línea, o cambia de módulo en el menú.
        </p>
        <button
          type="button"
          className="btn-fantasma"
          onClick={() => this.setState({ error: null })}
        >
          Reintentar
        </button>
      </div>
    )
  }
}
