FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Sequelize uses .sequelizerc, let's keep it if needed, but it's ignored by dockerignore.
# We will use the config/env vars in docker-compose.

EXPOSE 3001

CMD ["npm", "start"]
