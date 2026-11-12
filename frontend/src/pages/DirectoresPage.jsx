import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Directores.
// Copiar la anatomía de MediaPage.jsx (DISENO_UI.md §7) usando api/directores.js.
// Columnas: nombres, estado, fecha de actualización. El campo es "nombres" (plural)
// y NO es único en la base.
export default function DirectoresPage() {
  return (
    <>
      <EncabezadoPagina titulo="Directores" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Se construye copiando la anatomía de Media (DISENO_UI.md §7) sobre api/directores.js.
        </p>
      </div>
    </>
  )
}
