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

          let humedad_final = data.humedad;

          const medicionGuardada = await MedicionRepository.guardarMedicion({
            humedad: parseFloat(humedad_final),
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
