/**
 * @swagger
 * tags:
 *   - name: Maintenance
 *     description: Gestão de manutenções de equipamentos
 */

const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  startMaintenance,
  finishMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  cancelMaintenance,
} = require("../controllers/maintenanceController");

/**
 * @swagger
 * /maintenance:
 *   post:
 *     summary: Iniciar manutenção
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, tecnicoId, tipo, descricao, dataInicio]
 *             properties:
 *               equipmentId: { type: integer, example: 1 }
 *               tecnicoId: { type: integer, example: 3 }
 *               tipo: { type: string, example: "Preventiva" }
 *               descricao: { type: string, example: "Limpeza interna" }
 *               dataInicio: { type: string, format: date-time, example: "2026-04-20T09:00:00Z" }
 *     responses:
 *       201:
 *         description: Manutenção iniciada
 *       400:
 *         description: Dados inválidos
 */
router.post("/", auth, role("admin", "tecnico"), startMaintenance);

/**
 * @swagger
 * /maintenance/{id}/finish:
 *   put:
 *     summary: Concluir manutenção
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Manutenção concluída
 */
router.put("/:id/finish", auth, role("admin", "tecnico"), finishMaintenance);

/**
 * @swagger
 * /maintenance/{id}/cancel:
 *   put:
 *     summary: Cancelar manutenção
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Manutenção cancelada
 */
router.put("/:id/cancel", auth, role("admin", "tecnico"), cancelMaintenance);

/**
 * @swagger
 * /maintenance:
 *   get:
 *     summary: Listar manutenções
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de manutenções
 */
router.get("/", auth, role("admin", "tecnico"), getAllMaintenances);

/**
 * @swagger
 * /maintenance/{id}:
 *   get:
 *     summary: Ver detalhe da manutenção
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhe da manutenção
 */
router.get("/:id", auth, role("admin", "tecnico"), getMaintenanceById);

module.exports = router;
