#!/bin/bash

# CODE GPT ECOSYSTEM - INSTALACIÓN COMPLETA Y AUTÓNOMA
# Este script configura todo el ecosistema de manera completamente automática

set -e

# Función de logging con colores
log() {
    local level=$1
    shift
    local message=$@
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")  echo -e "\033[0;34m[$timestamp] [INFO]\033[0m $message" ;;
        "SUCCESS") echo -e "\033[0;32m[$timestamp] [SUCCESS]\033[0m $message" ;;
        "WARNING") echo -e "\033[1;33m[$timestamp] [WARNING]\033[0m $message" ;;
        "ERROR") echo -e "\033[0;31m[$timestamp] [ERROR]\033[0m $message" ;;
        *) echo -e "\033[0;36m[$timestamp] [$level]\033[0m $message" ;;
    esac
}

# Función para mostrar progreso
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))

    printf "\r["
    for ((i=1; i<=completed; i++)); do printf "="; done
    for ((i=completed+1; i<=width; i++)); do printf " "; done
    printf "] %d%% (%d/%d)" $percentage $current $total
}

# Verificar si se ejecuta como root (necesario para algunas configuraciones)
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log ERROR "No ejecutes este script como root. Usa un usuario normal con sudo cuando sea necesario."
        exit 1
    fi
}

# Verificar requisitos del sistema
check_requirements() {
    log INFO "Verificando requisitos del sistema..."

    local requirements_met=0
    local total_requirements=4

    # Verificar Node.js
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node -v | cut -d'.' -f1 | sed 's/v//')
        if [ "$node_version" -ge 16 ]; then
            log SUCCESS "Node.js $(node -v) ✓"
            ((requirements_met++))
        else
            log ERROR "Se requiere Node.js 16 o superior. Versión actual: $(node -v)"
        fi
    else
        log ERROR "Node.js no está instalado"
    fi

    # Verificar npm
    if command -v npm >/dev/null 2>&1; then
        log SUCCESS "npm $(npm -v) ✓"
        ((requirements_met++))
    else
        log ERROR "npm no está instalado"
    fi

    # Verificar git
    if command -v git >/dev/null 2>&1; then
        log SUCCESS "git $(git --version | cut -d' ' -f3) ✓"
        ((requirements_met++))
    else
        log WARNING "git no está instalado (se instalará automáticamente)"
    fi

    # Verificar curl
    if command -v curl >/dev/null 2>&1; then
        log SUCCESS "curl ✓"
        ((requirements_met++))
    else
        log WARNING "curl no está instalado (se instalará automáticamente)"
    fi

    show_progress $requirements_met $total_requirements

    if [ $requirements_met -lt 3 ]; then
        log ERROR "Requisitos mínimos no cumplidos. Instalando dependencias faltantes..."
        install_missing_dependencies
    else
        log SUCCESS "Todos los requisitos verificados ✓"
    fi

    echo ""
}

# Instalar dependencias faltantes
install_missing_dependencies() {
    log INFO "Instalando dependencias faltantes..."

    # Detectar distribución
    if command -v apt-get >/dev/null 2>&1; then
        # Debian/Ubuntu
        log INFO "Sistema Debian/Ubuntu detectado"
        sudo apt-get update
        sudo apt-get install -y nodejs npm git curl
    elif command -v yum >/dev/null 2>&1; then
        # RHEL/CentOS
        log INFO "Sistema RHEL/CentOS detectado"
        sudo yum install -y nodejs npm git curl
    elif command -v pacman >/dev/null 2>&1; then
        # Arch Linux
        log INFO "Sistema Arch Linux detectado"
        sudo pacman -S nodejs npm git curl
    else
        log ERROR "Distribución no soportada. Instala manualmente: nodejs, npm, git, curl"
        exit 1
    fi

    log SUCCESS "Dependencias instaladas ✓"
}

# Instalar dependencias de Node.js
install_node_dependencies() {
    log INFO "Instalando dependencias de Node.js..."

    if [ -f "package.json" ]; then
        npm install
        log SUCCESS "Dependencias de Node.js instaladas ✓"
    else
        log WARNING "package.json no encontrado. Creando..."
        # Crear package.json básico si no existe
        cat > package.json << 'EOF'
{
  "name": "code-gpt-ecosystem",
  "version": "1.0.0",
  "description": "Ecosistema colaborativo de desarrollo con múltiples AIs",
  "main": "ecosystem-integration.js",
  "scripts": {
    "start": "node master-autopilot.js",
    "install-complete": "./install-complete.sh",
    "status": "./status-ecosystem.sh",
    "logs": "tail -f logs/*.log"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "uuid": "^9.0.0",
    "ws": "^8.14.2",
    "eventemitter3": "^5.0.1"
  }
}
EOF
        npm install
        log SUCCESS "package.json creado e instalado ✓"
    fi
}

# Crear estructura de directorios
create_directories() {
    log INFO "Creando estructura de directorios..."

    local dirs=(
        "logs"
        "temp"
        "backup"
        "config"
        "data"
        "feedback-data"
        "autopilot-status"
        "auto-updates"
        "dashboard-ui"
        "scripts"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
    done

    log SUCCESS "Estructura de directorios creada ✓"
}

# Configurar permisos
set_permissions() {
    log INFO "Configurando permisos..."

    # Scripts ejecutables
    chmod +x *.js
    chmod +x *.sh

    # Archivos de configuración
    if [ -f "code-ecosystem-config.json" ]; then
        chmod 644 code-ecosystem-config.json
    fi

    log SUCCESS "Permisos configurados ✓"
}

# Configurar auto-arranque
configure_auto_startup() {
    log INFO "Configurando auto-arranque del sistema..."

    node auto-startup.js

    log SUCCESS "Auto-arranque configurado ✓"
}

# Crear scripts de utilidad
create_utility_scripts() {
    log INFO "Creando scripts de utilidad..."

    # Script de inicio rápido mejorado
    cat > quick-start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Code GPT Ecosystem en modo autónomo..."
echo "=================================================="

# Verificar si ya está corriendo
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ El ecosistema ya está corriendo"
    echo "🌐 Dashboard: http://localhost:8080"
    exit 0
fi

# Iniciar en background
nohup node master-autopilot.js > logs/master-autopilot.log 2>&1 &
MASTER_PID=$!

echo "⏳ Iniciando componentes..."
sleep 5

# Verificar que inició correctamente
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Ecosistema iniciado exitosamente!"
    echo ""
    echo "🌐 Dashboard: http://localhost:8080"
    echo "🔌 API: http://localhost:3000"
    echo "📡 WebSocket: ws://localhost:8081"
    echo ""
    echo "📋 PID del proceso: $MASTER_PID"
    echo "📊 Ver logs: tail -f logs/*.log"
    echo "🛑 Detener: ./stop-ecosystem.sh"
else
    echo "❌ Error iniciando el ecosistema"
    echo "📋 Revisa los logs: tail -f logs/*.log"
    exit 1
fi
EOF

    # Script de estado mejorado
    cat > status-ecosystem.sh << 'EOF'
#!/bin/bash
echo "📊 Estado del Code GPT Ecosystem"
echo "================================"

# Verificar procesos
echo "🔍 Procesos activos:"
echo "  Master Auto-Pilot: $(pgrep -f "master-autopilot.js" | wc -l) instancias"
echo "  API Gateway: $(pgrep -f "api-gateway.js" | wc -l) instancias"
echo "  Dashboard: $(pgrep -f "auto-dashboard.js" | wc -l) instancias"
echo "  Auto-Updater: $(pgrep -f "auto-updater.js" | wc -l) instancias"

echo ""
echo "🔌 Puertos en uso:"
echo "  3000 (API): $(lsof -i:3000 2>/dev/null | wc -l) conexiones"
echo "  8080 (Dashboard): $(lsof -i:8080 2>/dev/null | wc -l) conexiones"
echo "  8081 (WebSocket): $(lsof -i:8081 2>/dev/null | wc -l) conexiones"

echo ""
echo "🌐 Servicios HTTP:"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "  ✅ API Gateway: Saludable"
else
    echo "  ❌ API Gateway: No responde"
fi

if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "  ✅ Dashboard: Saludable"
else
    echo "  ❌ Dashboard: No responde"
fi

echo ""
echo "📈 Métricas del sistema:"
echo "  CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk '{print 100 - $1}')%"
echo "  Memoria: $(free | grep Mem | awk '{print $3/$2 * 100.0}')%"
echo "  Disco: $(df . | tail -1 | awk '{print $5}' | sed 's/%//')%"

echo ""
echo "📋 Logs recientes:"
for log_file in logs/*.log; do
    if [ -f "$log_file" ]; then
        log_name=$(basename "$log_file" .log)
        last_line=$(tail -1 "$log_file" 2>/dev/null || echo "Log vacío")
        echo "  $log_name: $last_line"
    fi
done

echo ""
echo "✅ Verificación completada"
EOF

    # Script de respaldo automático
    cat > backup-ecosystem.sh << 'EOF'
#!/bin/bash
echo "💾 Creando backup del ecosistema..."
echo "=================================="

timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="backup/ecosystem_backup_$timestamp"

mkdir -p "$backup_dir"

# Archivos a respaldar
files_to_backup=(
    "config"
    "feedback-data"
    "autopilot-status"
    "auto-updates"
    "logs"
    "data"
)

echo "📂 Copiando archivos..."
for file in "${files_to_backup[@]}"; do
    if [ -e "$file" ]; then
        cp -r "$file" "$backup_dir/"
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file (no existe)"
    fi
done

echo ""
echo "🗜️  Comprimiendo backup..."
tar -czf "$backup_dir.tar.gz" -C "$backup_dir" .
rm -rf "$backup_dir"

echo "✅ Backup creado: $backup_dir.tar.gz"
echo "💡 Tamaño: $(du -h "$backup_dir.tar.gz" | cut -f1)"
EOF

    chmod +x quick-start.sh status-ecosystem.sh backup-ecosystem.sh

    log SUCCESS "Scripts de utilidad creados ✓"
}

# Configurar logging
setup_logging() {
    log INFO "Configurando sistema de logging..."

    # Crear configuración de logs
    cat > config/logging.json << 'EOF'
{
  "level": "info",
  "console": true,
  "file": "logs/ecosystem.log",
  "maxSize": "10m",
  "maxFiles": 5,
  "format": "json",
  "enableRotation": true,
  "enableCompression": true
}
EOF

    log SUCCESS "Sistema de logging configurado ✓"
}

# Crear configuración por defecto
create_default_config() {
    log INFO "Creando configuración por defecto..."

    if [ ! -f "config/ecosystem-config.json" ]; then
        cat > config/ecosystem-config.json << 'EOF'
{
  "ecosystem": {
    "name": "Code GPT Ecosystem",
    "version": "1.0.0",
    "description": "Sistema autónomo de desarrollo colaborativo"
  },
  "autopilot": {
    "enabled": true,
    "checkInterval": 30000,
    "autoRecovery": true,
    "autoUpdate": true
  },
  "dashboard": {
    "port": 8080,
    "enableRealTimeUpdates": true,
    "enableNotifications": true
  },
  "development": {
    "languages": ["javascript", "typescript", "python", "go", "rust"],
    "autoLinting": true,
    "autoFormatting": true,
    "autoTesting": true
  }
}
EOF
        log SUCCESS "Configuración por defecto creada ✓"
    fi
}

# Crear documentación
create_documentation() {
    log INFO "Creando documentación..."

    cat > README-AUTONOMOUS.md << 'EOF'
# Code GPT Ecosystem - Sistema Autónomo

## 🚀 Introducción

Este es un ecosistema de desarrollo completamente autónomo que integra múltiples AIs para crear un flujo de trabajo de desarrollo automatizado e inteligente.

## 🎯 Características

### Auto-Pilot Maestro
- ✅ **Monitoreo automático** de todos los componentes
- ✅ **Recuperación automática** de fallos
- ✅ **Optimización automática** de recursos
- ✅ **Actualizaciones automáticas** sin intervención
- ✅ **Dashboard web** en tiempo real
- ✅ **Auto-arranque** del sistema

### Componentes Integrados
- 🔧 **API Gateway**: Punto central de comunicación
- 🌐 **Dashboard Web**: Interfaz de control en tiempo real
- 📊 **DevTools**: Validación, formateo y testing automático
- 💬 **Feedback System**: Aprendizaje continuo del sistema
- 🔄 **Auto-Updater**: Actualizaciones automáticas
- 🚀 **Auto-Startup**: Arranque automático del sistema

## 📋 Instalación Rápida

### Opción 1: Instalación Automática (Recomendado)
```bash
./install-complete.sh
./quick-start.sh
```

### Opción 2: Instalación Manual
```bash
npm install
node master-autopilot.js
```

## 🎮 Uso

### Inicio Rápido
```bash
./quick-start.sh
```

### Dashboard Web
Abre tu navegador en: **http://localhost:8080**

### Comandos Útiles
```bash
./status-ecosystem.sh    # Ver estado del sistema
./backup-ecosystem.sh    # Crear backup
./stop-ecosystem.sh      # Detener sistema
tail -f logs/*.log       # Ver logs en tiempo real
```

## 📊 Dashboard

El dashboard web proporciona:
- 📈 **Métricas en tiempo real** del sistema
- 🎛️ **Control manual** de componentes
- 📋 **Logs en vivo** de todos los procesos
- 🚨 **Alertas automáticas** de fallos
- 📊 **Reportes automáticos** de estado

## 🔧 Configuración

### Configuración Principal
Edita `config/ecosystem-config.json` para personalizar:
```json
{
  "autopilot": {
    "enabled": true,
    "checkInterval": 30000,
    "autoRecovery": true
  }
}
```

### Variables de Entorno
```bash
export LOG_LEVEL=debug
export AUTO_UPDATE=false
export DASHBOARD_PORT=8080
```

## 🚨 Monitoreo y Alertas

### Alertas Automáticas
- 🔴 **Componente fallido**: Reinicio automático
- 🟡 **Alto uso de CPU**: Optimización automática
- 🟠 **Actualización disponible**: Instalación automática
- 🔵 **Backup creado**: Confirmación automática

### Logs
```bash
# Ver logs en tiempo real
tail -f logs/master-autopilot.log
tail -f logs/ecosystem.log
tail -f logs/dashboard.log

# Ver logs de errores
tail -f logs/*error*.log
```

## 🔄 Auto-Recuperación

El sistema incluye recuperación automática de:
- ✅ **Fallos de componentes**
- ✅ **Pérdida de conexión**
- ✅ **Errores de actualización**
- ✅ **Problemas de recursos**
- ✅ **Reinicio del sistema**

## 📦 Backups Automáticos

- 💾 **Backup antes de actualizar**
- 📅 **Backups programados**
- 🔄 **Rollback automático** en caso de error
- 🗜️ **Compresión automática**

## 🛠️ Mantenimiento

### Verificación de Salud
```bash
./status-ecosystem.sh
```

### Backup Manual
```bash
./backup-ecosystem.sh
```

### Reinicio Controlado
```bash
./stop-ecosystem.sh
./quick-start.sh
```

## 🔐 Seguridad

- 🔒 **Comunicación segura** entre componentes
- 🛡️ **Validación automática** de código
- 📝 **Logs de auditoría** completos
- 🔐 **Configuración encriptada**

## 📈 Rendimiento

- ⚡ **Inicio rápido** (< 10 segundos)
- 🔄 **Monitoreo continuo** (30 segundos)
- 💾 **Uso eficiente** de memoria
- 🚀 **Auto-optimización** de recursos

## 🐛 Troubleshooting

### Problemas Comunes

1. **Dashboard no carga**
   ```bash
   ./stop-ecosystem.sh
   ./quick-start.sh
   ```

2. **Componente no responde**
   - El sistema se recupera automáticamente
   - Revisa logs: `tail -f logs/*.log`

3. **Alto uso de recursos**
   - El sistema optimiza automáticamente
   - Monitorea: `./status-ecosystem.sh`

4. **Error de permisos**
   ```bash
   chmod +x *.sh
   chmod +x *.js
   ```

## 📚 Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Auto-Pilot    │───▶│   API Gateway    │───▶│ Code Assistant  │
│   Maestro       │    │                  │    │                 │
│ • Monitoreo     │    │ • Validación     │    │ • Refinamiento  │
│ • Recuperación  │    │ • Formateo       │    │ • Optimización  │
│ • Optimización  │    │ • Testing        │    │ • Documentación │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │    │  Auto-Updater    │    │  Auto-Startup   │
│   Web           │    │                  │    │                 │
│ • Interfaz      │    │ • Actualizaciones│    │ • Arranque      │
│ • Control       │    │ • Rollback       │    │ • Watchdog      │
│ • Métricas      │    │ • Backup         │    │ • Recuperación  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama de características
3. Implementa tus mejoras
4. Agrega tests si es necesario
5. Crea pull request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🆘 Soporte

Para soporte técnico:
- Revisa la documentación
- Consulta los logs del sistema
- Crea un issue en GitHub
- Verifica el dashboard web

---

**¡Gracias por usar el Code GPT Ecosystem Autónomo!** 🚀🤖
EOF

    log SUCCESS "Documentación creada ✓"
}

# Función principal de instalación
main() {
    echo ""
    echo "🚀 CODE GPT ECOSYSTEM - INSTALACIÓN COMPLETA Y AUTÓNOMA"
    echo "========================================================"
    echo ""

    local start_time=$(date +%s)

    # Verificaciones iniciales
    check_root
    check_requirements

    # Instalación
    install_node_dependencies
    create_directories
    set_permissions
    create_default_config
    setup_logging
    create_utility_scripts
    configure_auto_startup
    create_documentation

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Resultado final
    echo ""
    echo "🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!"
    echo "=========================================="
    echo ""
    echo "⏱️  Tiempo de instalación: ${duration}s"
    echo ""
    echo "🌐 Dashboard Web: http://localhost:8080"
    echo "🔌 API Gateway: http://localhost:3000"
    echo "📡 WebSocket: ws://localhost:8081"
    echo ""
    echo "📋 Comandos disponibles:"
    echo "   ./quick-start.sh       - Iniciar ecosistema"
    echo "   ./status-ecosystem.sh  - Ver estado del sistema"
    echo "   ./backup-ecosystem.sh  - Crear backup"
    echo "   ./stop-ecosystem.sh    - Detener sistema"
    echo "   tail -f logs/*.log     - Ver logs en tiempo real"
    echo ""
    echo "📚 Documentación:"
    echo "   README-AUTONOMOUS.md   - Guía completa"
    echo "   README.md              - Documentación general"
    echo ""
    echo "💡 El sistema está configurado para:"
    echo "   ✅ Auto-arranque al iniciar el sistema"
    echo "   ✅ Monitoreo y recuperación automática"
    echo "   ✅ Actualizaciones automáticas"
    echo "   ✅ Dashboard web en tiempo real"
    echo "   ✅ Backups automáticos"
    echo ""
    echo "🚀 ¡Tu ecosistema de desarrollo autónomo está listo!"
    echo ""
    echo "Para iniciar: ./quick-start.sh"
    echo ""
}

# Ejecutar instalación
main "$@"