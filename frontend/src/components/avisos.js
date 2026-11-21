import Swal from 'sweetalert2'

// Único mecanismo de avisos y confirmaciones del frontend (ver DISENO_UI.md §6 y §9).
// No se usa el modal de Bootstrap para confirmar: dos mecanismos distintos para lo
// mismo confunden al usuario y al que copia el patrón.

// La paleta se lee de los tokens de tema.css en cada aviso. Antes eran hex fijos del tema
// oscuro: en el tema claro el título quedaba a 1,03:1 (texto oscuro sobre fondo oscuro) y el
// botón de confirmar perdía el contraste. Leyendo el token, cada tema usa sus colores.
function token(nombre, porDefecto) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
  return valor || porDefecto
}

function paleta() {
  return {
    background: token('--superficie', '#171b22'),
    color: token('--texto', '#e6e9ef'),
    cancelButtonColor: token('--superficie-2', '#262d38'),
  }
}

function paletaAcento() {
  return { ...paleta(), confirmButtonColor: token('--acento', '#f5b942') }
}

export function exito(mensaje) {
  // Aviso de éxito como toast en la esquina: no interrumpe, no tapa la tabla y no hay que
  // cerrarlo. Las confirmaciones y los errores siguen siendo modales porque exigen decisión.
  return Swal.fire({
    ...paletaAcento(),
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    title: mensaje,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    customClass: { popup: 'swal-toast' },
  })
}

// SweetAlert2 pinta el texto de los botones en blanco por defecto, que sobre el
// ámbar o el rojo queda ilegible. La clase vive en tema.css.
const CLASE_CONFIRMAR = { confirmButton: 'swal-confirmar' }

export function error(mensaje) {
  return Swal.fire({
    ...paletaAcento(),
    customClass: CLASE_CONFIRMAR,
    icon: 'error',
    title: 'No se pudo completar',
    text: mensaje,
    confirmButtonText: 'Entendido',
  })
}

// Cerrar un formulario con datos escritos pide confirmación: perder lo tecleado por un
// clic en la X o en Cancelar es de las cosas que más molestan de un panel.
export async function confirmarDescartar() {
  const resultado = await Swal.fire({
    ...paletaAcento(),
    customClass: CLASE_CONFIRMAR,
    icon: 'warning',
    title: '¿Descartar los cambios?',
    text: 'Lo que escribiste en el formulario se pierde.',
    showCancelButton: true,
    confirmButtonText: 'Descartar',
    cancelButtonText: 'Seguir editando',
    focusCancel: true,
  })
  return resultado.isConfirmed
}

// Devuelve true solo si el usuario confirma. "Cancelar" es la opción por defecto.
export async function confirmarBorrado(nombre) {
  const resultado = await Swal.fire({
    ...paleta(),
    customClass: CLASE_CONFIRMAR,
    icon: 'warning',
    title: `¿Eliminar «${nombre}»?`,
    text: 'Esta acción no se puede deshacer.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: token('--peligro', '#ef5a5a'),
    focusCancel: true,
  })
  return resultado.isConfirmed
}
