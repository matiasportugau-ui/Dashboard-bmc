# Prompt maestro: Evaluación inteligente de procesos de macOS (Activity Monitor)

## 🎯 Objetivo

Construir un **sistema de evaluación y decisión** que, a partir de datos de *Activity Monitor* y artefactos de diagnóstico de macOS, determine:

- **Qué procesos están activos** y por qué (origen/razón de existencia).
- **Si su consumo de recursos es normal** para su función y contexto.
- **Detección de anomalías** y probables **causas raíz**.
- **Acciones de optimización, limpieza y seguridad** priorizadas.
- **Registro reproducible** (logs, JSON, checklist) para auditoría y aprendizaje continuo.

> Modo de operación: *Análisis por lotes* (export/import) o *en vivo* (lecturas de Activity Monitor + reportes de diagnóstico). Salida en JSON + resumen ejecutable.

---

## 0) Setup / Contexto

- Dispositivo: {modelo\_mac} • CPU: {cpu} • RAM: {ram} • GPU: {gpu} • macOS: {version}
- Perfil de uso: {perfil (p.ej., edición video, dev, ofimática)}
- Ventana de análisis: {rango\_horario}
- Estado térmico y energía: {en\_cargador|batería}, {temp\_superficie\_aprox}, {ventiladores}
- Modo red: {wifi|ethernet|vpn}
- Política de seguridad: {Gatekeeper ON, SIP ON, FileVault ON}

### 0.1) Proceso de relajamiento (pre‑análisis)

> Objetivo: **llevar el sistema a un estado térmico y de carga estable** para medir un **baseline óptimo** y distinguir qué procesos nativos y de terceros se mantienen de forma habitual sin interferencias coyunturales.

**A) Descarga de carga activa (5–10 min)**

1. Cerrar apps de alto consumo (editores de video, VMs, navegadores con >10 pestañas, indexadores de terceros, sincronizadores on‑demand) y ventanas no usadas.
2. Pausar tareas intensivas programadas (respaldo/antivirus/escaneos) si están en curso.
3. Desconectar periféricos que generen carga/GPU (monitores externos, capturadoras, hubs de alto consumo) salvo que formen parte del uso estándar.
4. Conectar el cargador si se desea un baseline **en CA**; para baseline **en batería**, mantener desconectado.

**B) Estabilización térmica (10–20 min)**

1. Dejar la Mac **en reposo activo** (sin interacción) con tapa abierta y buena ventilación.
2. Registrar: rpm de ventiladores (si disponible), temperatura superficial aproximada, ausencia de picos en `kernel_task`.
3. Confirmar que *Energy Impact* total baja y que CPU total oscila en rangos de reposo.

**C) Saneamiento ligero (opcional, 3–5 min)**

1. Cerrar overlays y extensiones de menú innecesarias.
2. Desactivar temporalmente wallpapers dinámicos/efectos si el baseline se toma **en ahorro**.
3. Verificar que no haya descargas/actualizaciones activas (App Store/Steam/Drive/iCloud).

**D) Fijación del contexto del baseline**

- Modo: {CA|Batería}
- Pantallas: {interna|externa 4K|dual}
- Red: {wifi canal X|ethernet|vpn}
- Perfil: {reposo/idle vs. trabajo ligero}

**E) Señal de inicio de medición**

- Cuando CPU total ≤ {5–8}% sostenido por ≥ {3} min, *Energy Impact* bajo, I/O mínimo y `kernel_task` sin picos → **capturar baseline** (ver §0.2 y §2).

### 0.2) Tipos de baseline a capturar

- **Baseline óptimo** (*idle estable*): establece los rangos normales mínimos por pestaña (CPU, Memoria, Energía, Disco, Red).
- **Baseline habitual** (*entorno típico*): con tus apps residentes habituales (mensajería, notas, launcher, syncs que siempre usas) para separar **nativo vs. externo** y cuantificar su huella sostenida.
- **Baseline con monitores externos** (si aplica): cuantifica impacto de `WindowServer`/GPU.

---

## 1) Entradas (fuentes de evidencia)

- **Activity Monitor (5 pestañas)**: CPU, Memoria, Energía, Disco, Red (con columnas clave visibles).
- **Capturas de baseline** (según §0.2):
  - Paquetes de métricas en *idle estable*, *habitual*, y *con monitores externos*.
  - Marcar timestamp y condiciones (CA/batería, pantallas, red).
- **Diagnostics desde Activity Monitor**: *Sample Process*, *Spindump*, *System Diagnostics*, *Spotlight Diagnostics*.
- **Listados del sistema** (solo lectura):
  - Login Items / LaunchAgents / LaunchDaemons (usuarios + sistema)
  - Tareas en `launchd` (labels) y jobs en ejecución
  - Indexadores (*mds*, *mds\_stores*), UI compositor (*WindowServer*), *kernel\_task*, *securityd*, *trustd*, *nsurlsessiond*.
- **Eventos recientes**: instalaciones/actualizaciones, conexión de monitores externos, iCloud/Spotlight reindexaciones, sincronizaciones (Fotos/Drive), Time Machine.

> Acepta: exportaciones CSV/texto, capturas tabulares o JSON consolidado. **Incluir siempre al menos un baseline óptimo y uno habitual** antes del primer análisis comparativo.

---

## 2) Modelo de datos (normalizado)

Para cada **proceso** `P` crear un objeto:

```json
{
  "name": "",
  "pid": 0,
  "user": "",
  "kind": "{system|user|daemon|agent|app|helper}",
  "bundle_id": "",
  "signed_by_apple": true,
  "parent_process": "",
  "launch_mechanism": "{loginItem|LaunchAgent|LaunchDaemon|app|cron|unknown}",
  "role": "{UI|indexing|network|security|media|dev|unknown}",
  "cpu_pct": 0.0,
  "cpu_time_s": 0,
  "mem_real_mb": 0,
  "mem_compressed_mb": 0,
  "threads": 0,
  "energy_impact": 0.0,
  "disk_read_mb_s": 0.0,
  "disk_write_mb_s": 0.0,
  "net_in_mb_s": 0.0,
  "net_out_mb_s": 0.0,
  "gpu_hint": "{none|low|medium|high}",
  "window_count": 0,
  "lifetime_s": 0,
  "recent_spike": {"metric": "cpu|mem|disk|net|energy", "delta_pct": 0},
  "context": {"battery": true, "external_display": true, "time_block": "work|idle|sleep"},
  "samples": ["path/to/sample.txt"],
  "spindumps": ["path/to/spindump.log"],
  "flags": ["ui-blocking", "background", "network-intensive", "indexing", "unknown-origin"],
  "notes": ""
}
```

---

## 3) Reglas y heurísticas (baseline → anomalías)

**Clasificación por rol** (mapeos sugeridos):

- `kernel_task` → térmico/gestión CPU; `WindowServer` → compositor UI; `mds/mds_stores` → indexación Spotlight; `nsurlsessiond` → transferencias; `trustd/securityd` → validación; `photoanalysisd` → indexación Fotos; `backupd` → Time Machine.

**Baseline contextual** (ejemplos, ajustar al perfil):

- **En reposo** (sin apps activas, tapa abierta, sin indexaciones): `WindowServer` bajo, `kernel_task` bajo, I/O de disco mínimo, red en inactividad.
- **Tras cambios masivos** (instalar apps, conectar SSD, agregar fotos, encender FileVault): picos temporales en *mds/mds\_stores*, *photoanalysisd*, *trustd*.
- **Con monitor externo/alto DPI**: `WindowServer` y GPU pueden subir de forma proporcional a ventanas/transparencias/animaciones.

**Detectores de anomalías (reglas)**

- Pico sostenido **CPU** > {thr\_cpu}% por > {duracion} en proceso no-crítico y sin interacción de usuario.
- **Memoria**: crecimiento continuo (leak sospechoso) + compresión elevada del sistema.
- **Disco**: escrituras continuas > {thr\_write} MB/s fuera de ventanas de backup/indexado.
- **Red**: tráfico saliente anómalo en background por {duracion} sin app visible.
- **Energía**: *Energy Impact* alto en batería sin actividad de primer plano.
- **Persistencia**: binarios no Apple cargados en LaunchAgents/Daemons sin justificación.

**Scoring**

- `necessity_score` (0–100): ¿el rol del proceso corresponde al contexto?
- `efficiency_score` (0–100): recursos vs. output esperado para ese rol.
- `security_risk` (0–100): firma, origen, persistencia, conexiones, reputación.
- `stability_risk` (0–100): crashes, watchdogs, spindumps, bloqueos UI.
- `priority` = f(security\_risk, stability\_risk, energy, impacto\_usuario).

---

## 4) Análisis de causas raíz (RCA)

- **Térmico**: `kernel_task` alto → posible limitación por temperatura o sensores/puertos calientes.
- **UI/Gráficos**: `WindowServer` alto → múltiples escritorios/ventanas, monitores externos, wallpapers dinámicos, overlays.
- **Indexación**: `mds/mds_stores` alto → reindexación Spotlight (nueva data, discos externos, corrupción índice).
- **Red**: `nsurlsessiond`/`cloudd` → sincronizaciones iCloud/Drive; revisar colas.
- **Seguridad**: procesos con persistencia no reconocida, binarios sin firma o con reputación dudosa.

---

## 5) Acciones y procedimientos (playbooks)

### 5.1 Higiene y rendimiento

- Reducir ventanas/espacios, desactivar transparencias/animaciones si `WindowServer` persistente.
- Pausar o acotar indexaciones (excluir rutas ruidosas en Spotlight temporalmente).
- Reprogramar backups/escaneos intensivos fuera del horario de uso.
- Revisar apps con overlays (grabadores de pantalla, managers de ventanas).

### 5.2 Diagnóstico técnico

- Tomar **Sample** del proceso con pico; inspeccionar backtraces para I/O, locks, waits.
- Ejecutar **Spindump** ante congelamientos; correlacionar con timestamps.
- Contrastar métricas con su **lifetime** (picos breves vs. sostenidos).

### 5.3 Persistencia & arranque

- Auditar `Login Items`, `~/Library/LaunchAgents`, `/Library/LaunchDaemons`.
- Catalogar cada ítem → productor/propósito/firma. Deshabilitar temporalmente ítems sospechosos con rollback plan.

### 5.4 Seguridad

- Revisar integridad/firma de binarios; cotejar hash si es necesario.
- Identificar conexiones inusuales (dominios/destinos) asociadas a procesos background.

---

## 6) Salidas (artefactos)

1. **Resumen ejecutivo** (bullets + tabla top offenders)
2. **JSON** completo con scoring por proceso
3. **Lista priorizada de acciones** (con tiempo estimado y riesgo)
4. **Bitácora** (eventos, decisiones, muestras/spindumps referenciados)
5. **Paquete de baseline** (ZIP/JSON):
   - *baseline\_optimizado* (idle estable) + condiciones.
   - *baseline\_habitual* (apps residentes habituales) + clasificación **nativo vs. externo**.
   - *baseline\_video/monitores* (si aplica) + métricas de `WindowServer`/GPU.

---

## 7) Formatos de salida (plantillas)

### 7.1 Resumen

- *Estado general*: {ok|degradado|crítico}
- *Causas probables*: [..]
- *Procesos prioritarios*: tabla `name | cpu% | mem(MB) | energy | role | priority | acción sugerida`
- *Acciones inmediatas (0–15 min)*: [..]
- *Acciones de fondo (próximas 24–48 h)*: [..]

### 7.2 JSON (por proceso)

```json
{
  "host": {"model": "", "macos": ""},
  "window": {"from": "", "to": ""},
  "processes": [ { /* objetos del modelo de datos */ } ],
  "findings": [
    {"pid": 0, "issue": "cpu_sustained_high", "evidence": "..", "priority": 90,
     "suggested_actions": ["take_sample", "reduce_windows", "defer_indexing"]}
  ],
  "actions_plan": [
    {"action": "audit_login_items", "owner": "user", "eta_min": 10, "risk": "low"}
  ]
}
```

---

## 8) Instrucciones al analista (cómo operar este prompt)

1. **Ejecuta el Proceso de Relajamiento** (§0.1) hasta cumplir las señales de inicio.
2. Captura **baseline óptimo** y **habitual** (§0.2) con contexto documentado.
3. Normaliza insumos (CSV/t
