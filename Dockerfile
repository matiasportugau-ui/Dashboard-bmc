# Multi-stage build para optimización
FROM node:18-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci --only=production

# Etapa de producción
FROM node:18-alpine AS production

# Instalar PM2 globalmente para el manejo de procesos
RUN npm install -g pm2

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dashboard -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias desde el builder
COPY --from=builder --chown=dashboard:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=dashboard:nodejs . .

# Crear directorios necesarios
RUN mkdir -p uploads logs temp && chown -R dashboard:nodejs uploads logs temp

# Cambiar a usuario no-root
USER dashboard

# Exponer puerto
EXPOSE 5000

# Configuración de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Comando de inicio
CMD ["pm2-runtime", "server/dist/index.js"]

# Etapa de desarrollo
FROM node:18-alpine AS development

# Instalar herramientas de desarrollo
RUN apk add --no-cache git curl

# Establecer directorio de trabajo
WORKDIR /app

# Instalar nodemon globalmente
RUN npm install -g nodemon

# Crear usuario de desarrollo
RUN addgroup -g 1001 -S nodejs
RUN adduser -S dashboard -u 1001

# Copiar código fuente
COPY --chown=dashboard:nodejs . .

# Instalar dependencias
RUN npm install

# Crear directorios necesarios
RUN mkdir -p uploads logs temp && chown -R dashboard:nodejs uploads logs temp

# Cambiar a usuario no-root
USER dashboard

# Exponer puerto
EXPOSE 5000 3000 9229

# Comando de desarrollo
CMD ["nodemon", "--inspect=0.0.0.0:9229", "server/src/index.js"]