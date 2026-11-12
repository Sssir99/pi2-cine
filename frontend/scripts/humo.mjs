// Prueba rápida de la API: recorre los 5 módulos y hace un ciclo completo
// (crear, actualizar, borrar) con un registro temporal que se limpia al final.
//
//   npm run humo
//
// Sirve para saber si el problema está en el backend antes de tocar el frontend.
// Si un paso falla, el script dice cuál y deja el id del registro temporal para
// poder borrarlo a mano.

const PREFIJO = `humo-${Date.now()}`

// La URL sale de .env (VITE_API_URL) o de localhost:3000 por defecto.
function leerBase() {
  try {
    if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env')
  } catch {
    // Sin .env: se usa el valor por defecto.
  }
  return `${(process.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')}/api`
}

const BASE = leerBase()

async function pedir(metodo, ruta, cuerpo) {
  const respuesta = await fetch(BASE + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    datos = null
  }
  return { estado: respuesta.status, datos }
}

// Cada módulo: ruta, nombre legible y el cuerpo que necesita para el ciclo.
const MODULOS = [
  {
    ruta: '/generos',
    nombre: 'Géneros',
    crear: () => ({ nombre: `${PREFIJO}-genero`, descripcion: 'temporal' }),
    editar: () => ({ nombre: `${PREFIJO}-genero`, descripcion: 'temporal editado', estado: 'inactivo' }),
  },
  {
    ruta: '/directores',
    nombre: 'Directores',
    crear: () => ({ nombres: `${PREFIJO} Director` }),
    editar: () => ({ nombres: `${PREFIJO} Director`, estado: 'inactivo' }),
  },
  {
    ruta: '/productoras',
    nombre: 'Productoras',
    crear: () => ({ nombre: `${PREFIJO}-productora`, slogan: 'temporal' }),
    editar: () => ({ nombre: `${PREFIJO}-productora`, slogan: 'temporal editado', estado: 'inactivo' }),
  },
  {
    ruta: '/tipos',
    nombre: 'Tipos',
    crear: () => ({ nombre: `${PREFIJO}-tipo`, descripcion: 'temporal' }),
    editar: () => ({ nombre: `${PREFIJO}-tipo`, descripcion: 'temporal editado' }),
  },
]

const marca = (ok) => (ok ? 'ok  ' : 'FALLA')

async function probarModulo(modulo) {
  const pasos = []
  let id = null

  try {
    const lista = await pedir('GET', modulo.ruta)
    pasos.push({ nombre: 'GET lista', esperado: 200, obtenido: lista.estado })
    if (lista.estado !== 200) throw new Error('la lista no responde 200')

    const creado = await pedir('POST', modulo.ruta, modulo.crear())
    pasos.push({ nombre: 'POST', esperado: 201, obtenido: creado.estado })
    if (creado.estado !== 201) throw new Error(creado.datos?.error || 'no se pudo crear')
    id = creado.datos._id

    const editado = await pedir('PUT', `${modulo.ruta}/${id}`, modulo.editar())
    pasos.push({ nombre: 'PUT', esperado: 200, obtenido: editado.estado })
    if (editado.estado !== 200) throw new Error(editado.datos?.error || 'no se pudo actualizar')

    const borrado = await pedir('DELETE', `${modulo.ruta}/${id}`)
    pasos.push({ nombre: 'DELETE', esperado: 200, obtenido: borrado.estado })
    if (borrado.estado !== 200) throw new Error(borrado.datos?.error || 'no se pudo borrar')
    id = null

    return { modulo, pasos, error: null }
  } catch (fallo) {
    return { modulo, pasos, error: fallo.message, idSinBorrar: id }
  }
}

// Media necesita ids reales de las otras cuatro colecciones.
async function probarMedia() {
  const pasos = []
  const temporales = []

  try {
    const [generos, tipos] = await Promise.all([pedir('GET', '/generos'), pedir('GET', '/tipos')])
    pasos.push({ nombre: 'GET listas relacionadas', esperado: 200, obtenido: generos.estado })

    const genero = generos.datos?.find((g) => g.estado === 'activo')
    const tipo = tipos.datos?.[0]
    if (!genero || !tipo) throw new Error('faltan géneros activos o tipos: corre "npm run seed" en backend')

    // Director y productora de apoyo, temporales y activos.
    const director = await pedir('POST', '/directores', { nombres: `${PREFIJO} Director Media` })
    if (director.estado === 201) temporales.push(['/directores', director.datos._id])
    const productora = await pedir('POST', '/productoras', { nombre: `${PREFIJO}-productora-media` })
    if (productora.estado === 201) temporales.push(['/productoras', productora.datos._id])

    const cuerpo = {
      serial: PREFIJO,
      titulo: 'Registro de prueba',
      url: `https://ejemplo.com/${PREFIJO}`,
      genero: genero._id,
      tipo: tipo._id,
      director: director.datos?._id,
      productora: productora.datos?._id,
    }

    const creado = await pedir('POST', '/media', cuerpo)
    pasos.push({ nombre: 'POST', esperado: 201, obtenido: creado.estado })
    if (creado.estado !== 201) throw new Error(creado.datos?.error || 'no se pudo crear')
    temporales.push(['/media', creado.datos._id])

    const duplicado = await pedir('POST', '/media', cuerpo)
    pasos.push({ nombre: 'POST duplicado (409)', esperado: 409, obtenido: duplicado.estado })

    const editado = await pedir('PUT', `/media/${creado.datos._id}`, { ...cuerpo, titulo: 'Registro de prueba editado' })
    pasos.push({ nombre: 'PUT', esperado: 200, obtenido: editado.estado })

    const borrado = await pedir('DELETE', `/media/${creado.datos._id}`)
    pasos.push({ nombre: 'DELETE', esperado: 200, obtenido: borrado.estado })

    return { modulo: { nombre: 'Media' }, pasos, error: null }
  } catch (fallo) {
    return { modulo: { nombre: 'Media' }, pasos, error: fallo.message }
  } finally {
    // Limpieza: siempre, aunque algo haya fallado por el camino.
    for (const [ruta, id] of temporales) await pedir('DELETE', `${ruta}/${id}`)
  }
}

function imprimir(resultado) {
  const bien = resultado.pasos.every((paso) => paso.obtenido === paso.esperado) && !resultado.error
  console.log(`${resultado.modulo.nombre.padEnd(12)} ${marca(bien)}`)
  for (const paso of resultado.pasos) {
    const ok = paso.obtenido === paso.esperado
    console.log(`  ${ok ? 'ok  ' : 'FALLA'} ${paso.nombre.padEnd(26)} esperado ${paso.esperado}, obtuvo ${paso.obtenido}`)
  }
  if (resultado.error) console.log(`  >> ${resultado.error}`)
  if (resultado.idSinBorrar) console.log(`  >> quedó un registro sin borrar: ${resultado.modulo.ruta}/${resultado.idSinBorrar}`)
  return bien
}

console.log(`\nProbando la API en ${BASE}\n`)

const resultados = []
for (const modulo of MODULOS) resultados.push(await probarModulo(modulo))
resultados.push(await probarMedia())

console.log('')
let todoBien = true
for (const resultado of resultados) todoBien = imprimir(resultado) && todoBien

console.log(
  todoBien
    ? '\nTodo responde como dice RUTAS.md.\n'
    : '\nHay algo roto. Compara la ruta y el código con RUTAS.md y revisa la consola del backend.\n',
)

process.exit(todoBien ? 0 : 1)
