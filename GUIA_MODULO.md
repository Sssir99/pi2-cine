# Guía para tocar un módulo del frontend

Las cinco pantallas del panel (Media, Géneros, Directores, Productoras y Tipos) **ya están hechas y
funcionando** contra la API. Esta guía es para cambiar una de ellas sin romper el molde compartido:
añadir un campo, una columna, un filtro o un texto.

Las reglas de diseño y de código están en `DISENO_UI.md` y no se cambian por módulo.

Antes de empezar, el backend tiene que estar corriendo (`cd backend && npm start`) y la app abierta con
`cd frontend && npm run dev`.

## Paso 0 — Comprueba que la API responde

Desde `frontend/`:

```
npm run humo
npm test
```

`humo` recorre los 5 módulos con un ciclo completo (crear, actualizar, borrar) y dice cuál falla: si falla
un módulo, el problema está en el backend y no en la pantalla. `test` corre las pruebas de los helpers y
de los estados de la tabla.

## Dónde está cada cosa

```
src/pages/<Modulo>Page.jsx   la pantalla: estado, filtros, orden, columnas y formulario
src/api/<modulo>.js          las cinco operaciones contra la API (no se tocan)
src/components/              Layout, TablaListado, ModalFormulario, Filtros, Iconos, Portada, avisos
src/utils/formato.js         fechas, iniciales y texto del estado
src/utils/tabla.js           filtrarPorTexto y ordenarFilas
src/styles/tema.css          tokens y clases compartidas (un solo dueño: la base común)
```

`src/pages/MediaPage.jsx` es la referencia más completa: es la única con los cuatro selects de relación y
la vista previa de portada. `PlantillaPage.ejemplo.jsx` es un molde histórico de las primeras entregas: no
está en las rutas y **no** incluye lo último (filtros, orden, aviso de cambios sin guardar), así que no se
copia.

## Paso 1 — Rama nueva si el cambio es grande

```
git checkout main
git pull
git checkout -b fix/front-generos
```

Para un texto o un `placeholder` no hace falta rama.

## Paso 2 — Los cinco sitios que se tocan al añadir un campo

1. **El formulario**: un `<label htmlFor>` con su `id`, el `<input>` o `<select>` y, si hay una regla real,
   un `<div className="ayuda" id="ayuda-…">` enlazado con `aria-describedby`.
2. **`FORMULARIO_VACIO`**, `abrirEditar` y el objeto `datos` que se manda al guardar. Los nombres son los
   del contrato, en español y sin tildes (`nombre`, `nombres`, `descripcion`, `estado`, `slogan`). Nada de
   `fechaCreacion` ni `fechaActualizacion`: las pone el sistema y la API las ignora si llegan.
3. **La columna en `columnas`**, en el orden que fija `DISENO_UI.md` §7. Si la celda pinta otra cosa que el
   campo (un nombre traducido, un conteo), añade también `valor: (registro) => …` para que la columna
   ordene de verdad; y `ordenable: true` si debe poder pulsarse.
4. **Los filtros**: si el campo sirve para buscar, añádelo a la lista de `filtrarPorTexto`; si es un estado
   cerrado, un `<Selector>` nuevo en `<Filtros>`.
5. **Los textos** que lo mencionan: título en plural, botón ("+ Nuevo género"), estado vacío, "sin
   resultados" y `caption` de la tabla.

Los campos obligatorios van con `required`, `aria-required="true"` y el asterisco
`<span className="requerido" aria-hidden="true">*</span>`.

## Paso 3 — Lo que ya resuelve la base común (no lo reescribas)

- `TablaListado` dibuja el esqueleto de carga, el error con **Reintentar**, el estado vacío con su botón,
  el aviso de "sin resultados" cuando los filtros no dejan pasar nada, las cabeceras ordenables con
  `aria-sort` y las acciones de fila con icono y `aria-label`.
- `ModalFormulario` abre con el foco en el primer campo, bloquea ESC mientras hay cambios sin guardar y
  pregunta antes de descartar. Solo tienes que pasarle `sucio={tocado}` (el estado que se marca en
  `cambiarCampo` y se limpia al abrir el modal).
- `avisos.js` centraliza los mensajes: toast para el éxito, modal para el error y para confirmar borrado.
  No uses el modal de Bootstrap para confirmar.
- `cliente.js` convierte cualquier fallo en `{ status, mensaje }`: `status: 0` es red caída, y 400/404/409
  ya traen el texto del backend.

## Paso 4 — Prueba tu pantalla contra la API

Abre http://localhost:5173 y entra a tu módulo:

- [ ] La tabla muestra los registros reales (nada escrito en el código).
- [ ] Crear funciona y la fila aparece sin recargar.
- [ ] Editar abre con los datos cargados y al guardar se ven los cambios.
- [ ] Cerrar con cambios sin guardar pregunta; "Seguir editando" no cierra y "Descartar" sí.
- [ ] Borrar pide confirmación y la fila desaparece; "Cancelar" no borra.
- [ ] Borrar algo que usa una película responde 409 con el número de títulos (Géneros, Directores,
      Productoras y Tipos).
- [ ] Se ven los cuatro estados: cargando (esqueleto con la pestaña Red en "lenta"), vacío (borra todo y
      vuelve a correr `npm run seed`), error (apaga el backend y recarga; el pie se pone en rojo) y sin
      resultados (escribe algo que no exista en el buscador).
- [ ] Probar un duplicado muestra el aviso con el mensaje del backend (409).
- [ ] Dejar un campo obligatorio vacío no deja guardar (lo frena el navegador).
- [ ] Los dos temas, claro y oscuro, se ven bien (botón al pie del menú).
- [ ] A 1280 px de ancho no hay scroll horizontal de página.
- [ ] En móvil (390 px) la tabla se ve como tarjetas y el menú abre y cierra con la X, el velo y ESC.

## Paso 5 — Entrega

```
git add frontend/src/pages/GenerosPage.jsx
git commit -m "feat(front): campo X en Géneros"
git push -u origin fix/front-generos
```

Abre el PR con una captura de tu pantalla funcionando y una línea de qué probaste. No hace falta tocar
`App.jsx` (la ruta ya existe) ni ningún componente compartido.

## Si algo no sale

| Síntoma | Causa más probable |
|---|---|
| La tabla no carga y el pie dice "API sin conexión" | El backend está apagado o cambió de puerto. |
| "No se pudo cargar la información" con el backend encendido | La ruta del `api/<modulo>.js` no coincide con la de `RUTAS.md`. |
| Error 404 al guardar | El registro lo borró otro: la lista se recarga sola y el aviso lo dice. |
| Error 400 con un texto raro | Un campo obligatorio vacío o un valor fuera de rango: el mensaje lo manda el backend. |
| La pantalla queda en blanco o sale "Esta sección no se pudo mostrar" | Hay un error de JavaScript en tu página: abre la consola con F12 y lee el archivo y la línea. |
| La columna se puede pulsar pero no reordena | Falta `valor()` en esa columna: el registro no tiene el campo que se pinta. |
| El estado no cambia a "Inactivo" | Revisa que el `<select>` de estado esté dentro del formulario y con su `id`. |

No toques sin avisar al grupo: `src/api/cliente.js`, `src/styles/tema.css`, `src/components/*` ni
`src/App.jsx`. Si te falta algo ahí, se pide.
