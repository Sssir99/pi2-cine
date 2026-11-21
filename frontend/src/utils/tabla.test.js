import { describe, expect, it } from 'vitest'
import { filtrarPorTexto, ordenarFilas } from './tabla'

const titulos = [
  { titulo: 'Dune', anioEstreno: 2021, genero: 'ciencia ficción', sinopsis: null },
  { titulo: 'Arrival', anioEstreno: 2016, genero: 'ciencia ficción', sinopsis: 'Lingüista' },
  { titulo: 'Breaking Bad', anioEstreno: 2008, genero: 'drama', sinopsis: 'Química' },
]

describe('ordenarFilas', () => {
  it('ordena números de menor a mayor y al revés', () => {
    const asc = ordenarFilas(titulos, { clave: 'anioEstreno' }, 'asc')
    expect(asc.map((t) => t.anioEstreno)).toEqual([2008, 2016, 2021])

    const desc = ordenarFilas(titulos, { clave: 'anioEstreno' }, 'desc')
    expect(desc.map((t) => t.anioEstreno)).toEqual([2021, 2016, 2008])
  })

  it('ordena texto en español, con tildes incluidas', () => {
    const filas = [{ nombre: 'ciencia ficción' }, { nombre: 'acción' }, { nombre: 'aventura' }]
    expect(ordenarFilas(filas, { clave: 'nombre' }).map((f) => f.nombre)).toEqual([
      'acción',
      'aventura',
      'ciencia ficción',
    ])
  })

  it('manda los vacíos al final en los dos sentidos', () => {
    const asc = ordenarFilas(titulos, { clave: 'sinopsis' }, 'asc')
    expect(asc[asc.length - 1].sinopsis).toBeNull()

    const desc = ordenarFilas(titulos, { clave: 'sinopsis' }, 'desc')
    expect(desc[desc.length - 1].sinopsis).toBeNull()
  })

  it('usa valor(fila) cuando la celda pinta otra cosa', () => {
    const filas = [
      { _id: '1', genero: 'b', nombreGenero: 'drama' },
      { _id: '2', genero: 'a', nombreGenero: 'acción' },
    ]
    const columna = { clave: 'genero', valor: (fila) => fila.nombreGenero }
    expect(ordenarFilas(filas, columna).map((f) => f._id)).toEqual(['2', '1'])
  })

  it('no toca el arreglo original', () => {
    const copia = [...titulos]
    ordenarFilas(titulos, { clave: 'titulo' })
    expect(titulos).toEqual(copia)
  })

  it('devuelve las filas tal cual si no hay columna', () => {
    expect(ordenarFilas(titulos, undefined)).toBe(titulos)
  })
})

describe('filtrarPorTexto', () => {
  it('encuentra sin tildes ni mayúsculas', () => {
    expect(filtrarPorTexto(titulos, 'FICCION', ['genero']).map((t) => t.titulo)).toEqual([
      'Dune',
      'Arrival',
    ])
  })

  it('busca en varias propiedades a la vez', () => {
    expect(filtrarPorTexto(titulos, 'química', ['titulo', 'sinopsis']).map((t) => t.titulo)).toEqual([
      'Breaking Bad',
    ])
  })

  it('devuelve todo cuando la caja está vacía', () => {
    expect(filtrarPorTexto(titulos, '   ', ['titulo'])).toBe(titulos)
  })

  it('ignora los valores nulos sin romperse', () => {
    expect(filtrarPorTexto(titulos, 'dune', ['titulo', 'sinopsis'])).toHaveLength(1)
  })
})
