const express = require('express');
const router = express.Router();
const OrdenController = require('../controllers/OrdenController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, OrdenController.getAll);

module.exports = router;
