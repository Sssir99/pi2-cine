const express = require('express');
const validarId = require('../middleware/validarId');
const exigirCampos = require('../middleware/exigirCampos');
const tipoController = require('../controllers/tipoController');

const router = express.Router();

router.get('/', tipoController.listar);
router.get('/:id', validarId, tipoController.obtener);
router.post('/', tipoController.crear);
router.put('/:id', validarId, exigirCampos(['nombre']), tipoController.actualizar);
router.delete('/:id', validarId, tipoController.eliminar);

module.exports = router;