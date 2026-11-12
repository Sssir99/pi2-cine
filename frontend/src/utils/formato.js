// Helpers de formato compartidos por todas las páginas.
// Están aquí y no en cada módulo para que dos pantallas no formateen distinto.

const dosDigitos = (n) => String(n).padStart(2, '0')

// ISO de la API -> "dd/mm/aaaa hh:mm" (hora local del navegador).
export function formatearFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dosDigitos(
    fecha.getHours(),
  )}:${dosDigitos(fecha.getMinutes())}`
}

// "Interestelar" -> "INT", "Dune: Parte dos" -> "DP".
// Iniciales para el recuadro de portada cuando no hay imagen: una sola palabra
// usa sus tres primeras letras; dos o más, la inicial de cada una (máximo 2).
export function iniciales(texto, maximo = 2) {
  if (!texto) return '—'
  const palabras = texto
    .trim()
    .split(/\s+/)
    .map((palabra) => palabra.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)

  if (palabras.length === 0) return '—'
  if (palabras.length === 1) return palabras[0].slice(0, 3).toUpperCase()
  return palabras
    .slice(0, maximo)
    .map((palabra) => palabra.charAt(0))
    .join('')
    .toUpperCase()
}

// Texto legible para el estado: "activo" -> "Activo".
export function textoEstado(estado) {
  if (estado === 'activo') return 'Activo'
  if (estado === 'inactivo') return 'Inactivo'
  return estado || '—'
}
