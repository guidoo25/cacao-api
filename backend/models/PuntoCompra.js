const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const PuntoCompra = sequelize.define('PuntoCompra', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  esp_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Cada ESP8266 se asocia a un solo punto
  }
}, {
  tableName: 'puntos_compra',
  timestamps: true,
});

module.exports = PuntoCompra;
