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
- Bundler: pendiente de decidir con el tutor (Vite o create-react-app). No cambia nada de lo que sigue.

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
    EncabezadoPagina.jsx
    TablaListado.jsx
    BadgeEstado.jsx
    Portada.jsx
    ModalFormulario.jsx
    avisos.js         envoltorio de SweetAlert2 (éxito, error, confirmar borrado)
  pages/
    GenerosPage.jsx
    DirectoresPage.jsx
    ProductorasPage.jsx
    TiposPage.jsx
    MediaPage.jsx
  styles/tema.css
  App.jsx             router y Layout
  main.jsx
```

Nombres: componentes en PascalCase; archivos de `api/` en plural y minúscula; una página por módulo
y ningún módulo comparte página con otro.

## 6. Componentes compartidos (props fijas)

- `Layout` — marca, navegación de los 5 módulos, indicador de la API al pie.
- `EncabezadoPagina { titulo, subtitulo, accion }` — título en plural, contador y botón primario.
- `TablaListado { columnas, filas, cargando, error, vacio, onEditar, onEliminar }` — resuelve sola
  los tres estados (cargando, vacío, error) para que ningún módulo los reinvente.
- `BadgeEstado { estado }` — activo / inactivo.
- `Portada { url, titulo }` — imagen si hay url; si no, recuadro con las iniciales del título.
- `ModalFormulario { abierto, titulo, onCerrar, onGuardar, guardando, children }`.
- `ModalConfirmar { abierto, titulo, texto, onConfirmar, onCerrar }` — borrado con el nombre del
  registro dentro del texto, botón peligroso "Sí, eliminar" y cancelar por defecto.
- `avisos.js` — `exito(msg)`, `error(msg)`, `confirmarBorrado(nombre)` que devuelve true/false.

## 7. Anatomía de una pantalla CRUD (mismo orden siempre)

1. Encabezado: título en plural, contador ("5 registros") y botón "+ Nuevo …".
2. Filtros: solo Media (búsqueda por título o serial, género, tipo). Los módulos simples no llevan.
3. Tabla.
4. Estados: cargando (spinner centrado), vacío (mensaje + botón de crear), error (mensaje +
   botón reintentar).
5. Formulario en modal, no en página aparte.

Columnas por módulo:

- Géneros: nombre, descripción, estado, fecha de actualización, acciones.
- Directores: nombres, estado, fecha de actualización, acciones.
- Productoras: nombre, slogan, estado, fecha de actualización, acciones.
- Tipos: nombre, descripción, fecha de actualización, acciones.
- Media: portada, título + serial, año, género, tipo, director, productora, acciones.
  (Director y productora van en la tabla: son FK obligatorias y sin ellas no se puede revisar el
  registro sin abrir el formulario.)

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

- 200/201 → aviso de éxito ("Género creado", "Cambios guardados").
- 400 → mostrar el texto que manda el backend, que viene en `{ error }`.
- 404 → "Ese registro ya no existe" y recargar la lista.
- 409 → "Ya existe un registro con ese nombre / serial / url".
- 500 o red caída → "No se pudo conectar con la API. Verifica que el backend esté corriendo en
  localhost:3000".
- DELETE responde `{ mensaje }`; GET, POST y PUT devuelven el documento.
- Borrar siempre pide confirmación, con el botón peligroso a la derecha ("Sí, eliminar") y cancelar
  como opción por defecto.

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
- Por debajo de 768px la tabla pasa a tarjetas apiladas y la navegación a barra superior.
- El modal se ve completo en pantallas de 1366x768 (que es la de muchos portátiles del grupo).

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
