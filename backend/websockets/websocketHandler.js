const { WebSocketServer } = require('ws');
const PuntoCompra = require('../models/PuntoCompra');
const MedicionRepository = require('../repositories/MedicionRepository');

class WebSocketHandler {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.init();
  }

  init() {
    this.wss.on('connection', (ws) => {
      console.log('Nuevo cliente conectado vía WebSocket');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Datos recibidos vía WS:', data);

          if (data.tipo === 'medicion') {
            // Buscar si el esp_id está registrado en un Punto de Compra
            let puntoCompraId = null;
            if (data.esp_id) {
              const punto = await PuntoCompra.findOne({ where: { esp_id: data.esp_id } });
              if (punto) puntoCompraId = punto.id;
            }


            let u_fdr = data.humedad;
            let m_neto = data.peso;
            let V = 0.0005;

            let rho = m_neto / V;

            let humedad_compensada = -0.4692 + (1.0971 * u_fdr) - (0.000323 * rho);
            if (humedad_compensada < 0) humedad_compensada = 0;
            if (humedad_compensada > 100) humedad_compensada = 100;

            const medicionGuardada = await MedicionRepository.guardarMedicion({
              humedad: parseFloat(humedad_compensada.toFixed(2)),
              temperatura: data.temperatura,
              peso: data.peso,
              punto_compra_id: puntoCompraId
            });

            // Reenviar a todos los clientes web conectados
            const broadcastData = JSON.stringify({
              tipo: 'actualizacion',
              ...medicionGuardada.toJSON(), // Convertir modelo Sequelize a objeto plano
            });

            this.wss.clients.forEach((client) => {
              if (client.readyState === 1) { // OPEN
                client.send(broadcastData);
              }
            });
          }
        } catch (err) {
          console.error('Error procesando mensaje de WS:', err);
        }
      });

      ws.on('close', () => {
        console.log('Cliente WS desconectado');
      });
    });
  }
}

module.exports = WebSocketHandler;
