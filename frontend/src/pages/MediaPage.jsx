import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import Portada from '../components/Portada'
import Filtros, { Buscador, Selector } from '../components/Filtros'
import { ordenarFilas } from '../utils/tabla'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
import { actualizarMedia, crearMedia, eliminarMedia, listarMedia } from '../api/media'
import { listarGeneros } from '../api/generos'
import { listarDirectores } from '../api/directores'
import { listarProductoras } from '../api/productoras'
import { listarTipos } from '../api/tipos'

const FORMULARIO_VACIO = {
  serial: '',
  titulo: '',
  sinopsis: '',
  url: '',
  imagenPortada: '',
  anioEstreno: '',
  genero: '',
  director: '',
  productora: '',
  tipo: '',
}

// Mapa id -> nombre. Si la referencia ya no existe (otro módulo la borró) se
// muestra "(eliminado)"; nunca se enseña un ObjectId crudo.
function construirMapa(lista) {
  return new Map(lista.map((elemento) => [elemento._id, elemento]))
}

function nombreDe(mapa, id) {
  const encontrado = mapa.get(id)
  return encontrado ? encontrado.nombre || encontrado.nombres : '(eliminado)'
}

// Opciones de un select de relación. Al crear, solo activos; al editar se incluye
// el valor actual aunque esté inactivo, para no cambiar la relación sin querer.
function opcionesRelacion(lista, idActual, soloActivos = true) {
  const visibles = soloActivos ? lista.filter((elemento) => elemento.estado === 'activo') : lista
  const actual = lista.find((elemento) => elemento._id === idActual)
  if (actual && !visibles.some((elemento) => elemento._id === actual._id)) {
    return [...visibles, actual]
  }
  return visibles
}

export default function MediaPage() {
  const [media, setMedia] = useState([])
  const [generos, setGeneros] = useState([])
  const [directores, setDirectores] = useState([])
  const [productoras, setProductoras] = useState([])
  const [tipos, setTipos] = useState([])

  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)

  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroGenero, setFiltroGenero] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  // null = el orden que devuelve la API (más reciente primero); al pulsar una columna se ordena aquí.
  const [orden, setOrden] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)
  // ¿Se tocó el formulario? Al cerrar con cambios sin guardar se pide confirmación.
  const [tocado, setTocado] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const [listaMedia, listaGeneros, listaDirectores, listaProductoras, listaTipos] =
        await Promise.all([
          listarMedia(),
          listarGeneros(),
          listarDirectores(),
          listarProductoras(),
          listarTipos(),
        ])
      setMedia(listaMedia)
      setGeneros(listaGeneros)
      setDirectores(listaDirectores)
      setProductoras(listaProductoras)
      setTipos(listaTipos)
    } catch (fallo) {
      setErrorCarga(fallo.mensaje)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    // cargar() marca "cargando" antes de pedir datos a la API: es el caso legítimo
    // de sincronizar con un sistema externo, no un estado derivable en render.
    // oxlint-disable-next-line react/set-state-in-effect
    cargar()
  }, [cargar])

  const mapaGeneros = useMemo(() => construirMapa(generos), [generos])
  const mapaDirectores = useMemo(() => construirMapa(directores), [directores])
  const mapaProductoras = useMemo(() => construirMapa(productoras), [productoras])
  const mapaTipos = useMemo(() => construirMapa(tipos), [tipos])

  const filas = useMemo(() => {
    const texto = filtroTexto.trim().toLowerCase()
    return media.filter((elemento) => {
      const coincideTexto =
        !texto ||
        elemento.titulo.toLowerCase().includes(texto) ||
        elemento.serial.toLowerCase().includes(texto)
      const coincideGenero = !filtroGenero || elemento.genero === filtroGenero
      const coincideTipo = !filtroTipo || elemento.tipo === filtroTipo
      return coincideTexto && coincideGenero && coincideTipo
    })
  }, [media, filtroTexto, filtroGenero, filtroTipo])

  const hayFiltros = Boolean(filtroTexto.trim() || filtroGenero || filtroTipo)

  const abrirCrear = () => {
    setEditando(null)
    setFormulario(FORMULARIO_VACIO)
    setTocado(false)
    setModalAbierto(true)
  }

  const abrirEditar = (registro) => {
    setEditando(registro)
    setFormulario({
      serial: registro.serial || '',
      titulo: registro.titulo || '',
      sinopsis: registro.sinopsis || '',
      url: registro.url || '',
      imagenPortada: registro.imagenPortada || '',
      anioEstreno: registro.anioEstreno == null ? '' : String(registro.anioEstreno),
      genero: registro.genero || '',
      director: registro.director || '',
      productora: registro.productora || '',
      tipo: registro.tipo || '',
    })
    setTocado(false)
    setModalAbierto(true)
  }

  const cambiarCampo = (campo) => (evento) => {
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
    setTocado(true)
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const datos = {
        serial: formulario.serial.trim(),
        titulo: formulario.titulo.trim(),
        url: formulario.url.trim(),
        sinopsis: formulario.sinopsis.trim(),
        imagenPortada: formulario.imagenPortada.trim(),
        anioEstreno: formulario.anioEstreno === '' ? null : Number(formulario.anioEstreno),
        genero: formulario.genero,
        director: formulario.director,
        productora: formulario.productora,
        tipo: formulario.tipo,
      }

      if (editando) {
        await actualizarMedia(editando._id, datos)
      } else {
        await crearMedia(datos)
      }

      setModalAbierto(false)
      await cargar()
      await exito(editando ? 'Cambios guardados' : 'Título creado')
    } catch (fallo) {
      avisoError(fallo.mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (registro) => {
    const confirmado = await confirmarBorrado(registro.titulo)
    if (!confirmado) return
    try {
      await eliminarMedia(registro._id)
      await cargar()
      await exito('Título eliminado')
    } catch (fallo) {
      avisoError(fallo.mensaje)
      if (fallo.status === 404) cargar()
    }
  }

  const columnas = useMemo(
    () => [
      {
        clave: 'portada',
        encabezadoOculto: 'Portada',
        render: (registro) => <Portada url={registro.imagenPortada} titulo={registro.titulo} />,
      },
      {
        clave: 'titulo',
        encabezado: 'Título',
        ordenable: true,
        valor: (registro) => registro.titulo,
        render: (registro) => (
          <>
            <div className="titulo-fila">{registro.titulo}</div>
            <div className="serial">{registro.serial}</div>
          </>
        ),
      },
      {
        clave: 'anioEstreno',
        encabezado: 'Año',
        alineacion: 'derecha',
        ordenable: true,
        valor: (registro) => registro.anioEstreno,
        render: (registro) => (
          <span className="anio">{registro.anioEstreno ?? '—'}</span>
        ),
      },
      {
        clave: 'genero',
        encabezado: 'Género',
        ordenable: true,
        valor: (registro) => nombreDe(mapaGeneros, registro.genero),
        render: (registro) => (
          <span className="genero">{nombreDe(mapaGeneros, registro.genero)}</span>
        ),
      },
      {
        clave: 'tipo',
        encabezado: 'Tipo',
        ordenable: true,
        valor: (registro) => nombreDe(mapaTipos, registro.tipo),
        render: (registro) => {
          const nombreTipo = nombreDe(mapaTipos, registro.tipo)
          const esSerie = nombreTipo.toLowerCase().startsWith('serie')
          return <span className={`tipo${esSerie ? ' tipo--serie' : ''}`}>{nombreTipo}</span>
        },
      },
      {
        clave: 'director',
        encabezado: 'Director',
        ordenable: true,
        valor: (registro) => nombreDe(mapaDirectores, registro.director),
        render: (registro) => nombreDe(mapaDirectores, registro.director),
      },
      {
        clave: 'productora',
        encabezado: 'Productora',
        ordenable: true,
        valor: (registro) => nombreDe(mapaProductoras, registro.productora),
        render: (registro) => nombreDe(mapaProductoras, registro.productora),
      },
    ],
    [mapaGeneros, mapaDirectores, mapaProductoras, mapaTipos],
  )

  // El orden va después de las columnas: necesita sus `valor()` para ordenar por el
  // nombre del género o del director, no por el ObjectId.
  const filasOrdenadas = useMemo(() => {
    if (!orden) return filas
    const columna = columnas.find((c) => c.clave === orden.campo)
    return ordenarFilas(filas, columna, orden.direccion)
  }, [filas, columnas, orden])

  const alternarOrden = (columna) => {
    setOrden((actual) =>
      actual && actual.campo === columna.clave
        ? { campo: columna.clave, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }
        : { campo: columna.clave, direccion: 'asc' },
    )
  }

  const opcionesGenero = opcionesRelacion(generos, formulario.genero)
  const opcionesDirector = opcionesRelacion(directores, formulario.director)
  const opcionesProductora = opcionesRelacion(productoras, formulario.productora)
  const opcionesTipo = opcionesRelacion(tipos, formulario.tipo, false)

  const contador = `${filas.length} registro${filas.length === 1 ? '' : 's'}${
    hayFiltros ? ` de ${media.length}` : ''
  }`

  const filtros = (
    <Filtros>
      <Buscador
        id="filtro-texto"
        valor={filtroTexto}
        onCambio={setFiltroTexto}
        etiqueta="Buscar por título o serial"
      />
      <Selector
        id="filtro-genero"
        valor={filtroGenero}
        onCambio={setFiltroGenero}
        etiqueta="Filtrar por género"
      >
        <option value="">Todos los géneros</option>
        {generos.map((genero) => (
          <option key={genero._id} value={genero._id}>
            {genero.nombre}
          </option>
        ))}
      </Selector>
      <Selector
        id="filtro-tipo"
        valor={filtroTipo}
        onCambio={setFiltroTipo}
        etiqueta="Filtrar por tipo"
      >
        <option value="">Todos los tipos</option>
        {tipos.map((tipo) => (
          <option key={tipo._id} value={tipo._id}>
            {tipo.nombre}
          </option>
        ))}
      </Selector>
    </Filtros>
  )

  return (
    <>
      <EncabezadoPagina
        titulo="Media"
        subtitulo={cargando ? 'Catálogo de películas y series' : `Catálogo de películas y series · ${contador}`}
        accion={
          <button type="button" className="btn-acento" onClick={abrirCrear}>
            + Nuevo título
          </button>
        }
      />

      <TablaListado
        caption="Películas y series registradas en el catálogo"
        columnas={columnas}
        filas={filasOrdenadas}
        total={media.length}
        filtros={filtros}
        orden={orden}
        onOrdenar={alternarOrden}
        cargando={cargando}
        error={errorCarga}
        onReintentar={cargar}
        vacio={{
          titulo: 'Todavía no hay títulos registrados.',
          texto: 'Cuando agregues el primero, aparecerá en esta tabla.',
          textoAccion: '+ Nuevo título',
          onAccion: abrirCrear,
        }}
        sinResultados={{
          titulo: 'Ningún título coincide con los filtros.',
          texto: 'Prueba con otro texto o quita los filtros.',
        }}
        nombreRegistro={(registro) => registro.titulo}
        onEditar={abrirEditar}
        onEliminar={eliminar}
      />

      <ModalFormulario
        abierto={modalAbierto}
        titulo={editando ? 'Editar título' : 'Nuevo título'}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        guardando={guardando}
        sucio={tocado}
      >
        <fieldset className="grupo">
          <legend>Datos del título</legend>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label" htmlFor="serial">
                Serial <span className="requerido" aria-hidden="true">*</span>
              </label>
              <input
                id="serial"
                className="form-control"
                placeholder="INT-006"
                required
                aria-required="true"
                aria-describedby="ayuda-serial"
                value={formulario.serial}
                onChange={cambiarCampo('serial')}
              />
              <div id="ayuda-serial" className="ayuda">
                Único en el catálogo.
              </div>
            </div>

            <div className="col-md-8">
              <label className="form-label" htmlFor="titulo">
                Título <span className="requerido" aria-hidden="true">*</span>
              </label>
              <input
                id="titulo"
                className="form-control"
                placeholder="Dune: Parte dos"
                required
                aria-required="true"
                value={formulario.titulo}
                onChange={cambiarCampo('titulo')}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="sinopsis">
                Sinopsis
              </label>
              <textarea
                id="sinopsis"
                className="form-control"
                rows="2"
                placeholder="Breve descripción de la trama"
                value={formulario.sinopsis}
                onChange={cambiarCampo('sinopsis')}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="imagenPortada">
                Imagen de portada
              </label>
              <input
                id="imagenPortada"
                className="form-control"
                placeholder="https://... (opcional)"
                aria-describedby="ayuda-portada"
                value={formulario.imagenPortada}
                onChange={cambiarCampo('imagenPortada')}
              />
              <div id="ayuda-portada" className="ayuda">
                Si se deja vacía, se muestran las iniciales del título.
              </div>
              {formulario.imagenPortada.trim() ? (
                <div className="vista-portada">
                  <Portada url={formulario.imagenPortada} titulo={formulario.titulo} />
                  <span className="ayuda">Vista previa</span>
                </div>
              ) : null}
            </div>

            <div className="col-md-8">
              <label className="form-label" htmlFor="url">
                URL del video <span className="requerido" aria-hidden="true">*</span>
              </label>
              <input
                id="url"
                className="form-control"
                placeholder="https://..."
                required
                aria-required="true"
                aria-describedby="ayuda-url"
                value={formulario.url}
                onChange={cambiarCampo('url')}
              />
              <div id="ayuda-url" className="ayuda">
                Debe empezar por http:// o https://. Única en el catálogo.
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="anioEstreno">
                Año de estreno
              </label>
              <input
                id="anioEstreno"
                className="form-control"
                inputMode="numeric"
                placeholder="2024"
                aria-describedby="ayuda-anio"
                value={formulario.anioEstreno}
                onChange={cambiarCampo('anioEstreno')}
              />
              <div id="ayuda-anio" className="ayuda">
                Entre 1888 y 2100.
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="grupo mb-0">
          <legend>Clasificación y relaciones</legend>
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label" htmlFor="genero">
                Género <span className="requerido" aria-hidden="true">*</span>
              </label>
              <select
                id="genero"
                className="form-select"
                required
                aria-required="true"
                aria-describedby="ayuda-genero"
                value={formulario.genero}
                onChange={cambiarCampo('genero')}
              >
                <option value="">Selecciona un género</option>
                {opcionesGenero.map((genero) => (
                  <option key={genero._id} value={genero._id}>
                    {genero.nombre}
                    {genero.estado !== 'activo' ? ' (inactivo)' : ''}
                  </option>
                ))}
              </select>
              <div id="ayuda-genero" className="ayuda">
                Solo géneros activos.
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="tipo">
                Tipo <span className="requerido" aria-hidden="true">*</span>
              </label>
              <select
                id="tipo"
                className="form-select"
                required
                aria-required="true"
                value={formulario.tipo}
                onChange={cambiarCampo('tipo')}
              >
                <option value="">Selecciona un tipo</option>
                {opcionesTipo.map((tipo) => (
                  <option key={tipo._id} value={tipo._id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="director">
                Director <span className="requerido" aria-hidden="true">*</span>
              </label>
              <select
                id="director"
                className="form-select"
                required
                aria-required="true"
                aria-describedby="ayuda-director"
                value={formulario.director}
                onChange={cambiarCampo('director')}
              >
                <option value="">Selecciona un director</option>
                {opcionesDirector.map((director) => (
                  <option key={director._id} value={director._id}>
                    {director.nombres}
                    {director.estado !== 'activo' ? ' (inactivo)' : ''}
                  </option>
                ))}
              </select>
              <div id="ayuda-director" className="ayuda">
                Solo directores activos.
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="productora">
                Productora <span className="requerido" aria-hidden="true">*</span>
              </label>
              <select
                id="productora"
                className="form-select"
                required
                aria-required="true"
                aria-describedby="ayuda-productora"
                value={formulario.productora}
                onChange={cambiarCampo('productora')}
              >
                <option value="">Selecciona una productora</option>
                {opcionesProductora.map((productora) => (
                  <option key={productora._id} value={productora._id}>
                    {productora.nombre}
                    {productora.estado !== 'activo' ? ' (inactivo)' : ''}
                  </option>
                ))}
              </select>
              <div id="ayuda-productora" className="ayuda">
                Solo productoras activas.
              </div>
            </div>
          </div>
        </fieldset>
      </ModalFormulario>
    </>
  )
}
