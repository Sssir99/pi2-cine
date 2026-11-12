import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Directores.
// Copia src/pages/PlantillaPage.ejemplo.jsx como DirectoresPage.jsx y sigue
// GUIA_MODULO.md. Columnas: nombres, estado, fecha de actualización. El campo es
// "nombres" (plural) y NO es único en la base.
export default function DirectoresPage() {
  return (
    <>
      <EncabezadoPagina titulo="Directores" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Hazla copiando <code>PlantillaPage.ejemplo.jsx</code> y siguiendo GUIA_MODULO.md.
        </p>
      </div>
    </>
  )
}
