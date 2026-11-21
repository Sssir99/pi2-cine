import axios from 'axios'

// Base URL de la API. Tres casos:
//   - desarrollo (Vite en 5173): la API vive en otro puerto, http://localhost:3000;
//   - despliegue de un solo servicio (Express sirve también el panel): misma origen, base relativa;
//   - panel publicado aparte: se fija VITE_API_URL con la URL de la API.
const configurada = import.meta.env.VITE_API_URL
const base =
  configurada === undefined
    ? import.meta.env.DEV
      ? 'http://localhost:3000'
      : ''
    : configurada.replace(/\/+$/, '')
const baseURL = `${base}/api`

const cliente = axios.create({ baseURL, timeout: 15000 })

// Todo fallo llega a las páginas con la MISMA forma: { status, mensaje }.
// status 0 = no hubo respuesta (backend apagado o red caída).
const MENSAJE_SIN_API = base
  ? `No se pudo conectar con la API en ${base}. Verifica que el backend esté corriendo.`
  : 'No se pudo conectar con el servidor. Recarga la página o inténtalo de nuevo.'

function mensajeDe(status, datos) {
  if (status === 409) {
    return datos?.error || 'Ya existe un registro con ese nombre, serial o url.'
  }
  if (status === 404) {
    return 'Ese registro ya no existe.'
  }
  if (status === 400) {
    return datos?.error || 'Revisa los datos del formulario.'
  }
  return datos?.error || 'Ocurrió un error en el servidor. Intenta de nuevo.'
}

// Cualquier respuesta del servidor (aunque sea un 409 o un 404) significa que la API está
// viva. Se avisa por un evento para que el indicador del pie se ponga en verde al instante,
// sin esperar al sondeo de 30 s ni a que el usuario recargue.
function avisarApiViva() {
  window.dispatchEvent(new Event('api:viva'))
}

cliente.interceptors.response.use(
  (respuesta) => {
    avisarApiViva()
    return respuesta
  },
  (error) => {
    if (!error.response) {
      return Promise.reject({ status: 0, mensaje: MENSAJE_SIN_API })
    }
    avisarApiViva()
    const { status, data } = error.response
    return Promise.reject({ status, mensaje: mensajeDe(status, data) })
  },
)

// Usado por el indicador del pie: ¿la API responde?
export async function comprobarApi() {
  try {
    await cliente.get('/generos', { timeout: 4000 })
    return true
  } catch (fallo) {
    // 400/404 igual significan que hay servidor; solo la red caída cuenta como caída.
    return fallo.status > 0
  }
}

export default cliente
