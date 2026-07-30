const mqtt = require('mqtt');
const PuntoCompra = require('../models/PuntoCompra');
const MedicionRepository = require('../repositories/MedicionRepository');

class MqttHandler {
  constructor(websocketHandler) {
    this.wsHandler = websocketHandler;
    // Connect to the Mosquitto broker (default port 1883)
    this.client = mqtt.connect('mqtt://mosquitto');
    
    this.client.on('connect', () => {
      console.log('Conectado al broker MQTT (Mosquitto)');
      // Subscribe to the topic where ESP8266 publishes
      this.client.subscribe('cacao/recepcion', (err) => {
        if (!err) {
          console.log('Suscrito al tópico: cacao/recepcion');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      if (topic === 'cacao/recepcion') {
        try {
          const data = JSON.parse(message.toString());
          console.log('Datos recibidos vía MQTT:', data);

          // Find if esp_id is registered
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

          // Broadcast the newly saved data to all WebSocket clients (Frontend)
          this.wsHandler.broadcast({
            tipo: 'actualizacion',
            ...medicionGuardada.toJSON()
          });

        } catch (err) {
          console.error('Error procesando mensaje MQTT:', err);
        }
      }
    });
  }
}

module.exports = MqttHandler;
