const express = require('express');
const validarId = require('../middleware/validarId');
const productoraController = require('../controllers/productoraController');

const router = express.Router();

router.get('/', productoraController.listar);
router.get('/:id', validarId, productoraController.obtener);
router.post('/', productoraController.crear);
router.put('/:id', validarId, productoraController.actualizar);
router.delete('/:id', validarId, productoraController.eliminar);
	
module.exports = router;