/**
 * @swagger
 * tags:
 *   - name: Schedule
 *     description: Agendamentos de equipamentos
 */

const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createSchedule,
  getAllSchedules,
  approveSchedule,
  cancelSchedule,
  completeSchedule,
} = require("../controllers/scheduleController");

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Listar agendamentos
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */
router.get("/", auth, role("admin", "funcionario"), getAllSchedules);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Criar agendamento
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, setorDestinoId, dataInicio, dataFim]
 *             properties:
 *               equipmentId: { type: integer, example: 1 }
 *               setorDestinoId: { type: integer, example: 2 }
 *               dataInicio: { type: string, format: date-time, example: "2026-05-01T09:00:00Z" }
 *               dataFim: { type: string, format: date-time, example: "2026-05-10T18:00:00Z" }
 *     responses:
 *       201:
 *         description: Agendamento criado
 *       400:
 *         description: Dados inválidos ou equipamento não disponível
 */
router.post("/", auth, role("admin", "funcionario"), createSchedule);

/**
 * @swagger
 * /schedules/{id}/approve:
 *   put:
 *     summary: Aprovar agendamento (admin)
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Agendamento aprovado
 *       403:
 *         description: Sem permissão
 */
router.put("/:id/approve", auth, role("admin"), approveSchedule);

/**
 * @swagger
 * /schedules/{id}/cancel:
 *   put:
 *     summary: Cancelar agendamento
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Agendamento cancelado
 */
router.put("/:id/cancel", auth, role("admin", "funcionario"), cancelSchedule);

/**
 * @swagger
 * /schedules/{id}/complete:
 *   put:
 *     summary: Concluir agendamento (admin)
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Agendamento concluído
 *       403:
 *         description: Sem permissão
 */
router.put("/:id/complete", auth, role("admin"), completeSchedule);

module.exports = router;
