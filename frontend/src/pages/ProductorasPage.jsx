import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import BadgeEstado from '../components/BadgeEstado'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
import { actualizarProductora, crearProductora, eliminarProductora, listarProductoras } from '../api/productoras'
import { listarMedia } from '../api/media'
import { formatearFecha } from '../utils/formato'
import Filtros, { Buscador, Selector } from '../components/Filtros'
import { filtrarPorTexto, ordenarFilas } from '../utils/tabla'

// Campos del formulario con los nombres del contrato: nombre, slogan, descripción y estado.
const FORMULARIO_VACIO = { nombre: '', slogan: '', descripcion: '', estado: 'activo' }

export default function ProductorasPage() {
  const [registros, setRegistros] = useState([])
  // Títulos que usan cada registro: la tabla muestra cuántos produce cada productora,
  // que es lo que explica por qué una en uso no se puede borrar.
  const [media, setMedia] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  // null = el orden que devuelve la API; al pulsar una columna se ordena aquí en el cliente.
  const [orden, setOrden] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null) // null = creando
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)
  // ¿Se tocó el formulario? Al cerrar con cambios sin guardar se pide confirmación.
  const [tocado, setTocado] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const [lista, titulos] = await Promise.all([listarProductoras(), listarMedia()])
      setRegistros(lista)
      setMedia(titulos)
    } catch (fallo) {
      setErrorCarga(fallo.mensaje) // el mensaje ya viene traducido desde cliente.js
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

  const abrirCrear = () => {
    setEditando(null)
    setFormulario(FORMULARIO_VACIO)
    setTocado(false)
    setModalAbierto(true)
  }

  const abrirEditar = (registro) => {
    setEditando(registro)
    setFormulario({
      nombre: registro.nombre || '',
      slogan: registro.slogan || '',
      descripcion: registro.descripcion || '',
      estado: registro.estado || 'activo',
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
      // Solo los campos del contrato, recortados: las fechas las pone el sistema.
      const datos = {
        nombre: formulario.nombre.trim(),
        slogan: formulario.slogan.trim(),
        descripcion: formulario.descripcion.trim(),
        estado: formulario.estado,
      }

      if (editando) {
        await actualizarProductora(editando._id, datos)
      } else {
        await crearProductora(datos)
      }

      setModalAbierto(false)
      await cargar()
      await exito(editando ? 'Cambios guardados' : 'Registro creado')
    } catch (fallo) {
      // 400/404/409/red ya vienen con su texto desde cliente.js. El modal sigue
      // abierto para que el usuario corrija sin perder lo que escribió.
      avisoError(fallo.mensaje)
      // Un 404 aquí significa que el registro ya no existe: se recarga la lista en vez de
      // dejar al usuario reintentando contra una fila fantasma.
      if (fallo.status === 404) cargar()
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (registro) => {
    const confirmado = await confirmarBorrado(registro.nombre)
    if (!confirmado) return
    try {
      await eliminarProductora(registro._id)
      await cargar()
      await exito('Registro eliminado')
    } catch (fallo) {
      avisoError(fallo.mensaje)
      if (fallo.status === 404) cargar()
    }
  }

  // Columnas de la tabla, en el orden del contrato: nombre, slogan, descripción,
  // estado y fecha de actualización.
  const conteo = useMemo(() => {
    const mapa = new Map()
    for (const titulo of media) {
      const clave = String(titulo.productora)
      mapa.set(clave, (mapa.get(clave) || 0) + 1)
    }
    return mapa
  }, [media])

  const columnas = useMemo(
    () => [
      {
        clave: 'nombre',
        encabezado: 'Nombre',
        ordenable: true,
        render: (registro) => (
          <>
            <div className="titulo-fila">{registro.nombre}</div>
            {registro.slogan ? <div className="detalle-fila">{registro.slogan}</div> : null}
          </>
        ),
      },
      {
        clave: 'descripcion',
        encabezado: 'Descripción',
        ordenable: true,
        render: (registro) =>
          registro.descripcion ? (
            <span className="recortado" title={registro.descripcion}>
              {registro.descripcion}
            </span>
          ) : (
            <span className="suave">—</span>
          ),
      },
      {
        clave: 'titulos',
        encabezado: 'Títulos',
        ordenable: true,
        alineacion: 'derecha',
        // El número no está en el registro: se ordena por el conteo calculado.
        valor: (registro) => conteo.get(String(registro._id)) || 0,
        render: (registro) => {
          const cuantos = conteo.get(String(registro._id)) || 0
          return cuantos ? <span className="cifra">{cuantos}</span> : <span className="suave">—</span>
        },
      },
      {
        clave: 'estado',
        encabezado: 'Estado',
        ordenable: true,
        render: (registro) => <BadgeEstado estado={registro.estado} />,
      },
      {
        clave: 'fechaActualizacion',
        encabezado: 'Actualizado',
        ordenable: true,
        alineacion: 'derecha',
        render: (registro) => (
          <span className="mono">{formatearFecha(registro.fechaActualizacion)}</span>
        ),
      },
    ],
    [conteo],
  )

  // Filtro y orden en el cliente: la lista completa ya está en memoria.
  const filas = useMemo(() => {
    const porTexto = filtrarPorTexto(registros, filtroTexto, ['nombre', 'slogan', 'descripcion'])
    const porEstado = filtroEstado ? porTexto.filter((registro) => registro.estado === filtroEstado) : porTexto
    const columna = columnas.find((c) => c.clave === orden?.campo)
    return ordenarFilas(porEstado, columna, orden?.direccion || 'asc')
  }, [registros, filtroTexto, filtroEstado, columnas, orden])

  const alternarOrden = (columna) => {
    setOrden((actual) =>
      actual && actual.campo === columna.clave
        ? { campo: columna.clave, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }
        : { campo: columna.clave, direccion: 'asc' },
    )
  }

  const filtros = (
    <Filtros>
      <Buscador
        id="filtro-texto"
        valor={filtroTexto}
        onCambio={setFiltroTexto}
        etiqueta="Buscar por nombre o descripción"
      />
      <Selector id="filtro-estado" valor={filtroEstado} onCambio={setFiltroEstado} etiqueta="Filtrar por estado">
        <option value="">Todos los estados</option>
        <option value="activo">Solo activos</option>
        <option value="inactivo">Solo inactivos</option>
      </Selector>
    </Filtros>
  )

  const hayFiltros = Boolean(filtroTexto.trim() || filtroEstado)
  const contador = `${filas.length} registro${filas.length === 1 ? '' : 's'}${
    hayFiltros ? ` de ${registros.length}` : ''
  }`

  return (
    <>
      {/* Títulos y textos del módulo, en plural como el menú. */}
      <EncabezadoPagina
        titulo="Productoras"
        subtitulo={`Productoras del catálogo · ${contador}`}
        accion={
          <button type="button" className="btn-acento" onClick={abrirCrear}>
            + Nueva productora
          </button>
        }
      />

      <TablaListado
        caption="Productoras registradas en el catálogo"
        columnas={columnas}
        filas={filas}
        total={registros.length}
        filtros={filtros}
        orden={orden}
        onOrdenar={alternarOrden}
        cargando={cargando}
        error={errorCarga}
        onReintentar={cargar}
        sinResultados={{
          titulo: 'Ninguna productora coincide con la búsqueda.',
          texto: 'Prueba con otro nombre o quita los filtros.',
        }}
        vacio={{
          titulo: 'Todavía no hay productoras registradas.',
          texto: 'Cuando agregues la primera, aparecerá en esta tabla.',
          textoAccion: '+ Nueva productora',
          onAccion: abrirCrear,
        }}
        nombreRegistro={(registro) => registro.nombre}
        onEditar={abrirEditar}
        onEliminar={eliminar}
      />

      <ModalFormulario
        abierto={modalAbierto}
        titulo={editando ? 'Editar productora' : 'Nueva productora'}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        guardando={guardando}
        sucio={tocado}
      >
        <fieldset className="grupo">
          <legend>Datos de la productora</legend>
          <div className="row g-2">
            <div className="col-md-8">
              <label className="form-label" htmlFor="nombre">
                Nombre <span className="requerido" aria-hidden="true">*</span>
              </label>
              <input
                id="nombre"
                className="form-control"
                placeholder="Warner Bros"
                required
                aria-required="true"
                aria-describedby="ayuda-nombre"
                value={formulario.nombre}
                onChange={cambiarCampo('nombre')}
              />
              <div id="ayuda-nombre" className="ayuda">
                Único en el catálogo.
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="estado">
                Estado
              </label>
              <select
                id="estado"
                className="form-select"
                value={formulario.estado}
                onChange={cambiarCampo('estado')}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="slogan">
                Slogan
              </label>
              <textarea
                id="slogan"
                className="form-control"
                rows="2"
                placeholder="Frase corta de la productora (opcional)"
                value={formulario.slogan}
                onChange={cambiarCampo('slogan')}
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="form-control"
                rows="2"
                placeholder="Para qué sirve esta productora (opcional)"
                value={formulario.descripcion}
                onChange={cambiarCampo('descripcion')}
              />
            </div>
          </div>
        </fieldset>
      </ModalFormulario>
    </>
  )
}
