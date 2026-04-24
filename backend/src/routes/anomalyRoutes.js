/**
 * @swagger
 * tags:
 *   - name: Anomaly
 *     description: Gestão de anomalias nos equipamentos
 */

const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createAnomaly,
  getAllAnomalies,
  getAnomalyById,
  updateAnomaly,
  resolveAnomaly,
  deleteAnomaly,
} = require("../controllers/anomalyController");

/**
 * @swagger
 * /anomalies:
 *   post:
 *     summary: Reportar nova anomalia
 *     tags: [Anomaly]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, titulo, descricao, severidade]
 *             properties:
 *               equipmentId: { type: integer, example: 1 }
 *               titulo: { type: string, example: "Tela piscando" }
 *               descricao: { type: string, example: "A tela do monitor está a piscar intermitentemente" }
 *               severidade: { type: string, enum: [baixa, media, alta], example: "media" }
 *     responses:
 *       201:
 *         description: Anomalia reportada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post("/", auth, role("admin", "tecnico", "funcionario"), createAnomaly);

/**
 * @swagger
 * /anomalies:
 *   get:
 *     summary: Listar todas as anomalias
 *     tags: [Anomaly]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de anomalias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   titulo: { type: string }
 *                   descricao: { type: string }
 *                   estado: { type: string, enum: [reportada, em_analise, resolvida] }
 *                   severidade: { type: string, enum: [baixa, media, alta] }
 *                   equipment: { type: object }
 *                   user: { type: object }
 *                   createdAt: { type: string, format: date-time }
 */
router.get("/", auth, getAllAnomalies);

/**
 * @swagger
 * /anomalies/{id}:
 *   get:
 *     summary: Ver detalhe de uma anomalia
 *     tags: [Anomaly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhe da anomalia
 *       404:
 *         description: Anomalia não encontrada
 */
router.get("/:id", auth, getAnomalyById);

/**
 * @swagger
 * /anomalies/{id}:
 *   put:
 *     summary: Editar anomalia (admin)
 *     tags: [Anomaly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: { type: string }
 *               descricao: { type: string }
 *               estado: { type: string, enum: [reportada, em_analise, resolvida] }
 *               severidade: { type: string, enum: [baixa, media, alta] }
 *     responses:
 *       200:
 *         description: Anomalia atualizada
 *       403:
 *         description: Sem permissão
 */
router.put("/:id", auth, role("admin"), updateAnomaly);

/**
 * @swagger
 * /anomalies/{id}/resolve:
 *   put:
 *     summary: Resolver anomalia (admin ou técnico)
 *     tags: [Anomaly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Anomalia resolvida
 *       403:
 *         description: Sem permissão
 */
router.put("/:id/resolve", auth, role("admin", "tecnico"), resolveAnomaly);

/**
 * @swagger
 * /anomalies/{id}:
 *   delete:
 *     summary: Eliminar anomalia (admin)
 *     tags: [Anomaly]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Anomalia eliminada
 *       403:
 *         description: Sem permissão
 */
router.delete("/:id", auth, role("admin"), deleteAnomaly);

module.exports = router;
