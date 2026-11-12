import cliente from './cliente'

// Módulo Director — /api/directores
export const listarDirectores = () => cliente.get('/directores').then((r) => r.data)
export const obtenerDirector = (id) => cliente.get(`/directores/${id}`).then((r) => r.data)
export const crearDirector = (datos) => cliente.post('/directores', datos).then((r) => r.data)
export const actualizarDirector = (id, datos) => cliente.put(`/directores/${id}`, datos).then((r) => r.data)
export const eliminarDirector = (id) => cliente.delete(`/directores/${id}`).then((r) => r.data)
