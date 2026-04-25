/**
 * @swagger
 * tags:
 *   - name: Sector
 *     description: Gestão de setores/departamentos
 */

const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createSector,
  getAllSectors,
  getSectorById,
  updateSector,
  deleteSector,
} = require("../controllers/sectorController");

/**
 * @swagger
 * /sectors:
 *   post:
 *     summary: Criar setor (admin)
 *     tags: [Sector]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string, example: "Recursos Humanos" }
 *     responses:
 *       201:
 *         description: Setor criado
 *       400:
 *         description: Nome já existe
 */
router.post("/", auth, role("admin"), createSector);

/**
 * @swagger
 * /sectors:
 *   get:
 *     summary: Listar setores
 *     tags: [Sector]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de setores
 */
router.get("/", auth, role("admin", "funcionario"), getAllSectors);

/**
 * @swagger
 * /sectors/{id}:
 *   get:
 *     summary: Ver detalhe de setor
 *     tags: [Sector]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhe do setor
 *       404:
 *         description: Setor não encontrado
 */
router.get("/:id", auth, role("admin", "funcionario"), getSectorById);

/**
 * @swagger
 * /sectors/{id}:
 *   put:
 *     summary: Atualizar setor (admin)
 *     tags: [Sector]
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
 *               nome: { type: string, example: "RH" }
 *     responses:
 *       200:
 *         description: Setor atualizado
 *       404:
 *         description: Setor não encontrado
 */
router.put("/:id", auth, role("admin"), updateSector);

/**
 * @swagger
 * /sectors/{id}:
 *   delete:
 *     summary: Eliminar setor (admin)
 *     tags: [Sector]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Setor eliminado
 *       404:
 *         description: Setor não encontrado
 */
router.delete("/:id", auth, role("admin"), deleteSector);

module.exports = router;
