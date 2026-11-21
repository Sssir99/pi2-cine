import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
import { actualizarTipo, crearTipo, eliminarTipo, listarTipos } from '../api/tipos'
import { formatearFecha } from '../utils/formato'
import Filtros, { Buscador } from '../components/Filtros'
import { filtrarPorTexto, ordenarFilas } from '../utils/tabla'

// Campos del formulario vacío, con los nombres del contrato (sin fechas).
// Tipo NO lleva estado.
const FORMULARIO_VACIO = { nombre: '', descripcion: '' }

export default function TiposPage() {
  const [registros, setRegistros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [filtroTexto, setFiltroTexto] = useState('')
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
      setRegistros(await listarTipos())
    } catch (fallo) {
      setErrorCarga(fallo.mensaje)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
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
      descripcion: registro.descripcion || '',
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
      // Datos que se mandan a la API: sin fechaCreacion ni fechaActualizacion.
      const datos = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
      }

      if (editando) {
        await actualizarTipo(editando._id, datos)
      } else {
        await crearTipo(datos)
      }

      setModalAbierto(false)
      await cargar()
      await exito(editando ? 'Cambios guardados' : 'Registro creado')
    } catch (fallo) {
      // 400/404/409/red ya vienen con su texto desde cliente.js.
      // El modal sigue abierto para que el usuario corrija sin perder lo escrito.
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
      await eliminarTipo(registro._id)
      await cargar()
      await exito('Registro eliminado')
    } catch (fallo) {
      avisoError(fallo.mensaje)
      if (fallo.status === 404) cargar()
    }
  }

  // Columnas de la tabla. Tipo no lleva estado.
  const columnas = useMemo(
    () => [
      {
        clave: 'nombre',
        encabezado: 'Nombre',
        ordenable: true,
        render: (registro) => (
          <>
            <div className="titulo-fila">{registro.nombre}</div>
            {registro.descripcion ? <div className="detalle-fila">{registro.descripcion}</div> : null}
          </>
        ),
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
    [],
  )

  // Filtro y orden en el cliente: la lista completa ya está en memoria.
  const filas = useMemo(() => {
    const porTexto = filtrarPorTexto(registros, filtroTexto, ['nombre', 'descripcion'])
    const columna = columnas.find((c) => c.clave === orden?.campo)
    return ordenarFilas(porTexto, columna, orden?.direccion || 'asc')
  }, [registros, filtroTexto, columnas, orden])

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
    </Filtros>
  )

  const hayFiltros = Boolean(filtroTexto.trim())
  const contador = `${filas.length} registro${filas.length === 1 ? '' : 's'}${
    hayFiltros ? ` de ${registros.length}` : ''
  }`

  return (
    <>
      <EncabezadoPagina
        titulo="Tipos"
        subtitulo={`Tipos del catálogo · ${contador}`}
        accion={
          <button type="button" className="btn-acento" onClick={abrirCrear}>
            + Nuevo tipo
          </button>
        }
      />

      <TablaListado
        caption="Tipos registrados en el catálogo"
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
          titulo: 'Ningún tipo coincide con la búsqueda.',
          texto: 'Prueba con otro término.',
        }}
        vacio={{
          titulo: 'Todavía no hay tipos registrados.',
          texto: 'Cuando agregues el primero, aparecerá en esta tabla.',
          textoAccion: '+ Nuevo tipo',
          onAccion: abrirCrear,
        }}
        nombreRegistro={(registro) => registro.nombre}
        onEditar={abrirEditar}
        onEliminar={eliminar}
      />

      <ModalFormulario
        abierto={modalAbierto}
        titulo={editando ? 'Editar tipo' : 'Nuevo tipo'}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        guardando={guardando}
        sucio={tocado}
      >
        <fieldset className="grupo">
          <legend>Datos del tipo</legend>
          <div className="row g-2">
            <div className="col-md-12">
              <label className="form-label" htmlFor="nombre">
                Nombre <span className="requerido" aria-hidden="true">*</span>
              </label>
              <input
                id="nombre"
                className="form-control"
                placeholder="Serie"
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

            <div className="col-12">
              <label className="form-label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="form-control"
                rows="2"
                placeholder="Para qué sirve este tipo (opcional)"
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