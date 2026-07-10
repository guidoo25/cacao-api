const express = require('express');
const router = express.Router();
const PuntoCompraController = require('../controllers/PuntoCompraController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, PuntoCompraController.getAll);
router.get('/:id/stats', verifyToken, PuntoCompraController.getStats);
router.post('/', verifyToken, isAdmin, PuntoCompraController.create);
router.put('/:id', verifyToken, isAdmin, PuntoCompraController.update);
router.delete('/:id', verifyToken, isAdmin, PuntoCompraController.delete);

module.exports = router;
