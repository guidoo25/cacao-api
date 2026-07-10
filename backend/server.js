require('dotenv').config();
const express = require('express');
const http = require('http');
const sequelize = require('./database/connection');

// Definir asociaciones de modelos antes de cargar rutas
const Medicion = require('./models/Medicion');
const PuntoCompra = require('./models/PuntoCompra');
Medicion.belongsTo(PuntoCompra, { foreignKey: 'punto_compra_id', as: 'puntoCompra' });
PuntoCompra.hasMany(Medicion, { foreignKey: 'punto_compra_id', as: 'mediciones' });

const medicionRoutes = require('./routes/medicionRoutes');
const authRoutes = require('./routes/authRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const puntoCompraRoutes = require('./routes/puntoCompraRoutes');
const ordenRoutes = require('./routes/ordenRoutes');
const AuthController = require('./controllers/AuthController');
const WebSocketHandler = require('./websockets/websocketHandler');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Inicializar WebSockets
new WebSocketHandler(server);

app.use(cors());
app.use(express.json());

// Cargar rutas
app.use('/api', medicionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/puntos-compra', puntoCompraRoutes);
app.use('/api/ordenes', ordenRoutes);

const PORT = process.env.PORT || 3000;

// Conectar DB y arrancar servidor
sequelize.authenticate()
  .then(() => {
    console.log('Base de datos conectada correctamente (migraciones manejadas por sequelize-cli).');
    AuthController.seedAdmin();
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
  });
