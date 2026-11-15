// PLANTILLA DE PANTALLA CRUD — no está conectada a ninguna ruta.
//
// Para tu módulo:
//   1. Copia este archivo como src/pages/<Modulo>Page.jsx (ej. GenerosPage.jsx).
//   2. Cambia los bloques marcados con ">>>".
//   3. Guarda: la ruta ya existe en App.jsx, así que la pantalla aparece sola.
//
// Está escrita para el módulo Género (nombre + descripción + estado). Si tu módulo
// no tiene estado (Tipo), borra la columna, el campo del formulario y el badge.
// Si tiene campos de texto de más (Productora: slogan y descripción), copia el patrón
// del campo "descripcion" una vez por campo.
//
// Lo que NO tienes que escribir: los estados de la tabla, el modal, la confirmación
// de borrado, los avisos y el manejo de errores. Todo eso ya está en los componentes
// compartidos y en api/cliente.js (ver DISENO_UI.md §6 y §9).

import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import BadgeEstado from '../components/BadgeEstado'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
// >>> 1. Las cinco funciones de TU módulo (revisa src/api/<modulo>.js).
import { actualizarGenero, crearGenero, eliminarGenero, listarGeneros } from '../api/generos'
import { formatearFecha } from '../utils/formato'

// >>> 2. Los campos del formulario vacío, con los nombres del contrato (sin tildes).
const FORMULARIO_VACIO = { nombre: '', descripcion: '', estado: 'activo' }

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
      setRegistros(await listarGeneros())
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
      descripcion: registro.descripcion || '',
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
        descripcion: formulario.descripcion.trim(),
        estado: formulario.estado,
      }

      if (editando) {
        await actualizarGenero(editando._id, datos)
      } else {
        await crearGenero(datos)
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
      await eliminarGenero(registro._id)
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
        clave: 'descripcion',
        encabezado: 'Descripción',
        render: (registro) => registro.descripcion || <span className="suave">—</span>,
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
        titulo="Géneros"
        subtitulo={`Géneros del catálogo · ${contador}`}
        accion={
          <button type="button" className="btn-acento" onClick={abrirCrear}>
            + Nuevo género
          </button>
        }
      />

      <TablaListado
        caption="Géneros registrados en el catálogo"
        columnas={columnas}
        filas={registros}
        cargando={cargando}
        error={errorCarga}
        onReintentar={cargar}
        vacio={{
          titulo: 'Todavía no hay géneros registrados.',
          texto: 'Cuando agregues el primero, aparecerá en esta tabla.',
          textoAccion: '+ Nuevo género',
          onAccion: abrirCrear,
        }}
        nombreRegistro={(registro) => registro.nombre}
        onEditar={abrirEditar}
        onEliminar={eliminar}
      />

      <ModalFormulario
        abierto={modalAbierto}
        titulo={editando ? 'Editar género' : 'Nuevo género'}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardar}
        guardando={guardando}
      >
        <fieldset className="grupo">
          <legend>Datos del género</legend>
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
              <label className="form-label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="form-control"
                rows="2"
                placeholder="Para qué sirve este género (opcional)"
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
