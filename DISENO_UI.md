# Estándar de UI del frontend — PI2 Cine

Este archivo es el contrato visual y de código del frontend, igual que RUTAS.md lo es de la API.
Regla de oro: si algo no está aquí, se pregunta antes de inventarlo. Nada de estilos propios por módulo.

## 0. Antes de la primera línea

El backend debe estar corriendo en http://localhost:3000 y con CORS habilitado. Sin eso el frontend
no funciona y el error parece del frontend cuando es del backend. El backend se levanta con
`cd backend && npm start` (o `npm run dev`).

## 1. Stack

- React con JavaScript (sin TypeScript).
- Bootstrap 5.3 solo CSS, importado una vez en main. Sin react-bootstrap.
- Axios para las peticiones HTTP.
- React Router 6 para la navegación (una ruta por módulo).
- SweetAlert2 para avisos y confirmaciones.
- Bundler: Vite con `@vitejs/plugin-react` (decidido en nov 2026: CRA está abandonado y falla con Node 24).
  La URL de la API se lee de `import.meta.env.VITE_API_URL` (`.env` local, `.env.example` en el repo).

CSS propio solo en `src/styles/tema.css`: tokens y un puñado de clases compartidas.
Prohibido `style={{...}}` salvo valores dinámicos (por ejemplo el ancho de una barra).

## 2. Tipografía

- Fuente: la del sistema (`-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
  No se cargan fuentes de Google: si en la grabación falla la red, el diseño no puede cambiar.
- Base 15px, altura de línea 1.5.
- Título de página 22–26px, peso 650.
- Título de modal 17–18px, peso 650.
- Etiqueta de formulario 12.5–13px, color tenue.
- Tabla 14px; encabezado de tabla 11.5px, mayúsculas, espaciado .6px.
- Texto de ayuda y pie 12px. Nada por debajo de 12px: los 11.5px los marcó el detector
  como tiny-text.
- Seriales, ids y números: `ui-monospace, Consolas, monospace`.

## 3. Colores

Tema A (oscuro, elegido para todo el frontend). Todos los colores viven como variables en
`tema.css`; ningún componente escribe un hex directo.

| Token           | Valor   | Uso |
|-----------------|---------|-----|
| --fondo         | #0f1115 | fondo de página y de los inputs |
| --superficie    | #171b22 | cajas, sidebar, modal |
| --superficie-2  | #1d222b | hover de fila, chips, botones de acción en reposo |
| --borde         | #262c38 | todos los bordes de 1px |
| --texto         | #e6e9ef | texto principal (15.5:1) |
| --texto-suave   | #98a2b3 | texto secundario y encabezados de tabla (6.7:1) |
| --texto-ayuda   | #8b95a7 | ayudas, placeholders y notas (5.7:1) |
| --acento        | #f5b942 | acción primaria y foco (texto #15181e encima = 10:1) |
| --peligro       | #ef5a5a | eliminar |
| --ok            | #3ecf8e | punto de "API en línea" |

Reglas duras de color:
- Ningún texto por debajo de 4.5:1. El gris viejo (#6b7486) fallaba con 3.7:1 y no se usa más.
- Verde = activo, gris = inactivo; el estado nunca se comunica solo con color, siempre lleva texto.
- Chip de tipo: azul (#9fb4ff) para película, violeta (#c3a6ff) para serie. Chip de género en gris
  neutro, nunca un color por género.

## 4. Forma y espacio

- Escala de espaciado en múltiplos de 4: 4, 8, 12, 16, 20, 24, 32.
- Radios: 8px en controles, 9–10px en botones, 12–14px en cajas, 999px en chips.
- Bordes de 1px con `--borde`. Una sola sombra (`0 1px 2px rgba(16,24,40,.04)`) y solo en la caja
  que contiene la tabla.
- Sin gradientes, salvo el recuadro de portada cuando no hay imagen.

## 5. Estructura de archivos

```
frontend/src/
  api/
    cliente.js        axios + baseURL + normalización de errores
    generos.js        listar, obtener, crear, actualizar, eliminar
    directores.js
    productoras.js
    tipos.js
    media.js
  components/
    Layout.jsx
    ErrorBoundary.jsx   límite de errores: una pantalla rota no deja la app en blanco
    EncabezadoPagina.jsx
    TablaListado.jsx
    BadgeEstado.jsx
    Portada.jsx
    ModalFormulario.jsx
    Iconos.jsx        iconos SVG en línea (menú y acciones)
    avisos.js         envoltorio de SweetAlert2 (toast de éxito, error, confirmar borrado)
  pages/
    GenerosPage.jsx
    DirectoresPage.jsx
    ProductorasPage.jsx
    TiposPage.jsx
    MediaPage.jsx
    PlantillaPage.ejemplo.jsx   molde CRUD completo, NO está en las rutas (ver GUIA_MODULO.md)
  styles/tema.css
  utils/formato.js      formatearFecha, iniciales, textoEstado (nada de fechas a mano por módulo)
  App.jsx             router y Layout
  main.jsx
```

Nombres: componentes en PascalCase; archivos de `api/` en plural y minúscula; una página por módulo
y ningún módulo comparte página con otro.

## 6. Componentes compartidos (props fijas)

- `Layout` — marca, navegación de los 6 módulos con icono, indicador de la API al pie. En móvil el menú
  es un cajón que se abre con el botón de la barra superior y se cierra con la X de dentro, el velo o ESC.
- `EncabezadoPagina { titulo, subtitulo, accion }` — título en plural, contador y botón primario.
- `TablaListado` — resuelve sola los estados (cargando, error, vacío, sin resultados) para que ningún
  módulo los reinvente. Props: `{ caption, columnas, filas, total, filtros, cargando, error, onReintentar,
  vacio, sinResultados, nombreRegistro, onEditar, onEliminar }`.
  - `columnas`: `[{ clave, encabezado, render(fila), alineacion }]`; si el `<th>` va vacío, `encabezadoOculto`
    con el texto para lector de pantalla. `alineacion: 'derecha'` para cifras, años y fechas.
  - Mientras carga dibuja un esqueleto con la forma de la tabla (`.esqueleto-fila`), no un spinner suelto.
  - Las acciones de fila son dos botones cuadrados de 30 px con icono (`IconoEditar` / `IconoBorrar`) y
    `aria-label` con el nombre del registro; no llevan texto visible.
  - `total`: registros sin filtrar. Es lo que distingue "no hay nada" (estado vacío con botón de crear) de
    "los filtros no dejan pasar nada" (aviso sin botón). Sin `total` se asume `filas.length`.
  - `filtros`: nodo opcional que se dibuja sobre la tabla dentro de la misma caja. Solo Media lo usa.
  - `vacio`: `{ titulo, texto, textoAccion, onAccion }`. `sinResultados`: `{ titulo, texto }`.
  - `nombreRegistro(fila)`: nombre para los `aria-label` de Editar/Eliminar.
- `BadgeEstado { estado }` — activo / inactivo.
- `Portada { url, titulo }` — imagen si hay url; si no, recuadro con las iniciales del título
  (una palabra usa sus tres primeras letras: INT; dos o más, la inicial de cada una: BB, DP).
- `ModalFormulario { abierto, titulo, onCerrar, onGuardar, guardando, children }`. El `<form>` ES el
  `.modal-content` (si se anida dentro, se rompe el flex de Bootstrap y el pie se sale de la pantalla a
  1366x768) y el diálogo lleva `modal-dialog-scrollable` como red de seguridad.
- `Iconos.jsx` — iconos SVG en línea (16 px, trazo 1.7, `currentColor`) para el menú y las acciones.
  Sin librería de iconos: el proyecto usa Bootstrap solo por CSS.
- `avisos.js` — **el único mecanismo de avisos y confirmaciones es SweetAlert2**. Expone
  `exito(msg)`, `error(msg)` y `confirmarBorrado(nombre)` que devuelve true/false. No se usa el modal
  de Bootstrap para confirmar: dos mecanismos distintos para lo mismo confunden al usuario y al que
  copia el patrón.
- `ErrorBoundary` — envuelve las rutas en `App.jsx` con `key={pathname}`. Si una pantalla lanza un
  error, se ve el mensaje y la navegación sigue viva; al cambiar de módulo se reinicia solo.
- `Portada` cae a las iniciales si la imagen no carga (url rota o sin red), no deja un hueco vacío.

## 7. Anatomía de una pantalla CRUD (mismo orden siempre)

1. Encabezado: título en plural, contador ("5 registros") y botón "+ Nuevo …".
2. Filtros: solo Media (búsqueda por título o serial, género, tipo). Los módulos simples no llevan.
3. Tabla.
4. Estados: cargando (spinner ámbar centrado y "Cargando …"), vacío (título, una frase y el botón
   de crear) y error (mensaje + botón reintentar). Los tres viven en el mismo contenedor de la tabla
   y se controlan con un estado (`cargando | error | vacio | datos`), no con un `if` repetido por
   módulo. Están dibujados en el mockup para copiarlos tal cual.
5. Formulario en modal, no en página aparte.

Columnas por módulo:

- Géneros: nombre + descripción (misma celda, dos líneas), estado, fecha de actualización, acciones.
- Directores: nombres, títulos (cuántos lo usan), estado, fecha de actualización, acciones.
- Productoras: nombre + slogan, descripción, títulos, estado, fecha de actualización, acciones.
- Tipos: nombre + descripción (dos líneas), fecha de actualización, acciones.
- Media: portada, título + serial, año, género, tipo, director, productora, acciones.
  (Director y productora van en la tabla: son FK obligatorias y sin ellas no se puede revisar el
  registro sin abrir el formulario.)

La celda de dos líneas es la del molde: el nombre manda (`.titulo-fila`) y el dato de apoyo va
debajo en gris (`.detalle-fila`). La columna "Títulos" cuenta las Media que usan ese registro; es lo
que explica por qué un director o una productora en uso no se puede borrar (la API responde 409).

Media no tiene estado: no se le pone columna de estado ni campo en el formulario.

## 8. Formularios

- Un solo componente de modal sirve para crear y editar; cambia el título y los valores iniciales.
- Campos obligatorios marcados con asterisco.
- Texto de ayuda solo donde hay una regla real: url que empiece por http/https, año entre 1888 y
  2100, valores únicos (nombre, serial).
- Al editar, los selects incluyen el valor actual aunque esté inactivo; si no, el PUT cambiaría la
  relación sin que nadie lo pida.
- Al crear, los selects de género, director y productora muestran solo los activos; el de tipos,
  todos.
- Mientras envía: botón deshabilitado con texto "Guardando…".

## 9. Mensajes y errores (mapeo de la API)

- 200/201 → aviso de éxito como toast abajo a la derecha ("Género creado", "Cambios guardados"), se va solo
  en 2,2 s y no bloquea nada.
- 400 → mostrar el texto que manda el backend, que viene en `{ error }`.
- 404 → "Ese registro ya no existe" y recargar la lista.
- 409 → el texto del backend: valor único repetido ("Ya existe un registro…") o registro en uso que
  no se puede borrar ("No se puede eliminar el género: lo usan 2 títulos del catálogo").
- 500 o red caída → "No se pudo conectar con la API. Verifica que el backend esté corriendo en
  localhost:3000".
- DELETE responde `{ mensaje }`; GET, POST y PUT devuelven el documento.
- Borrar siempre pide confirmación con SweetAlert2, con el nombre del registro en el título
  ("¿Eliminar «Interestelar»?"), texto "Esta acción no se puede deshacer", botón rojo "Sí, eliminar"
  y "Cancelar" como opción por defecto. Después, un aviso de éxito que se cierra solo.
- SweetAlert2 se configura con el tema: `background: '#171b22'`, `color: '#e6e9ef'`, `cancelButtonColor:
  '#262c38'`. El botón de confirmar va en rojo `#ef5a5a` cuando borra y en ámbar `#f5b942` cuando solo
  informa ("Entendido"). En los dos casos lleva la clase `swal-confirmar` de `tema.css`, porque el texto
  blanco por defecto sobre ámbar o rojo no se lee (sobre ámbar da 1.9:1).

## 10. Accesibilidad mínima (no negociable)

Lo que la auditoría encontró roto en el mockup y quedó corregido; todo módulo lo replica:

- Cada control con `id` y su `<label for="...">` real. Prohibido el label decorativo.
- Obligatorios con `required` y `aria-required="true"`; el asterisco es `aria-hidden`.
- Texto de ayuda enlazado con `aria-describedby`.
- Botones de fila con nombre propio: `aria-label="Eliminar Interestelar"`, no cinco "Borrar" iguales.
- Tabla con `<caption class="visually-hidden">` y `scope="col"` en cada `<th>`; las celdas de
  encabezado vacías llevan texto para lector de pantalla.
- Modal con `aria-labelledby` apuntando a su título, y el botón de cerrar con `aria-label="Cerrar"`.
- Foco visible propio en todo lo clicable: `:focus-visible { outline: 2px solid var(--acento) }`.
  El outline del navegador es casi invisible sobre fondo oscuro.
- Un solo `h1` por página; los títulos de modal son `h2` (no saltar de h1 a h5).
- Nada de emoji como icono.

## 11. Textos

- Español. Los nombres de campo enviados a la API son los del contrato, sin tildes
  (nombre, nombres, descripcion, estado, slogan, serial, titulo, sinopsis, url, imagenPortada,
  anioEstreno, genero, director, productora, tipo).
- El módulo se llama Media (igual que la ruta /api/media); la entidad es "título". El botón
  dice "+ Nuevo título", no "Nueva película", porque el mismo formulario crea series.
- Botones con verbo: Guardar, Eliminar, Cancelar, Reintentar.
- Fechas en formato dd/mm/aaaa hh:mm, desde `fechaCreacion` y `fechaActualizacion`.
- Nunca mostrar ObjectId crudos: se traducen con las listas. Si la referencia ya no existe,
  mostrar "(eliminado)".
- Estado vacío con frase completa: "Todavía no hay géneros registrados."

## 12. Responsive

- Se graba el video a 1440x900 y debe verse bien a 1280 de ancho, sin scroll horizontal.
- Por debajo de 768px la tabla pasa a tarjetas apiladas y la navegación a un cajón lateral con velo
  (barra superior con el botón de menú, la marca y el punto de la API).
- El modal se ve completo en pantallas de 1366x768 (que es la de muchos portátiles del grupo). Medido en
  el navegador: 688px de alto con el formulario de Media, sin scroll interno.

## 13. Git y trabajo en grupo

- Una rama por módulo: `feat/front-generos`, `feat/front-directores`, `feat/front-productoras`,
  `feat/front-tipos`, `feat/front-media`.
- Un PR por módulo con una captura de la pantalla funcionando y una línea de qué se probó.
- No se toca sin avisar: `api/cliente.js`, `styles/tema.css`, `components/*` y `App.jsx`. Es la base
  común; si falta algo ahí, se pide.
- No se instalan dependencias nuevas sin avisar al grupo.
- La URL de la API va en un `.env` que no se sube; el repo lleva `.env.example` con la variable.

## 14. Checklist de módulo terminado

1. La tabla muestra los registros reales de la API (nada quemado en el código).
2. Crear funciona y el registro aparece sin recargar la página.
3. Editar funciona y se ven los cambios.
4. Eliminar pide confirmación y el registro desaparece.
5. Se ven los tres estados: cargando, vacío y error.
6. Los errores muestran el mensaje correcto (probar un duplicado y un campo vacío).
7. Textos en español, sin colores fuera del tema y sin `console.log` sueltos.

## 15. Lo que NO entra en esta entrega

- Login, registro o cualquier módulo de seguridad.
- Subida de archivos: la portada es una URL.
- Paginación, ordenamiento y filtros en los módulos simples.
- Pruebas automáticas y conmutador de tema claro/oscuro.

## 16. Estado de la base (nov 2026)

Ya está construida y verificada; nadie la reescribe, solo la usa:

- `api/cliente.js` con `baseURL` desde `VITE_API_URL`, timeout de 15 s y normalización de errores a
  `{ status, mensaje }`. `status: 0` = no hubo respuesta (backend apagado): ese caso lo mapea a
  "No se pudo conectar con la API…". 409/404/400 usan el `{ error }` que manda el backend.
- Los 5 archivos de `api/` con las cinco operaciones de su módulo.
- `utils/formato.js`: `formatearFecha` (dd/mm/aaaa hh:mm), `iniciales` y `textoEstado`.
- Los 7 componentes compartidos y `Layout` con el indicador de la API (revisa cada 30 s).
- `App.jsx` con las 6 rutas: `/` abre el Resumen y las otras cinco son los módulos.
- `pages/ResumenPage.jsx` es la pantalla de entrada: cuenta las cinco colecciones con las listas que ya
  existen (sin endpoints nuevos), muestra los últimos títulos agregados y el reparto por género en barras.
  Cada tarjeta de cifra enlaza a su módulo.
- `pages/MediaPage.jsx` completa, como plantilla de referencia: tabla con portada, título + serial, año,
  género, tipo, director y productora traducidos desde las otras 4 listas ("(eliminado)" si falta la
  referencia), filtros por texto/género/tipo, y el modal con los 4 selects (activos al crear; el actual se
  incluye aunque esté inactivo al editar).
- `pages/*Page.jsx` de los otros 4 módulos ya están construidos (los hizo cada integrante en la entrega 2)
  y usan el mismo molde que `MediaPage.jsx`.
- `PlantillaPage.ejemplo.jsx` es una pantalla CRUD completa y funcionando (~250 líneas comentadas) que no
  está conectada a ninguna ruta. Verificada en el navegador contra la API antes de publicarla: lista,
  crear, editar (con el cambio a inactivo) y borrar con confirmación.
- `scripts/humo.mjs` (`npm run humo`) recorre los 5 módulos con un ciclo crear/actualizar/borrar, incluido
  el 409 de Media, y limpia lo que crea. Verificado: 22 pasos en verde contra la API real.
- `ErrorBoundary` probado con una pantalla que lanza un error: sale el mensaje, la navegación sigue viva y
  al cambiar de módulo se reinicia. `Portada` con url rota cae a las iniciales.
