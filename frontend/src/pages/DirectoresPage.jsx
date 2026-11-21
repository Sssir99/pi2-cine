import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import BadgeEstado from '../components/BadgeEstado'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
import { actualizarDirector, crearDirector, eliminarDirector, listarDirectores } from '../api/directores'
import { listarMedia } from '../api/media'
import { formatearFecha } from '../utils/formato'

// Campos del formulario con los nombres del contrato: Director solo tiene nombres y estado.
const FORMULARIO_VACIO = { nombres: '', estado: 'activo' }

export default function DirectoresPage() {
  const [registros, setRegistros] = useState([])
  // Títulos que usan cada registro: se cuentan con la lista de Media para que la tabla
  // muestre de un vistazo qué directores están en uso (y por eso no se pueden borrar).
  const [media, setMedia] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null) // null = creando
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)

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
    setModalAbierto(true)
  }

  const abrirEditar = (registro) => {
    setEditando(registro)
    setFormulario({
      nombres: registro.nombres || '',
      estado: registro.estado || 'activo',
    })
    setModalAbierto(true)
  }

  const cambiarCampo = (campo) => (evento) => {
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
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
      },
      {
        // Cuántos títulos lo usan. Es el dato que explica por qué un director no se
        // puede borrar y hace que la tabla no sea una sola columna de texto.
        clave: 'titulos',
        encabezado: 'Títulos',
        render: (registro) => {
          const cuantos = conteo.get(String(registro._id)) || 0
          return cuantos ? <span className="cifra">{cuantos}</span> : <span className="suave">—</span>
        },
      },
      {
        clave: 'estado',
        encabezado: 'Estado',
        render: (registro) => <BadgeEstado estado={registro.estado} />,
      },
      {
        clave: 'fechaActualizacion',
        encabezado: 'Actualizado',
        render: (registro) => (
          <span className="mono">{formatearFecha(registro.fechaActualizacion)}</span>
        ),
      },
    ],
    [conteo],
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
        filas={registros}
        cargando={cargando}
        error={errorCarga}
        onReintentar={cargar}
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
