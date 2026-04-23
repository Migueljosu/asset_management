# TODO — Implementação do Sistema de Notificações

## 1. Base de Dados (Prisma)
- [ ] Adicionar modelo `Notification` ao schema
- [ ] Criar migration
- [ ] Aplicar migration na base de dados

## 2. Backend
- [ ] Criar `notificationController.js` (listar, criar, marcar como lida, marcar todas como lidas)
- [ ] Criar `notificationRoutes.js`
- [ ] Registar rotas em `index.js`

## 3. Frontend — UI
- [ ] Criar `notificationService.ts` (API calls)
- [ ] Criar `types.ts` para notificações
- [ ] Atualizar `Topbar.tsx` com sininho, contador e dropdown

## 4. Notificações Automáticas
- [ ] Ao reportar anomalia → notificar admin + tecnico
- [ ] Ao aprovar agendamento → notificar funcionário
- [ ] Ao concluir manutenção → notificar quem reportou anomalia
- [ ] Ao equipamento ficar atrasado no empréstimo → notificar admin

## Validação
- [ ] Backend carrega sem erro
- [ ] Frontend mostra sininho com contador
- [ ] Notificações aparecem nos eventos

