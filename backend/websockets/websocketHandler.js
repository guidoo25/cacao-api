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
      console.log('Cliente Web conectado vía WebSocket (Dashboard)');

      ws.on('close', () => {
        console.log('Cliente Web WS desconectado');
      });
    });
  }

  broadcast(dataObj) {
    const broadcastData = JSON.stringify(dataObj);
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(broadcastData);
      }
    });
  }
}

module.exports = WebSocketHandler;
