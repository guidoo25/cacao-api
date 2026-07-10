const express = require('express');
const MedicionController = require('../controllers/MedicionController');

const router = express.Router();

router.get('/historial', MedicionController.obtenerHistorial);
router.put('/:id/orden', MedicionController.actualizarOrden);

module.exports = router;
