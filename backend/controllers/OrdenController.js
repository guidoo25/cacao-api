const Medicion = require('../models/Medicion');
const PuntoCompra = require('../models/PuntoCompra');
const sequelize = require('../database/connection');

const OrdenController = {
  async getAll(req, res) {
    try {
      // Obtener todas las mediciones que tengan n_orden
      const mediciones = await Medicion.findAll({
        where: { n_orden: { [require('sequelize').Op.not]: null } },
        include: [{ model: PuntoCompra, as: 'puntoCompra' }],
        order: [['fecha_registro', 'DESC']]
      });

      // Agrupar por n_orden
      const ordenesMap = {};
      
      mediciones.forEach(m => {
        const orderId = m.n_orden;
        if (!ordenesMap[orderId]) {
          ordenesMap[orderId] = {
            id: orderId,
            client: 'Cliente Local',
            status: 'completed', // Siempre completado para histórico
            description: `Recepción de lote ${orderId}`,
            sensors: {},
            fecha: m.fecha_registro
          };
        }
        
        // Agregar sensor si no está
        if (m.puntoCompra) {
          const sId = m.puntoCompra.id;
          if (!ordenesMap[orderId].sensors[sId]) {
            ordenesMap[orderId].sensors[sId] = {
              id: sId,
              name: m.puntoCompra.nombre,
              deviceId: m.puntoCompra.esp_id,
              status: 'online', // o calcular
              lastReading: {
                humidity: parseFloat(m.humedad),
                temperature: parseFloat(m.temperatura)
              }
            };
          }
        }
      });

      const result = Object.values(ordenesMap).map(o => ({
        ...o,
        sensors: Object.values(o.sensors)
      })).sort((a, b) => b.fecha - a.fecha);

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener órdenes' });
    }
  }
};

module.exports = OrdenController;
