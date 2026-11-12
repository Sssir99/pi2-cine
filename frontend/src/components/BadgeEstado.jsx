import { textoEstado } from '../utils/formato'

// Estado con texto siempre visible: el color solo acompaña, nunca comunica solo.
export default function BadgeEstado({ estado }) {
  const inactivo = estado !== 'activo'
  return (
    <span className={`estado-chip${inactivo ? ' estado-chip--inactivo' : ''}`}>
      <span className="punto" aria-hidden="true" />
      {textoEstado(estado)}
    </span>
  )
}
