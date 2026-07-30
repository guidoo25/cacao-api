# Sistema Cacao IoT - Proyecto de Tesis

Este repositorio contiene la arquitectura completa (Backend, Frontend y Base de Datos) para el monitoreo de temperatura, humedad y peso del Cacao en Baba, utilizando placas ESP8266 y tecnología web moderna.

## Estructura del Proyecto

- `/backend`: API REST construida con Node.js, Express y Sequelize.
- `/frontend`: Dashboard web construido con Next.js, React y Tailwind CSS.
- `docker-compose.yml`: Archivo de orquestación para levantar todos los servicios juntos.

---

## 🚀 Guía Rápida de Despliegue (Docker)

El proyecto está dockerizado para garantizar su portabilidad y fácil ejecución en cualquier entorno.

### Requisitos Previos
Tener instalado [Docker](https://docs.docker.com/get-docker/) y Docker Compose.

### Pasos para ejecutar

1. Clona el repositorio o ubícate en la carpeta raíz (`cacao-iot`):
   ```bash
   cd ruta/a/tu/cacao-iot
   ```

2. Levanta todos los contenedores en segundo plano:
   ```bash
   docker-compose up -d --build
   ```

Este comando se encarga automáticamente de:
- Descargar y configurar una base de datos **PostgreSQL**.
- Construir el **Backend**, ejecutar las *migraciones* de la base de datos y levantarlo en el puerto `3001`.
- Construir el **Frontend** de Next.js y levantarlo en el puerto `3000`.

### Verificación
Una vez que el proceso termine, puedes acceder a:
- **Dashboard Web (Frontend):** [http://localhost:3000](http://localhost:3000)
- **API (Backend):** [http://localhost:3001/api/ordenes](http://localhost:3001/api/ordenes)

---

## 🛑 Detener el Sistema

Si necesitas apagar el sistema y liberar los puertos, ejecuta:
```bash
docker-compose down
```

---

## 🔌 Configuración del Microcontrolador (ESP8266)

El código fuente para el microcontrolador debe leer sensores (DHT22 para temperatura/humedad y HX711 para peso) y enviar la información mediante peticiones HTTP POST. 

Asegúrate de cambiar la IP en el código de tu placa (`serverUrl`) apuntando a la IP de la máquina donde levantaste este contenedor de Docker (ej. `http://192.168.X.X:3001/api/mediciones`).
