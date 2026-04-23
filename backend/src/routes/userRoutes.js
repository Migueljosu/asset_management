const router = require("express").Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
} = require("../controllers/userController");

// perfil
/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestão de usuários
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Perfil do usuário logado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/me", auth, getProfile);

// admin
router.post("/", auth, role("admin"), createUser);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar usuários (admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get("/", auth, role("admin"), getAllUsers);
router.get("/:id", auth, role("admin"), getUserById);
router.put("/:id", auth, role("admin"), updateUser);
router.delete("/:id", auth, role("admin"), deleteUser);

module.exports = router;
