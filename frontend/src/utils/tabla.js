// Orden y filtro de tablas, en el cliente.
//
// Se hacen aquí y no en la API porque el catálogo entero ya viene en una sola lista
// (son decenas de registros, no miles): filtrar y ordenar sin ir al servidor es
// instantáneo y no cambia el contrato de RUTAS.md.

// Compara dos valores de una celda. Los vacíos van siempre al final, sea cual sea
// el sentido del orden, para que no aparezcan arriba al invertir la columna.
function comparar(a, b, sentido) {
  const vacioA = a === null || a === undefined || a === ''
  const vacioB = b === null || b === undefined || b === ''
  if (vacioA && vacioB) return 0
  if (vacioA) return 1
  if (vacioB) return -1

  if (typeof a === 'number' && typeof b === 'number') return (a - b) * sentido

  // localeCompare con numeric: "2021" > "2010" y también ordena bien las fechas ISO.
  return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' }) * sentido
}

// Devuelve una copia ordenada. `columna` es la definición de la tabla: usa
// `columna.valor(fila)` si la celda se pinta con otra cosa (un nombre traducido, por
// ejemplo) y si no `fila[columna.clave]`.
export function ordenarFilas(filas, columna, direccion = 'asc') {
  if (!columna) return filas
  const sentido = direccion === 'desc' ? -1 : 1
  const valor = (fila) => (columna.valor ? columna.valor(fila) : fila[columna.clave])
  return [...filas].sort((a, b) => comparar(valor(a), valor(b), sentido))
}

// Filtro por texto libre sobre una o varias propiedades. Sin tildes y sin mayúsculas:
// "ficcion" encuentra "ciencia ficción".
const sinTildes = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function filtrarPorTexto(filas, texto, campos) {
  const buscado = sinTildes(texto).trim()
  if (!buscado) return filas
  return filas.filter((fila) => campos.some((campo) => sinTildes(fila[campo]).includes(buscado)))
}
