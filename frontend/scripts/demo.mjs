// Datos de ejemplo para grabar el video de la entrega 2.
//
//   npm run demo           carga 5 títulos con sus relaciones (idempotente)
//   npm run demo:limpiar   borra solo lo que carga este script
//
// Va por la API igual que la app, no por Mongo directo: si algo falla, es un
// problema real de la API y se ve en ese momento. No toca los géneros ni los
// tipos del seed, solo los busca por nombre y los reutiliza.
//
// Los datos son para la cámara: títulos conocidos, sinopsis corta y portada con
// picsum (si la imagen no carga, la tabla cae a las iniciales, que es lo que hace
// el componente Portada). Los seriales van con el prefijo CINE- para que el
// limpiador sepa exactamente qué borrar y no toque nada del tutor ni de las pruebas.

const LIMPIAR = process.argv.includes('--limpiar')

// Misma resolución de la URL que usa humo.mjs: .env o localhost:3000.
function leerBase() {
  try {
    if (typeof process.loadEnvFile === 'function') process.loadEnvFile('.env')
  } catch {
    // Sin .env: se usa el valor por defecto.
  }
  return `${(process.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')}/api`
}

const BASE = leerBase()

const GENEROS = ['ciencia ficción', 'drama']
const TIPOS = ['película', 'serie']

const DIRECTORES = ['Christopher Nolan', 'Denis Villeneuve', 'Johan Renck', 'Vince Gilligan']
const PRODUCTORAS = [
  'Warner Bros',
  'Legendary Pictures',
  'HBO',
  'FilmNation Entertainment',
  'Sony Pictures Television',
]

// Slogan y descripción de cada productora: sin ellos la tabla se ve vacía y el panel
// parece a medio llenar. Solo se rellenan si están en blanco.
const DATOS_PRODUCTORA = {
  'Warner Bros': {
    slogan: 'El estudio que inventó el cine sonoro.',
    descripcion: 'Productora y distribuidora estadounidense fundada en 1923.',
  },
  'Legendary Pictures': {
    slogan: 'Grandes historias, gran escala.',
    descripcion: 'Productora estadounidense de cine de género y franquicias.',
  },
  HBO: {
    slogan: 'No es televisión, es HBO.',
    descripcion: 'Cadena y productora de series de prestigio.',
  },
  'FilmNation Entertainment': {
    slogan: 'Cine independiente con alcance global.',
    descripcion: 'Productora y distribuidora de cine independiente.',
  },
  'Sony Pictures Television': {
    slogan: 'Series para todos los públicos.',
    descripcion: 'División televisiva de Sony Pictures.',
  },
}

const TITULOS = [
  {
    serial: 'CINE-001',
    titulo: 'Interstellar',
    sinopsis:
      'Un grupo de exploradores cruza un agujero de gusano buscando un planeta habitable para la humanidad.',
    url: 'https://cdn.picine.dev/peliculas/interstellar.mp4',
    imagenPortada: 'https://picsum.photos/seed/interstellar/300/450',
    anioEstreno: 2014,
    genero: 'ciencia ficción',
    tipo: 'película',
    director: 'Christopher Nolan',
    productora: 'Warner Bros',
  },
  {
    serial: 'CINE-002',
    titulo: 'Dune',
    sinopsis:
      'El heredero de una casa noble debe proteger el recurso más valioso del universo en un planeta desértico.',
    url: 'https://cdn.picine.dev/peliculas/dune.mp4',
    imagenPortada: 'https://picsum.photos/seed/dune/300/450',
    anioEstreno: 2021,
    genero: 'ciencia ficción',
    tipo: 'película',
    director: 'Denis Villeneuve',
    productora: 'Legendary Pictures',
  },
  {
    serial: 'CINE-003',
    titulo: 'Chernobyl',
    sinopsis:
      'La historia del accidente nuclear de 1986 y de quienes intentaron contener lo que ya no tenía control.',
    url: 'https://cdn.picine.dev/series/chernobyl.mp4',
    imagenPortada: 'https://picsum.photos/seed/chernobyl/300/450',
    anioEstreno: 2019,
    genero: 'drama',
    tipo: 'serie',
    director: 'Johan Renck',
    productora: 'HBO',
  },
  {
    serial: 'CINE-004',
    titulo: 'Arrival',
    sinopsis:
      'Una lingüista intenta comunicarse con los visitantes de una nave antes de que el miedo gane la partida.',
    url: 'https://cdn.picine.dev/peliculas/arrival.mp4',
    imagenPortada: 'https://picsum.photos/seed/arrival/300/450',
    anioEstreno: 2016,
    genero: 'ciencia ficción',
    tipo: 'película',
    director: 'Denis Villeneuve',
    productora: 'FilmNation Entertainment',
  },
  {
    serial: 'CINE-005',
    titulo: 'Breaking Bad',
    sinopsis:
      'Un profesor de química con cáncer terminal se convierte en fabricante de metanfetamina para dejar dinero a su familia.',
    url: 'https://cdn.picine.dev/series/breaking-bad.mp4',
    imagenPortada: 'https://picsum.photos/seed/breakingbad/300/450',
    anioEstreno: 2008,
    genero: 'drama',
    tipo: 'serie',
    director: 'Vince Gilligan',
    productora: 'Sony Pictures Television',
  },
]

async function pedir(metodo, ruta, cuerpo) {
  let respuesta
  try {
    respuesta = await fetch(BASE + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
  } catch (fallo) {
    console.error(`\nNo se pudo hablar con la API en ${BASE}. ¿Está corriendo el backend? (${fallo.message})`)
    process.exit(1)
  }
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    datos = null
  }
  return { estado: respuesta.status, datos }
}

const lista = async (ruta) => (await pedir('GET', ruta)).datos || []

// Crea el registro si no existe (busca por el campo dado) y devuelve su id.
async function asegurar(ruta, campo, valor, cuerpo, etiqueta) {
  const existentes = await lista(ruta)
  const encontrado = existentes.find((r) => String(r[campo]).toLowerCase() === valor.toLowerCase())
  if (encontrado) {
    console.log(`  ya estaba   ${etiqueta}`)
    return encontrado._id
  }

  const { estado, datos } = await pedir('POST', ruta, cuerpo)
  if (estado === 201) {
    console.log(`  creado      ${etiqueta}`)
    return datos._id
  }
  if (estado === 409) {
    // Carrera con otro proceso: se vuelve a buscar y se sigue.
    const otraVez = (await lista(ruta)).find(
      (r) => String(r[campo]).toLowerCase() === valor.toLowerCase(),
    )
    if (otraVez) {
      console.log(`  ya estaba   ${etiqueta}`)
      return otraVez._id
    }
  }
  console.error(`  FALLA       ${etiqueta} -> ${estado} ${JSON.stringify(datos)}`)
  process.exit(1)
}

async function cargar() {
  console.log(`Cargando el catálogo de ejemplo en ${BASE}\n`)

  const generos = {}
  for (const nombre of GENEROS) {
    generos[nombre] = await asegurar('/generos', 'nombre', nombre, { nombre }, `género "${nombre}"`)
  }

  const tipos = {}
  for (const nombre of TIPOS) {
    tipos[nombre] = await asegurar('/tipos', 'nombre', nombre, { nombre }, `tipo "${nombre}"`)
  }

  const directores = {}
  for (const nombres of DIRECTORES) {
    directores[nombres] = await asegurar('/directores', 'nombres', nombres, { nombres }, `director "${nombres}"`)
  }

  const productoras = {}
  for (const nombre of PRODUCTORAS) {
    productoras[nombre] = await asegurar(
      '/productoras',
      'nombre',
      nombre,
      { nombre, ...(DATOS_PRODUCTORA[nombre] || {}) },
      `productora "${nombre}"`,
    )
  }

  // Las que ya existían se quedaron sin slogan ni descripción (asegurar no toca lo que
  // encuentra). Se completan aquí, y solo si están en blanco, para no pisar cambios.
  for (const productora of await lista('/productoras')) {
    const datos = DATOS_PRODUCTORA[productora.nombre]
    if (!datos || (productora.slogan && productora.descripcion)) continue
    const { estado } = await pedir('PUT', `/productoras/${productora._id}`, {
      nombre: productora.nombre,
      estado: productora.estado || 'activo',
      ...datos,
    })
    if (estado === 200) console.log(`  completada  productora "${productora.nombre}"`)
  }

  for (const titulo of TITULOS) {
    const cuerpo = {
      serial: titulo.serial,
      titulo: titulo.titulo,
      sinopsis: titulo.sinopsis,
      url: titulo.url,
      imagenPortada: titulo.imagenPortada,
      anioEstreno: titulo.anioEstreno,
      genero: generos[titulo.genero],
      tipo: tipos[titulo.tipo],
      director: directores[titulo.director],
      productora: productoras[titulo.productora],
    }
    await asegurar('/media', 'serial', titulo.serial, cuerpo, `título "${titulo.titulo}" (${titulo.serial})`)
  }

  const media = await lista('/media')
  const nuestros = media.filter((m) => m.serial.startsWith('CINE-'))
  console.log(`\nListo: ${nuestros.length} títulos de ejemplo en la base.`)
  for (const m of nuestros) console.log(`  ${m.serial}  ${m.titulo}  (${m.anioEstreno})`)
  console.log('\nAbre http://localhost:5173 y ya hay catálogo para grabar.')
  console.log('Al terminar, npm run demo:limpiar deja la base como tras el seed.')
}

async function limpiar() {
  console.log(`Borrando el catálogo de ejemplo de ${BASE}\n`)

  let borrados = 0
  for (const titulo of TITULOS) {
    const encontrados = (await lista('/media')).filter((m) => m.serial === titulo.serial)
    for (const m of encontrados) {
      const { estado } = await pedir('DELETE', `/media/${m._id}`)
      console.log(`  ${estado === 200 ? 'borrado    ' : 'FALLA      '} película "${m.titulo}" (${m.serial})`)
      if (estado === 200) borrados += 1
    }
  }
  if (borrados === 0) console.log('  no había títulos de ejemplo cargados')

  // Directores y productoras solo se borran si ya nada los referencia: si el tutor
  // los usó en un título suyo, se quedan.
  const media = await lista('/media')
  const enUso = new Set()
  for (const m of media) {
    enUso.add(String(m.director))
    enUso.add(String(m.productora))
  }

  for (const nombres of DIRECTORES) {
    for (const d of (await lista('/directores')).filter((x) => x.nombres === nombres)) {
      if (enUso.has(String(d._id))) {
        console.log(`  se queda    director "${d.nombres}" (lo usa otro título)`)
        continue
      }
      const { estado } = await pedir('DELETE', `/directores/${d._id}`)
      console.log(`  ${estado === 200 ? 'borrado    ' : 'FALLA      '} director "${d.nombres}"`)
    }
  }

  for (const nombre of PRODUCTORAS) {
    for (const p of (await lista('/productoras')).filter((x) => x.nombre === nombre)) {
      if (enUso.has(String(p._id))) {
        console.log(`  se queda    productora "${p.nombre}" (la usa otro título)`)
        continue
      }
      const { estado } = await pedir('DELETE', `/productoras/${p._id}`)
      console.log(`  ${estado === 200 ? 'borrado    ' : 'FALLA      '} productora "${p.nombre}"`)
    }
  }

  const final = {
    generos: (await lista('/generos')).length,
    directores: (await lista('/directores')).length,
    productoras: (await lista('/productoras')).length,
    tipos: (await lista('/tipos')).length,
    media: (await lista('/media')).length,
  }
  console.log(
    `\nBase: ${final.generos} géneros, ${final.directores} directores, ${final.productoras} productoras, ` +
      `${final.tipos} tipos, ${final.media} títulos.`,
  )
}

await (LIMPIAR ? limpiar() : cargar())
