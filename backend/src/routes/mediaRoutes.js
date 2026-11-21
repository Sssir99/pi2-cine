// Rutas de Media.
const express = require('express');
const validarId = require('../middleware/validarId');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

router.get('/', mediaController.listar);
router.get('/:id', validarId, mediaController.obtener);
router.post('/', mediaController.crear);
// Sin exigirCampos: en Media la existencia del título se comprueba antes de validar el
// cuerpo (404 antes que 400), y validarReferencias ya responde 400 por cada campo faltante.
router.put('/:id', validarId, mediaController.actualizar);
router.delete('/:id', validarId, mediaController.eliminar);

module.exports = router;
