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

- `src/pages/MediaPage.jsx` es la pantalla de referencia ya terminada.
- Las otras cuatro páginas son avisos de "en construcción": cada integrante reemplaza la suya copiando
  la anatomía de Media.
- No se toca sin avisar al grupo: `src/api/cliente.js`, `src/styles/tema.css`, `src/components/*` ni
  `src/App.jsx`.

## Scripts

- `npm run dev` — servidor de desarrollo (Vite).
- `npm run build` — compila a `dist/`.
- `npm run lint` — oxlint.
- `npm run preview` — sirve el build.
