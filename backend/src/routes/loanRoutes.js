/**
 * @swagger
 * tags:
 *   - name: Loan
 *     description: Empréstimos de equipamentos
 */

const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { getAllLoans, createLoan, returnLoan, deleteLoan } = require("../controllers/loanController");

/**
 * @swagger
 * /loans:
 *   get:
 *     summary: Listar empréstimos
 *     tags: [Loan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empréstimos
 */
router.get("/", auth, role("admin", "funcionario"), getAllLoans);

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Criar empréstimo
 *     tags: [Loan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, setorDestinoId, dataPrevista]
 *             properties:
 *               equipmentId: { type: integer, example: 1 }
 *               setorDestinoId: { type: integer, example: 2 }
 *               dataPrevista: { type: string, format: date-time, example: "2026-04-25" }
 *     responses:
 *       201:
 *         description: Empréstimo criado
 *       400:
 *         description: Dados inválidos
 */
router.post("/", auth, role("admin", "funcionario"), createLoan);

/**
 * @swagger
 * /loans/return:
 *   post:
 *     summary: Devolver equipamento
 *     tags: [Loan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [loanId]
 *             properties:
 *               loanId: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Equipamento devolvido
 */
router.post("/return", auth, role("admin", "funcionario"), returnLoan);

/**
 * @swagger
 * /loans/{id}:
 *   delete:
 *     summary: Eliminar empréstimo
 *     tags: [Loan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Empréstimo eliminado
 */
router.delete("/:id", auth, role("admin", "funcionario"), deleteLoan);

module.exports = router;
