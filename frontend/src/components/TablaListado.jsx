import { IconoBorrar, IconoEditar } from './Iconos'

// Resuelve los tres estados de la tabla (cargando, error, vacío) y la tabla misma,
// para que ningún módulo los reinvente. Los estados viven en el MISMO contenedor
// que la tabla y se controlan con props, no con un `if` copiado por página.
//
// Props:
//   caption        texto del <caption> para lectores de pantalla
//   columnas       [{ clave, encabezado, render(fila), alineacion }]  (encabezadoOculto si el th va vacío;
//                                                            alineacion: 'derecha' para cifras y fechas)
//   filas          registros ya filtrados por la página
//   total          registros sin filtrar (para distinguir "vacío" de "sin resultados")
//   filtros        nodo opcional que se dibuja sobre la tabla (solo Media lo usa)
//   cargando       boolean
//   error          string | null
//   onReintentar   callback del botón Reintentar
//   vacio          { titulo, texto, textoAccion, onAccion } cuando no hay ningún registro
//   sinResultados  { titulo, texto } cuando hay registros pero los filtros no dejan pasar ninguno
//   nombreRegistro (fila) => string, para los aria-label de Editar/Eliminar
//   onEditar       (fila) => void   (opcional)
//   onEliminar     (fila) => void   (opcional)
//   orden          { campo, direccion } | null   columna ordenada ahora mismo
//   onOrdenar      (columna) => void   si se pasa, las columnas con `ordenable: true`
//                  se pueden pulsar para ordenar; el módulo decide cómo ordenar
const FILAS_ESQUELETO = 4

export default function TablaListado({
  caption,
  columnas = [],
  filas = [],
  total,
  filtros,
  cargando = false,
  error = null,
  onReintentar,
  vacio,
  sinResultados,
  nombreRegistro,
  onEditar,
  onEliminar,
  orden = null,
  onOrdenar = null,
}) {
  const totalRegistros = total ?? filas.length
  const conAcciones = Boolean(onEditar || onEliminar)

  const claseColumna = (columna) => (columna.alineacion === 'derecha' ? 'text-end' : undefined)

  if (cargando) {
    return (
      <div className="caja" aria-busy="true" role="status">
        <span className="visually-hidden">Cargando…</span>
        {/* Los filtros siguen ahí mientras carga: si desaparecen, la página da un salto
            y el usuario pierde lo que tenía escrito. */}
        {filtros}
        {Array.from({ length: FILAS_ESQUELETO }, (_, fila) => (
          <div className="esqueleto-fila" key={fila}>
            {columnas.map((columna, indice) => (
              <span
                key={columna.clave}
                className="esqueleto-bloque"
                style={{ maxWidth: `${74 + ((fila * 13 + indice * 29) % 70)}px` }}
              />
            ))}
            {conAcciones ? (
              <span className="esqueleto-bloque" style={{ maxWidth: '62px' }} />
            ) : null}
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="caja estado-caja">
        <p className="estado-titulo">No se pudo cargar la información</p>
        <p className="estado-texto">{error}</p>
        {onReintentar ? (
          <button type="button" className="btn-fantasma" onClick={onReintentar}>
            Reintentar
          </button>
        ) : null}
      </div>
    )
  }

  if (filas.length === 0) {
    const filtrado = totalRegistros > 0
    const texto = filtrado
      ? {
          titulo: sinResultados?.titulo || 'Ningún registro coincide con la búsqueda',
          texto: sinResultados?.texto || 'Prueba con otro texto o quita los filtros.',
        }
      : {
          titulo: vacio?.titulo || 'Sin registros',
          texto: vacio?.texto,
        }

    return (
      <div className="caja">
        {filtrado && filtros ? filtros : null}
        <div className="estado-caja">
          <p className="estado-titulo">{texto.titulo}</p>
          {texto.texto ? <p className="estado-texto">{texto.texto}</p> : null}
          {!filtrado && vacio?.onAccion ? (
            <button type="button" className="btn-acento" onClick={vacio.onAccion}>
              {vacio.textoAccion || 'Crear el primero'}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="caja">
      {filtros}
      <div className="table-responsive">
        <table className="table">
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columnas.map((columna) => {
                const activa = orden?.campo === columna.clave
                return (
                  <th
                    key={columna.clave}
                    scope="col"
                    className={claseColumna(columna)}
                    aria-sort={activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {columna.ordenable && onOrdenar ? (
                      <button
                        type="button"
                        className={`ordenar${activa ? ' activa' : ''}`}
                        onClick={() => onOrdenar(columna)}
                      >
                        {columna.encabezado}
                        <span className="ordenar__marca" aria-hidden="true">
                          {activa ? (orden.direccion === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    ) : (
                      columna.encabezado || (
                        <span className="visually-hidden">{columna.encabezadoOculto}</span>
                      )
                    )}
                  </th>
                )
              })}
              {conAcciones ? (
                <th scope="col" className="text-end">
                  <span className="visually-hidden">Acciones</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => {
              const nombre = nombreRegistro ? nombreRegistro(fila) : ''
              return (
                <tr key={fila._id}>
                  {columnas.map((columna) => (
                    <td
                      key={columna.clave}
                      data-label={columna.encabezado || columna.encabezadoOculto || ''}
                      className={claseColumna(columna)}
                    >
                      {columna.render ? columna.render(fila) : fila[columna.clave]}
                    </td>
                  ))}
                  {conAcciones ? (
                    <td data-label="">
                      <div className="acciones">
                        {onEditar ? (
                          <button
                            type="button"
                            className="icono"
                            aria-label={`Editar ${nombre}`}
                            title="Editar"
                            onClick={() => onEditar(fila)}
                          >
                            <IconoEditar />
                          </button>
                        ) : null}
                        {onEliminar ? (
                          <button
                            type="button"
                            className="icono peligro"
                            aria-label={`Eliminar ${nombre}`}
                            title="Eliminar"
                            onClick={() => onEliminar(fila)}
                          >
                            <IconoBorrar />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
