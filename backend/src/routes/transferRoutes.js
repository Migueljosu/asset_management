/**
 * @swagger
 * tags:
 *   - name: Transfer
 *     description: Transferências de equipamentos entre setores
 */

const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createTransfer,
  getAllTransfers,
  getTransferById,
  getTransfersByEquipment,
  getTransferableEquipments,
} = require("../controllers/transferController");

/**
 * @swagger
 * /transfers:
 *   post:
 *     summary: Criar transferência de equipamento
 *     tags: [Transfer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, setorDestinoId]
 *             properties:
 *               equipmentId: { type: integer, example: 1 }
 *               setorDestinoId: { type: integer, example: 3 }
 *     responses:
 *       201:
 *         description: Transferência criada
 *       400:
 *         description: Equipamento não está em uso
 */
router.post("/", auth, role("admin"), createTransfer);

/**
 * @swagger
 * /transfers:
 *   get:
 *     summary: Listar transferências
 *     tags: [Transfer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transferências
 */
router.get("/", auth, role("admin"), getAllTransfers);

/**
 * @swagger
 * /transfers/available/equipment:
 *   get:
 *     summary: Listar equipamentos transferíveis
 *     tags: [Transfer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de equipamentos em uso
 */
router.get("/available/equipment", auth, role("admin"), getTransferableEquipments);

/**
 * @swagger
 * /transfers/equipment/{equipmentId}:
 *   get:
 *     summary: Ver histórico de transferências de um equipamento
 *     tags: [Transfer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Histórico de transferências
 */
router.get("/equipment/:equipmentId", auth, role("admin"), getTransfersByEquipment);

/**
 * @swagger
 * /transfers/{id}:
 *   get:
 *     summary: Ver detalhe de uma transferência
 *     tags: [Transfer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhe da transferência
 */
router.get("/:id", auth, role("admin"), getTransferById);

module.exports = router;
