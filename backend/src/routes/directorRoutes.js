const express = require('express');
const validarId = require('../middleware/validarId');
const directorController = require('../controllers/directorController');

const router = express.Router();

router.get('/', directorController.listar);
router.get('/:id', validarId, directorController.obtener);
router.post('/', directorController.crear);
router.put('/:id', validarId, directorController.actualizar);
router.delete('/:id', validarId, directorController.eliminar);
	
module.exports = router;