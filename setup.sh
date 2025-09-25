#!/bin/bash

# Script de instalación rápida para Dashboard Financiero BMC
echo "🚀 Iniciando instalación del Dashboard Financiero BMC..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ y ejecuta este script nuevamente."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm y ejecuta este script nuevamente."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias del proyecto raíz
echo "📦 Instalando dependencias del proyecto raíz..."
npm install

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p uploads logs temp

# Copiar archivo de configuración de entorno
if [ ! -f .env.local ]; then
    echo "⚙️ Copiando archivo de configuración de entorno..."
    cp .env.example .env.local
    echo "✅ Archivo .env.local creado. Por favor edítalo con tus configuraciones."
else
    echo "⚠️ Archivo .env.local ya existe. Saltando copia."
fi

# Instalar dependencias del servidor
echo "📦 Instalando dependencias del servidor..."
cd server
npm install
cd ..

# Verificar Docker (opcional)
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker detectado. Puedes usar 'docker-compose up' para desarrollo."
else
    echo "⚠️ Docker no detectado. Puedes ejecutar el proyecto sin Docker."
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env.local con tus configuraciones"
echo "2. Ejecuta 'npm run dev' para desarrollo local"
echo "3. O ejecuta 'docker-compose up' si tienes Docker"
echo ""
echo "📊 URLs importantes:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo "- Health Check: http://localhost:5000/health"
echo ""
echo "📚 Documentación:"
echo "- README.md: Documentación principal"
echo "- docs/ANALYSIS.md: Análisis de requisitos"
echo "- GPT_INTEGRATION_GUIDE.md: Guía para GPT"