import cliente from './cliente'

// Módulo Productora — /api/productoras
export const listarProductoras = () => cliente.get('/productoras').then((r) => r.data)
export const obtenerProductora = (id) => cliente.get(`/productoras/${id}`).then((r) => r.data)
export const crearProductora = (datos) => cliente.post('/productoras', datos).then((r) => r.data)
export const actualizarProductora = (id, datos) => cliente.put(`/productoras/${id}`, datos).then((r) => r.data)
export const eliminarProductora = (id) => cliente.delete(`/productoras/${id}`).then((r) => r.data)
