'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear tabla usuarios
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. Crear tabla puntos_compra
    await queryInterface.createTable('puntos_compra', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      esp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 3. Crear tabla mediciones
    await queryInterface.createTable('mediciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      humedad: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      temperatura: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      peso: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true
      },
      fecha_registro: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      punto_compra_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'puntos_compra',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      n_orden: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mediciones');
    await queryInterface.dropTable('puntos_compra');
    await queryInterface.dropTable('usuarios');
  }
};
