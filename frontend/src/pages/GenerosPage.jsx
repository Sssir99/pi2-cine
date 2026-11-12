import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Géneros.
// Esta pantalla la construye otro integrante del equipo. Copiar la anatomía de
// MediaPage.jsx (DISENO_UI.md §7) usando api/generos.js, TablaListado y
// ModalFormulario. Columnas: nombre, descripción, estado, fecha de actualización.
export default function GenerosPage() {
  return (
    <>
      <EncabezadoPagina titulo="Géneros" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Se construye copiando la anatomía de Media (DISENO_UI.md §7) sobre api/generos.js.
        </p>
      </div>
    </>
  )
}
