const { z } = require("zod");

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  perfil: z.enum(["admin", "tecnico", "funcionario"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

module.exports = { registerSchema, loginSchema };