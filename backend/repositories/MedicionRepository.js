const Medicion = require('../models/Medicion');

class MedicionRepository {
  async guardarMedicion(datos) {
    try {
      const medicion = await Medicion.create({
        humedad: datos.humedad,
        temperatura: datos.temperatura,
        peso: datos.peso,
        punto_compra_id: datos.punto_compra_id
      });
      return medicion;
    } catch (error) {
      console.error('Error al guardar medición en repositorio:', error);
      throw error;
    }
  }

  async obtenerHistorial(limite = 50) {
    try {
      const historial = await Medicion.findAll({
        order: [['fecha_registro', 'DESC']],
        limit: limite,
      });
      return historial;
    } catch (error) {
      console.error('Error al obtener historial en repositorio:', error);
      throw error;
    }
  }
}

module.exports = new MedicionRepository();
