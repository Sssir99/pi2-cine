import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import BadgeEstado from '../components/BadgeEstado'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
import { actualizarDirector, crearDirector, eliminarDirector, listarDirectores } from '../api/directores'
import { listarMedia } from '../api/media'
import { formatearFecha } from '../utils/formato'
import Filtros, { Buscador, Selector } from '../components/Filtros'
import { filtrarPorTexto, ordenarFilas } from '../utils/tabla'

// Campos del formulario con los nombres del contrato: Director solo tiene nombres y estado.
const FORMULARIO_VACIO = { nombres: '', estado: 'activo' }

export default function DirectoresPage() {
  const [registros, setRegistros] = useState([])
  // Títulos que usan cada registro: se cuentan con la lista de Media para que la tabla
  // muestre de un vistazo qué directores están en uso (y por eso no se pueden borrar).
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
      const [lista, titulos] = await Promise.all([listarDirectores(), listarMedia()])
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
      nombres: registro.nombres || '',
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
        nombres: formulario.nombres.trim(),
        estado: formulario.estado,
      }

      if (editando) {
        await actualizarDirector(editando._id, datos)
      } else {
        await crearDirector(datos)
      }

      setModalAbierto(false)
      await cargar()
      await exito(editando ? 'Cambios guardados' : 'Registro creado')
    } catch (fallo) {
      // 400/404/409/red ya vienen con su texto desde cliente.js. El modal sigue
      // abierto para que el usuario corrija sin perder lo que escribió.
      avisoError(fallo.mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (registro) => {
    const confirmado = await confirmarBorrado(registro.nombres)
    if (!confirmado) return
    try {
      await eliminarDirector(registro._id)
      await cargar()
      await exito('Registro eliminado')
    } catch (fallo) {
      avisoError(fallo.mensaje)
      if (fallo.status === 404) cargar()
    }
  }

  // Columnas de la tabla: nombres, estado y fecha de actualización.
  const conteo = useMemo(() => {
    const mapa = new Map()
    for (const titulo of media) {
      const clave = String(titulo.director)
      mapa.set(clave, (mapa.get(clave) || 0) + 1)
    }
    return mapa
  }, [media])

  const columnas = useMemo(
    () => [
      {
        clave: 'nombres',
        encabezado: 'Nombres',
        ordenable: true,
      },
      {
        // Cuántos títulos lo usan. Es el dato que explica por qué un director no se
        // puede borrar y hace que la tabla no sea una sola columna de texto.
        clave: 'titulos',
        encabezado: 'Títulos',
        ordenable: true,
        alineacion: 'derecha',
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
    const porTexto = filtrarPorTexto(registros, filtroTexto, ['nombres'])
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
        etiqueta="Buscar por nombre"
      />
      <Selector id="filtro-estado" valor={filtroEstado} onCambio={setFiltroEstado} etiqueta="Filtrar por estado">
        <option value="">Todos los estados</option>
        <option value="activo">Solo activos</option>
        <option value="inactivo">Solo inactivos</option>
      </Selector>
    </Filtros>
  )

  const contador = `${registros.length} registro${registros.length === 1 ? '' : 's'}`

  return (
    <>
      {/* Títulos y textos del módulo, en plural como el menú. */}
      <EncabezadoPagina
        titulo="Directores"
        subtitulo={`Directores del catálogo · ${contador}`}
        accion={
          <button type="button" className="btn-acento" onClick={abrirCrear}>
            + Nuevo director
          </button>
        }
      />

      <TablaListado
        caption="Directores registrados en el catálogo"
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
          titulo: 'Ningún director coincide con la búsqueda.',
          texto: 'Prueba con otro nombre o quita los filtros.',
        }}
        vacio={{
          titulo: 'Todavía no hay directores registrados.',
          texto: 'Cuando agregues el primero, aparecerá en esta tabla.',
          textoAccion: '+ Nuevo director',
          onAccion: abrirCrear,
        }}
        nombreRegistro={(registro) => registro.nombres}
        onEditar={abrirEditar}
        onEliminar={eliminar}
      />

      <ModalFormulario
        abierto={modalAbierto}
        titulo={editando ? 'Editar director' : 'Nuevo director'}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        guardando={guardando}
        sucio={tocado}
      >
        <fieldset className="grupo">
          <legend>Datos del director</legend>
          <div className="row g-2">
            <div className="col-md-8">
              <label className="form-label" htmlFor="nombres">
                Nombres <span className="requerido" aria-hidden="true">*</span>
              </label>
              <input
                id="nombres"
                className="form-control"
                placeholder="Christopher Nolan"
                required
                aria-required="true"
                aria-describedby="ayuda-nombres"
                value={formulario.nombres}
                onChange={cambiarCampo('nombres')}
              />
              <div id="ayuda-nombres" className="ayuda">
                No es único: dos directores pueden llamarse igual.
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
          </div>
        </fieldset>
      </ModalFormulario>
    </>
  )
}
