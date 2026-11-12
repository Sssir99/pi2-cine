import cliente from './cliente'

// Módulo Tipo — /api/tipos (no tiene estado)
export const listarTipos = () => cliente.get('/tipos').then((r) => r.data)
export const obtenerTipo = (id) => cliente.get(`/tipos/${id}`).then((r) => r.data)
export const crearTipo = (datos) => cliente.post('/tipos', datos).then((r) => r.data)
export const actualizarTipo = (id, datos) => cliente.put(`/tipos/${id}`, datos).then((r) => r.data)
export const eliminarTipo = (id) => cliente.delete(`/tipos/${id}`).then((r) => r.data)
