const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', AuthController.login);
router.post('/change-password', verifyToken, AuthController.changePassword);

module.exports = router;
