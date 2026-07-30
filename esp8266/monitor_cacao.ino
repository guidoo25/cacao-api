#include <SoftwareSerial.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <HX711.h>

// Librerías de WiFi y MQTT
#include <ESP8266WiFi.h>
#include <WiFiManager.h>
#include <PubSubClient.h>

// ---------------- PINES DEL HX711 ----------------
#define LOADCELL_DOUT_PIN D3
#define LOADCELL_SCK_PIN D4
HX711 scale;

#define ESP_ID "PUNTO-E8271F" 

// ---------------- PINES DEL MAX485 ----------------
#define RX_PIN D5    
#define TX_PIN D6    
#define RE_DE_PIN D7 

// ---------------- PANTALLA OLED -------------------
#define ANCHO_PANTALLA 128
#define ALTO_PANTALLA 64
#define OLED_RESET -1 

SoftwareSerial modbus(RX_PIN, TX_PIN);
Adafruit_SSD1306 display(ANCHO_PANTALLA, ALTO_PANTALLA, &Wire, OLED_RESET);

// Cliente WiFi y MQTT
WiFiClient espClient;
PubSubClient mqttClient(espClient);

const char* mqtt_server = "192.168.100.126"; // IP del servidor Node.js/Mosquitto
const int mqtt_port = 1883;

byte requestFrame[] = {0x01, 0x03, 0x00, 0x00, 0x00, 0x02, 0xC4, 0x0B}; 
byte responseBuffer[11]; // Arreglo para guardar los bytes que llegan

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000; // Enviar cada 5 segundos al servidor

void reconnectMQTT() {
  // Loop until we're reconnected
  while (!mqttClient.connected()) {
    Serial.print("Intentando conexión MQTT...");
    // Attempt to connect
    if (mqttClient.connect(ESP_ID)) {
      Serial.println("conectado");
    } else {
      Serial.print("falló, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" reintentando en 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(RE_DE_PIN, OUTPUT);
  digitalWrite(RE_DE_PIN, LOW); 
  modbus.begin(4800); 

  // Inicializar OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Fallo OLED");
    for(;;); 
  }
  
  // Inicializar balanza HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(2280.f); // Factor de calibración (AJUSTAR ESTO)
  scale.tare(); // Poner a cero al iniciar
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println(" PROYECTO CACAO ");
  display.println(" Configurando WiFi...");
  display.display();

  // WiFiManager - Portal Cautivo
  WiFiManager wifiManager;
  wifiManager.setConfigPortalTimeout(180);

  // Si no logra conectarse, crea el punto de acceso "CacaoAP"
  if (!wifiManager.autoConnect("CacaoAP", "12345678")) {
    Serial.println("Fallo al conectar o se acabó el tiempo del portal AP");
    ESP.restart();
    delay(1000);
  }

  Serial.println("Conectado a la red WiFi!");
  
  display.clearDisplay();
  display.setCursor(0, 20);
  display.println("WiFi Conectado!");
  display.print("IP: "); display.println(WiFi.localIP());
  display.display();
  delay(2000);

  // Inicializar MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop(); // Mantener viva la conexión MQTT
  
  // 1. Enviar petición Modbus
  digitalWrite(RE_DE_PIN, HIGH); 
  delay(10); 
  modbus.write(requestFrame, sizeof(requestFrame));
  modbus.flush(); 
  digitalWrite(RE_DE_PIN, LOW); 
  
  delay(200); 
  
  // 2. Leer respuesta
  int byteCount = 0;
  while (modbus.available() && byteCount < 11) {
    responseBuffer[byteCount] = modbus.read();
    byteCount++;
  }
  
  // 3. Procesar y Mostrar Datos
  display.clearDisplay();
  
  if (byteCount >= 7) {
    int humedadRaw = (responseBuffer[3] << 8) | responseBuffer[4];
    float u_fdr = humedadRaw / 10.0;

    // Unir los dos bytes de Temperatura (Posiciones 5 y 6)
    int tempRaw = (responseBuffer[5] << 8) | responseBuffer[6];
    float tempReal = tempRaw / 10.0;

    // Leer Balanza HX711
    float peso = scale.get_units(5); // Promedio de 5 lecturas
    if (peso < 0) peso = 0; // Evitar valores negativos por ruido

    float V = 0.0005;
    float rho = peso / V;
    float humedad_compensada = -0.4692 + (1.0971 * u_fdr) - (0.000323 * rho);
    
    if (humedad_compensada < 0) humedad_compensada = 0;
    if (humedad_compensada > 100) humedad_compensada = 100;

    // Dibujar en OLED
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("MONITOR DE CACAO");
    display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
    
    // Mostramos Humedad Compensada, Temperatura y Peso
    display.setTextSize(2);
    display.setCursor(0, 14);
    display.print("H:");
    display.print(humedad_compensada, 1);
    display.println("%");

    display.setCursor(0, 31);
    display.print("T:");
    display.print(tempReal, 1);
    display.println("C");

    display.setCursor(0, 48);
    display.print("P:");
    display.print(peso, 2);
    display.println("kg");

    // Enviar por MQTT si ha pasado el intervalo
    if (millis() - lastSendTime > SEND_INTERVAL) {
      String json = "{\"tipo\":\"medicion\",\"esp_id\":\"";
      json += ESP_ID;
      json += "\",\"humedad\":";
      json += String(humedad_compensada, 1);
      json += ",\"temperatura\":";
      json += String(tempReal, 1);
      json += ",\"peso\":";
      json += String(peso, 2);
      json += "}";
      
      mqttClient.publish("cacao/recepcion", json.c_str());
      lastSendTime = millis();
      Serial.println("Dato publicado MQTT: " + json);
    }
  } else {
    display.setTextSize(1);
    display.setCursor(0, 20);
    display.println("Leyendo sensores...");
  }
  
  display.display(); 
  
  // Usamos delay en el loop que interfiere un poco con el socket si es muy alto
  // 1000 a 2000 es funcional si no recibimos grandes paquetes.
  delay(1800); 
}
