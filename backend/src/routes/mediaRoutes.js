// Rutas de Media.
const express = require('express');
const validarId = require('../middleware/validarId');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

router.get('/', mediaController.listar);
router.get('/:id', validarId, mediaController.obtener);
router.post('/', mediaController.crear);
router.put('/:id', validarId, mediaController.actualizar);
router.delete('/:id', validarId, mediaController.eliminar);

module.exports = router;
