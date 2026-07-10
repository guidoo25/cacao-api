const express = require('express');
const router = express.Router();
const KpiController = require('../controllers/KpiController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, KpiController.getDashboardKpis);

module.exports = router;
