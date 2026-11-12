import { useEffect, useRef } from 'react'
import Modal from 'bootstrap/js/dist/modal'

// Un solo modal para crear y editar: cambia el título y los valores iniciales.
// Los tres estados de la tabla los resuelve TablaListado; este componente solo
// se ocupa del formulario y de cerrarse cuando toca.
//
// Props: abierto, titulo, onCerrar, onGuardar, guardando, children.
// El botón "Guardar" envía el <form>, así que los `required` de los campos
// funcionan sin escribir validación a mano.
export default function ModalFormulario({ abierto, titulo, onCerrar, onGuardar, guardando, children }) {
  const contenedor = useRef(null)
  const instancia = useRef(null)
  const cerrarRef = useRef(onCerrar)

  // Última versión del callback, sin volver a montar el modal en cada render.
  useEffect(() => {
    cerrarRef.current = onCerrar
  })

  useEffect(() => {
    const nodo = contenedor.current
    instancia.current = new Modal(nodo, { backdrop: 'static' })

    const alOcultar = () => cerrarRef.current()
    nodo.addEventListener('hidden.bs.modal', alOcultar)

    return () => {
      nodo.removeEventListener('hidden.bs.modal', alOcultar)
      instancia.current?.dispose()
      instancia.current = null
    }
  }, [])

  useEffect(() => {
    const modal = instancia.current
    if (!modal) return
    if (abierto && !modal._isShown) modal.show()
    if (!abierto && modal._isShown) modal.hide()
  }, [abierto])

  // Mientras guarda no se cierra con ESC: evita que el usuario cierre a medias
  // y se quede sin saber si el registro se creó.
  useEffect(() => {
    if (instancia.current) instancia.current._config.keyboard = !guardando
  }, [guardando])

  const cerrar = () => {
    if (!guardando) onCerrar()
  }

  return (
    <div
      className="modal fade"
      ref={contenedor}
      tabIndex={-1}
      aria-labelledby="titulo-modal"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        {/* El <form> ES el .modal-content: si se mete dentro, rompe el flex de
            Bootstrap y el pie del modal se sale de la pantalla a 1366x768. */}
        <form
          className="modal-content"
          onSubmit={(evento) => {
            evento.preventDefault()
            if (!guardando) onGuardar()
          }}
        >
          <div className="modal-header">
            <h2 className="modal-title" id="titulo-modal">
              {titulo}
            </h2>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={cerrar}
              disabled={guardando}
            />
          </div>

          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button type="button" className="btn-fantasma" onClick={cerrar} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn-acento" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
