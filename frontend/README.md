# Frontend PI2 Cine

Panel de administración en React que consume la API de `../backend`.

## Arranque

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm run dev               # http://localhost:5173
```

El backend tiene que estar corriendo (`cd ../backend && npm run dev`). Si no, la tabla muestra el error
de conexión y el indicador del pie se pone en rojo: es lo esperado, no un fallo del frontend.

## Antes de escribir código

Leer `../DISENO_UI.md` (contrato visual y de código: tokens, componentes compartidos, anatomía de una
pantalla CRUD, mapeo de errores de la API y checklist de módulo terminado).

- `src/pages/MediaPage.jsx` es la pantalla de referencia ya terminada, y las otras cuatro ya están hechas
  (Géneros, Directores, Productoras y Tipos): quedan como ejemplo de cómo se ve un módulo completo.
- No se toca sin avisar al grupo: `src/api/cliente.js`, `src/styles/tema.css`, `src/components/*` ni
  `src/App.jsx`.

## Scripts

- `npm run dev` — servidor de desarrollo (Vite).
- `npm run build` — compila a `dist/`.
- `npm run lint` — oxlint.
- `npm run humo` — prueba los 5 endpoints de la API con un ciclo crear/actualizar/borrar y limpia.
- `npm run demo` — carga 3 títulos de ejemplo con sus directores, productoras, géneros y tipos, para
  grabar el video o mostrar el panel con datos. Es idempotente: si ya están, no los duplica.
- `npm run demo:limpiar` — borra solo lo que cargó `npm run demo` y deja la base como tras el seed.
- `npm run preview` — sirve el build.
