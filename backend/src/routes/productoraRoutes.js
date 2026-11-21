const express = require('express');
const validarId = require('../middleware/validarId');
const exigirCampos = require('../middleware/exigirCampos');
const productoraController = require('../controllers/productoraController');

const router = express.Router();

router.get('/', productoraController.listar);
router.get('/:id', validarId, productoraController.obtener);
router.post('/', productoraController.crear);
router.put('/:id', validarId, exigirCampos(['nombre']), productoraController.actualizar);
router.delete('/:id', validarId, productoraController.eliminar);

module.exports = router;
