// Rutas de Género — PLANTILLA DE REFERENCIA.
// Cada módulo copia este archivo y cambia la ruta base y el controller.
const express = require('express');
const validarId = require('../middleware/validarId');
const generoController = require('../controllers/generoController');

const router = express.Router();

router.get('/', generoController.listar);
router.get('/:id', validarId, generoController.obtener);
router.post('/', generoController.crear);
router.put('/:id', validarId, generoController.actualizar);
router.delete('/:id', validarId, generoController.eliminar);

module.exports = router;
