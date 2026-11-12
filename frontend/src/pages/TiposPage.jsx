import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Tipos.
// Copia src/pages/PlantillaPage.ejemplo.jsx como TiposPage.jsx y sigue GUIA_MODULO.md.
// Columnas: nombre, descripción, fecha de actualización. Tipo NO tiene estado:
// borra el select, la columna y el import de BadgeEstado.
export default function TiposPage() {
  return (
    <>
      <EncabezadoPagina titulo="Tipos" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Hazla copiando <code>PlantillaPage.ejemplo.jsx</code> y siguiendo GUIA_MODULO.md.
        </p>
      </div>
    </>
  )
}
