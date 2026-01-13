FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    chromium-chromedriver

# Copiar package.json
COPY package*.json ./

# Instalar dependencias de Node
RUN npm ci --only=production && \
    npm install -g nodemon

# Copiar código
COPY . .

# Crear directorios de reports
RUN mkdir -p test-results reports logs

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando de inicio
CMD ["npm", "start"]
