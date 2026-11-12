import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Tipos.
// Copiar la anatomía de MediaPage.jsx (DISENO_UI.md §7) usando api/tipos.js.
// Columnas: nombre, descripción, fecha de actualización. Tipo NO tiene estado:
// ni columna ni campo en el formulario.
export default function TiposPage() {
  return (
    <>
      <EncabezadoPagina titulo="Tipos" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Se construye copiando la anatomía de Media (DISENO_UI.md §7) sobre api/tipos.js.
        </p>
      </div>
    </>
  )
}
