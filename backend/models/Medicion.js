const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Medicion = sequelize.define('Medicion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  humedad: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  temperatura: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  peso: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true, // true para compatibilidad con registros antiguos
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  punto_compra_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // true para permitir mediciones anónimas/viejas
    references: {
      model: 'puntos_compra',
      key: 'id'
    }
  },
  n_orden: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'mediciones',
  timestamps: false,
});

module.exports = Medicion;
