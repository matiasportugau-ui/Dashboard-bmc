# BMC — Procesos y Automatización (Corrida de 2025-09-26 20:08)
**Estado:** PRELIMINAR — sin CHATS_EXPORTADOS (plantilla de primera pasada)

## Resumen ejecutivo
Se generó una plantilla de trabajo para el inventario E2E de procesos y backlog de automatización. Esta versión no contiene evidencias ni métricas reales porque aún no se cargaron los CHATS_EXPORTADOS ni SOPs. Al pegar las fuentes, se ejecutará la extracción y se actualizarán todas las secciones con datos de BMC.

## Mapa E2E (borrador orientativo)
1. Marketing/Leads → 2. Comercial/Descubrimiento → 3. CPQ/Presupuestos → 4. Propuesta/Firma →
5. Planificación/OT → 6. Producción/Servicios → 7. Facturación/Cobranza → 8. Postventa/Soporte → 9. Analítica/BI/IA

## GAPS Top-5 (hipótesis a validar)
1) No existe un mapa E2E único y vigente (ventas→postventa).  
2) SLAs no estandarizados para TTQ, cotizaciones y ejecución/soporte.  
3) CPQ manual sin validaciones de margen ni aprobaciones escalonadas.  
4) Handoffs débiles entre Comercial→CPQ→Propuesta/Firma→Planificación (sin checklist/RACI).  
5) Integración CRM↔ERP parcial (productos/BOM, facturas/pagos duplicados).  

## Preguntas por rol (para destrabar)
- **El_Mono:** 
  1. ¿Cuál es el flujo “feliz” actual de lead→cobro?  
  2. ¿Dónde se rompen más los handoffs (y por qué)?  
  3. Prioriza 3 métricas operativas críticas (TTQ, margen real, DSO, NPS, etc.).
- **Martín:** 
  1. ¿Qué reglas de pricing/margen aplica CPQ y quién aprueba excepciones?  
  2. ¿Qué integraciones activas hay entre CRM↔ERP↔e‑commerce↔pagos?  
  3. ¿Qué reportes usas para forecast y win‑rate?
- **Ramiro:** 
  1. ¿Cómo se genera la OT y qué campos son obligatorios?  
  2. ¿Qué cuellos de botella hay en planificación/capacidad?  
  3. ¿Cómo se registran costos reales vs teóricos por orden?
- **Sandra:** 
  1. ¿Cuál es el proceso de facturación y qué valida antes de emitir?  
  2. ¿Cómo calculan DSO y qué alertas existen para morosidad?  
  3. ¿Qué conciliaciones automáticas podrían implementarse?
- **Matías:** 
  1. ¿Qué canales de soporte existen y cómo se mide CSAT/NPS?  
  2. ¿Qué automatizaciones actuales hay en tickets/WhatsApp?  
  3. ¿Qué conocimiento base existe y cómo se actualiza?

## Checklist de archivos a subir
- **SOP Comercial y CPQ** (Drive, Alta) — Owner: Comercial  
- **Plantillas de cotización y propuesta** (Drive, Alta) — Owner: Comercial/Legal  
- **Catálogo de productos/BOM sin cifras** (Drive, Alta) — Owner: Producto/ERP  
- **Diagrama integraciones CRM↔ERP↔e‑commerce↔pagos** (Drive, Alta) — Owner: TI  
- **Política de SLAs y RACI por proceso** (Drive, Media) — Owner: PMO/Operaciones  

## Inventario de procesos (borrador)
> Nota: estructura de ejemplo; se reemplazará con extracción real al cargar fuentes.

### P1 — Captura y Calificación de Leads
- **Etiqueta:** Marketing/Leads — **Trigger:** nuevo lead en formulario/WhatsApp  
- **Entradas:** lead form, mensajes WhatsApp, fuente campaña  
- **Salidas:** lead calificado (MQL/SQL), actividad en CRM  
- **Tareas (RACI orientativo):**
  1. Registrar lead y fuente en CRM — *R:* Mkt / *A:* Mkt — *Sistemas:* CRM, WhatsApp
  2. Enriquecer y deduplicar — *R:* Mkt — *Sistemas:* CRM/ETL
  3. Score automático y routing — *R:* Bot/CRM — *Validaciones:* datos mínimos
- **Handoffs:** Marketing→Comercial (criterio: SQL)
- **SLA:** TTQ (respuesta inicial) ≤ 15 min
- **Métricas:** Tasa contacto 24h, %SQL, costo por SQL

### P2 — Descubrimiento Comercial
- **Etiqueta:** Comercial/Descubrimiento — **Trigger:** SQL asignado  
- **Entradas:** SQL, historial de contacto  
- **Salidas:** oportunidad creada, notas, próximos pasos  
- **Tareas:**
  1. Llamada/diagnóstico — *R:* Ejecutivo
  2. Definir necesidad/alcance — *R:* Ejecutivo — *Artefactos:* checklist discovery
  3. Calificar presupuesto/plazos — *R:* Ejecutivo — *Validaciones:* calificación BANT
- **Handoffs:** Comercial→CPQ (criterio: potencial viable)
- **SLA:** discovery ≤ 2 días hábiles
- **Métricas:** win‑rate etapa, ciclo etapa

### P3 — CPQ / Presupuestos
- **Etiqueta:** CPQ/Presupuestos — **Trigger:** oportunidad viable  
- **Entradas:** productos/BOM, reglas de pricing, descuentos permitidos  
- **Salidas:** cotización generada con versión y vigencia  
- **Tareas:**
  1. Selección BOM/servicios — *R:* Ejecutivo/Preventa — *Sistemas:* CPQ/ERP
  2. Validar márgenes/reglas — *R:* CPQ — *Validaciones:* margen mínimo
  3. Aprobación excepciones — *A:* Gerencia — *Artefactos:* bitácora aprobación
- **Handoffs:** CPQ→Propuesta/Firma
- **SLA:** TTQ ≤ 24 h
- **Métricas:** exactitud margen, re‑trabajos por error

### P4 — Propuesta y Firma
- **Etiqueta:** Propuesta/Firma — **Trigger:** cotización aprobada por cliente  
- **Entradas:** cotización vigente, condiciones legales, datos fiscales  
- **Salidas:** contrato firmado, orden de compra  
- **Tareas:**
  1. Generar propuesta/contrato — *R:* Comercial/Legal — *Sistemas:* Docusign
  2. Validar datos fiscales — *R:* Backoffice
  3. Firma digital y archivado — *R:* Cliente/Comercial — *Sistemas:* Firma digital
- **Handoffs:** Propuesta/Firma→Planificación/OT
- **SLA:** ciclo firma ≤ 3 días
- **Métricas:** tasa caída post‑cotización

### P5 — Planificación y Orden de Trabajo
- **Etiqueta:** Planificación/OT — **Trigger:** contrato/OC recibida  
- **Entradas:** contrato, alcance, capacidad
- **Salidas:** OT con cronograma y responsables
- **Tareas:**
  1. Crear OT y checklist — *R:* Operaciones
  2. Asignar recursos/capacidad — *R:* Operaciones — *Sistemas:* ERP/Planner
  3. Kickoff interno — *R:* PM — *Artefactos:* acta kickoff
- **Handoffs:** Planificación→Producción/Servicios
- **SLA:** programación ≤ 48 h
- **Métricas:** cumplimiento plan (OT)

### P6 — Producción / Servicios
- **Etiqueta:** Producción/Servicios — **Trigger:** OT activa  
- **Entradas:** OT, materiales/recursos
- **Salidas:** trabajo completado, parte de servicio
- **Tareas:** ejecutar, registrar tiempos/costos, control calidad
- **SLA:** cumplimiento hitos
- **Métricas:** margen real vs teórico

### P7 — Facturación y Cobranza
- **Etiqueta:** Facturación/Cobranza — **Trigger:** hito cumplido/entrega  
- **Entradas:** parte de servicio, contrato, datos fiscales
- **Salidas:** factura emitida, pago registrado
- **Tareas:** emitir factura, enviar, conciliar pago
- **Métricas:** DSO, % notas de crédito

### P8 — Postventa y Soporte
- **Etiqueta:** Postventa/Soporte — **Trigger:** ticket o garantía  
- **Entradas:** ticket, historial cliente
- **Salidas:** ticket resuelto y feedback
- **Tareas:** triage, SLA por prioridad, cierre y encuesta
- **Métricas:** SLA cumplimiento, CSAT/NPS

## Backlog de Automatizaciones (RICE preliminar 0–100)
1. **Bot de calificación y routing de leads (WhatsApp→CRM)** — RICE: 78  
2. **Validador de márgenes CPQ + aprobaciones** — RICE: 75  
3. **Sincronización ERP↔CRM de catálogo/BOM** — RICE: 72  
4. **Firma digital con disparadores automáticos de estado** — RICE: 68  
5. **ETL margen teórico vs real (BI)** — RICE: 66  
6. **Recordatorios SLA en tickets y OT** — RICE: 64  
7. **Conciliación automática de pagos** — RICE: 60  
8. **Panel operativo TTQ/win‑rate/DSO/NPS** — RICE: 58  

## Alertas de privacidad
No incluir cifras confidenciales, datos personales sin consentimiento ni credenciales. Anonimizar: nombres, RUT/DNI, montos, correos/telefonía, URLs privadas.

## Próximos pasos
1) Subir CHATS_EXPORTADOS y SOPs clave.  
2) Ejecutar extracción y normalización.  
3) Validar con RACI y fijar SLAs por proceso.  
4) Recalcular RICE con métricas reales y dependencias.  

---

<!-- EXPORT_SEAL v1
project: "BMC Uruguay — Automatización Total"
prompt_id: "chat_harvester_bmc_procesos_v1_1"
version: "1.1.0"
file: "BMC-Procesos-Automatizacion.md"
lang: "es"
created_at: "2025-09-26T20:08:30Z"
author: "GPT-5 Thinking"
origin: "Primera pasada (plantilla)"
body_sha256: "TBD"
notes: "Se actualizará automáticamente al cargar fuentes reales."
-->