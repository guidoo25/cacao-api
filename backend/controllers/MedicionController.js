const MedicionRepository = require('../repositories/MedicionRepository');

class MedicionController {
  async obtenerHistorial(req, res) {
    try {
      const historial = await MedicionRepository.obtenerHistorial();
      res.json(historial);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener historial' });
    }
  }

  async actualizarOrden(req, res) {
    try {
      const { id } = req.params;
      const { n_orden } = req.body;
      const Medicion = require('../models/Medicion');
      
      const medicion = await Medicion.findByPk(id);
      if (!medicion) return res.status(404).json({ error: 'Medición no encontrada' });
      
      await medicion.update({ n_orden });
      res.json(medicion);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar orden' });
    }
  }
}

module.exports = new MedicionController();
