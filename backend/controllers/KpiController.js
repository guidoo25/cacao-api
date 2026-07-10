const Medicion = require('../models/Medicion');
const { Op } = require('sequelize');
const sequelize = require('../database/connection');

const KpiController = {
  async getDashboardKpis(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 0. Última medición global
      const ultimaMedicion = await Medicion.findOne({
        order: [['fecha_registro', 'DESC']],
        raw: true
      });

      // 1. Totales del día (Peso, Humedad, Temp) y conteo de órdenes
      const promediosDia = await Medicion.findOne({
        where: { fecha_registro: { [Op.gte]: today } },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('temperatura')), 'promedio_temp'],
          [sequelize.fn('AVG', sequelize.col('humedad')), 'promedio_humedad'],
          [sequelize.fn('SUM', sequelize.col('peso')), 'total_peso'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('n_orden'))), 'total_ordenes']
        ],
        raw: true
      });

      // 2. Historial de las últimas 12 horas para los gráficos (Sparklines)
      const hace12Horas = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const historialReciente = await Medicion.findAll({
        where: { fecha_registro: { [Op.gte]: hace12Horas } },
        order: [['fecha_registro', 'ASC']],
        attributes: ['humedad', 'temperatura', 'fecha_registro']
      });

      const historialHumedad = historialReciente.map(m => parseFloat(m.humedad));
      const historialTemperatura = historialReciente.map(m => parseFloat(m.temperatura));

      // Si no hay datos, enviar unos ceros para que no rompa el gráfico
      if (historialHumedad.length === 0) {
        historialHumedad.push(0, 0);
        historialTemperatura.push(0, 0);
      }

      res.status(200).json({
        ultima_medicion: {
          humedad: ultimaMedicion ? parseFloat(ultimaMedicion.humedad) : 0,
          temperatura: ultimaMedicion ? parseFloat(ultimaMedicion.temperatura) : 0,
        },
        hoy: {
          promedio_temperatura: promediosDia.promedio_temp ? parseFloat(promediosDia.promedio_temp) : 0,
          promedio_humedad: promediosDia.promedio_humedad ? parseFloat(promediosDia.promedio_humedad) : 0,
          total_peso: promediosDia.total_peso ? parseFloat(promediosDia.total_peso) : 0,
          total_ordenes: parseInt(promediosDia.total_ordenes) || 0
        },
        graficos: {
          humedad: historialHumedad,
          temperatura: historialTemperatura
        }
      });
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      res.status(500).json({ error: 'Error al obtener KPIs' });
    }
  }
};

module.exports = KpiController;
