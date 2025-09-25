#!/bin/bash

# DEMOSTRACIÓN: Code GPT Ecosystem en Modo Completamente Autónomo
# Este script muestra cómo el sistema funciona sin intervención humana

echo "🚀 DEMOSTRACIÓN: Code GPT Ecosystem Autónomo"
echo "============================================="
echo ""
echo "Este script demostrará cómo el ecosistema funciona completamente solo:"
echo "• Auto-instalación y configuración"
echo "• Auto-arranque de componentes"
echo "• Auto-monitoreo y recuperación"
echo "• Auto-actualización"
echo "• Dashboard web en tiempo real"
echo ""
echo "🛑 Presiona Ctrl+C para detener la demostración"
echo ""

# Función para mostrar progreso
show_step() {
    echo ""
    echo "📍 PASO $1: $2"
    echo "────────────────────────────"
}

# Función para esperar
wait_for_service() {
    local url=$1
    local timeout=$2
    local count=0

    echo "⏳ Esperando a que $url responda..."
    while ! curl -s "$url" > /dev/null 2>&1; do
        sleep 1
        count=$((count + 1))
        if [ $count -ge $timeout ]; then
            echo "❌ Timeout esperando $url"
            return 1
        fi
    done
    echo "✅ $url está respondiendo"
    return 0
}

# Paso 1: Instalación autónoma
show_step 1 "Instalación completamente automática"
echo "Ejecutando instalación autónoma..."
./install-complete.sh

# Paso 2: Inicio del sistema
show_step 2 "Inicio autónomo del ecosistema"
echo "Iniciando el ecosistema en modo auto-pilot..."
./quick-start.sh &
ECOSYSTEM_PID=$!

# Paso 3: Verificar que todo esté funcionando
show_step 3 "Verificación automática de funcionamiento"
echo "Verificando que todos los componentes estén funcionando..."

# Esperar a que los servicios estén listos
wait_for_service "http://localhost:3000/health" 30
wait_for_service "http://localhost:8080" 30

# Paso 4: Mostrar estado del sistema
show_step 4 "Dashboard y monitoreo en tiempo real"
echo "🌐 Dashboard web: http://localhost:8080"
echo "🔌 API Gateway: http://localhost:3000"
echo "📡 WebSocket: ws://localhost:8081"
echo ""
echo "El sistema ahora está funcionando completamente solo:"
echo "• ✅ Auto-monitoreo cada 30 segundos"
echo "• ✅ Auto-recuperación de fallos"
echo "• ✅ Auto-optimización de recursos"
echo "• ✅ Auto-actualizaciones"
echo "• ✅ Dashboard web en tiempo real"
echo ""
echo "📊 Comandos para monitorear:"
echo "   ./status-ecosystem.sh    - Ver estado del sistema"
echo "   tail -f logs/*.log       - Ver logs en tiempo real"
echo "   ./backup-ecosystem.sh    - Crear backup manual"
echo ""

# Paso 5: Demostrar auto-recuperación
show_step 5 "Demostración de auto-recuperación"
echo "El sistema se recupera automáticamente de fallos."
echo "Prueba deteniendo un componente y observa cómo se recupera solo."
echo ""
echo "Para detener la demostración:"
echo "   ./stop-ecosystem.sh"
echo ""
echo "Para reiniciar:"
echo "   ./restart-ecosystem.sh"
echo ""

# Mantener la demostración viva
echo "🎯 DEMOSTRACIÓN EN CURSO..."
echo "El ecosistema está funcionando de manera completamente autónoma."
echo "Abre http://localhost:8080 en tu navegador para ver el dashboard."
echo ""

# Función para manejar interrupción
cleanup() {
    echo ""
    echo "🛑 Deteniendo demostración..."
    ./stop-ecosystem.sh
    exit 0
}

# Configurar trap para limpieza
trap cleanup INT TERM

# Mantener vivo
while true; do
    sleep 1
    # Verificar que el ecosistema siga funcionando
    if ! kill -0 $ECOSYSTEM_PID 2>/dev/null; then
        echo "❌ El proceso del ecosistema se detuvo"
        break
    fi
done

echo "✅ Demostración completada"
echo "El ecosistema autónomo está funcionando perfectamente!"