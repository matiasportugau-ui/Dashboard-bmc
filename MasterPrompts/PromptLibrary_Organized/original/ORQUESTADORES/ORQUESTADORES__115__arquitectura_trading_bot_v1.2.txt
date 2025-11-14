# Arquitectura — Trading Bot + Sistema Inteligente de Decisión (v1.2)
_Export_: 2025-09-07T08:51:50Z (UTC) · **TZ**: America/Montevideo

## 1) Capas
- **Ingesta de Datos**: mercado (ticks/OHLCV, order book), noticias/sentimiento, macro (calendario), on-chain (si aplica), métricas de broker.
- **Feature Store & Señales**: indicadores técnicos, microestructura, volatilidad/estacionalidad, eventos; control de frescura/calidad.
- **Inteligencia Multi‑Agente (RCT‑COE)**: PLN, RSR, BLD, CRT, INT, OPS, SAFE, AU1, AU2; orquestación PEIPM‑50.
- **Estrategia & Riesgo**: señal → reglas → sizing (vol‑target/Kelly fracc.) → gates (spread/latencia/noticias) → límites.
- **Ejecución (MetaTrader EA)**: suscripción de señales, gestor de órdenes, control de slippage/ToF; bridge EA↔servicio.
- **Monitoreo & Observabilidad**: PnL, DD, win‑rate, latencia p50/p95, slippage, fills, rechazos; alertas OPS.
- **Ciclo de Vida (PEIPM‑50)**: mejora continua, BAEM, changelog, auditoría de atribución.

## 2) Flujo de Decisión (end‑to‑end)
```mermaid
flowchart LR
    A[Ingesta de Datos] --> B[Feature Store & Señales]
    B --> C[Orquestador Multi‑Agente RCT‑COE]
    C --> D[Estrategia & Riesgo]
    D --> E[Ejecución MetaTrader (EA)]
    E --> F[Monitoreo & Observabilidad]
    F --> C
    F --> D
```
- Feedback continuo desde Monitoreo a Orquestador (ajustes) y a Estrategia (riesgo/sizing).

## 3) Componentes del Orquestador (vista de grafo)
```mermaid
graph TD
    PLN[PLN Planificador] --> RSR[RSR Investigador]
    RSR --> BLD[BLD Constructor]
    BLD --> CRT[CRT Crítico/Auditor]
    CRT --> INT[INT Integrador]
    INT --> OPS[OPS Operaciones]
    OPS --> SAFE[SAFE Compliance]
    AU1[AU1 Negocio/Operaciones] --> INT
    AU2[AU2 Calidad/Producto] --> INT
    SAFE --> INT
```
**Políticas**: gates seguridad ≥ 0.995; robustez ≥ 0.85; score ≥ 0.80. AU: INT arbitra; CRT puntúa 0–1; SAFE puede vetar.

## 4) Tipos de Input y Efecto en Decisiones
- **Mercado**: precio/vol/volatilidad → timing y tamaño.
- **Microestructura**: spread, imbalance, latencia, rechazo → gating y tipo de orden.
- **Macro/Noticias**: ventanas de veto o reducción de tamaño.
- **Sentimiento**: sesgo direccional de corto plazo (ajuste de confianza).
- **Cuenta/Riesgo**: margen, exposición neta, correlaciones → límites y hedging.
- **Salud del Sistema**: SLOs/errores → pausas operativas.

## 5) Métricas y SLOs
- **Estrategia**: Sharpe, MAR, hit‑rate, DD máx, expectancy, profit factor.
- **Ejecución**: slippage medio/p95, fill‑rate, rechazo, latencia p50/p95, costo/tx.
- **Riesgo**: exposición por activo, correlación, VaR/ES, pérdidas intradía.
- **Calidad/Robustez**: estabilidad, sensibilidad, fuga; consistencia inter‑juez (si aplica).
- **SLO OPS**: p95 ≤ 2s @10×; disponibilidad ≥ 99.5%; cola < 1s.

## 6) Diseño del EA (alto nivel)
- **Subsistema Señales**: endpoint autenticado; caché local para resiliencia.
- **Gestor Órdenes**: IOC/FOK/GTX; control retry/backoff; OCO/TP/SL dinámicos.
- **Riesgo Local**: max lot, max DD intradía, max órdenes simultáneas.
- **Telemetría**: envío JSONL + métricas; trazas para auditoría.
- **Fallback**: safe‑mode ante fallas (pausa y cierre controlado).

## 7) Gobernanza & Seguridad
- Logs JSONL, hashes de versión, control de accesos, separación DEV/QA/PRD.
- Privacidad/PII, rotación de llaves, rate‑limits, RBAC.
- Auditoría BAEM periódica; matrices de evidencia y changelog.

## 8) Checklists
**Previo**: feeds OK, latencias OK, límites riesgo ON, calendario cargado.  
**Durante**: SLOs verdes, sin drift features, fills y slippage en tolerancia, PnL en guardrails.  
**Cierre**: snapshots, rotación de logs, reconciliación broker, archivo de decisiones.

## 9) Diagrama ASCII (capas)
```
[Data Ingesta] -> [Feature Store] -> [Orquestador MA] -> [Estrategia/Riesgo] -> [EA MetaTrader] -> [Monitoreo]
         ^                                                                               |
         |-------------------------------------------------------------------------------| (feedback)
```
