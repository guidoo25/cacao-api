const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_cacao';
const JWT_EXPIRES_IN = '24h';

const AuthController = {
  // Crear admin inicial si no hay usuarios en la DB
  async seedAdmin() {
    try {
      const usersCount = await User.count();
      if (usersCount === 0) {
        await User.create({
          username: 'admin',
          password: 'cocoasecret$$', 
          role: 'ADMIN'
        });
        console.log('Usuario ADMIN por defecto creado (admin / cocoasecret$$)');
      }
    } catch (error) {
      console.error('Error al inicializar admin:', error);
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Contraseña inválida' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      res.status(200).json({
        id: user.id,
        username: user.username,
        role: user.role,
        accessToken: token,
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.userId;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const isValidPassword = await user.verifyPassword(oldPassword);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'La contraseña anterior no es correcta' });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = AuthController;
