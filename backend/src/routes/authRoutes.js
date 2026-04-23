/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nome: { type: string, example: Miguel }
 *         email: { type: string, example: miguel@test.com }
 *         perfil: { type: string, enum: [admin, tecnico, funcionario], example: funcionario }
 *         createdAt: { type: string, format: date-time }
 *
 *     Equipment:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         nome: { type: string, example: Laptop Dell }
 *         codigo: { type: string, example: EQ-001 }
 *         estado: { type: string, enum: [disponivel, reservado, em_uso, manutencao, inativo], example: disponivel }
 *         createdAt: { type: string, format: date-time }
 *
 *     Schedule:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         equipmentId: { type: integer, example: 1 }
 *         setorDestinoId: { type: integer, example: 2 }
 *         dataInicio: { type: string, format: date-time }
 *         dataFim: { type: string, format: date-time }
 *         estado: { type: string, example: pendente }
 *
 *     Loan:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         equipmentId: { type: integer, example: 1 }
 *         setorDestinoId: { type: integer, example: 2 }
 *         dataSaida: { type: string, format: date-time }
 *         dataPrevista: { type: string, format: date-time }
 *         estado: { type: string, example: ativo }
 *
 *     Maintenance:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         equipmentId: { type: integer, example: 1 }
 *         tecnicoId: { type: integer, example: 3 }
 *         tipo: { type: string, example: Preventiva }
 *         descricao: { type: string, example: Limpeza interna }
 *         estado: { type: string, example: em_andamento }
 *
 *     Transfer:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         equipmentId: { type: integer, example: 1 }
 *         setorOrigemId: { type: integer, example: 1 }
 *         setorDestinoId: { type: integer, example: 2 }
 *         dataTransferencia: { type: string, format: date-time }
 *
 *   responses:
 *     Unauthorized:
 *       description: Não autenticado
 *     Forbidden:
 *       description: Sem permissão
 */

const express = require("express");
const router = express.Router();

const { loginLimiter } = require("../middlewares/rateLimit");

const {
  register,
  login,
  refresh,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

//  AUTH
router.post("/register", register);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticação e tokens
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: miguel@test.com
 *             senha: 12345678
 *     responses:
 *       200:
 *         description: Login realizado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 token: "JWT_TOKEN"
 *                 refreshToken: "REFRESH_TOKEN"
 *                 user:
 *                   id: 1
 *                   nome: Miguel
 *                   email: miguel@test.com
 *                   perfil: funcionario
 */
router.post("/login", loginLimiter, login);

//  TOKENS
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Gerar novo access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             refreshToken: "REFRESH_TOKEN"
 *     responses:
 *       200:
 *         description: Novo token gerado
 */
router.post("/refresh", refresh);

//  RESET PASSWORD
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router;