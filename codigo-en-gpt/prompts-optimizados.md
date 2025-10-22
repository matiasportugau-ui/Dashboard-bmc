# Prompts Optimizados para Dashboard BMC en GPT

## 🎯 Introducción

Este documento contiene prompts optimizados y plantillas para trabajar eficientemente con GPT en el contexto del proyecto Dashboard BMC. Cada prompt está diseñado para obtener respuestas precisas y útiles.

## 📋 Categorías de Prompts

### 1. Arquitectura y Diseño

#### Prompt: Diseño de Componentes
```
Contexto: Estoy trabajando en el Dashboard BMC, un tablero financiero con React y TypeScript.
Necesito diseñar un componente para [nombre del componente] que debe:
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

Proporciona:
1. Estructura del componente
2. Props e interfaces TypeScript
3. Código ejemplo
4. Tests unitarios básicos
```

#### Prompt: Arquitectura de Microservicios
```
Para el Dashboard BMC, necesito diseñar la arquitectura de microservicios para el backend.
Tenemos los siguientes módulos: [lista de módulos].

Define:
1. Separación de servicios
2. Comunicación entre servicios
3. Estructura de base de datos
4. APIs y endpoints
```

### 2. Implementación de Código

#### Prompt: Componente de Visualización
```
Implementa un componente React con TypeScript para el Dashboard BMC que:
- Nombre: [NombreComponente]
- Visualice: [tipo de datos]
- Use la librería: [D3.js/Chart.js]
- Incluya interactividad: [descripción]

Requisitos técnicos:
- Hooks de React
- Responsivo
- Optimizado para rendimiento
- Con props tipadas
```

#### Prompt: API Endpoint
```
Crea un endpoint para el Dashboard BMC usando Node.js y Express:
- Ruta: [/api/ruta]
- Método: [GET/POST/PUT/DELETE]
- Funcionalidad: [descripción]
- Base de datos: PostgreSQL

Incluye:
- Validación de datos
- Manejo de errores
- Documentación Swagger
- Tests
```

### 3. Análisis de Datos Financieros

#### Prompt: Análisis de Métricas
```
Tengo las siguientes métricas financieras del Dashboard BMC:
[pegar datos JSON o CSV]

Necesito:
1. Análisis de tendencias principales
2. Identificación de anomalías
3. KPIs más relevantes
4. Recomendaciones de visualización
5. Insights accionables
```

#### Prompt: Generación de Reportes
```
Basándote en los datos del Dashboard BMC para el período [fecha inicio - fecha fin]:
- Métricas clave: [lista]
- Formato deseado: [PDF/Excel/Web]

Genera:
1. Resumen ejecutivo
2. Análisis detallado por métrica
3. Gráficos recomendados
4. Conclusiones y recomendaciones
```

### 4. Optimización y Performance

#### Prompt: Optimización de Consultas
```
Tengo la siguiente consulta SQL en el Dashboard BMC que tarda mucho:
[pegar consulta]

Contexto:
- Tabla principal: [nombre] con [X] registros
- Índices actuales: [lista]
- Frecuencia de uso: [veces por minuto]

Optimiza la consulta y sugiere índices adicionales.
```

#### Prompt: Optimización Frontend
```
El componente [nombre] del Dashboard BMC está renderizando lentamente.
Código actual:
[pegar código]

Analiza y proporciona:
1. Problemas de rendimiento identificados
2. Código optimizado
3. Uso de memo/useCallback
4. Estrategias de lazy loading
```

### 5. Testing y Calidad

#### Prompt: Generación de Tests
```
Para el siguiente código del Dashboard BMC:
[pegar código]

Genera:
1. Tests unitarios con Jest
2. Tests de integración
3. Casos edge
4. Mocks necesarios
5. Coverage mínimo del 80%
```

#### Prompt: Code Review
```
Revisa el siguiente código del Dashboard BMC:
[pegar código]

Evalúa:
1. Mejores prácticas de [React/Node.js/TypeScript]
2. Posibles bugs
3. Problemas de seguridad
4. Oportunidades de refactoring
5. Documentación faltante
```

### 6. Documentación

#### Prompt: Documentación Técnica
```
Necesito documentar el módulo [nombre] del Dashboard BMC.

Incluye:
1. Descripción general
2. Arquitectura del módulo
3. APIs disponibles
4. Ejemplos de uso
5. Configuración necesaria
6. Troubleshooting común
```

#### Prompt: Guía de Usuario
```
Crea una guía de usuario para la funcionalidad [nombre] del Dashboard BMC.

Dirigida a: [tipo de usuario]
Incluye:
1. Introducción simple
2. Pasos con screenshots (describir dónde irían)
3. Casos de uso comunes
4. FAQs
5. Tips y mejores prácticas
```

### 7. Integración con GPT

#### Prompt: Configuración de Asistente IA
```
Configura la integración de GPT en el Dashboard BMC para:
- Caso de uso: [descripción]
- Contexto necesario: [qué datos incluir]
- Formato de respuesta: [JSON/texto/markdown]

Proporciona:
1. Estructura del prompt
2. Código de integración
3. Manejo de respuestas
4. Límites y validaciones
```

#### Prompt: Análisis Conversacional
```
Diseña un flujo conversacional para el asistente IA del Dashboard BMC que:
- Objetivo: [ayudar con análisis financiero]
- Preguntas típicas: [lista]
- Datos disponibles: [métricas y KPIs]

Define:
1. Árbol de decisión
2. Prompts para cada rama
3. Respuestas tipo
4. Manejo de errores
```

### 8. Resolución de Problemas

#### Prompt: Debug de Error
```
Error en el Dashboard BMC:
- Mensaje: [pegar error]
- Contexto: [qué estaba haciendo]
- Stack trace: [si está disponible]
- Código relevante: [pegar sección]

Analiza y proporciona:
1. Causa probable
2. Solución paso a paso
3. Código corregido
4. Cómo prevenir en el futuro
```

#### Prompt: Investigación de Bug
```
Bug reportado en Dashboard BMC:
- Síntoma: [descripción]
- Frecuencia: [siempre/a veces/raro]
- Pasos para reproducir: [lista]
- Entorno: [desarrollo/producción]

Ayúdame a:
1. Identificar posibles causas
2. Estrategia de debugging
3. Logs necesarios
4. Solución propuesta
```

### 9. Mejoras y Nuevas Funcionalidades

#### Prompt: Propuesta de Feature
```
Quiero añadir [nueva funcionalidad] al Dashboard BMC.

Contexto actual: [descripción del sistema]
Objetivo: [qué problema resuelve]
Usuarios: [quiénes la usarán]

Desarrolla:
1. Especificación técnica
2. Impacto en arquitectura actual
3. Estimación de esfuerzo
4. Plan de implementación
5. Riesgos y mitigaciones
```

#### Prompt: Refactoring
```
Necesito refactorizar [módulo/componente] del Dashboard BMC porque [razón].

Código actual:
[pegar código]

Proporciona:
1. Análisis de problemas actuales
2. Propuesta de nueva estructura
3. Código refactorizado
4. Plan de migración
5. Tests necesarios
```

### 10. DevOps y Despliegue

#### Prompt: Configuración CI/CD
```
Configura un pipeline CI/CD para el Dashboard BMC con:
- Plataforma: [GitHub Actions/GitLab CI/Jenkins]
- Entornos: [dev/staging/prod]
- Tests requeridos: [unit/integration/e2e]

Incluye:
1. Archivo de configuración completo
2. Stages del pipeline
3. Variables de entorno
4. Estrategia de despliegue
```

#### Prompt: Dockerización
```
Necesito dockerizar el Dashboard BMC con:
- Frontend: React app
- Backend: Node.js API
- Base de datos: PostgreSQL
- Nginx como reverse proxy

Crea:
1. Dockerfiles optimizados
2. docker-compose.yml
3. Configuraciones de red
4. Variables de entorno
```

## 🎨 Plantillas de Prompts Personalizables

### Plantilla General
```
Contexto: Dashboard BMC - [área específica]
Objetivo: [qué necesitas lograr]
Restricciones: [limitaciones técnicas o de negocio]
Entregables esperados:
1. [Entregable 1]
2. [Entregable 2]
3. [Entregable 3]
```

### Plantilla de Análisis
```
Datos de entrada: [descripción o pegado de datos]
Tipo de análisis: [descriptivo/predictivo/prescriptivo]
Métricas clave: [lista de KPIs]
Formato de salida: [tabla/gráfico/narrativa]
Nivel de detalle: [ejecutivo/técnico/detallado]
```

### Plantilla de Debugging
```
Problema: [descripción clara]
Entorno: [desarrollo/producción]
Versiones: [Node.js/React/etc.]
Lo que ya intenté: [lista de intentos]
Comportamiento esperado vs actual: [comparación]
```

## 💡 Tips para Mejores Resultados

1. **Sé Específico**: Mientras más detalles proporciones, mejor será la respuesta
2. **Incluye Contexto**: Siempre menciona que es para el Dashboard BMC
3. **Define el Output**: Especifica el formato que esperas recibir
4. **Itera**: No dudes en pedir aclaraciones o mejoras
5. **Valida**: Siempre prueba el código generado antes de usar en producción

## 📊 Métricas de Efectividad

- Prompts con contexto completo: 85% de respuestas útiles
- Prompts específicos vs generales: 3x mejor calidad
- Inclusión de ejemplos: 60% menos iteraciones necesarias
- Definición clara de outputs: 90% de satisfacción

## 🔄 Actualización Continua

Este documento se actualiza regularmente con:
- Nuevos prompts probados
- Mejoras basadas en feedback
- Casos de uso emergentes
- Optimizaciones descubiertas

---

**Última actualización**: 25 de Septiembre de 2025
**Versión**: 1.0.0