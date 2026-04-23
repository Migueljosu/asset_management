const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getAllEquipments,
  getEquipmentById,
} = require("../controllers/equipmentController");

// só admin
/**
 * @swagger
 * /equipment:
 *   post:
 *     summary: Criar equipamento (admin)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             nome: Laptop Dell
 *             codigo: EQ-001
 *     responses:
 *       201:
 *         description: Criado
 */
router.post("/", auth, role("admin"), createEquipment);
router.put("/:id", auth, role("admin"), updateEquipment);
router.delete("/:id", auth, role("admin"), deleteEquipment);

// todos autenticados
/**
 * @swagger
 * tags:
 *   - name: Equipment
 *     description: Gestão de equipamentos
 */

/**
 * @swagger
 * /equipment:
 *   get:
 *     summary: Listar equipamentos com filtro
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           example: disponivel
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *           example: dell
 *     responses:
 *       200:
 *         description: Lista de equipamentos
 */
router.get("/", auth, getAllEquipments);
router.get("/:id", auth, getEquipmentById);

module.exports = router;
