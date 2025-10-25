# Informe comparativo de IA — 2025-09-06 04:53

## Modelos puntuados (ranking descendente por desempeño global)

### GPT-5
**Categoría:** Texto/Multimodal (orquestación)  
**Modalidad:** Texto, Imagen*, Código (*análisis)  
**Roles ideales:** PLN, RSR, CRT, INT, SAFE, AU1, AU2  
**Capacidades clave:**
- Razonamiento profundo
- Orquestación multi-agente
- Análisis estructurado
- Argumentación
- Evaluación QA
- Redacción técnica avanzada
**Fortalezas:**
- Alta precisión y coherencia
- Excelente trazabilidad
- Buen manejo de contexto largo
- Auditoría y planificación
**Limitaciones:**
- Costo computacional más alto
- Latencia mayor que modelos livianos
- No genera imágenes nativas
**Casos de uso recomendados:**
- Diseño de procesos
- Auditoría/QA
- Integración de entregables
- Decisiones complejas
**No recomendado para:**
- Renderizado visual nativo
- Tareas ultra‑rápidas y de bajo costo
**Métricas (0–10)**
- Razonamiento: 9.7
- Multimodalidad: 8.5
- Extracción: 9.2
- Generación: 9.2
- Compliance/Seguridad: 9.3
- Estabilidad: 9.4
- Velocidad: 7.5
- Eficiencia de costo: 5.5
- Gestión de contexto: 9.0
- Colaboración: 9.4
- **Score global (ponderado): 8.905**
**Integraciones/Tools:** Sí (planificación, análisis, control QA)  
**Controles de determinismo:** 8.0  
**Comentarios:** Ideal como cerebro del flujo y juez crítico.

### GPT-4o
**Categoría:** Texto/Visión (multimodal)  
**Modalidad:** Texto, Imagen (visión), Código  
**Roles ideales:** IMG, FIT, DAT, BLD, INT  
**Capacidades clave:**
- Análisis visual
- Extracción de atributos de imagen
- Síntesis multimodal
- Construcción de artefactos
**Fortalezas:**
- Muy buen desempeño en visión
- Velocidad competitiva
- Integración flexible con otros roles
**Limitaciones:**
- Menos estricto al criticar
- No especializado en compliance avanzado
**Casos de uso recomendados:**
- Análisis de prendas en fotos
- Generación de renders asistidos
- Integración de datos visuales
**No recomendado para:**
- Auditorías normativas estrictas sin apoyo de CRT/SAVE
**Métricas (0–10)**
- Razonamiento: 8.8
- Multimodalidad: 9.2
- Extracción: 9.0
- Generación: 8.9
- Compliance/Seguridad: 8.7
- Estabilidad: 8.9
- Velocidad: 8.5
- Eficiencia de costo: 7.0
- Gestión de contexto: 8.2
- Colaboración: 9.0
- **Score global (ponderado): 8.745**
**Integraciones/Tools:** Sí (visión + construcción)  
**Controles de determinismo:** 7.5  
**Comentarios:** Los ‘ojos y manos’ del pipeline de prendas.

### GPT-4
**Categoría:** Texto (alto desempeño)  
**Modalidad:** Texto, Código  
**Roles ideales:** CRT, SAFE, PLN  
**Capacidades clave:**
- Evaluación crítica
- Compliance
- Redacción técnica
- Razonamiento estable
**Fortalezas:**
- Muy estable
- Excelente para QA y revisiones
- Buen costo-beneficio
**Limitaciones:**
- Capacidades de visión limitadas/indirectas
**Casos de uso recomendados:**
- Validación QA
- Checklist‑QA
- Revisión de métricas y compliance
**No recomendado para:**
- Análisis visual directo o tareas multimodales complejas
**Métricas (0–10)**
- Razonamiento: 8.9
- Multimodalidad: 7.0
- Extracción: 8.4
- Generación: 8.7
- Compliance/Seguridad: 9.0
- Estabilidad: 9.2
- Velocidad: 7.8
- Eficiencia de costo: 7.2
- Gestión de contexto: 8.0
- Colaboración: 8.6
- **Score global (ponderado): 8.365**
**Integraciones/Tools:** Sí (auditoría, análisis)  
**Controles de determinismo:** 8.8  
**Comentarios:** Auditor/validador ideal de entregables.

### GPT-3.5
**Categoría:** Texto (ligero)  
**Modalidad:** Texto, Código  
**Roles ideales:** RSR (ligero), BLD (borradores), OPS (asistencias)  
**Capacidades clave:**
- Redacción general
- Soporte operativo
- Borradores rápidos
**Fortalezas:**
- Muy rápido
- Muy económico
**Limitaciones:**
- Razonamiento y robustez inferiores
- Menor exactitud en tareas críticas
**Casos de uso recomendados:**
- Tareas no críticas
- Skeletons de documentos
- Resúmenes iniciales
**No recomendado para:**
- QA crítico
- Decisiones complejas
- Extracción técnica exigente
**Métricas (0–10)**
- Razonamiento: 6.8
- Multimodalidad: 5.5
- Extracción: 6.5
- Generación: 7.2
- Compliance/Seguridad: 7.4
- Estabilidad: 7.5
- Velocidad: 9.2
- Eficiencia de costo: 9.0
- Gestión de contexto: 6.8
- Colaboración: 7.0
- **Score global (ponderado): 7.1**
**Integraciones/Tools:** Limitadas  
**Controles de determinismo:** 6.5  
**Comentarios:** Útil para abaratar etapas preliminares.

### DALL·E 3
**Categoría:** Imagen (generativa)  
**Modalidad:** Imagen (generación)  
**Roles ideales:** BLD visual (conceptos, moodboards)  
**Capacidades clave:**
- Generación de imágenes creativas/realistas a partir de texto
**Fortalezas:**
- Alta calidad visual
- Versatilidad estética
**Limitaciones:**
- Control técnico fino limitado
- No ideal para renders técnicos exactos
**Casos de uso recomendados:**
- Concept art
- Catálogo preliminar
- Variantes de estilo
**No recomendado para:**
- Fichas técnicas de fábrica
- Medidas exactas
**Métricas (0–10)**
- Razonamiento: 4.0
- Multimodalidad: 8.8
- Extracción: 4.0
- Generación: 9.4
- Compliance/Seguridad: 8.5
- Estabilidad: 8.6
- Velocidad: 8.4
- Eficiencia de costo: 7.2
- Gestión de contexto: 5.0
- Colaboración: 7.8
- **Score global (ponderado): 6.7**
**Integraciones/Tools:** Sí (workflow de diseño)  
**Controles de determinismo:** 6.0  
**Comentarios:** Excelente para visuales, complementa a modelos de texto.

### Whisper
**Categoría:** Audio (ASR)  
**Modalidad:** Audio → Texto  
**Roles ideales:** RSR (audio), DAT (transcripción para análisis)  
**Capacidades clave:**
- Transcripción robusta
- Detección de idioma
- Puntuación y tiempos
**Fortalezas:**
- Alta precisión en ASR
- Soporta ruidos moderados
**Limitaciones:**
- No genera audio
- No razona sobre contenido complejo por sí mismo
**Casos de uso recomendados:**
- Notas de voz
- Entrevistas
- Fittings hablados
**No recomendado para:**
- Síntesis/generación de audio
- Decisiones complejas
**Métricas (0–10)**
- Razonamiento: 3.0
- Multimodalidad: 6.0
- Extracción: 9.3
- Generación: 3.0
- Compliance/Seguridad: 8.2
- Estabilidad: 8.0
- Velocidad: 8.0
- Eficiencia de costo: 8.5
- Gestión de contexto: 4.0
- Colaboración: 7.5
- **Score global (ponderado): 6.4**
**Integraciones/Tools:** Sí (pipelines ASR → análisis)  
**Controles de determinismo:** 5.5  
**Comentarios:** Pieza clave para convertir audio en datos analizables.


---
## Módulos/Extensiones (no puntuados)

### PEIPM (Evaluador Iterativo del Prompt Maestro)
**Tipo:** Orquestación/QA  
**Roles:** CRT (meta), INT, OPS  
**Propósito:** QA iterativo con métricas; convergencia en bucles; changelog
**Beneficios:**
- Mejora continua
- Trazabilidad
- Criterios objetivos
- Estabilidad
**Limitaciones:**
- Depende del modelo base
- Overhead de ciclos
**Cuándo usar:** Calidad alta necesaria; Riesgo de drift; Entregables críticos
**Complementa a:** GPT-5 (CRT/INT), GPT-4 (SAFE/QA)
**Notas:** Actúa como cinturón de calidad; no un modelo separado

### Frankenstein Auditor
**Tipo:** Híbrido Auditor (AU1/AU2 + PEIPM)  
**Roles:** CRT reforzado, AU1/AU2, SAFE  
**Propósito:** Auditor duro con resolución de conflictos; 50 ciclos fijos
**Beneficios:**
- Estándares altos
- Control de riesgos
- Registro exhaustivo
**Limitaciones:**
- Más costo/tiempo
- Puede ser conservador
**Cuándo usar:** Necesitás máximo rigor y comparabilidad
**Complementa a:** GPT-5/GPT-4 (CRT), GPT-4o (BLD)
**Notas:** Ideal en homologaciones y aprobaciones formales

### Suegro Insoportable
**Tipo:** Benchmark estricto  
**Roles:** CRT comparativo, INT  
**Propósito:** Comparar contra histórico (≥95% de benchmark)
**Beneficios:**
- Evita regresiones
- Nivel de calidad constante
**Limitaciones:**
- Puede rechazar mejoras creativas ‘off‑benchmark’
**Cuándo usar:** Mantenimiento de calidad; Producción en serie
**Complementa a:** GPT-5 (INT/CRT), GPT-4 (SAFE)
**Notas:** Muy útil para operaciones repetibles/industriales

### PromptMaker (Fase 0)
**Tipo:** Pre‑estudio y capacitación  
**Roles:** PLN, RSR  
**Propósito:** Tarjeta de Estudio; KPIs; Plan V0; glosario y riesgos
**Beneficios:**
- Reduce ambigüedad
- Alinea stakeholders
**Limitaciones:**
- Requiere tiempo inicial
**Cuándo usar:** Proyectos complejos o multi‑equipo
**Complementa a:** Todos los modelos; especialmente GPT-5/4
**Notas:** Base para arrancar con buen pie

### FFmpeg/CLI (herramienta)
**Tipo:** Procesamiento media (no-IA)  
**Roles:** OPS  
**Propósito:** Conversión y manipulación de audio/video
**Beneficios:**
- Estándar industrial
- Confiable
**Limitaciones:**
- No ‘razona’
- Necesita orquestación
**Cuándo usar:** Mastering; pipelines de media
**Complementa a:** GPT-4/4o/5; PEIPM
**Notas:** Útil como engranaje técnico del pipeline
