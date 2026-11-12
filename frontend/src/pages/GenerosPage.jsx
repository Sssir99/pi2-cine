import EncabezadoPagina from '../components/EncabezadoPagina'

// PENDIENTE — módulo Géneros.
// Esta pantalla la construye otro integrante del equipo: ver GUIA_MODULO.md (paso 2).
// Copia src/pages/PlantillaPage.ejemplo.jsx como GenerosPage.jsx y cambia los 5
// bloques marcados con ">>>". Columnas: nombre, descripción, estado, fecha de actualización.
export default function GenerosPage() {
  return (
    <>
      <EncabezadoPagina titulo="Géneros" subtitulo="Módulo en construcción" />
      <div className="caja estado-caja">
        <p className="estado-titulo">Esta pantalla todavía no está hecha</p>
        <p className="estado-texto">
          Hazla copiando <code>PlantillaPage.ejemplo.jsx</code> y siguiendo GUIA_MODULO.md.
        </p>
      </div>
    </>
  )
}
