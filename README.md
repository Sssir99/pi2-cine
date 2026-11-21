# Pi2 Cine Web App

App web tipo catálogo para publicar películas y series en modo Administrador.
Proyecto Integrado 2 — IU Digital de Antioquia.

## Stack

- Backend: Node.js + Express 4
- Base de datos: MongoDB (MongoDB Atlas, tier gratuito M0)
- ODM: Mongoose 8
- Pruebas de la API: colección de Postman (49 peticiones) y `npm run humo`
- Frontend: React 19 + Vite (JavaScript, sin TypeScript)
- Estilos: Bootstrap 5.3 (CSS y el JS del modal) + `src/styles/tema.css` con los tokens de los dos temas
- HTTP: Axios · Navegación: React Router 6 · Avisos: SweetAlert2

## Estructura

```
pi2-cine/
├── backend/              → API REST (Express + Mongoose)
│   ├── src/
│   │   ├── server.js      → arranca el servidor
│   │   ├── app.js         → configura Express
│   │   ├── config/db.js   → conexión a MongoDB Atlas
│   │   ├── config/dns.js  → DNS de Node (Atlas falla con el de Windows)
│   │   ├── middleware/    → validarId, exigirCampos, errorHandler
│   │   ├── models/        → los 5 modelos (Genero, Director, Productora, Tipo, Media)
│   │   └── seed/seed.js   → datos iniciales (5 géneros, 2 tipos)
│   ├── .env               → variables de entorno (NO se sube a Git)
│   └── package.json
├── frontend/             → panel de administración en React (entrega 2)
│   ├── src/
│   │   ├── api/           → cliente Axios + un archivo por módulo
│   │   ├── components/    → Layout, TablaListado, ModalFormulario, avisos…
│   │   ├── pages/         → Resumen + una página por módulo (y el molde histórico de la plantilla)
│   │   ├── styles/tema.css → tokens de los dos temas y clases compartidas
│   │   ├── utils/         → formato.js (fechas, iniciales) y tabla.js (filtrar, ordenar)
│   │   ├── App.jsx        → rutas
│   │   └── main.jsx       → aplica el tema guardado antes de pintar
│   ├── scripts/humo.mjs   → prueba rápida de los 5 endpoints (npm run humo)
│   ├── scripts/demo.mjs   → datos de ejemplo para grabar (npm run demo / demo:limpiar)
│   ├── .env               → URL de la API (NO se sube a Git)
│   └── package.json
├── postman/              → colección de la API (49 peticiones)
├── RUTAS.md              → contrato de endpoints (congelado)
├── DISENO_UI.md          → contrato visual y de código del frontend
├── GUIA_MODULO.md        → cómo tocar una pantalla sin romper el molde
└── README.md
```

## Requisitos

- Node.js 18 o superior
- Una cuenta y cluster en MongoDB Atlas (gratis)

## Instalación y arranque

1. `cd backend`
2. `npm install`
3. Pega tu cadena de conexión en `backend/.env` (campo `MONGO_URI`)
4. `npm run seed`  → carga los 5 géneros y 2 tipos (idempotente: se puede repetir sin duplicar)
5. `npm run dev`   → servidor en http://localhost:3000

## Frontend

El frontend consume la API anterior; sin el backend corriendo no muestra datos.

1. `cd frontend`
2. `npm install`
3. Copia `.env.example` a `.env` (la URL de la API; por defecto `http://localhost:3000`)
4. `npm run dev` → panel en http://localhost:5173

Notas para el equipo:

- **Bundler: Vite** (decidido; `create-react-app` está abandonado y falla con Node 24). Si siguen un tutorial
  de CRA, cambian tres cosas y ya: el `index.html` está en la raíz de `frontend/` (no en `public/`), la
  variable de entorno se lee como `import.meta.env.VITE_API_URL` (no `process.env.REACT_APP_…`) y el servidor
  arranca con `npm run dev` (no `npm start`).
- Para cambiar una pantalla: **`GUIA_MODULO.md`**. `src/pages/MediaPage.jsx` es la referencia más completa;
  `PlantillaPage.ejemplo.jsx` es un molde histórico que ya no incluye filtros, orden ni aviso de cambios.
- `npm test` corre las pruebas de Vitest (helpers y estados de la tabla).
- `npm run demo` carga 5 títulos de ejemplo con sus relaciones y `npm run demo:limpiar` los borra.
- Antes de tocar el frontend: `npm run humo` comprueba los 5 endpoints de la API con un ciclo
  crear/actualizar/borrar y te dice cuál está roto. Si ahí falla tu módulo, el problema es del backend.
- Las reglas de diseño están en `DISENO_UI.md`: no se inventa nada que no esté ahí.
- Una rama por módulo (`feat/front-generos`, …) y un PR por módulo. No se toca sin avisar `api/cliente.js`,
  `styles/tema.css`, `components/*` ni `App.jsx`: es la base común.

## Despliegue

En producción se publica **un solo servicio**: Express sirve la API bajo `/api` y el panel compilado en
la raíz, así que todo vive en una URL, sin CORS y sin variables en el cliente. El paso a paso (Atlas,
Render, variables, verificación y capturas para el documento) está en **`DEPLOY.md`**, y el servicio está
descrito en `render.yaml`.

Comprobación rápida del paquete de producción en local:

```
cd frontend && VITE_API_URL= npm run build
cd ../backend && npm start          # http://localhost:3000
curl http://localhost:3000/api/salud
```

## Estado de los módulos (API implementada)

Los 5 módulos están implementados con CRUD completo (GET, GET/:id, POST, PUT, DELETE) y registrados en `src/app.js`:

| Módulo    | Ruta base          | Archivos                                        |
|-----------|--------------------|-------------------------------------------------|
| Género    | `/api/generos`     | `controllers/generoController.js` + `routes/generoRoutes.js` |
| Director  | `/api/directores`  | `controllers/directorController.js` + `routes/directorRoutes.js` |
| Productora| `/api/productoras` | `controllers/productoraController.js` + `routes/productoraRoutes.js` |
| Tipo      | `/api/tipos`       | `controllers/tipoController.js` + `routes/tipoRoutes.js` |
| Media     | `/api/media`       | `controllers/mediaController.js` + `routes/mediaRoutes.js` |

Middlewares compartidos (`src/middleware/`):

- `validarId.js` → responde 400 si el `:id` no tiene formato de ObjectId (se usa en todas las rutas con `:id`).
- `exigirCampos.js` → responde 400 si un PUT no trae el campo identificador (nombre/nombres): `findByIdAndUpdate`
  no valida los campos obligatorios que no vienen en el cuerpo.
- `errorHandler.js` → manejador central: 409 si se repite un valor único, 400 si falla una validación, 404 si el registro no existe y 500 ante cualquier otro error.

CORS (`cors` en `src/app.js`): la API acepta peticiones desde cualquier origen en desarrollo, porque el
frontend de React corre en otro puerto (Vite 5173 / CRA 3000). Para publicar, se restringe con
`cors({ origin: ['https://midominio.com'] })`.

Media valida además que el género, el director y la productora existan y estén `activo`, y que el tipo exista, antes de crear o actualizar.

## Para el equipo (al clonar el repo)

- El `.env` NO se sube al repo (está en `.gitignore`). Cada integrante crea el suyo en `backend/.env` con la cadena `mongodb+srv://` del mismo cluster (Atlas → Connect → Drivers).
- La base de datos se llama `cine`.
- En Atlas, Network Access debe permitir la IP de cada uno o dejar "Allow access from anywhere" (0.0.0.0/0) para desarrollo.
- `fechaCreacion` y `fechaActualizacion` las genera el sistema; NO se envían en el body.
- El contrato de endpoints está en `RUTAS.md`: cada módulo implementa su controller y rutas siguiéndolo.

## Entidades (módulos)

1. Género — nombre, estado, descripción
2. Director — nombres, estado
3. Productora — nombre, estado, slogan, descripción
4. Tipo — nombre, descripción
5. Media — serial, título, sinopsis, url, imagen de portada, año de estreno + referencias a género/director/productora/tipo

El detalle de campos y validaciones está en los modelos; el contrato de endpoints está en `RUTAS.md`.
