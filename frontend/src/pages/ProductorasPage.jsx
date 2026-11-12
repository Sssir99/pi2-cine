import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Productoras.
// Copiar la anatomía de MediaPage.jsx (DISENO_UI.md §7) usando api/productoras.js.
// Columnas: nombre, slogan, estado, fecha de actualización.
export default function ProductorasPage() {
  return (
    <>
      <EncabezadoPagina titulo="Productoras" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Se construye copiando la anatomía de Media (DISENO_UI.md §7) sobre api/productoras.js.
        </p>
      </div>
    </>
  )
}
