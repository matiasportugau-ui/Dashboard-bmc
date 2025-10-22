#vanza Checklist Revisión Humana Workflow Autogenerado

1. Credenciales
   - [ ] Todas las credenciales listadas existen en n8n (Settings > Credentials).
   - [ ] No se exponen secretos en parámetros.
2. Parámetros de Nodos
   - [ ] URLs apuntan a entornos correctos (dev/stub/prod).
   - [ ] Queries SQL usan parámetros y evitan interpolación directa.
3. Seguridad & PII
   - [ ] Datos sensibles (phone) se hash o pseudonimizan antes de persistir si aplica.
4. Conexiones
   - [ ] Flujo lógico (orden nodos) coincide con objetivo del plan.
   - [ ] No hay nodos huérfanos.
5. Riesgos
   - [ ] Riesgos nivel alto ausentes o mitigaciones claras documentadas.
6. Métricas
   - [ ] Métricas definidas tienen lugar de instrumentación (Function node o agente externo).
7. Modificaciones Pendientes
   - [ ] nodos_modificados (si existen) fueron aplicados manualmente tras importar.
8. Rollback
   - [ ] Pasos de rollback viables y probados en entorno dev.
9. Calidad
   - [ ] Calidad ≥0.90 confirmada por validator.
10. Logging

- [ ] Plan registrado en workflow_change_log con ID.

Al terminar: etiquetar workflow en n8n con tag `autogen-reviewed`.
