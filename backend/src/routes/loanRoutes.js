const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { getAllLoans, createLoan, returnLoan, deleteLoan } = require("../controllers/loanController");
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
router.get("/", auth, role("admin", "funcionario"), getAllLoans);
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
router.delete("/:id", auth, role("admin", "funcionario"), deleteLoan);

module.exports = router;
