import axios from 'axios'

// Base URL: en desarrollo http://localhost:3000; se cambia en frontend/.env sin tocar código.
const baseURL = `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')}/api`

const cliente = axios.create({ baseURL, timeout: 15000 })

// Todo fallo llega a las páginas con la MISMA forma: { status, mensaje }.
// status 0 = no hubo respuesta (backend apagado o red caída).
const MENSAJE_SIN_API =
  'No se pudo conectar con la API. Verifica que el backend esté corriendo en localhost:3000.'

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
