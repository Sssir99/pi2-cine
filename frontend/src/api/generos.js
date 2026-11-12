import cliente from './cliente'

// Módulo Género — /api/generos
export const listarGeneros = () => cliente.get('/generos').then((r) => r.data)
export const obtenerGenero = (id) => cliente.get(`/generos/${id}`).then((r) => r.data)
export const crearGenero = (datos) => cliente.post('/generos', datos).then((r) => r.data)
export const actualizarGenero = (id, datos) => cliente.put(`/generos/${id}`, datos).then((r) => r.data)
export const eliminarGenero = (id) => cliente.delete(`/generos/${id}`).then((r) => r.data)
