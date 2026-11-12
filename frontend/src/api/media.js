import cliente from './cliente'

// Módulo Media — /api/media
export const listarMedia = () => cliente.get('/media').then((r) => r.data)
export const obtenerMedia = (id) => cliente.get(`/media/${id}`).then((r) => r.data)
export const crearMedia = (datos) => cliente.post('/media', datos).then((r) => r.data)
export const actualizarMedia = (id, datos) => cliente.put(`/media/${id}`, datos).then((r) => r.data)
export const eliminarMedia = (id) => cliente.delete(`/media/${id}`).then((r) => r.data)
