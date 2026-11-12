# Guía para hacer tu módulo del frontend

Cada integrante hace **una** pantalla: Géneros, Directores, Productoras o Tipos. La de Media ya está
hecha y sirve de referencia. Esta guía es el camino corto; las reglas de diseño están en `DISENO_UI.md`
y no se cambian.

Antes de empezar, el backend tiene que estar corriendo (`cd backend && npm run dev`) y la app abierta con
`cd frontend && npm run dev`.

## Paso 0 — Comprueba que tu API responde

Desde `frontend/`:

```
npm run humo
```

Recorre los 5 módulos con un ciclo completo (crear, actualizar, borrar) y te dice cuál falla. Si tu
módulo sale en FALLA, el problema es del backend, no de tu pantalla: arréglalo ahí antes de seguir.

## Paso 1 — Crea tu rama

```
git checkout main
git pull
git checkout -b feat/front-generos
```

(La tuya: `feat/front-generos`, `feat/front-directores`, `feat/front-productoras`, `feat/front-tipos`.)

## Paso 2 — Copia la plantilla

```
cd frontend/src/pages
cp PlantillaPage.ejemplo.jsx GenerosPage.jsx
```

`PlantillaPage.ejemplo.jsx` es una pantalla CRUD completa y funcionando, escrita para un módulo con
nombre + descripción + estado. No está conectada a ninguna ruta: es solo el molde.

Ojo: **no borres** `PlantillaPage.ejemplo.jsx`, déjalo para el siguiente.

## Paso 3 — Cambia los 5 bloques marcados con `>>>`

Abre tu archivo y busca los comentarios `// >>>`. Son los únicos sitios donde hay que tocar:

1. **Las funciones de tu módulo.** Están en `src/api/<modulo>.js` y ya vienen escritas:
   `listarGeneros`, `crearGenero`, `actualizarGenero`, `eliminarGenero`.
2. **Los campos del formulario vacío.** Los nombres son los del contrato, en español y sin tildes:
   `nombre`, `nombres`, `descripcion`, `estado`, `slogan`.
3. **Los datos que se mandan al guardar.** Nada de `fechaCreacion` ni `fechaActualizacion`: las pone el
   sistema.
4. **Las columnas de la tabla**, en el orden que fija `DISENO_UI.md` §7:
   - Géneros: nombre, descripción, estado, fecha de actualización
   - Directores: nombres, estado, fecha de actualización
   - Productoras: nombre, slogan, estado, fecha de actualización
   - Tipos: nombre, descripción, fecha de actualización (sin estado)
5. **Los textos**: el título en plural, el botón ("+ Nuevo género"), el mensaje del estado vacío y el
   `caption` de la tabla.

## Paso 4 — Ajusta el formulario a tus campos

- **Tipos** no tiene estado: borra el `<select>` de estado, la columna del estado y el `import` de
  `BadgeEstado`. Esa es la única diferencia rara entre módulos.
- **Directores** usa `nombres` (en plural) y no lleva descripción ni slogan.
- **Productoras** lleva además `slogan`, opcional: cópialo del campo "descripción".
- Los campos obligatorios van con `required`, `aria-required="true"` y el asterisco
  `<span className="requerido" aria-hidden="true">*</span>`. El texto de ayuda va solo donde hay una
  regla real, enlazado con `aria-describedby`.

## Paso 5 — Prueba tu pantalla contra la API

Abre http://localhost:5173 y entra a tu módulo. Tienes que ver esto funcionando:

- [ ] La tabla muestra los registros reales (nada escrito en el código).
- [ ] Crear funciona y la fila aparece sin recargar.
- [ ] Editar abre con los datos cargados y al guardar se ven los cambios.
- [ ] Borrar pide confirmación y la fila desaparece; "Cancelar" no borra.
- [ ] Se ven los tres estados: cargando (recarga con F5), vacío (borra todo) y error (apaga el backend
      y recarga; el pie se pone en rojo).
- [ ] Probar un duplicado muestra el aviso con el mensaje del backend (409).
- [ ] Dejar un campo obligatorio vacío no deja guardar (lo frena el navegador).
- [ ] A 1280 px de ancho no hay scroll horizontal.

## Paso 6 — Entrega

```
git add frontend/src/pages/GenerosPage.jsx
git commit -m "feat(front): pantalla de Géneros"
git push -u origin feat/front-generos
```

Abre el PR con una captura de tu pantalla funcionando y una línea de qué probaste. No hace falta tocar
`App.jsx` (la ruta ya existe) ni ningún componente compartido.

## Si algo no sale

| Síntoma | Causa más probable |
|---|---|
| La tabla no carga y el pie dice "API sin conexión" | El backend está apagado o cambió de puerto. |
| "No se pudo cargar la información" con el backend encendido | La ruta del `api/<modulo>.js` no coincide con la de `RUTAS.md`. |
| Error 404 al guardar | La ruta o el método del controlador no existen todavía. |
| Error 400 con un texto raro | Un campo obligatorio vacío o un valor fuera de rango: el mensaje lo manda el backend. |
| La pantalla queda en blanco o sale "Esta sección no se pudo mostrar" | Hay un error de JavaScript en tu página: abre la consola con F12 y lee el archivo y la línea. |
| El estado no cambia a "Inactivo" | Revisa que el `<select>` de estado esté dentro del formulario y con su `id`. |

No toques sin avisar al grupo: `src/api/cliente.js`, `src/styles/tema.css`, `src/components/*` ni
`src/App.jsx`. Si te falta algo ahí, se pide.
