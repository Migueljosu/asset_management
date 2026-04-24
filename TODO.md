# TODO — Melhorias no Projeto Asset Management

## Fase 1: Documentação Swagger em todas as rotas
- [ ] `backend/src/routes/userRoutes.js` — CRUD users + profile
- [ ] `backend/src/routes/equipmentRoutes.js` — CRUD equipment
- [ ] `backend/src/routes/scheduleRoutes.js` — schedules (create, list, approve, cancel, complete)
- [ ] `backend/src/routes/loanRoutes.js` — loans (create, list, return, delete)
- [ ] `backend/src/routes/maintenanceRoutes.js` — maintenance (create, list, complete, cancel)
- [ ] `backend/src/routes/transferRoutes.js` — transfers (create, list)
- [ ] `backend/src/routes/sectorRoutes.js` — sectors (CRUD)
- [ ] `backend/src/routes/anomalyRoutes.js` — anomalies (create, list, update, delete)
- [ ] `backend/src/routes/notificationRoutes.js` — notifications (list, mark read, count, delete)
- [ ] `backend/src/routes/dashboardRoutes.js` — dashboard stats
- [ ] `backend/src/config/swagger.js` — adicionar tags Anomaly, Sector, Notification

## Fase 2: Notificações em tempo real no frontend
- [ ] Criar `frontend/src/lib/eventEmitter.ts` — event bus simples
- [ ] Atualizar `Topbar.tsx` — escutar evento de refresh + polling 5s
- [ ] Atualizar `AnomalyPage.tsx` — emitir evento após criar/editar/eliminar anomalia
- [ ] Atualizar `ScheduleList.tsx/SchedulesPage.tsx` — emitir evento após aprovar/cancelar/concluir
- [ ] Atualizar `MaintenancePage.tsx` — emitir evento após criar/concluir manutenção
- [ ] Atualizar `LoanList.tsx/LoansPage.tsx` — emitir evento após criar/devolver empréstimo
- [ ] Atualizar `TransfersPage.tsx` — emitir evento após criar transferência
- [ ] Atualizar `UsersPage.tsx` — emitir evento após criar/editar/eliminar user
- [ ] Atualizar `SectorsPage.tsx` — emitir evento após criar/editar/eliminar sector
- [ ] Atualizar `EquipmentList.tsx` — emitir evento após criar/editar/eliminar equipamento

## Validação Final
- [ ] Verificar Swagger UI em `/api/docs`
- [ ] Testar notificações em tempo real no frontend
