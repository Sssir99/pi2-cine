import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Productoras.
// Copia src/pages/PlantillaPage.ejemplo.jsx como ProductorasPage.jsx y sigue
// GUIA_MODULO.md. Columnas: nombre, slogan, estado, fecha de actualización.
export default function ProductorasPage() {
  return (
    <>
      <EncabezadoPagina titulo="Productoras" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Hazla copiando <code>PlantillaPage.ejemplo.jsx</code> y siguiendo GUIA_MODULO.md.
        </p>
      </div>
    </>
  )
}
