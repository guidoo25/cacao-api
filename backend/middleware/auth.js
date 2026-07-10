const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  // Se espera token en formato "Bearer <token>"
  const tokenParts = token.split(' ');
  const tokenString = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

  jwt.verify(tokenString, process.env.JWT_SECRET || 'secret_key_cacao', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized!' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Require Admin Role!' });
  }
  next();
};

const isDigitador = (req, res, next) => {
  if (req.userRole !== 'DIGITADOR') {
    return res.status(403).json({ error: 'Require Digitador Role!' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDigitador
};
