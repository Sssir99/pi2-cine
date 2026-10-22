# Pi2 Cine Web App

App web tipo catálogo para publicar películas y series en modo Administrador.
Proyecto Integrado 2 — IU Digital de Antioquia.

## Stack

- Backend: Node.js + Express
- Base de datos: MongoDB (MongoDB Atlas, tier gratuito M0)
- ODM: Mongoose
- Pruebas: Postman

## Estructura

```
pi2-cine/
├── backend/              → API REST (Express + Mongoose)
│   ├── src/
│   │   ├── server.js      → arranca el servidor
│   │   ├── app.js         → configura Express
│   │   ├── config/db.js   → conexión a MongoDB Atlas
│   │   ├── models/        → los 5 modelos (Genero, Director, Productora, Tipo, Media)
│   │   └── seed/seed.js   → datos iniciales (5 géneros, 2 tipos)
│   ├── .env               → variables de entorno (NO se sube a Git)
│   └── package.json
├── frontend/             → (entrega posterior, aún no existe)
├── RUTAS.md              → contrato de endpoints (congelado)
└── README.md
```

## Requisitos

- Node.js 18 o superior
- Una cuenta y cluster en MongoDB Atlas (gratis)

## Instalación y arranque

1. `cd backend`
2. `npm install`
3. Pega tu cadena de conexión en `backend/.env` (campo `MONGO_URI`)
4. `npm run seed`  → carga los 5 géneros y 2 tipos (solo la primera vez)
5. `npm run dev`   → servidor en http://localhost:3000

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
