# Despliegue en la nube (Render)

El proyecto se publica como **un solo servicio web**: Express sirve la API bajo `/api` y el panel
compilado (`frontend/dist`) en la raíz, así que todo vive en la misma URL, sin CORS y sin variables de
entorno en el cliente.

La base de datos sigue en MongoDB Atlas (tier gratis M0); lo que se publica es el servidor.

## Qué hace falta

- Cuenta de GitHub con el repo `Sssir99/pi2-cine` y la rama `main` al día.
- Cuenta en Render (gratis, sin tarjeta para el plan free).
- La cadena de conexión de Atlas (`mongodb+srv://…`), la misma de `backend/.env`.

## Preparar Atlas (5 minutos)

1. Entra al cluster → **Database Access** → *Add New Database User*. Crea un usuario solo para la app
   con contraseña fuerte y permiso **Read and write to any database**.
2. **Network Access** → *Add IP Address* → `0.0.0.0/0` con la nota "Render free (IP no fija)".
   El plan gratis de Render no tiene IP de salida fija; restringirla por IP rompería la conexión cada
   vez que el servicio se reinicia.
3. Copia la cadena de conexión del usuario nuevo (**Connect → Drivers**) y cambia `<password>`.

## Comprobar que el paquete de producción funciona en local

Antes de publicar nada, el mismo modo que usará Render:

```
cd frontend && VITE_API_URL= npm run build
cd ../backend && npm install && npm start
```

(El `VITE_API_URL=` vacío es a propósito: así el panel pide `/api` a su propio origen en vez de a
`localhost:3000`, que es lo que lleva el `.env` de desarrollo.)

Abre http://localhost:3000 (no 5173): debe cargar el panel desde el propio Express. Comprueba:

- http://localhost:3000/api/salud → `{"ok":true,"base":"conectada",…}`
- http://localhost:3000/generos escrito a mano en la barra → carga la pantalla (fallback de React Router)
- http://localhost:3000/api/nada → 404 en JSON
- Crear, editar y borrar un género, y el botón de tema.

## Crear el servicio en Render

### Opción A — a mano (recomendada para documentar)

**New → Web Service** y rellena el formulario. Son unos clics más que el blueprint, pero el paso a paso
queda visible en pantalla, que es lo que pide el documento de la entrega.

| Campo | Valor |
|---|---|
| Repository | `Sssir99/pi2-cine` |
| Branch | `main` |
| Runtime | Node |
| Build Command | `export VITE_API_URL="" && npm ci --prefix backend && npm ci --include=dev --prefix frontend && npm run build --prefix frontend` |
| Start Command | `npm start --prefix backend` |
| Instance Type | Free |
| Health Check Path | `/api/salud` |
| Environment variables | `NODE_ENV=production`, `NODE_VERSION=22`, `MONGO_URI=<cadena de Atlas>` |

> **Ojo con `NODE_ENV=production`:** con esa variable puesta, `npm ci` no instala las
> `devDependencies`, y Vite vive ahí. El build falla con `vite: not found`. Por eso el comando de
> compilación instala el frontend con `--include=dev`; el backend sí puede quedarse con las de producción.

### Opción B — con el blueprint del repo

**New → Blueprint**, conecta GitHub y elige el repo: Render lee `render.yaml`, propone el servicio
`pi2-cine` con los mismos comandos y solo pide la cadena de Mongo. Es más rápido y el archivo queda como
la configuración versionada del servicio; el build y el arranque son idénticos a los de la opción A.

## Verificar el despliegue

Con la URL que da Render (`https://pi2-cine.onrender.com` o similar):

1. `https://<url>/api/salud` responde 200 y `"base":"conectada"`.
2. `https://<url>/` abre el Resumen con las cifras de la base.
3. Recargar en `https://<url>/generos` no da 404 (fallback de la SPA).
4. Crear, editar y borrar un género; probar el 409 borrando uno en uso.
5. Los dos temas y la vista móvil.
6. En **Logs** no hay errores ni avisos de conexión a Mongo.

> El plan gratis **duerme el servicio a los 15 minutos sin visitas** y tarda cerca de un minuto en
> despertar. Para grabar el video, abre la URL un par de minutos antes y déjala cargada.

## Capturas para el documento

Estas son las que pide el paso a paso; conviene numerarlas en el mismo orden que el texto:

1. Cluster de Atlas con la base `cine` y las colecciones.
2. **Network Access** con la regla `0.0.0.0/0`.
3. **Database Access** con el usuario de la app.
4. Repo en GitHub con la rama `main` y el último commit.
5. Render → **New → Blueprint** con el repo seleccionado.
6. Pantalla de variables de entorno con `MONGO_URI` (valor oculto).
7. Log del build terminando en `Your service is live`.
8. Log del arranque: `Servidor corriendo en http://localhost:10000` y la conexión a Mongo.
9. `/api/salud` en el navegador con `ok: true`.
10. El panel desplegado en el Resumen.
11. Una pantalla con datos (Media) y el alta de un título con el toast de éxito.
12. El 409 al intentar borrar un género en uso.
13. La vista móvil con el menú abierto.
14. El tema claro (para mostrar que hay dos).

## Si algo falla

| Síntoma | Causa más probable |
|---|---|
| El build falla en `npm ci` | Falta `package-lock.json` en la rama o se subió con otro gestor. |
| El servicio arranca y muere | `MONGO_URI` vacía o mal pegada; míralo en **Logs**. |
| `/api/salud` responde 503 con `base: "sin conexion"` | Atlas no acepta la IP (`Network Access`) o el usuario no tiene permisos. |
| La página carga pero no hay datos | La API responde 500: revisa el log; casi siempre es la base. |
| `Cannot find module 'helmet'` | El build no instaló el backend (`npm ci --prefix backend`). |
| Entrar directo a `/generos` da 404 | Falta `frontend/dist` en el build: revisa que `npm run build --prefix frontend` corra. |
| Tarda un minuto en abrir | El plan gratis está despertando. No es un error. |

## Actualizar la app

Cada push a `main` vuelve a desplegar solo. Para no romper la entrega, verifica en local con
`npm test`, `npm run humo` y `npm run build` antes de empujar.

## Si algún día se separa el frontend (opcional)

El código lo soporta sin cambios: publica `frontend/` en Netlify o Vercel con
`VITE_API_URL=https://<url-de-la-api>` y en Render pon `ORIGENES_PERMITIDOS=https://<url-del-panel>`
para cerrar CORS. Con el servicio único no hace falta ninguna de las dos cosas.
