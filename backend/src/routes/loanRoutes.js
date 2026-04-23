const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { createLoan, returnLoan } = require("../controllers/loanController");
/**
 * @swagger
 * tags:
 *   - name: Loan
 */

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Criar empréstimo
 *     tags: [Loan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             equipmentId: 1
 *             setorDestinoId: 2
 *             dataPrevista: 2026-04-25
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
 *       content:
 *         application/json:
 *           example:
 *             loanId: 1
 */
router.post("/return", auth, role("admin", "funcionario"), returnLoan);

module.exports = router;