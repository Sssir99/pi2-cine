import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import BadgeEstado from '../components/BadgeEstado'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
// >>> 1. Las cinco funciones de TU módulo (revisa src/api/<modulo>.js).
import { actualizarProductora, crearProductora, eliminarProductora, listarProductoras } from '../api/productoras'
import { formatearFecha } from '../utils/formato'

// >>> 2. Los campos del formulario vacío, con los nombres del contrato (sin tildes).
const FORMULARIO_VACIO = { nombre: '', slogan: '', fechaActualizacion: '', estado: 'activo' }

export default function PlantillaPage() {
  const [registros, setRegistros] = useState([])
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
      setRegistros(await listarProductoras())
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
      nombre: registro.nombre || '',
      slogan: registro.slogan || '',
      fechaActualizacion: registro.fechaActualizacion || '',
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
      // >>> 3. Los datos que se mandan a la API. Recorta los textos y no mandes
      // fechaCreacion ni fechaActualizacion: las pone el sistema.
      const datos = {
        nombre: formulario.nombre.trim(),
        slogan: formulario.slogan.trim(),
        fechaActualizacion: formulario.fechaActualizacion.trim(),
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

  // >>> 4. Las columnas de tu tabla, en el orden del contrato (DISENO_UI.md §7).
  // El "render" es lo que se pinta en la celda; si no lo pones, usa fila[clave].
  const columnas = useMemo(
    () => [
      { clave: 'nombre', encabezado: 'Nombre' },
      {
        clave: 'slogan',
        encabezado: 'Slogan',
        render: (registro) => registro.slogan || <span className="suave">—</span>,
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
    [],
  )

  const contador = `${registros.length} registro${registros.length === 1 ? '' : 's'}`

  return (
    <>
      {/* >>> 5. Títulos y textos de tu módulo, en plural como el menú. */}
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
        filas={registros}
        cargando={cargando}
        error={errorCarga}
        onReintentar={cargar}
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
                placeholder="drama"
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
                placeholder="Para qué sirve esta productora (opcional)"
                value={formulario.slogan}
                onChange={cambiarCampo('slogan')}
              />
            </div>
          </div>
        </fieldset>
      </ModalFormulario>
    </>
  )
}
