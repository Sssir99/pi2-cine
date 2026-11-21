// Pantalla de entrada del panel: el estado del catálogo de un vistazo.
//
// No es un módulo CRUD: es una lectura de las cinco colecciones que ya existen, así que
// usa las mismas listas que las pantallas de Media, Géneros, Directores, Productoras y
// Tipos, sin endpoints nuevos. Si la API falla, avisa y deja reintentar como las demás.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../components/EncabezadoPagina'
import Portada from '../components/Portada'
import { listarMedia } from '../api/media'
import { listarGeneros } from '../api/generos'
import { listarDirectores } from '../api/directores'
import { listarProductoras } from '../api/productoras'
import { listarTipos } from '../api/tipos'

const CIFRAS = [
  { ruta: '/media', etiqueta: 'Títulos', clave: 'media' },
  { ruta: '/generos', etiqueta: 'Géneros', clave: 'generos' },
  { ruta: '/directores', etiqueta: 'Directores', clave: 'directores' },
  { ruta: '/productoras', etiqueta: 'Productoras', clave: 'productoras' },
  { ruta: '/tipos', etiqueta: 'Tipos', clave: 'tipos' },
]

const ULTIMOS = 4

const VACIO = { media: [], generos: [], directores: [], productoras: [], tipos: [] }

export default function ResumenPage() {
  const [datos, setDatos] = useState(VACIO)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [media, generos, directores, productoras, tipos] = await Promise.all([
        listarMedia(),
        listarGeneros(),
        listarDirectores(),
        listarProductoras(),
        listarTipos(),
      ])
      setDatos({ media, generos, directores, productoras, tipos })
    } catch (fallo) {
      setError(fallo.mensaje)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // Sincronización con la API al montar: es el caso legítimo de efecto con estado.
    // oxlint-disable-next-line react/set-state-in-effect
    cargar()
  }, [cargar])

  const nombreGenero = useMemo(() => {
    const mapa = new Map(datos.generos.map((g) => [g._id, g.nombre]))
    return (id) => mapa.get(id) || 'Sin género'
  }, [datos.generos])

  const nombreTipo = useMemo(() => {
    const mapa = new Map(datos.tipos.map((t) => [t._id, t.nombre]))
    return (id) => mapa.get(id) || 'Sin tipo'
  }, [datos.tipos])

  // Reparto por género: todos los géneros, también los que no tienen títulos, para que
  // se vea de un golpe qué está sin usar.
  const reparto = useMemo(() => {
    const cuentas = new Map(datos.generos.map((g) => [g._id, 0]))
    for (const titulo of datos.media) {
      if (cuentas.has(titulo.genero)) cuentas.set(titulo.genero, cuentas.get(titulo.genero) + 1)
    }
    return datos.generos
      .map((g) => ({ id: g._id, nombre: g.nombre, cuantos: cuentas.get(g._id) }))
      .sort((a, b) => b.cuantos - a.cuantos || a.nombre.localeCompare(b.nombre))
  }, [datos.media, datos.generos])

  const maximo = Math.max(1, ...reparto.map((r) => r.cuantos))
  const ultimos = datos.media.slice(0, ULTIMOS)

  if (cargando) {
    return (
      <div className="caja estado-caja" role="status">
        <div className="spinner-border spinner-acento" aria-hidden="true" />
        <p className="estado-texto">Cargando…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="caja estado-caja">
        <p className="estado-titulo">No se pudo cargar la información</p>
        <p className="estado-texto">{error}</p>
        <button type="button" className="btn-fantasma" onClick={cargar}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Resumen"
        subtitulo="Qué hay en el catálogo ahora mismo"
        accion={
          <Link className="btn-fantasma" to="/media">
            Ver el catálogo
          </Link>
        }
      />

      <div className="rejilla-cifras">
        {CIFRAS.map((cifra) => (
          <Link key={cifra.clave} className="cifra-tarjeta" to={cifra.ruta}>
            <span className="cifra-tarjeta__numero">{datos[cifra.clave].length}</span>
            <span className="cifra-tarjeta__etiqueta">{cifra.etiqueta}</span>
          </Link>
        ))}
      </div>

      <div className="rejilla-doble">
        <section className="panel" aria-labelledby="titulo-ultimos">
          <h2 id="titulo-ultimos">Agregados recientemente</h2>
          {ultimos.length === 0 ? (
            <p className="panel-vacio">
              Todavía no hay títulos. <Link to="/media">Agrega el primero</Link>.
            </p>
          ) : (
            <ul className="lista-limpia">
              {ultimos.map((titulo) => (
                <li key={titulo._id}>
                  <Link className="fila-lista" to="/media">
                    <Portada url={titulo.imagenPortada} titulo={titulo.titulo} />
                    <span className="fila-lista__texto">
                      <span className="titulo-fila">{titulo.titulo}</span>
                      <span className="detalle-fila">
                        {titulo.anioEstreno ?? 'Sin año'} · {nombreGenero(titulo.genero)} ·{' '}
                        {nombreTipo(titulo.tipo)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="titulo-generos">
          <h2 id="titulo-generos">Títulos por género</h2>
          <ul className="lista-limpia">
            {reparto.map((fila) => (
              <li key={fila.id} className="fila-barra">
                <span className="fila-barra__texto">
                  <span>{fila.nombre}</span>
                  <span className="cifra">{fila.cuantos}</span>
                </span>
                <span className="barra" aria-hidden="true">
                  <span style={{ width: `${(fila.cuantos / maximo) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
