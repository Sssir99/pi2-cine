// Pantalla del módulo Géneros: listar, crear, editar y eliminar contra /api/generos.
//
// Sigue el molde de PlantillaPage.ejemplo.jsx (ver GUIA_MODULO.md). Los estados de la
// tabla, el modal, la confirmación de borrado, los avisos y el manejo de errores vienen
// de los componentes compartidos y de api/cliente.js (DISENO_UI.md §6 y §9).

import { useCallback, useEffect, useMemo, useState } from 'react'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TablaListado from '../components/TablaListado'
import ModalFormulario from '../components/ModalFormulario'
import BadgeEstado from '../components/BadgeEstado'
import { confirmarBorrado, error as avisoError, exito } from '../components/avisos'
import { actualizarGenero, crearGenero, eliminarGenero, listarGeneros } from '../api/generos'
import { formatearFecha } from '../utils/formato'

// Campos del formulario con los nombres del contrato (RUTAS.md), sin tildes.
const FORMULARIO_VACIO = { nombre: '', descripcion: '', estado: 'activo' }

export default function GenerosPage() {
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

  const abrirEditar = (genero) => {
    setEditando(genero)
    setFormulario({
      nombre: genero.nombre || '',
      descripcion: genero.descripcion || '',
      estado: genero.estado || 'activo',
    })
    setModalAbierto(true)
  }

  const cambiarCampo = (campo) => (evento) => {
    setFormulario((actual) => ({ ...actual, [campo]: evento.target.value }))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      // fechaCreacion y fechaActualizacion no se mandan: las pone el sistema.
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
      await exito(editando ? 'Cambios guardados' : 'Género creado')
    } catch (fallo) {
      // 400/404/409/red ya vienen con su texto desde cliente.js. El modal sigue
      // abierto para que el usuario corrija sin perder lo que escribió.
      avisoError(fallo.mensaje)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (genero) => {
    const confirmado = await confirmarBorrado(genero.nombre)
    if (!confirmado) return
    try {
      await eliminarGenero(genero._id)
      await cargar()
      await exito('Género eliminado')
    } catch (fallo) {
      avisoError(fallo.mensaje)
      if (fallo.status === 404) cargar()
    }
  }

  // Columnas en el orden del contrato (DISENO_UI.md §7):
  // nombre, descripción, estado, fecha de actualización.
  const columnas = useMemo(
    () => [
      {
        clave: 'nombre',
        encabezado: 'Nombre',
        // Misma celda de dos líneas que usa Media con título y serial: el nombre manda y
        // la descripción va debajo en gris. Evita una columna que solía quedar vacía.
        render: (genero) => (
          <>
            <div className="titulo-fila">{genero.nombre}</div>
            {genero.descripcion ? <div className="detalle-fila">{genero.descripcion}</div> : null}
          </>
        ),
      },
      {
        clave: 'estado',
        encabezado: 'Estado',
        render: (genero) => <BadgeEstado estado={genero.estado} />,
      },
      {
        clave: 'fechaActualizacion',
        encabezado: 'Actualizado',
        render: (genero) => (
          <span className="mono">{formatearFecha(genero.fechaActualizacion)}</span>
        ),
      },
    ],
    [],
  )

  const contador = `${registros.length} registro${registros.length === 1 ? '' : 's'}`

  return (
    <>
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
        nombreRegistro={(genero) => genero.nombre}
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
