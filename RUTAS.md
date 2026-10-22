# Contrato de rutas — API películas y series (PI2)

Base URL: http://localhost:3000
Todos los endpoints responden JSON.
`:id` = ObjectId de MongoDB (24 caracteres hex).

## Convenciones

- CRUD completo en las 5 entidades (GET, POST, PUT, DELETE).
- `fechaCreacion` y `fechaActualizacion` las pone el sistema: NO se envían ni se aceptan en el body del POST/PUT.
- Media: al crear o actualizar, el backend debe validar que `genero`, `director` y `productora` existan y tengan estado `activo`, y que `tipo` exista.

## Géneros — /api/generos

| Método | Ruta             | Body (POST/PUT)                         |
|--------|------------------|-----------------------------------------|
| GET    | /api/generos     | —                                       |
| GET    | /api/generos/:id | —                                       |
| POST   | /api/generos     | { nombre, estado?, descripcion? }       |
| PUT    | /api/generos/:id | { nombre, estado, descripcion }         |
| DELETE | /api/generos/:id | —                                       |

## Directores — /api/directores

| Método | Ruta                | Body (POST/PUT)          |
|--------|---------------------|--------------------------|
| GET    | /api/directores     | —                        |
| GET    | /api/directores/:id | —                        |
| POST   | /api/directores     | { nombres, estado? }     |
| PUT    | /api/directores/:id | { nombres, estado }      |
| DELETE | /api/directores/:id | —                        |

## Productoras — /api/productoras

| Método | Ruta                 | Body (POST/PUT)                            |
|--------|----------------------|--------------------------------------------|
| GET    | /api/productoras     | —                                          |
| GET    | /api/productoras/:id | —                                          |
| POST   | /api/productoras     | { nombre, estado?, slogan?, descripcion? } |
| PUT    | /api/productoras/:id | { nombre, estado, slogan, descripcion }    |
| DELETE | /api/productoras/:id | —                                          |

## Tipos — /api/tipos

| Método | Ruta            | Body (POST/PUT)              |
|--------|-----------------|------------------------------|
| GET    | /api/tipos      | —                            |
| GET    | /api/tipos/:id  | —                            |
| POST   | /api/tipos      | { nombre, descripcion? }     |
| PUT    | /api/tipos/:id  | { nombre, descripcion }      |
| DELETE | /api/tipos/:id  | —                            |

## Media — /api/media

| Método | Ruta            | Body (POST/PUT)                                                                                       |
|--------|-----------------|-------------------------------------------------------------------------------------------------------|
| GET    | /api/media      | —                                                                                                     |
| GET    | /api/media/:id  | —                                                                                                     |
| POST   | /api/media      | { serial, titulo, url, genero, director, productora, tipo, sinopsis?, imagenPortada?, anioEstreno? } |
| PUT    | /api/media/:id  | { serial, titulo, url, genero, director, productora, tipo, sinopsis, imagenPortada, anioEstreno }     |
| DELETE | /api/media/:id  | —                                                                                                     |

## Códigos de respuesta esperados

- 200: OK (GET, PUT)
- 201: creado (POST)
- 400: body inválido, validación fallida o `:id` sin formato de ObjectId
- 404: no existe (GET/:id, PUT/:id, DELETE/:id con id inexistente)
- 409: conflicto — valor único ya existente (nombre, serial, url)
- 500: error del servidor
