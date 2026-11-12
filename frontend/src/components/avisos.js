import Swal from 'sweetalert2'

// Único mecanismo de avisos y confirmaciones del frontend (ver DISENO_UI.md §6 y §9).
// No se usa el modal de Bootstrap para confirmar: dos mecanismos distintos para lo
// mismo confunden al usuario y al que copia el patrón.

const TEMA = {
  background: '#171b22',
  color: '#e6e9ef',
  cancelButtonColor: '#262c38',
}

const TEMA_BOTON_ACENTO = {
  ...TEMA,
  confirmButtonColor: '#f5b942',
}

export function exito(mensaje) {
  return Swal.fire({
    ...TEMA,
    icon: 'success',
    title: mensaje,
    timer: 1600,
    showConfirmButton: false,
  })
}

// SweetAlert2 pinta el texto de los botones en blanco por defecto, que sobre el
// ámbar o el rojo queda ilegible. La clase vive en tema.css.
const CLASE_CONFIRMAR = { confirmButton: 'swal-confirmar' }

export function error(mensaje) {
  return Swal.fire({
    ...TEMA,
    ...TEMA_BOTON_ACENTO,
    customClass: CLASE_CONFIRMAR,
    icon: 'error',
    title: 'No se pudo completar',
    text: mensaje,
    confirmButtonText: 'Entendido',
  })
}

// Devuelve true solo si el usuario confirma. "Cancelar" es la opción por defecto.
export async function confirmarBorrado(nombre) {
  const resultado = await Swal.fire({
    ...TEMA,
    customClass: CLASE_CONFIRMAR,
    icon: 'warning',
    title: `¿Eliminar «${nombre}»?`,
    text: 'Esta acción no se puede deshacer.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef5a5a',
    focusCancel: true,
  })
  return resultado.isConfirmed
}
