const PuntoCompra = require('../models/PuntoCompra');

const PuntoCompraController = {
  async getAll(req, res) {
    try {
      const puntos = await PuntoCompra.findAll();
      const Medicion = require('../models/Medicion');
      
      const result = await Promise.all(puntos.map(async (punto) => {
        const lastReading = await Medicion.findOne({
          where: { punto_compra_id: punto.id },
          order: [['fecha_registro', 'DESC']]
        });
        
        return {
          ...punto.toJSON(),
          lastReading: lastReading ? lastReading.toJSON() : null
        };
      }));
      
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener puntos de compra' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, ubicacion, esp_id } = req.body;
      const nuevoPunto = await PuntoCompra.create({ nombre, ubicacion, esp_id });
      res.status(201).json(nuevoPunto);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear punto de compra' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, ubicacion, esp_id } = req.body;
      const [updated] = await PuntoCompra.update({ nombre, ubicacion, esp_id }, {
        where: { id }
      });
      if (updated) {
        const updatedPunto = await PuntoCompra.findByPk(id);
        res.status(200).json(updatedPunto);
      } else {
        res.status(404).json({ error: 'Punto de compra no encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar punto de compra' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await PuntoCompra.destroy({
        where: { id }
      });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Punto de compra no encontrado' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar punto de compra' });
    }
  },

  async getStats(req, res) {
    try {
      const { id } = req.params;
      const { Op } = require('sequelize');
      const Medicion = require('../models/Medicion');

      // Historial últimas 12h
      const hace12Horas = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const historial = await Medicion.findAll({
        where: {
          punto_compra_id: id,
          fecha_registro: { [Op.gte]: hace12Horas }
        },
        order: [['fecha_registro', 'ASC']],
        attributes: ['humedad', 'temperatura', 'fecha_registro']
      });

      const humedad = historial.map(m => parseFloat(m.humedad));
      const temperatura = historial.map(m => parseFloat(m.temperatura));

      if (humedad.length === 0) {
        humedad.push(0, 0);
        temperatura.push(0, 0);
      }

      // Órdenes de los últimos 7 días para el histograma
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 6);
      hace7Dias.setHours(0,0,0,0);

      const ordenes7Dias = await Medicion.findAll({
        where: {
          punto_compra_id: id,
          n_orden: { [Op.not]: null },
          fecha_registro: { [Op.gte]: hace7Dias }
        },
        attributes: ['fecha_registro', 'n_orden']
      });

      const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const histogramaOrdenes = [0, 0, 0, 0, 0, 0, 0];
      
      // Contar órdenes únicas por día
      const ordenesPorDia = {};
      ordenes7Dias.forEach(o => {
        const d = new Date(o.fecha_registro);
        const dayIdx = d.getDay();
        const key = `${dayIdx}-${o.n_orden}`;
        if (!ordenesPorDia[key]) {
          ordenesPorDia[key] = true;
          histogramaOrdenes[dayIdx]++;
        }
      });

      // Últimas 5 órdenes registradas en este sensor
      const ultimasOrdenes = await Medicion.findAll({
        where: {
          punto_compra_id: id,
          n_orden: { [Op.not]: null }
        },
        order: [['fecha_registro', 'DESC']],
        limit: 5,
        attributes: ['n_orden', 'peso', 'fecha_registro']
      });

      res.status(200).json({
        graficos: { humedad, temperatura },
        histograma: diasSemana.map((label, i) => ({ label, value: histogramaOrdenes[i] })),
        ordenes: ultimasOrdenes
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener estadísticas del sensor' });
    }
  }
};

module.exports = PuntoCompraController;
