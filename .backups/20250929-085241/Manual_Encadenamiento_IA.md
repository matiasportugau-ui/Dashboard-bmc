# Manual de Encadenamiento de IAs
*(Guía práctica para generar posibilidades y abordar procesos con cadenas multi‑IA)*

> Idioma: es-UY · Uso: copiar/pegar en tus proyectos · Formatos: prompts listos, plantillas JSON y checklists

---

# # 1) ¿Qué es “encadenar IAs”?
Orquestar varios modelos/roles en pasos coordinados para resolver tareas complejas con mejor control, calidad y trazabilidad. Cada paso usa la salida del anterior o trabaja en paralelo y luego converge.

**Beneficios:** especialización por rol, mayor calidad (QA explícito), reproducibilidad (logs), menor ambigüedad y mejor gestión de riesgos.

---

# # 2) Formas de encadenamiento (patrones)
## # A. Secuencial
**A → B → C.** Ideal para descomponer tareas: resumir → traducir → validar, o brief → borrador → edición → QA.
- **Ventajas:** simple, depurable, bajo acoplamiento.
- **Cuándo usar:** tareas lineales con dependencias claras.

## # B. Paralelo
**A || B || C → Integración.** Varias tareas en simultáneo (p. ej., análisis de sentimiento y extracción de entidades).
- **Ventajas:** rapidez, exploración de variantes.
- **Clave:** definir cómo se fusionan resultados (reglas/ponderaciones).

## # C. Multi‑Agente (roles)
Equipo virtual con roles especializados (PLN, RSR, BLD, CRT, INT, SAFE, OPS, AU1/AU2).
- **Ventajas:** calidad y cobertura de requisitos.
- **Clave:** comunicación explícita entre roles y formato por ciclo.

## # D. Iterativo (bucles)
Repite ciclos hasta cumplir KPIs/early‑stop. Útil para mejorar versiones: código con tests, renders, fichas técnicas.
- **Criterios de parada:** delta de mejora, cobertura=100%, estabilidad.

## # E. Convergente (resolución de conflictos)
Genera alternativas (AU1/AU2), puntúa con CRT y **INT** decide o combina. **SAFE** puede vetar.
- **Útil cuando:** hay enfoques contrapuestos (tiempo vs calidad, coste vs exactitud).

## # F. Híbrido (adaptativo)
Mezcla secuencial + paralelo + iterativo + convergente según condiciones. Ideal para proyectos con ramas/decisiones.

---

# # 3) Marcos rápidos (plug‑and‑play)

## # 3.1 Cadena Secuencial — Plantilla
**Prompt (bloque único):**
```
[SISTEMA] Vas a ejecutar una cadena SECuencial A→B→C. Mantén formato y no saltees pasos.

[Objetivo] <describir>

[Pasos]
A) Analiza requisitos y produce LISTA_DE_TAREAS.
B) Desarrolla la versión inicial del artefacto siguiendo LISTA_DE_TAREAS.
C) Revisa y devuelve MEJORAS priorizadas.
D) Aplica mejoras y entrega V_FINAL.

[Salidas]
- LISTA_DE_TAREAS
- V_BORRADOR
- REVISION_QA
- V_FINAL
```

## # 3.2 Cadena Paralela — Plantilla
```
[SISTEMA] Ejecuta tareas en paralelo y luego integra.

[Objetivo] <describir>

[Paralelos]
P1) <tarea/rol/modelo>
P2) <tarea/rol/modelo>
P3) <tarea/rol/modelo>

[Integración]
- Fusiona resultados con matriz de criterios (peso por criterio).
- Entrega V_FINAL + tabla de decisiones.
```

## # 3.3 Multi‑Agente (Roles) — Plantilla
```
[SISTEMA] Orquestador multi‑agente. Roles: PLN, RSR, BLD, CRT, INT, SAFE, OPS, AU1, AU2.

[FASES]
F0 Estudio → tarjeta, KPIs, riesgos.
F1 Plan → roadmap y dependencias.
F2 Ciclos (i=1..N): RSR→BLD→CRT→INT (+SAFE/OPS/AU).
F3 Cierre → versión final, changelog, matriz de evidencia.

[Formato por ciclo]
RESUMEN_i, CAMBIOS_i, METRICAS_i {calidad, cobertura, estabilidad}, RIESGOS_i, PENDIENTES_i.
```

## # 3.4 Iterativo (PEIPM‑like) — Plantilla
```
[Config JSON]
{
  "ciclos_max": 6,
  "early_stop_delta": 0.02,
  "early_stop_ventana": 2,
  "kpis": ["calidad>=0.90","cobertura=100%","estabilidad>=0.92"]
}

[Loop i=1..N]
1) Construir V_i
2) Evaluar métricas (CRT)
3) Proponer mejoras priorizadas
4) Integrar cambios (INT)
[Detener si] KPIs OK o mejora<delta por ventana.
```

## # 3.5 Convergente (AU1/AU2) — Plantilla
```
[Generar] AU1 y AU2 con enfoques distintos.
[Evaluar] CRT: matriz de criterios + score 0..1 por alternativa.
[Decidir] INT: escoger/combinar; SAFE puede vetar.
[Entregar] V_CONVERGENTE + tabla “vs alternativas”.
```

---

# # 4) Plantillas JSON de control
```json
{
  "proyecto": "Nombre",
  "objetivo": "Resultado esperado y restricciones",
  "roles_activos": ["PLN","RSR","BLD","CRT","INT","SAFE","OPS","AU1","AU2"],
  "kpis": ["calidad>=0.90","cobertura=100%","estabilidad>=0.92"],
  "limites": {"ciclos_max": 8, "early_stop_delta": 0.02, "early_stop_ventana": 2},
  "politicas": {
    "una_consulta_por_datos_faltantes": true,
    "seguir_con_supuestos": true,
    "cumplimiento_privacidad": true
  },
  "registro": {"guardar_tarjeta": true, "guardar_changelog": true}
}
```

**Matriz de criterios (ejemplo):**
| Criterio        | Peso | AU1 | AU2 |
|-----------------|-----:|----:|----:|
| Calidad         |  0.5 | 0.88| 0.92|
| Cobertura       |  0.3 | 1.00| 0.95|
| Estabilidad     |  0.2 | 0.90| 0.90|
| **Score total** |      |0.922|0.928|

---

# # 5) Checklists QA (copiar/pegar)
- [ ] Requisitos mapeados 100% (matriz requisitos→salidas).
- [ ] KPIs alcanzados o justificados (valores y evidencia).
- [ ] Evidencias / fuentes cuando aplique.
- [ ] Entregables reproducibles (archivos + cómo usarlos).
- [ ] Riesgos y próximos pasos documentados.
- [ ] Changelog de ciclos (si hubo iteración).

---

# # 6) Recetas por dominio (resumen)
**Moda (renders y fichas):**
- Paralelo: IMG (análisis visual) + FIT (fitting) + DAT (atributos) → INT integra; BLD genera render y ficha; CRT valida.
- Iterativo: repetir hasta KPIs; Convergente si hay variantes de diseño.

**Manufactura:**
- Secuencial: plan→simulación→optimización→QA.
- Paralelo: análisis de cuellos + costos + compliance → INT.

**Audio (podcast):**
- Iterativo: cadena NR→EQ→Comp→Limiter; CRT mide LUFS/dBTP; AU1 (tiempo) vs AU2 (calidad).

**Dashboards:**
- Paralelo: ingesta (ERP/CRM/APIs) + limpieza + visual; CRT valida KPIs; OPS arma runbooks.

---

# # 7) Prompt “orquestador” listo para pegar
```
[SISTEMA] Orquestador de cadenas multi‑IA. Aplica el patrón adecuado (Secuencial / Paralelo / Multi‑Agente / Iterativo / Convergente / Híbrido) según el objetivo y restricciones.

[Objetivo] <describe lo que querés lograr>

[Entradas] <datos, bocetos, fotos, fuentes>
[KPIs] calidad>=0.90, cobertura=100%, estabilidad>=0.92
[Límites] ciclos_max=6, early_stop_delta=0.02, ventana=2
[Roles] PLN, RSR, BLD, CRT, INT, SAFE, OPS, AU1, AU2 (activar solo los necesarios)

[Plan]
1) F0 Estudio → tarjeta, riesgos, KPIs.
2) F1 Plan → roadmap y dependencias; si faltan datos críticos, UNA consulta.
3) F2 Ejecución → elegir patrón:
   - Secuencial: A→B→C→QA.
   - Paralelo: P1||P2||P3 → Integración.
   - Multi‑Agente: RSR→BLD→CRT→INT (+SAFE/OPS).
   - Iterativo: bucle hasta KPIs/early‑stop.
   - Convergente: AU1/AU2 + CRT + INT + SAFE.
4) F3 Cierre → V_FINAL, matriz de evidencia, changelog, próximos pasos.

[Formato por ciclo]
RESUMEN_i, CAMBIOS_i, METRICAS_i {calidad, cobertura, estabilidad, delta}, RIESGOS_i, PENDIENTES_i.

[Entrega]
- Artefacto final
- Tabla de criterios/decisiones
- KPIs y cómo se midieron
- Checklist QA marcada
```
---

# # 8) Consejos finales
- Define criterios de éxito **antes** de iterar.
- Activa solo los roles necesarios (menos ruido).
- Loguea decisiones y supuestos (trazabilidad).
- Usa *early‑stop* para ahorrar tiempo/costo.
- Si hay conflicto, aplica AU1/AU2 + CRT + INT + SAFE.
